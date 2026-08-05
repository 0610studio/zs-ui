import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import {
  Easing,
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface SkiaShimmerProps {
  /** 하이라이트 색상 (#RGB / #RRGGBB) */
  color: string;
  /** 밴드 중심의 최대 불투명도 (0~1) */
  opacity?: number;
  /** 밴드가 한 번 지나가는 시간(ms) */
  duration?: number;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** #RGB / #RRGGBB hex만 정규화, 그 외 형식은 null */
const toRgbHex = (color: string): string | null => {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const [r, g, b] = color.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
};

const withAlpha = (rgbHex: string, alpha: number): string =>
  `${rgbHex}${Math.round(clamp01(alpha) * 255)
    .toString(16)
    .padStart(2, "0")}`;

/**
 * 부모를 가득 채우는 shimmer 오버레이.
 * 같은 hue의 알파 그라데이션(투명 → 하이라이트 → 투명)을 대각선으로 흘려보내
 * 아래 콘텐츠가 실제로 비쳐 보인다.
 */
function SkiaShimmer({ color, opacity = 0.6, duration = 1100 }: SkiaShimmerProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);

  // 밴드 폭·이동 거리는 실제 측정된 크기 기준 (기존 구현의 DEVICE_WIDTH 하드코딩 제거)
  const bandWidth = size.width * 0.65;
  const startOffset = bandWidth + size.height;
  const travel = size.width + bandWidth * 2 + size.height;

  const gradient = useMemo(() => {
    const rgb = toRgbHex(color);
    const peak = clamp01(opacity);
    if (!rgb) {
      // hex가 아니면 알파 조절이 불가하므로 색상 그대로 중앙에 사용
      return { colors: ["transparent", color, "transparent"], positions: [0, 0.5, 1] };
    }
    // 같은 hue로만 알파를 올렸다 내리는 종 모양 프로파일 → 경계선 없는 부드러운 광택
    return {
      colors: [
        withAlpha(rgb, 0),
        withAlpha(rgb, peak * 0.4),
        withAlpha(rgb, peak),
        withAlpha(rgb, peak * 0.4),
        withAlpha(rgb, 0),
      ],
      positions: [0, 0.3, 0.5, 0.7, 1],
    };
  }, [color, opacity]);

  useEffect(() => {
    if (size.width === 0) return;

    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );

    return () => cancelAnimation(progress);
  }, [duration, size.width]);

  const gradientStart = useDerivedValue(() => {
    const x = -startOffset + travel * progress.value;
    return vec(x, 0);
  });
  const gradientEnd = useDerivedValue(() => {
    const x = -startOffset + travel * progress.value;
    return vec(x + bandWidth, size.height);
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={handleLayout}>
      {size.width > 0 && size.height > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={size.width} height={size.height}>
            <LinearGradient
              start={gradientStart}
              end={gradientEnd}
              colors={gradient.colors}
              positions={gradient.positions}
            />
          </Rect>
        </Canvas>
      )}
    </View>
  );
}

export default React.memo(SkiaShimmer);
