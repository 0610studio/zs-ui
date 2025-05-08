import React, { ReactNode, useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { ViewProps, KeyboardAvoidingView, StatusBar, StyleSheet, Dimensions, ActivityIndicator, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewAtom from '../atoms/ViewAtom';
import ScrollViewAtom from '../atoms/ScrollViewAtom';
import { useTheme } from '../../model/useThemeProvider';

export type ZSContainerProps = ViewProps & {
  backgroundColor?: string;
  isLoader?: boolean;
  statusBarColor?: string;
  barStyle?: 'light-content' | 'dark-content';
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  isScrollView?: boolean;
  topComponent?: ReactNode;
  bottomComponent?: ReactNode;
  showsVerticalScrollIndicator?: boolean;
  loadingComponent?: React.ReactNode;
  keyboardVerticalOffset?: number;
  behavior?: 'padding' | 'height' | 'position';
  automaticallyAdjustKeyboardInsets?: boolean;
  keyboardScrollExtraOffset?: number;
};

export type ZSContainerRef = ScrollView;

const ZSContainer = forwardRef<ZSContainerRef, ZSContainerProps>(function ZSContainer(
  {
    backgroundColor,
    isLoader = false,
    statusBarColor,
    barStyle = 'dark-content',
    edges = ['top', 'bottom'],
    isScrollView = true,
    topComponent,
    bottomComponent,
    showsVerticalScrollIndicator = true,
    loadingComponent = <ActivityIndicator />,
    keyboardVerticalOffset,
    behavior,
    automaticallyAdjustKeyboardInsets = true,
    keyboardScrollExtraOffset,
    ...props
  },
  forwardedRef
) {
  const { palette } = useTheme();
  const [isDelayed, setIsDelayed] = useState(true);
  const positionRef = useRef<number | null>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastTouchY = useRef<number | null>(0);

  useImperativeHandle(forwardedRef, () => scrollViewRef.current as ScrollView, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const keyboardShowSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      if (scrollViewRef.current && keyboardScrollExtraOffset) {
        const screenHeight = Dimensions.get('window').height;
        const keyboardHeight = e.endCoordinates.height;
        const safeAreaBottom = 0;
        const availableScreenHeight = screenHeight - keyboardHeight - safeAreaBottom;

        // 현재 터치 위치와 스크롤 위치를 기반으로 새로운 스크롤 위치 계산
        const currentScrollPosition = positionRef.current || 0;
        const touchPosition = lastTouchY.current || 0;

        const scrollOffset = touchPosition - availableScreenHeight + keyboardScrollExtraOffset;
        scrollViewRef.current.scrollTo({
          y: currentScrollPosition + scrollOffset,
          animated: true,
        });
      }
    });

    return () => {
      positionRef.current = null;
      lastTouchY.current = null;
      keyboardShowSubscription.remove();
    };
  }, [keyboardScrollExtraOffset]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (keyboardScrollExtraOffset) positionRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleTouch = (evt: any) => {
    if (keyboardScrollExtraOffset) lastTouchY.current = evt.nativeEvent.pageY;
  };

  return (
    <SafeAreaView
      style={[
        { backgroundColor: backgroundColor || palette.background.base },
        styles.flex1,
        styles.fullWidth,
      ]}
      edges={edges}
    >
      {!isDelayed && (
        <KeyboardAvoidingView
          style={[styles.flex1, styles.fullWidth]}
          behavior={behavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {topComponent && topComponent}

          {isLoader ? (
            loadingComponent
          ) : isScrollView ? (
            <ScrollViewAtom
              ref={scrollViewRef}
              style={[styles.flex1, styles.fullWidth]}
              bounces={false}
              overScrollMode="never"
              contentContainerStyle={styles.scrollContainerStyle}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
              onScroll={handleScroll}
              onTouchStart={handleTouch}
            >
              <ViewAtom style={[styles.flex1, styles.fullWidth, props.style]}>
                {props.children}
              </ViewAtom>
            </ScrollViewAtom>
          ) : (
            <ViewAtom style={[styles.flex1, styles.fullWidth, props.style]}>
              {props.children}
            </ViewAtom>
          )}

          {!isLoader && bottomComponent && bottomComponent}
        </KeyboardAvoidingView>
      )}
      <StatusBar
        barStyle={barStyle}
        backgroundColor={statusBarColor || palette.background.base}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  fullWidth: { width: Dimensions.get('window').width },
  scrollContainerStyle: {
    flexGrow: 1,
    alignItems: 'center',
    width: Dimensions.get('window').width,
  },
});

export default ZSContainer;
