import React, { ReactNode, useEffect, useImperativeHandle, forwardRef, useRef, useState } from 'react';
import { ViewProps, StatusBar, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Keyboard, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../model/useThemeProvider';

export type ZSContainerProps = ViewProps & {
  backgroundColor?: string;
  statusBarColor?: string;
  barStyle?: 'light-content' | 'dark-content';
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  scrollViewDisabled?: boolean;
  topComponent?: ReactNode;
  bottomComponent?: ReactNode;
  rightComponent?: ReactNode;
  showsVerticalScrollIndicator?: boolean;
  keyboardScrollExtraOffset?: number;
  translucent?: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
};

export type ZSContainerRef = ScrollView;

const ZSContainer = forwardRef<ZSContainerRef, ZSContainerProps>(function ZSContainer(
  {
    backgroundColor,
    statusBarColor,
    barStyle,
    edges = ['top', 'bottom'],
    scrollViewDisabled = false,
    topComponent,
    bottomComponent,
    rightComponent,
    showsVerticalScrollIndicator = true,
    keyboardScrollExtraOffset = 30,
    translucent,
    scrollEventThrottle = 16,
    ...props
  },
  forwardedRef
) {
  const { palette, dimensions: { height: windowHeight } } = useTheme();
  const positionRef = useRef<number | null>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastTouchY = useRef<number | null>(0);
  const [keyboardHeight, setKeyboardHeight] = useState<number | null>(0);

  useImperativeHandle(forwardedRef, () => scrollViewRef.current as ScrollView, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      if (scrollViewRef.current) {
        const screenHeight = windowHeight;
        const keyboardHeight = e.endCoordinates.height;
        const safeAreaBottom = 0;
        const availableScreenHeight = screenHeight - keyboardHeight - safeAreaBottom;
        const currentScrollPosition = positionRef.current || 0;
        const touchPosition = lastTouchY.current || 0;

        // touchPosition이 키보드 높이보다 아래인 경우
        // const isTouchPositionBelowKeyboard = touchPosition > availableScreenHeight;

        // 현재 터치 위치와 스크롤 위치를 기반으로 새로운 스크롤 위치 계산
        const scrollOffset = touchPosition - availableScreenHeight + keyboardScrollExtraOffset;

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: currentScrollPosition + scrollOffset,
            animated: true,
          });
        }, 100);
      }
    });

    const keyboardHideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      positionRef.current = null;
      lastTouchY.current = null;
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, [keyboardScrollExtraOffset]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (props.onScroll) props.onScroll(event);
    positionRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleTouch = (evt: any) => {
    lastTouchY.current = evt.nativeEvent.pageY;
  };

  return (
    <SafeAreaView
      style={[{ backgroundColor: backgroundColor || palette.background.base }, styles.flex1]}
      edges={edges}
    >
      <View style={styles.flex1}>
        {topComponent && topComponent}
        {
          scrollViewDisabled ? (
            <View style={styles.flex1}>
              {props.children}
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.flex1}
              contentContainerStyle={[styles.scrollContainerStyle, { paddingBottom: Platform.OS === 'ios' ? keyboardHeight || 0 : 0 }]}
              bounces={false}
              overScrollMode="never"
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={false}
              onScroll={handleScroll}
              onTouchStart={handleTouch}
              scrollEventThrottle={scrollEventThrottle}
            >
              <View style={[styles.flex1, props.style]}>
                {props.children}
              </View>
            </ScrollView>
          )
        }
        {bottomComponent && bottomComponent}
      </View>

      {
        (barStyle || statusBarColor || translucent) && (
          <StatusBar
            barStyle={barStyle}
            backgroundColor={statusBarColor || palette.background.base}
            translucent={translucent}
          />
        )
      }
    </SafeAreaView>
  );
});

export const styles = StyleSheet.create({
  flex1: { flex: 1, width: '100%' },
  scrollContainerStyle: { flexGrow: 1, alignItems: 'center', width: '100%' },
});

export default ZSContainer;
