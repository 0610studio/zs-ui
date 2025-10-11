import React, { ReactNode, useEffect, useImperativeHandle, forwardRef, useRef, useState, useCallback, useMemo } from 'react';
import { ViewProps, StatusBar, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../model/useThemeProvider';
import useKeyboard from '../../model/useKeyboard';
import useFoldingState from '../../model/useFoldingState';
import { FoldingState } from '../../model/types';

const KEYBOARD_ANIMATION_DELAY = 50;
const SCROLL_VIEW_OPTIONS = {
  bounces: false,
  overScrollMode: "never" as const,
  keyboardShouldPersistTaps: "handled" as const,
  automaticallyAdjustKeyboardInsets: false
}

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
  dividerLineComponent?: ReactNode;
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
    showsVerticalScrollIndicator = true,
    keyboardScrollExtraOffset = 30,
    translucent,
    scrollEventThrottle = 16,
    scrollToFocusedInput = true,
    // foldable device
    dividerLineComponent,
    rightComponent,
    // ---
    ...props
  },
  forwardedRef
) {
  const { palette, dimensions: { height: windowHeight } } = useTheme();
  const { foldingState, width } = useFoldingState();
  const positionRef = useRef<number | null>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastTouchY = useRef<number | null>(0);
  const [keyboardHeight, setKeyboardHeight] = useState<number | null>(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  useImperativeHandle(forwardedRef, () => scrollViewRef.current as ScrollView, [scrollViewDisabled]);

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
    styles.w100
  ], [backgroundColor, palette.background.base]);

  const scrollContentStyle = useMemo(() => [
    styles.scrollContainerStyle,
    {
      paddingBottom: keyboardHeight ? keyboardHeight : 0
    }
  ], [keyboardHeight]);

  const containerStyle = useMemo(() => [
    styles.w100,
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
      <View style={styles.w100}>
        {topComponent}
        <View style={[styles.w100, { flexDirection: 'row' }]}>
          <View style={styles.flex1}>
            {scrollViewDisabled ? (
              <View style={[styles.flex1, containerStyle]}>
                {props.children}
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                style={styles.w100}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                contentContainerStyle={scrollContentStyle}
                scrollEventThrottle={scrollEventThrottle}
                onScroll={handleScroll}
                onTouchStart={handleTouch}
                // ---
                {...SCROLL_VIEW_OPTIONS}
              >
                <View style={[styles.flex1, containerStyle]}>
                {props.children}
                </View>
              </ScrollView>
            )}
          </View>
          {foldingState === FoldingState.UNFOLDED && rightComponent && dividerLineComponent && dividerLineComponent}
          {
            foldingState === FoldingState.UNFOLDED && rightComponent && (
              <View style={styles.flex1}>
                {scrollViewDisabled ? (
                  <View style={[styles.flex1, containerStyle]}>
                    {rightComponent}
                  </View>
                ) : (
                  <ScrollView
                    style={styles.w100}
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                    contentContainerStyle={scrollContentStyle}
                    scrollEventThrottle={scrollEventThrottle}
                    // ---
                    {...SCROLL_VIEW_OPTIONS}
                  >
                    <View style={[styles.flex1, containerStyle]}>
                      {rightComponent}
                    </View>
                  </ScrollView>
                )}
              </View>
            )
          }
        </View >
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
  flex1: { flex: 1 },
  w100: { flex: 1, width: '100%' },
  scrollContainerStyle: { alignItems: 'center', width: '100%' },
});

export default ZSContainer;
