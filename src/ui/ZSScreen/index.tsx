import React, { ReactNode, cloneElement, useContext, useEffect, useImperativeHandle, forwardRef, useRef, useCallback, useMemo, useState } from 'react';
import { Platform, ViewProps, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, TextInput, View, type HostInstance, type KeyboardEvent, type LayoutChangeEvent, type RefreshControlProps, type ScrollViewInstance } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets, type Edge, type EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { resolveColor, type ColorName } from '../../theme/color';
import { useScreenCovered } from '../../context/ScreenCoverContext';
import { SurfaceContext } from '../../context/SurfaceContext';
import { BottomStickyContext, useBottomBarStore } from '../../context/BottomBarContext';
import { NavigationContext } from 'expo-router/react-navigation';
import { useHeaderOverlap } from '../../navigation/useHeaderInset';
import { useTabBarOverlap } from '../../navigation/useTabBarInset';
import { ZSHeaderBackground } from '../../navigation/ZSHeaderBackground';
import useKeyboard from '../../model/useKeyboard';
import { useWindowLayout } from '../../layout/LayoutContext';
import { useCanSplitPanes } from '../../layout/useCanSplitPanes';
import { resolveContentMaxWidth } from '../../layout/windowClass';
import type { ContentMaxWidth } from '../../layout/types';
import { InputFocusContext } from './InputFocusContext';
import { ScreenBottomInsetContext } from './BottomInsetContext';

const KEYBOARD_ANIMATION_DELAY = 50;
const SCROLL_VIEW_OPTIONS = {
  keyboardShouldPersistTaps: "handled" as const,
  automaticallyAdjustKeyboardInsets: false
}

function ContainerInsets({ enabled, children }: {
  enabled: boolean;
  children: (headerOverlap: number, insets: EdgeInsets, tabBarOverlap: number) => ReactNode;
}) {
  const headerOverlap = useHeaderOverlap(enabled);
  const tabBarOverlap = useTabBarOverlap(enabled);
  const insets = useSafeAreaInsets();
  return <>{children(headerOverlap, insets, tabBarOverlap)}</>;
}

let nextBottomBarOwner = 0;

function useBottomBarReport() {
  const store = useBottomBarStore();
  const navigation = useContext(NavigationContext);
  const ref = useRef<HostInstance>(null);
  const [owner] = useState(() => ++nextBottomBarOwner);
  const active = store !== null && navigation !== undefined;
  const stickyTop = useRef<number | null>(null);

  const report = useCallback(() => {
    if (!active || !navigation?.isFocused()) return;
    ref.current?.measureInWindow((_x, y) => store?.set({ owner, top: stickyTop.current === null ? y : Math.min(y, stickyTop.current) }));
  }, [active, navigation, store, owner]);
  const reportRef = useRef(report);

  useEffect(() => {
    reportRef.current = report;
    report();
  }, [report]);

  useEffect(() => {
    if (!active || !navigation || !store) return undefined;
    const release = () => {
      if (store.get()?.owner === owner) store.set(null);
    };
    const offFocus = navigation.addListener('focus', () => reportRef.current());
    const offBlur = navigation.addListener('blur', release);
    return () => {
      offFocus();
      offBlur();
      release();
    };
  }, [active, navigation, store, owner]);

  const setSticky = useCallback((top: number | null) => {
    stickyTop.current = top;
    reportRef.current();
  }, []);

  return { ref, onLayout: report, active, setSticky };
}

export type ZSScreenBottomPlacement = 'full' | 'start' | 'end';

export type ZSScreenProps = ViewProps & {
  backgroundColor?: ColorName | (string & {});
  edges?: Edge[];
  maxContentWidth?: ContentMaxWidth;
  scrollEnabled?: boolean;
  extendUnderTabBar?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  bounces?: boolean;
  topComponent?: ReactNode;
  bottomComponent?: ReactNode;
  bottomComponentPlacement?: ZSScreenBottomPlacement;
  showsVerticalScrollIndicator?: boolean;
  keyboardScrollExtraOffset?: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
  scrollToFocusedInput?: boolean;
};

export type ZSScreenRef = ScrollViewInstance;

