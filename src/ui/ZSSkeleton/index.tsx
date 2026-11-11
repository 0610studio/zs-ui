import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type HostInstance, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { resolveColor, type ColorMode, type ColorName, type ThemeColors } from '../../theme/color';
import { RADIUS, radiusStyle, type RadiusToken } from '../../theme/radius';
import { mixHex } from '../hexColor';
import SkiaShimmer from './SkiaShimmer';
import { SkeletonShapeContext, lineShapes, sameShapes, type ShimmerShape, type SkeletonShapeRegistry, type TextLayoutLine } from './SkeletonShapes';

export interface ZSSkeletonProps extends ViewProps {
  loading?: boolean;
  shimmerColor?: string;
  shimmerOpacity?: number;
  duration?: number;
}

export interface ZSSkeletonBoxProps extends ViewProps {
  height: number;
  backgroundColor?: ColorName | (string & {});
  radius?: RadiusToken;
  shimmerColor?: string;
  shimmerOpacity?: number;
  duration?: number;
}

const DARK_BOX_HIGHLIGHT = 0.12;

function boxShimmerColor(colors: ThemeColors, mode: ColorMode, background: string | undefined): string {
  if (mode === 'light') return colors.surface2;
  const lift = (base: string) => mixHex(colors.text, base, DARK_BOX_HIGHLIGHT);
  return (background !== undefined ? lift(background) : null) ?? lift(colors.surface4) ?? colors.surface4;
}

function contentShimmerColor(colors: ThemeColors, mode: ColorMode): string {
  return mode === 'dark' ? colors.text : colors.background;
}

function isCircleSlot(radius: RadiusToken, height: number, style: ZSSkeletonBoxProps['style']): boolean {
  return radius === 'full' && StyleSheet.flatten(style)?.width === height;
}

function SkeletonBox({ height, backgroundColor = 'surface4', radius = 'sm', shimmerColor, shimmerOpacity = 0.7, duration = 1100, style, ...props }: ZSSkeletonBoxProps) {
  const { colors, mode } = useTheme();
  const background = resolveColor(colors, backgroundColor);
  return (
    <View style={[styles.fullWidth, radiusStyle(radius), style, { height, overflow: 'hidden', backgroundColor: background }]} {...props}>
      {isCircleSlot(radius, height, style) ? null : (
        <SkiaShimmer color={shimmerColor ?? boxShimmerColor(colors, mode, background)} opacity={shimmerOpacity} duration={duration} />
      )}
    </View>
  );
}

function ZSSkeleton({ loading = true, children, ...props }: ZSSkeletonProps) {
  if (!loading) return <>{children}</>;
  return <LoadingSkeleton {...props}>{children}</LoadingSkeleton>;
}

function LoadingSkeleton({ style, children, shimmerColor, shimmerOpacity = 0.6, duration = 1100, onLayout, ...props }: Omit<ZSSkeletonProps, 'loading'>) {
  const { colors, mode } = useTheme();
  const hostRef = useRef<HostInstance>(null);
  const textsRef = useRef(new Map<string, { node: HostInstance; lines: readonly TextLayoutLine[] }>());
  const [shapesByText, setShapesByText] = useState<ReadonlyMap<string, ShimmerShape[]>>(() => new Map());

  const measureText = useCallback((key: string, node: HostInstance, lines: readonly TextLayoutLine[]) => {
    const host = hostRef.current;
    if (!host) return;
    node.measureLayout(host, (left, top) => {
      if (!textsRef.current.has(key)) return;
      const next = lineShapes(lines, left, top, RADIUS.xs);
      setShapesByText((prev) => (sameShapes(prev.get(key), next) ? prev : new Map(prev).set(key, next)));
    }, () => {});
  }, []);

  const registry = useMemo<SkeletonShapeRegistry>(() => ({
    reportText: (key, node, lines) => {
      textsRef.current.set(key, { node, lines });
      measureText(key, node, lines);
    },
    remove: (key) => {
      textsRef.current.delete(key);
      setShapesByText((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    },
  }), [measureText]);

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    textsRef.current.forEach(({ node, lines }, key) => measureText(key, node, lines));
  };

  const shapes = useMemo(() => {
    const all = [...shapesByText.values()].flat();
    return all.length > 0 ? all : undefined;
  }, [shapesByText]);

  return (
    <View ref={hostRef} style={[style, styles.host]} accessibilityState={{ busy: true }} {...props} onLayout={handleLayout}>
      <SkeletonShapeContext.Provider value={registry}>
        <View style={styles.content}>{children}</View>
      </SkeletonShapeContext.Provider>
      <SkiaShimmer color={shimmerColor ?? contentShimmerColor(colors, mode)} opacity={shimmerOpacity} duration={duration} shapes={shapes} />
    </View>
  );
}

const Memo = React.memo(ZSSkeleton) as unknown as typeof ZSSkeleton & { Box: typeof SkeletonBox };
Memo.Box = SkeletonBox;

export default Memo;

const styles = StyleSheet.create({
  host: { overflow: 'hidden' },
  content: { width: '100%', opacity: 0.5 },
  fullWidth: { width: '100%' },
});
