import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { IS_WEB, warnWebUnsupported } from "../../model/webUnsupported";
import {
  Easing,
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface SkiaShimmerProps {
  color: string;
  /** 밴드 중심 최대 불투명도 (0~1) */
  opacity?: number;
  /** 한 번 지나가는 시간(ms) */
  duration?: number;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** #RGB / #RRGGBB hex 만 정규화, 그 외는 null */
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

/** 같은 hue 의 알파 그라데이션을 대각선으로 흘려보내 아래 콘텐츠가 비쳐 보이게 한다. */
function SkiaShimmer({ color, opacity = 0.6, duration = 1100 }: SkiaShimmerProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);

  const bandWidth = size.width * 0.65;
  const startOffset = bandWidth + size.height;
  const travel = size.width + bandWidth * 2 + size.height;

  const gradient = useMemo(() => {
    const rgb = toRgbHex(color);
    const peak = clamp01(opacity);
    if (!rgb) {
      // hex 가 아니면 알파 조절이 안 되므로 색상 그대로 쓴다
      return { colors: ["transparent", color, "transparent"], positions: [0, 0.5, 1] };
    }
    // 종 모양 알파 프로파일 → 경계선 없는 광택
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
    if (IS_WEB) warnWebUnsupported("ZSSkeleton · ZSSkeletonBox");
  }, []);

  useEffect(() => {
    if (IS_WEB || size.width === 0) return;

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

  // CanvasKit 미로딩 환경에서 Skia Canvas 가 크래시한다. 분기는 rules-of-hooks 때문에 모든 hook 뒤에 둔다.
  if (IS_WEB) return null;

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
