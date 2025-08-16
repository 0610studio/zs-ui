import React, { ReactNode, useEffect, useImperativeHandle, forwardRef, useRef, useState, useCallback, useMemo } from 'react';
import { ViewProps, StatusBar, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Keyboard, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../model/useThemeProvider';

const IS_IOS = Platform.OS === 'ios';
const KEYBOARD_ANIMATION_DELAY = 50;
const keyboardEvents = {
  showEvent: IS_IOS ? 'keyboardWillShow' as const : 'keyboardDidShow' as const,
  hideEvent: IS_IOS ? 'keyboardWillHide' as const : 'keyboardDidHide' as const,
};

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
  scrollToFocusedInput?: boolean;
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
    scrollToFocusedInput = true,
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

  const handleKeyboardShow = useCallback((e: any) => {
    setKeyboardHeight(e.endCoordinates.height);
    
    if (scrollViewRef.current && scrollToFocusedInput) {
      const keyboardHeight = e.endCoordinates.height;
      const safeAreaBottom = 0;
      const availableScreenHeight = windowHeight - keyboardHeight - safeAreaBottom;
      const currentScrollPosition = positionRef.current || 0;
      const touchPosition = lastTouchY.current || 0;

      // 현재 터치 위치와 스크롤 위치를 기반으로 새로운 스크롤 위치 계산
      const scrollOffset = touchPosition - availableScreenHeight + keyboardScrollExtraOffset;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: currentScrollPosition + scrollOffset,
          animated: true,
        });
      }, KEYBOARD_ANIMATION_DELAY);
    }
  }, [windowHeight, keyboardScrollExtraOffset, scrollToFocusedInput]);

  // 키보드 숨김 핸들러를 메모이제이션하여 성능 최적화
  const handleKeyboardHide = useCallback(() => {
    setKeyboardHeight(0);
  }, []);

  useEffect(() => {
    const keyboardShowSubscription = Keyboard.addListener(keyboardEvents.showEvent, handleKeyboardShow);
    const keyboardHideSubscription = Keyboard.addListener(keyboardEvents.hideEvent, handleKeyboardHide);

    return () => {
      positionRef.current = null;
      lastTouchY.current = null;
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, [keyboardEvents.showEvent, keyboardEvents.hideEvent, handleKeyboardShow, handleKeyboardHide]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (props.onScroll) props.onScroll(event);
    positionRef.current = event.nativeEvent.contentOffset.y;
  }, [props.onScroll]);

  const handleTouch = useCallback((evt: any) => {
    lastTouchY.current = evt.nativeEvent.pageY;
  }, []);

  const safeAreaStyle = useMemo(() => [
    { backgroundColor: backgroundColor || palette.background.base }, 
    styles.flex1
  ], [backgroundColor, palette.background.base]);

  const scrollContentStyle = useMemo(() => [
    styles.scrollContainerStyle, 
    { 
      paddingBottom: keyboardHeight ? keyboardHeight : 0 
    }
  ], [keyboardHeight]);

  const containerStyle = useMemo(() => [
    styles.flex1, 
    props.style
  ], [props.style]);

  const shouldShowStatusBar = useMemo(() => 
    Boolean(barStyle || statusBarColor || translucent), 
    [barStyle, statusBarColor, translucent]
  );

  return (
    <SafeAreaView
      style={safeAreaStyle}
      edges={edges}
    >
      <View style={styles.flex1}>
        {topComponent}
        {
          scrollViewDisabled ? (
            <View style={styles.flex1}>
              {props.children}
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.flex1}
              contentContainerStyle={scrollContentStyle}
              bounces={false}
              overScrollMode="never"
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={false}
              onScroll={handleScroll}
              onTouchStart={handleTouch}
              scrollEventThrottle={scrollEventThrottle}
            >
              <View style={containerStyle}>
                {props.children}
              </View>
            </ScrollView>
          )
        }
        {bottomComponent}
      </View>

      {shouldShowStatusBar && (
        <StatusBar
          barStyle={barStyle}
          backgroundColor={statusBarColor || palette.background.base}
          translucent={translucent}
        />
      )}
    </SafeAreaView>
  );
});

export const styles = StyleSheet.create({
  flex1: { flex: 1, width: '100%' },
  scrollContainerStyle: { flexGrow: 1, alignItems: 'center', width: '100%' },
});

const arePropsEqual = (
  prevProps: ZSContainerProps, 
  nextProps: ZSContainerProps
): boolean => {
  return (
    prevProps.backgroundColor === nextProps.backgroundColor &&
    prevProps.statusBarColor === nextProps.statusBarColor &&
    prevProps.barStyle === nextProps.barStyle &&
    prevProps.scrollViewDisabled === nextProps.scrollViewDisabled &&
    prevProps.showsVerticalScrollIndicator === nextProps.showsVerticalScrollIndicator &&
    prevProps.keyboardScrollExtraOffset === nextProps.keyboardScrollExtraOffset &&
    prevProps.translucent === nextProps.translucent &&
    prevProps.scrollEventThrottle === nextProps.scrollEventThrottle &&
    prevProps.scrollToFocusedInput === nextProps.scrollToFocusedInput &&
    prevProps.onScroll === nextProps.onScroll &&
    prevProps.style === nextProps.style &&
    prevProps.children === nextProps.children &&
    prevProps.topComponent === nextProps.topComponent &&
    prevProps.bottomComponent === nextProps.bottomComponent &&
    prevProps.rightComponent === nextProps.rightComponent &&
    // edges 배열 비교
    JSON.stringify(prevProps.edges) === JSON.stringify(nextProps.edges)
  );
};

export default React.memo(ZSContainer, arePropsEqual);
