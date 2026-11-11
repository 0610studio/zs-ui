import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Canvas, Group, LinearGradient, Rect, Skia, vec } from "@shopify/react-native-skia";
import {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { ShimmerShape } from "./SkeletonShapes";

export const PULSE_PEAK_RATIO = 0.5;

const toRgbHex = (color: string): string | null => {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  if (/^#[0-9a-fA-F]{8}$/.test(color)) return color.slice(0, 7);
  return null;
};

export interface SkiaShimmerProps {
  color: string;
  opacity?: number;
  duration?: number;
  shapes?: readonly ShimmerShape[];
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

const toAlphaHex = (alpha: number): string =>
  Math.round(clamp01(alpha) * 255)
    .toString(16)
    .padStart(2, "0");

function SkiaShimmer({ color, opacity = 0.6, duration = 1100, shapes }: SkiaShimmerProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const bandWidth = size.width * 0.65;
  const startOffset = bandWidth + size.height;
  const travel = size.width + bandWidth * 2 + size.height;

  const gradient = useMemo(() => {
    const rgb = toRgbHex(color);
    const peak = clamp01(opacity);
    if (!rgb) {
      return { colors: ["transparent", color, "transparent"], positions: [0, 0.5, 1] };
    }
    return {
      colors: [0, peak * 0.4, peak, peak * 0.4, 0].map((alpha) => `${rgb}${toAlphaHex(alpha)}`),
      positions: [0, 0.3, 0.5, 0.7, 1],
    };
  }, [color, opacity]);

  useEffect(() => {
    if (size.width === 0) return;
    if (reduceMotion) {
      pulse.value = 0;
      if (Platform.OS !== 'ios') return;
      pulse.value = withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.Never }),
        -1,
        true,
        undefined,
        ReduceMotion.Never
      );
      return () => cancelAnimation(pulse);
    }

    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );

    return () => cancelAnimation(progress);
  }, [duration, size.width, reduceMotion]);

  const gradientStart = useDerivedValue(() => {
    const x = -startOffset + travel * progress.value;
    return vec(x, 0);
  });
  const gradientEnd = useDerivedValue(() => {
    const x = -startOffset + travel * progress.value;
    return vec(x + bandWidth, size.height);
  });

  const clips = useMemo(
    () => shapes?.map((shape) => Skia.RRectXY(Skia.XYWHRect(shape.x, shape.y, shape.width, shape.height), shape.radius, shape.radius)),
    [shapes]
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const pulsePeak = clamp01(opacity) * PULSE_PEAK_RATIO;
  const pulseOpacity = useDerivedValue(() => pulse.value * pulsePeak);

  const band = reduceMotion ? (
    <Rect x={0} y={0} width={size.width} height={size.height} color={toRgbHex(color) ?? color} opacity={pulseOpacity} />
  ) : (
    <Rect x={0} y={0} width={size.width} height={size.height}>
      <LinearGradient
        start={gradientStart}
        end={gradientEnd}
        colors={gradient.colors}
        positions={gradient.positions}
      />
    </Rect>
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={handleLayout}>
      {size.width > 0 && size.height > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          {clips ? clips.map((clip, i) => <Group key={i} clip={clip}>{band}</Group>) : band}
        </Canvas>
      )}
    </View>
  );
}

export default React.memo(SkiaShimmer);
