import React, { ReactNode, useEffect, useImperativeHandle, forwardRef, useRef, useState, useCallback, useMemo } from 'react';
import { ViewProps, StatusBar, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../model/useThemeProvider';
import useKeyboard from '../../model/useKeyboard';

const KEYBOARD_ANIMATION_DELAY = 50;

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
  const scrollTimeoutRef = useRef<number | null>(null);

  useImperativeHandle(forwardedRef, () => scrollViewRef.current as ScrollView, []);

  const handleKeyboardShow = (e: any) => {
    setKeyboardHeight(e.endCoordinates.height);
    
    if (scrollViewRef.current && scrollToFocusedInput) {
      const keyboardHeight = e.endCoordinates.height;
      const safeAreaBottom = 0;
      const availableScreenHeight = windowHeight - keyboardHeight - safeAreaBottom;
      const currentScrollPosition = positionRef.current || 0;
      const touchPosition = lastTouchY.current || 0;

      // 현재 터치 위치와 스크롤 위치를 기반으로 새로운 스크롤 위치 계산
      const scrollOffset = touchPosition - availableScreenHeight + keyboardScrollExtraOffset;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: currentScrollPosition + scrollOffset,
          animated: true,
        });
        scrollTimeoutRef.current = null;
      }, KEYBOARD_ANIMATION_DELAY);
    }
  };

  const handleKeyboardHide = () => {
    setKeyboardHeight(0);
  };

  useKeyboard({
    handleKeyboardShow,
    handleKeyboardHide,
  });

  useEffect(() => {
    return () => {
      positionRef.current = null;
      lastTouchY.current = null;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

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

export default ZSContainer;
