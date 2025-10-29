import React, { ReactNode, useEffect, useImperativeHandle, forwardRef, useRef, useState, useCallback, useMemo } from 'react';
import { ViewProps, StatusBar, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import useKeyboard from '../../model/useKeyboard';
import useFoldingState from '../../model/useFoldingState';
import { FoldingState } from '../../model/types';
import { MAX_FOLDABLE_SINGLE_WIDTH } from '../../model/utils';

const windowHeight = Dimensions.get('window').height;
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
  foldableSingleScreen?: boolean;
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
    foldableSingleScreen,
    dividerLineComponent,
    rightComponent,
    // ---
    ...props
  },
  forwardedRef
) {
  const { palette } = useTheme();
  const { foldingState, width } = useFoldingState();
  const positionRef = useRef<number | null>(0);
  const position2Ref = useRef<number | null>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollView2Ref = useRef<ScrollView>(null);
  const touchPositionRef = useRef<number | null>(0);
  const lastTouchY = useRef<number | null>(0);
  const [keyboardHeight, setKeyboardHeight] = useState<number | null>(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  useImperativeHandle(forwardedRef, () => scrollViewRef.current as ScrollView, [scrollViewDisabled]);

  const handleKeyboardShow = (e: any) => {
    setKeyboardHeight(e.endCoordinates.height);

    if ((scrollViewRef.current || scrollView2Ref.current) && scrollToFocusedInput) {
      const keyboardHeight = e.endCoordinates.height;
      const safeAreaBottom = 0;
      const availableScreenHeight = windowHeight - keyboardHeight - safeAreaBottom;

      // 현재 스크롤 위치 참조
      const currentScrollPosition = touchPositionRef.current === 1
        ? positionRef.current || 0
        : position2Ref.current || 0;

      const touchPosition = lastTouchY.current || 0;

      // 현재 터치 위치와 스크롤 위치를 기반으로 새로운 스크롤 위치 계산
      const scrollOffset = touchPosition - availableScreenHeight + keyboardScrollExtraOffset;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (touchPositionRef.current === 1) {
          scrollViewRef.current?.scrollTo({
            y: currentScrollPosition + scrollOffset,
            animated: true,
          });
        } else {
          scrollView2Ref.current?.scrollTo({
            y: currentScrollPosition + scrollOffset,
            animated: true,
          });
        }
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

  // 클린업
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
  
  // 에러 로그 출력
  useEffect(() => {
    if (foldableSingleScreen && (rightComponent || dividerLineComponent)) {
      console.error('[ZSContainer] foldableSingleScreen일 때는 rightComponent/dividerLineComponent를 사용할 수 없습니다.');
    }
  }, [foldableSingleScreen, rightComponent, dividerLineComponent]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>, position: 1 | 2) => {
    if (props.onScroll) props.onScroll(event);

    if (position === 1) {
      positionRef.current = event.nativeEvent.contentOffset.y;
    } else {
      position2Ref.current = event.nativeEvent.contentOffset.y;
    }
  }, [props.onScroll]);

  const handleTouch = useCallback((evt: any, position: 1 | 2) => {
    lastTouchY.current = evt.nativeEvent.pageY;
    touchPositionRef.current = position;
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
      <View style={[styles.w100, { backgroundColor: "#00000009" }]}>
        <View style={[styles.w100, { maxWidth: foldableSingleScreen ? Math.min(width, MAX_FOLDABLE_SINGLE_WIDTH) : '100%', alignSelf: 'center', backgroundColor: palette.background.base }]}>
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
                  onScroll={(event) => { handleScroll(event, 1); }}
                  onTouchStart={(evt) => handleTouch(evt, 1)}
                  // ---
                  {...SCROLL_VIEW_OPTIONS}
                >
                  <View style={[styles.flex1, containerStyle]}>
                    {props.children}
                  </View>
                </ScrollView>
              )}
            </View>
            {foldingState === FoldingState.UNFOLDED && !foldableSingleScreen && rightComponent && dividerLineComponent && dividerLineComponent}
            {
              foldingState === FoldingState.UNFOLDED && !foldableSingleScreen && rightComponent && (
                <View style={styles.flex1}>
                  {scrollViewDisabled ? (
                    <View style={[styles.flex1, containerStyle]}>
                      {rightComponent}
                    </View>
                  ) : (
                    <ScrollView
                      ref={scrollView2Ref}
                      style={styles.w100}
                      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                      contentContainerStyle={scrollContentStyle}
                      scrollEventThrottle={scrollEventThrottle}
                      onScroll={(event) => { handleScroll(event, 2); }}
                      onTouchStart={(evt) => handleTouch(evt, 2)}
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
  scrollContainerStyle: { alignItems: 'center', width: '100%', flexGrow: 1 },
});

export default ZSContainer;
