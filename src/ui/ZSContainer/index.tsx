import React, { ReactNode, useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { ViewProps, KeyboardAvoidingView, StatusBar, StyleSheet, ActivityIndicator, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Keyboard, View, DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../model/useThemeProvider';
import VariantView from './ui/VariantView';

export type ZSContainerProps = ViewProps & {
  backgroundColor?: string;
  isLoader?: boolean;
  statusBarColor?: string;
  barStyle?: 'light-content' | 'dark-content';
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  scrollViewDisabled?: boolean;
  topComponent?: ReactNode;
  bottomComponent?: ReactNode;
  rightComponent?: ReactNode;
  showsVerticalScrollIndicator?: boolean;
  loadingComponent?: React.ReactNode;
  keyboardVerticalOffset?: number;
  behavior?: 'padding' | 'height' | 'position';
  automaticallyAdjustKeyboardInsets?: boolean;
  keyboardScrollExtraOffset?: number;
  translucent?: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
};

export type ZSContainerRef = ScrollView;

const ZSContainer = forwardRef<ZSContainerRef, ZSContainerProps>(function ZSContainer(
  {
    backgroundColor,
    isLoader = false,
    statusBarColor,
    barStyle,
    edges = ['top', 'bottom'],
    scrollViewDisabled = false,
    topComponent,
    bottomComponent,
    rightComponent,
    showsVerticalScrollIndicator = true,
    loadingComponent = <ActivityIndicator />,
    keyboardVerticalOffset,
    behavior,
    automaticallyAdjustKeyboardInsets = true,
    keyboardScrollExtraOffset,
    translucent,
    scrollEventThrottle = 100,
    ...props
  },
  forwardedRef
) {
  const { palette, splitBreakpoint, splitRatio, dimensions: { height: windowHeight, width: windowWidth }, isSplitView } = useTheme();
  const [isDelayed, setIsDelayed] = useState(true);
  const positionRef = useRef<number | null>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastTouchY = useRef<number | null>(0);
  const splitEnabled = !!(isSplitView && (windowWidth >= splitBreakpoint) && rightComponent);

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
        const screenHeight = windowHeight;
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
    if (props.onScroll) props.onScroll(event);
    if (keyboardScrollExtraOffset) positionRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleTouch = (evt: any) => {
    if (keyboardScrollExtraOffset) lastTouchY.current = evt.nativeEvent.pageY;
  };

  const renderContent = () => {
    if (isLoader) return loadingComponent;

    const leftWidth = (splitEnabled ? `${splitRatio * 100}%` : '100%') as DimensionValue;
    const rightWidth = `${(1 - splitRatio) * 100}%` as DimensionValue;

    return (
      <View style={styles.splitContainer}>

        {/* 메인 컴포넌트 */}
        <VariantView
          style={props.style}
          children={props.children}
          scrollViewRef={scrollViewRef}
          variantWidth={leftWidth}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
          scrollViewDisabled={scrollViewDisabled}
          scrollEventThrottle={scrollEventThrottle}
          handleScroll={handleScroll}
          handleTouch={handleTouch}
        />

        {/* 폴드/태블릿 화면 오른쪽 컴포넌트 */}
        {rightComponent && splitEnabled && (
          <VariantView
            style={styles.splitView}
            children={rightComponent}
            variantWidth={rightWidth}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
            scrollViewDisabled={false}
            scrollEventThrottle={scrollEventThrottle}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        { backgroundColor: backgroundColor || palette.background.base },
        styles.flex1,
        { width: '100%' },
      ]}
      edges={edges}
    >
      {!isDelayed && (
        <KeyboardAvoidingView
          style={[styles.flex1, { width: '100%' }]}
          behavior={behavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {topComponent && topComponent}
          {renderContent()}
          {!isLoader && bottomComponent && bottomComponent}
        </KeyboardAvoidingView>
      )}

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
  flex1: { flex: 1 },
  scrollContainerStyle: {
    flexGrow: 1,
    alignItems: 'center',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  splitView: {
    minHeight: '100%',
  },
});

export default ZSContainer;
