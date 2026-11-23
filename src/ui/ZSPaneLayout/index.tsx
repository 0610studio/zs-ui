import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { I18nManager, Platform, ScrollView, StyleSheet, View, type HostInstance, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';
import { BlurTargetView } from 'expo-blur';
import { useHeaderOverlap } from '../../navigation/useHeaderInset';
import { useTabBarOverlap } from '../../navigation/useTabBarInset';
import { ZSHeaderBackground } from '../../navigation/ZSHeaderBackground';
import { HeaderFillContext } from '../../navigation/headerFill';
import { useTheme } from '../../context/ThemeContext';
import { resolveColor, type ColorName } from '../../theme/color';
import { useDisplayFeatures, useWindowLayout } from '../../layout/LayoutContext';
import { MATERIAL_PANE_SPACER, resolvePaneArrangement, type LocalFold, type PaneArrangement } from '../../layout/paneLayout';
import { PaneContext } from '../../layout/PaneContext';
import { classifyHeight, classifyWidth, narrowerClass } from '../../layout/windowClass';
import type { DisplayFeature, PaneRole, WindowSizeClassName } from '../../layout/types';

export type ZSPaneLayoutProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  divider?: boolean | ReactNode;
  spacing?: number;
  primaryFraction?: number;
  compactBehavior?: 'hide' | 'stack';
  scroll?: boolean;
  extendUnderTabBar?: boolean;
  tabletop?: boolean;
  backgroundColor?: ColorName | (string & {});
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type Frame = { x: number; y: number; width: number; height: number };

function toLocalFold(fold: DisplayFeature | null, frame: Frame | null): LocalFold | null {
  if (!fold || !frame) return null;
  const { rect, orientation, active } = fold;
  if (orientation === 'vertical') {
    const start = rect.x - frame.x;
    return start > 0 && start < frame.width ? { orientation, start, size: rect.width, active } : null;
  }
  const start = rect.y - frame.y;
  return start > 0 && start < frame.height ? { orientation, start, size: rect.height, active } : null;
}

function renderSeparator(arrangement: PaneArrangement, divider: boolean | ReactNode, color: string): ReactNode {
  if (arrangement.mode === 'single') return null;
  if (arrangement.gap > 0) {
    return <View style={arrangement.mode === 'split' ? { width: arrangement.gap } : { height: arrangement.gap }} testID="zs-pane-gap" />;
  }
  if (divider !== true) return divider === false ? null : divider;
  return <View style={[arrangement.mode === 'split' ? styles.divider : styles.horizontalDivider, { backgroundColor: color }]} />;
}

function ZSPaneLayout({
  primary,
  secondary,
  divider = Platform.OS === 'ios',
  spacing = Platform.OS === 'android' ? MATERIAL_PANE_SPACER : 0,
  primaryFraction = 0.4,
  compactBehavior = 'hide',
  scroll = false,
  extendUnderTabBar = false,
  tabletop = false,
  backgroundColor,
  style,
  testID,
}: ZSPaneLayoutProps) {
  const { colors } = useTheme();
  const layout = useWindowLayout();
  const { fold } = useDisplayFeatures();
  const insideScrollView = useContext(ScrollView.Context) != null;
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const rowRef = useRef<HostInstance>(null);
  const [frame, setFrame] = useState<Frame | null>(null);

  useEffect(() => {
    if (__DEV__ && insideScrollView) {
      console.warn('[ZSPaneLayout] ScrollView 안에 두지 마세요. 화면 최상위에 두고 pane 별 스크롤은 scroll prop 을 쓰세요.');
    }
  }, [insideScrollView]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setMeasuredWidth((prev) => (prev !== null && Math.abs(prev - next) < 0.5 ? prev : next));
    rowRef.current?.measureInWindow((x, y, width, height) => {
      setFrame((prev) =>
        prev && prev.x === x && prev.y === y && prev.width === width && prev.height === height ? prev : { x, y, width, height },
      );
    });
  }, []);

  const containerWidth = measuredWidth ?? layout.width;
  const containerHeight = frame?.height ?? layout.height;
  const surfaceColor = resolveColor(colors, backgroundColor) ?? colors.background;

  return (
    <SafeAreaProvider style={[styles.flex1, { backgroundColor: surfaceColor }, style]}>
      <PaneRow
        primary={primary}
        secondary={secondary}
        divider={divider}
        dividerColor={colors.border}
        spacing={spacing}
        primaryFraction={primaryFraction}
        compactBehavior={compactBehavior}
        scroll={scroll}
        extendUnderTabBar={extendUnderTabBar}
        tabletop={tabletop}
        surfaceColor={surfaceColor}
        windowClass={layout.widthClass}
        windowHeightClass={layout.heightClass}
        fold={toLocalFold(fold, frame)}
        width={containerWidth}
        height={containerHeight}
        measuredHeight={frame?.height}
        rowRef={rowRef}
        onLayout={handleLayout}
        testID={testID}
      />
    </SafeAreaProvider>
  );
}