const ZSScreen = forwardRef<ZSScreenRef, ZSScreenProps>(function ZSScreen(
  {
    backgroundColor,
    edges,
    maxContentWidth = 'none',
    scrollEnabled = true,
    extendUnderTabBar = false,
    refreshControl,
    bounces,
    topComponent,
    bottomComponent,
    bottomComponentPlacement = 'full',
    showsVerticalScrollIndicator = true,
    keyboardScrollExtraOffset = 30,
    scrollEventThrottle = 16,
    scrollToFocusedInput = true,
    style,
    children,
    onScroll,
    ...viewProps
  },
  forwardedRef
) {
  const { colors } = useTheme();
  const screenCovered = useScreenCovered();
  const bottomBar = useBottomBarReport();
  const isIOS = Platform.OS === 'ios';
  const { widthClass, readableMaxWidth } = useWindowLayout();
  const contentMaxWidth = resolveContentMaxWidth(maxContentWidth, { widthClass, readableMaxWidth });
  // 한쪽 CTA 는 ZSPaneLayout 이 두 칸으로 나누는 창에서만 — 폭 등급이 아니라 같은 분할 규칙(큰 화면 창·pane 최소 폭)을 본다.
  // 화면 확대로 compact 가 된 펼친 Fold 도 두 칸이라 한쪽에 두고, 한 칸이면 전폭으로 둔다
  const canSplit = useCanSplitPanes();
  const bottomSide = bottomComponent && bottomComponentPlacement !== 'full' && canSplit ? bottomComponentPlacement : null;
  const [bottomSideHeight, setBottomSideHeight] = useState(0);
  const handleBottomSideLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setBottomSideHeight((prev) => (prev === height ? prev : height));
  }, []);
  const bottomInset = bottomSide ? bottomSideHeight : 0;
  const isAutoEdges = edges === undefined;
  const isIOSAutoInset = isAutoEdges && isIOS;
  const positionRef = useRef(0);
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const scrollContentRef = useRef<HostInstance>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useImperativeHandle(forwardedRef, () => scrollViewRef.current as ScrollViewInstance, [scrollEnabled]);

  // 지금 contentOffset 을 화면 좌표로 잰다(스크롤 뷰 윗변 - 콘텐츠 윗변). iOS 가 헤더·safe area 를 자동 인셋으로 넣으면
  // 정지 offset 이 0 이 아니라 -인셋이라, onScroll 로 받아 둔 값은 확인용으로만 쓴다
  const measureScrollOffset = useCallback((done: (offset: number) => void) => {
    const scrollView = scrollViewRef.current;
    const outer = scrollView?.getNativeScrollRef?.();
    const inner = scrollView?.getInnerViewRef?.();
    if (!outer?.measureInWindow || !inner?.measureInWindow) {
      done(positionRef.current);
      return;
    }
    outer.measureInWindow((_x, outerY) => {
      inner.measureInWindow((_innerX, innerY) => done(outerY - innerY));
    });
  }, []);

  const scrollFocusedInputIntoView = useCallback((keyboardTop: number) => {
    const input = TextInput.State.currentlyFocusedInput();
    const content = scrollContentRef.current;
    if (!input || !content) return;
    // 이 컨테이너 밖(시트·모달) 입력이면 measureLayout 이 실패한다
    input.measureLayout(content, () => {
      input.measureInWindow((_x, y, _width, height) => {
        const overlap = y + height + keyboardScrollExtraOffset - keyboardTop;
        if (overlap <= 0) return;
        // 목표는 '지금 offset + 가린 만큼'. 본문 아래 여백이 키보드 높이 + 여유라 끝을 넘지 않고,
        // iOS 자동 인셋 아래서는 목표가 음수(-인셋 ~ 0)일 수 있어 scrollToOverflowEnabled 로 네이티브 0 하한을 푼다
        measureScrollOffset((offset) => {
          scrollViewRef.current?.scrollTo({ y: offset + overlap, animated: true });
        });
      });
    }, () => {});
  }, [keyboardScrollExtraOffset, measureScrollOffset]);

  const keyboardTopRef = useRef<number | null>(null);

  const scheduleScrollToFocusedInput = useCallback((keyboardTop: number) => {
    if (!scrollToFocusedInput || !scrollEnabled) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
      scrollFocusedInputIntoView(keyboardTop);
    }, KEYBOARD_ANIMATION_DELAY);
  }, [scrollToFocusedInput, scrollEnabled, scrollFocusedInputIntoView]);

  const handleKeyboardShow = (e: KeyboardEvent) => {
    keyboardTopRef.current = e.endCoordinates.screenY;
    scheduleScrollToFocusedInput(e.endCoordinates.screenY);
  };

  const handleKeyboardHide = () => {
    keyboardTopRef.current = null;
  };

  const notifyInputFocus = useCallback(() => {
    if (keyboardTopRef.current !== null) scheduleScrollToFocusedInput(keyboardTopRef.current);
  }, [scheduleScrollToFocusedInput]);

  const { keyboardHeight } = useKeyboard({
    handleKeyboardShow,
    handleKeyboardHide,
  });

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScroll?.(event);
    const y = event.nativeEvent.contentOffset.y;
    positionRef.current = y;
    const next = y > 0.5;
    setScrolled((prev) => (prev === next ? prev : next));
  }, [onScroll]);

  const contentBackground = StyleSheet.flatten(style)?.backgroundColor;
  const surfaceColor = resolveColor(colors, backgroundColor) ?? contentBackground ?? colors.background;
  const bounce = bounces ?? refreshControl != null;

  const rootStyle = useMemo(() => [
    styles.w100,
    { backgroundColor: surfaceColor },
  ], [surfaceColor]);

  const rootEdges = useMemo<Edge[]>(() => {
    if (!isAutoEdges) return edges;
    if (isIOS) return ['left', 'right'];
    return bottomComponent ? ['left', 'right', 'top'] : ['left', 'right', 'top', 'bottom'];
  }, [isAutoEdges, isIOS, edges, bottomComponent]);

  const fixedContentEdges: Edge[] = bottomComponent ? ['top'] : ['top', 'bottom'];

  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const handleScrollViewLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight((prev) => (prev === height ? prev : height));
  }, []);

  // 키보드가 떠 있는 동안은 키보드 높이에 포커스 여유까지 더해, 가린 만큼 올려도 스크롤 끝을 넘지 않게 한다
  const keyboardPadding = keyboardHeight > 0 ? keyboardHeight + keyboardScrollExtraOffset : 0;
  const scrollContentStyle = useMemo(() => [
    styles.scrollContainerStyle,
    { paddingBottom: keyboardPadding + bottomInset },
  ], [keyboardPadding, bottomInset]);

  const columnStyle = useMemo(() => (
    contentMaxWidth === undefined ? undefined : { width: '100%' as const, maxWidth: contentMaxWidth, alignSelf: 'center' as const }
  ), [contentMaxWidth]);

  const containerStyle = useMemo(() => [
    styles.w100,
    columnStyle,
    style
  ], [columnStyle, style]);

  const slot = (node: ReactNode) => (columnStyle && node ? <View style={columnStyle}>{node}</View> : node);

  const bottomEdgeProbe = (
    <View ref={bottomBar.ref} collapsable={false} pointerEvents="none" accessible={false} onLayout={bottomBar.onLayout} style={styles.edgeProbe} />
  );

  // 한쪽 CTA — 본문은 아래 끝까지 두고, 그 위 바닥에 절반 폭으로 띄운다. 측정 점은 CTA 윗변(스낵바 바닥)
  const renderBottomSide = () => (
    <View pointerEvents="box-none" style={styles.sideDock} testID="zs-screen-bottom-side">
      {bottomEdgeProbe}
      <View pointerEvents="box-none" style={[styles.sideRow, columnStyle, bottomSide === 'end' && styles.sideRowEnd]}>
        <View style={styles.sideSlot} onLayout={handleBottomSideLayout}>
          {bottomComponent}
        </View>
      </View>
    </View>
  );

  const renderTop = (headerOverlap: number) => {
    if (!topComponent) return null;
    if (headerOverlap > 0) return <View style={{ paddingTop: headerOverlap }}>{slot(topComponent)}</View>;
    if (isIOSAutoInset) return <SafeAreaView edges={['top']}>{slot(topComponent)}</SafeAreaView>;
    return slot(topComponent);
  };

  const refreshControlFor = (underHeader: number) =>
    refreshControl && underHeader > 0 && refreshControl.props.progressViewOffset === undefined
      ? cloneElement(refreshControl, { progressViewOffset: underHeader })
      : refreshControl;

  const fillStyle = (insets: EdgeInsets) => {
    if (!isIOSAutoInset || scrollViewHeight <= 0) return null;
    const insetTop = topComponent ? 0 : insets.top;
    const insetBottom = bottomComponent ? 0 : insets.bottom;
    return { flexGrow: 0, minHeight: Math.max(0, scrollViewHeight - insetTop - insetBottom) };
  };

  const renderBody = (underHeader: number, insets: EdgeInsets, underTabBar: number) => {
    if (!scrollEnabled) {
      if (isIOSAutoInset) {
        return (
          <SafeAreaView {...viewProps} style={[styles.flex1, containerStyle]} edges={fixedContentEdges}>
            {children}
          </SafeAreaView>
        );
      }
      const fixedBody = (
        <View {...viewProps} style={[styles.flex1, containerStyle]}>
          {children}
        </View>
      );
      // extendUnderTabBar 면 본문이 탭 바 뒤까지 깔리고, 안의 목록이 아래 inset·탭 바만큼 직접 비킨다
      const fixedTabBarPadding = extendUnderTabBar ? 0 : underTabBar;
      return underHeader > 0 || fixedTabBarPadding > 0
        ? <View style={[styles.flex1, { paddingTop: underHeader, paddingBottom: fixedTabBarPadding }]}>{fixedBody}</View>
        : fixedBody;
    }
    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.w100}
        contentInsetAdjustmentBehavior={isIOSAutoInset ? 'automatic' : 'never'}
        // 자동 인셋 아래서 정지 offset 은 -인셋. 네이티브 scrollTo 는 contentInset(0) 기준 0 아래를 막으므로 푼다
        scrollToOverflowEnabled={isIOSAutoInset || undefined}
        onLayout={isIOSAutoInset ? handleScrollViewLayout : undefined}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={[
          scrollContentStyle,
          fillStyle(insets),
          underHeader > 0 ? { paddingTop: underHeader } : null,
          underTabBar > 0 && keyboardHeight === 0 ? { paddingBottom: insets.bottom + underTabBar } : null,
        ]}
        scrollEventThrottle={scrollEventThrottle}
        onScroll={handleScroll}
        scrollsToTop={!screenCovered}
        bounces={bounce}
        overScrollMode={bounce ? 'auto' : 'never'}
        refreshControl={refreshControlFor(underHeader)}
        {...SCROLL_VIEW_OPTIONS}
      >
        <View {...viewProps} ref={scrollContentRef} style={[styles.flex1, containerStyle]}>
          {children}
        </View>
      </ScrollView>
    );
  };

  return (
    <InputFocusContext.Provider value={notifyInputFocus}>
      <ScreenBottomInsetContext.Provider value={bottomInset}>
      <BottomStickyContext.Provider value={bottomBar.active ? bottomBar.setSticky : null}>
      <SurfaceContext.Provider value={typeof surfaceColor === 'string' ? surfaceColor : null}>
      <SafeAreaProvider>
          <ContainerInsets enabled={isAutoEdges}>
          {(headerOverlap, insets, tabBarOverlap) => {
            const underHeader = topComponent ? 0 : headerOverlap;
            const underTabBar = bottomComponent ? 0 : tabBarOverlap;
            const body = renderBody(underHeader, insets, underTabBar);
            const edgesForRoot = rootEdges.filter(
              (edge) => !(edge === 'top' && headerOverlap > 0) && !(edge === 'bottom' && underTabBar > 0 && (scrollEnabled || extendUnderTabBar)),
            );
            return (
              <SafeAreaView style={rootStyle} edges={edgesForRoot}>
                <View style={styles.w100}>
                  {renderTop(headerOverlap)}
                  {isAutoEdges && bottomComponent ? (
                    <SafeAreaView mode="margin" edges={['bottom']} style={styles.flex1}>
                      <View style={tabBarOverlap > 0 ? [styles.flex1, { marginBottom: tabBarOverlap }] : styles.flex1}>
                        {body}
                        {bottomSide ? renderBottomSide() : (
                          <>
                            {bottomEdgeProbe}
                            <View style={[styles.staticSlot, columnStyle]}>{bottomComponent}</View>
                          </>
                        )}
                      </View>
                    </SafeAreaView>
                  ) : bottomSide ? (
                    <View style={styles.flex1}>
                      {body}
                      {renderBottomSide()}
                    </View>
                  ) : (
                    <>
                      {body}
                      {bottomComponent ? bottomEdgeProbe : null}
                      {slot(bottomComponent)}
                    </>
                  )}
                  {bottomBar.active && !bottomComponent ? (
                    <View
                      ref={bottomBar.ref}
                      collapsable={false}
                      pointerEvents="none"
                      accessible={false}
                      onLayout={bottomBar.onLayout}
                      testID="zs-screen-bottom-probe"
                      style={[styles.bottomProbe, { bottom: (edgesForRoot.includes('bottom') ? 0 : insets.bottom) + tabBarOverlap }]}
                    />
                  ) : null}
                  {underHeader > 0 && scrollEnabled ? <ZSHeaderBackground color={surfaceColor} height={underHeader} scrolled={scrolled} /> : null}
                </View>
              </SafeAreaView>
            );
          }}
        </ContainerInsets>
      </SafeAreaProvider>
      </SurfaceContext.Provider>
      </BottomStickyContext.Provider>
      </ScreenBottomInsetContext.Provider>
    </InputFocusContext.Provider>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  w100: { flex: 1, width: '100%' },
  scrollContainerStyle: { alignItems: 'center', width: '100%', flexGrow: 1 },
  staticSlot: { position: 'static' },
  bottomProbe: { position: 'absolute', left: 0, width: 0, height: 0 },
  edgeProbe: { height: 0 },
  sideDock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  sideRow: { width: '100%', flexDirection: 'row' },
  sideRowEnd: { justifyContent: 'flex-end' },
  sideSlot: { width: '50%' },
});

export default ZSScreen;
