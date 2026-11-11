import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';
import { ZSHeaderBackground, useHeaderInset, useTabBarInset } from '@0610studio/zs-ui';

function topPaddingOf(style: ScrollViewProps['contentContainerStyle']): number {
  const { paddingTop, paddingVertical, padding } = StyleSheet.flatten(style) ?? {};
  const value = paddingTop ?? paddingVertical ?? padding;
  return typeof value === 'number' ? value : 0;
}

function bottomPaddingOf(style: ScrollViewProps['contentContainerStyle']): number {
  const { paddingBottom, paddingVertical, padding } = StyleSheet.flatten(style) ?? {};
  const value = paddingBottom ?? paddingVertical ?? padding;
  return typeof value === 'number' ? value : 0;
}

export default function ScreenScrollView({ style, contentContainerStyle, children, onScroll, ...props }: ScrollViewProps) {
  const headerInset = useHeaderInset();
  const tabBarInset = useTabBarInset();
  const { bottom } = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const backgroundColor = StyleSheet.flatten(style)?.backgroundColor;
  const scrollView = (
    <ScrollView
      style={style}
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
      onScroll={(event) => {
        onScroll?.(event);
        const next = event.nativeEvent.contentOffset.y > 0.5;
        setScrolled((prev) => (prev === next ? prev : next));
      }}
      contentContainerStyle={[
        contentContainerStyle,
        headerInset > 0 ? { paddingTop: topPaddingOf(contentContainerStyle) + headerInset } : null,
        tabBarInset > 0 ? { paddingBottom: bottomPaddingOf(contentContainerStyle) + bottom + tabBarInset } : null,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
  return (
    <SafeAreaView edges={tabBarInset > 0 ? EDGES_UNDER_TAB_BAR : EDGES} style={[styles.flex1, { backgroundColor }]}>
      {scrollView}
      {Platform.OS === 'android' && headerInset > 0 ? <ZSHeaderBackground color={backgroundColor} scrolled={scrolled} /> : null}
    </SafeAreaView>
  );
}

const EDGES: Edge[] = Platform.OS === 'android' ? ['left', 'right', 'bottom'] : ['left', 'right'];
const EDGES_UNDER_TAB_BAR: Edge[] = ['left', 'right'];

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