type PaneRowProps = Pick<ZSPaneLayoutProps, 'primary' | 'secondary' | 'divider' | 'testID'> & {
  dividerColor: string;
  spacing: number;
  primaryFraction: number;
  compactBehavior: 'hide' | 'stack';
  scroll: boolean;
  extendUnderTabBar: boolean;
  tabletop: boolean;
  surfaceColor: string;
  windowClass: WindowSizeClassName;
  windowHeightClass: WindowSizeClassName;
  fold: LocalFold | null;
  width: number;
  height: number;
  measuredHeight: number | undefined;
  rowRef: React.RefObject<HostInstance | null>;
  onLayout: (event: LayoutChangeEvent) => void;
};

function PaneRow({
  primary,
  secondary,
  divider,
  dividerColor,
  spacing,
  primaryFraction,
  compactBehavior,
  scroll,
  extendUnderTabBar,
  tabletop,
  surfaceColor,
  windowClass,
  windowHeightClass,
  fold,
  width,
  height,
  measuredHeight,
  rowRef,
  onLayout,
  testID,
}: PaneRowProps) {
  const insets = useSafeAreaInsets();
  const rtl = I18nManager.isRTL;
  const dividerWidth = divider === true ? StyleSheet.hairlineWidth : 0;
  const arrangement = resolvePaneArrangement({
    widthClass: windowClass,
    width,
    primaryFraction,
    dividerWidth,
    spacing,
    fold,
    rtl,
    height: measuredHeight,
    tabletop,
    insets: { start: rtl ? insets.right : insets.left, end: rtl ? insets.left : insets.right },
  });
  const separator = renderSeparator(arrangement, divider, dividerColor);

  const leading: Edge = rtl ? 'right' : 'left';
  const trailing: Edge = rtl ? 'left' : 'right';
  const paneProps = { scroll, extendUnderTabBar, surfaceColor, windowClass, windowHeightClass };

  return (
    <View
      key={arrangement.mode}
      ref={rowRef}
      style={arrangement.mode === 'stacked' ? styles.column : styles.row}
      onLayout={onLayout}
      testID={testID}
    >
      {arrangement.mode === 'split' ? (
        <>
          <Pane {...paneProps} role="primary" sides={[leading]} width={arrangement.primaryWidth} estimatedWidth={arrangement.primaryWidth} estimatedHeight={height} testID="zs-pane-primary">
            {primary}
          </Pane>
          {separator}
          <Pane {...paneProps} role="secondary" sides={[trailing]} estimatedWidth={arrangement.secondaryWidth} estimatedHeight={height} testID="zs-pane-secondary">
            {secondary}
          </Pane>
        </>
      ) : arrangement.mode === 'stacked' ? (
        <>
          <Pane {...paneProps} role="primary" sides={[leading, trailing]} vertical={['top']} height={arrangement.primaryHeight} estimatedWidth={width} estimatedHeight={arrangement.primaryHeight} testID="zs-pane-primary">
            {primary}
          </Pane>
          {separator}
          <Pane {...paneProps} role="secondary" sides={[leading, trailing]} vertical={['bottom']} estimatedWidth={width} estimatedHeight={arrangement.secondaryHeight} testID="zs-pane-secondary">
            {secondary}
          </Pane>
        </>
      ) : (
        <Pane {...paneProps} role="single" sides={[leading, trailing]} estimatedWidth={width} estimatedHeight={height} testID="zs-pane-primary">
          {compactBehavior === 'stack' && secondary ? (
            scroll ? <>{primary}{secondary}</> : (
              <>
                <View style={styles.flex1}>{primary}</View>
                <View style={styles.flex1}>{secondary}</View>
              </>
            )
          ) : primary}
        </Pane>
      )}
    </View>
  );
}

type PaneProps = {
  role: PaneRole;
  sides: Edge[];
  vertical?: Edge[];
  scroll: boolean;
  extendUnderTabBar: boolean;
  surfaceColor: string;
  width?: number;
  height?: number;
  estimatedWidth: number;
  estimatedHeight: number;
  windowClass: WindowSizeClassName;
  windowHeightClass: WindowSizeClassName;
  testID: string;
  children: ReactNode;
};

function Pane({
  role,
  sides,
  vertical = ['top', 'bottom'],
  scroll,
  extendUnderTabBar,
  surfaceColor,
  width,
  height,
  estimatedWidth,
  estimatedHeight,
  windowClass,
  windowHeightClass,
  testID,
  children,
}: PaneProps) {
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null);
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout;
    setContentSize((prev) =>
      prev && Math.abs(prev.width - next.width) < 0.5 && Math.abs(prev.height - next.height) < 0.5
        ? prev
        : { width: next.width, height: next.height },
    );
  }, []);

  const paneWidth = contentSize?.width ?? estimatedWidth;
  const paneHeight = contentSize?.height ?? estimatedHeight;
  const pane = useMemo(
    () => ({
      role,
      width: paneWidth,
      widthClass: narrowerClass(windowClass, classifyWidth(paneWidth)),
      height: paneHeight,
      heightClass: narrowerClass(windowHeightClass, classifyHeight(paneHeight)),
    }),
    [role, paneWidth, paneHeight, windowClass, windowHeightClass],
  );

  const isIOS = Platform.OS === 'ios';
  const headerOverlap = useHeaderOverlap(vertical.includes('top'));
  const tabBarOverlap = useTabBarOverlap(vertical.includes('bottom'));
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const inheritedFill = useContext(HeaderFillContext);
  const headerFill = role === 'secondary' ? null : inheritedFill;
  const blurHeader = Platform.OS === 'android' && scroll && headerOverlap > 0;
  const blurTarget = useRef<HostInstance>(null);

  const baseEdges: Edge[] = scroll && isIOS ? sides : [...sides, ...vertical];
  const edges = baseEdges.filter(
    (edge) => !(edge === 'top' && headerOverlap > 0) && !(edge === 'bottom' && tabBarOverlap > 0 && (scroll || extendUnderTabBar)),
  );
  // extendUnderTabBar 인 고정 pane 은 탭 바 뒤까지 깔리고, 안의 콘텐츠가 아래 inset·탭 바만큼 직접 비킨다
  const fixedTabBarPadding = extendUnderTabBar ? 0 : tabBarOverlap;
  const scrollView = scroll ? (
    <ScrollView
      style={blurHeader ? [styles.flex1, { backgroundColor: surfaceColor }] : styles.flex1}
      scrollEventThrottle={16}
      onScroll={(event) => {
        const next = event.nativeEvent.contentOffset.y > 0.5;
        setScrolled((prev) => (prev === next ? prev : next));
      }}
      contentContainerStyle={[
        styles.scrollContent,
        headerOverlap > 0 ? { paddingTop: headerOverlap } : null,
        tabBarOverlap > 0 ? { paddingBottom: bottomInset + tabBarOverlap } : null,
      ]}
      contentInsetAdjustmentBehavior={isIOS ? 'automatic' : 'never'}
      keyboardShouldPersistTaps="handled"
      onLayout={handleLayout}
    >
      {children}
    </ScrollView>
  ) : null;
  return (
    <PaneContext.Provider value={pane}>
      <HeaderFillContext.Provider value={headerFill}>
        <View style={width !== undefined ? { width } : height !== undefined ? { height } : styles.flex1} testID={testID}>
          <SafeAreaView
            edges={edges}
            style={!scroll && (headerOverlap > 0 || fixedTabBarPadding > 0) ? [styles.flex1, { paddingTop: headerOverlap, paddingBottom: fixedTabBarPadding }] : styles.flex1}
          >
            {scroll ? (
              blurHeader ? (
                <BlurTargetView ref={blurTarget} style={styles.flex1}>
                  {scrollView}
                </BlurTargetView>
              ) : (
                scrollView
              )
            ) : (
              <View style={styles.flex1} onLayout={handleLayout}>
                {children}
              </View>
            )}
            {headerOverlap > 0 && scroll ? (
              <ZSHeaderBackground color={surfaceColor} height={headerOverlap} scrolled={scrolled} blurTarget={blurHeader ? blurTarget : undefined} />
            ) : null}
          </SafeAreaView>
        </View>
      </HeaderFillContext.Provider>
    </PaneContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  column: { flex: 1, flexDirection: 'column' },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  horizontalDivider: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  scrollContent: { flexGrow: 1 },
});

export default ZSPaneLayout;
