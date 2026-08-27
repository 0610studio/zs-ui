import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Blur, Canvas, Group, RoundedRect, SweepGradient, vec } from "@shopify/react-native-skia";
import {
  Easing,
  cancelAnimation,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";
import { IS_WEB, warnWebUnsupported } from "../../model/webUnsupported";

const FULL_ROTATION_RADIANS = Math.PI * 2;
const DEFAULT_GLOW_INTENSITY = 0.5;
const GLOW_PULSE_DURATION = 2400;

/** glow를 세밀하게 제어할 때 사용하는 설정 (숫자 하나로 충분하면 glow={0~1} 사용) */
export interface ZSBorderBeamGlowConfig {
  /** 글로우가 stroke 바깥으로 퍼지는 폭(px) */
  width?: number;
  /** blur 강도 */
  blur?: number;
  /** 숨쉬는 한 사이클(ms) */
  pulseDuration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

export interface ZSBorderBeamProps extends ViewProps {
  children?: React.ReactNode;
  /** sweep gradient 색상 배열 (꼬리 → 머리 순) — 지정 시 colorFrom/colorTo는 무시됩니다 */
  colors?: string[];
  /** 광선 시작(꼬리) 색상 (기본: palette.primary.main) */
  colorFrom?: string;
  /** 광선 끝(머리) 색상 (기본: palette.secondary.main) */
  colorTo?: string;
  /** 광선(혜성)이 둘레에서 차지하는 비율 (0~1). 1이면 둘레 전체 그라디언트 링 */
  beamLength?: number;
  /** 광선이 지나가지 않는 구간의 얇은 기본 테두리 색. 'none'이면 표시 안 함 (기본: colorFrom 12% 알파) */
  trackColor?: string;
  /**
   * 글로우 강도.
   * - `false` : 글로우 없음 (선명한 광선만)
   * - `0~1`   : 숫자 하나로 폭·blur·불투명도를 함께 스케일 (기본 0.5)
   * - config  : 세밀 제어 — { width, blur, pulseDuration, minOpacity, maxOpacity }
   */
  glow?: boolean | number | ZSBorderBeamGlowConfig;
  /** 광선이 한 바퀴 도는 시간(ms) */
  duration?: number;
  /** 애니메이션 시작 지연(ms) */
  delay?: number;
  /** 회전 방향 반전 */
  reverse?: boolean;
  /** false면 효과를 숨기고 애니메이션을 정지 */
  active?: boolean;
  borderWidth?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** #RGB / #RRGGBB hex에만 알파를 붙이고, 그 외 형식은 null 반환 */
const withAlpha = (color: string, alphaHex: string): string | null => {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return `${color}${alphaHex}`;
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const [r, g, b] = color.slice(1);
    return `#${r}${r}${g}${g}${b}${b}${alphaHex}`;
  }
  return null;
};

/** 색상의 완전 투명 버전 (hue 유지 → blur 시 색 번짐이 자연스러움) */
const transparentize = (color: string): string => withAlpha(color, "00") ?? "#00000000";

interface GlowSettings {
  width: number;
  blur: number;
  pulseDuration: number;
  minOpacity: number;
  maxOpacity: number;
}

const resolveGlow = (glow: ZSBorderBeamProps["glow"]): GlowSettings | null => {
  if (glow === false || glow === 0) return null;

  const intensity = typeof glow === "number" ? Math.min(Math.max(glow, 0), 1) : DEFAULT_GLOW_INTENSITY;
  const maxOpacity = 0.3 + 0.6 * intensity;
  const scaled: GlowSettings = {
    width: 16 * intensity,
    blur: 20 * intensity,
    pulseDuration: GLOW_PULSE_DURATION,
    minOpacity: maxOpacity * 0.58,
    maxOpacity,
  };

  if (typeof glow === "object") {
    return {
      width: glow.width ?? scaled.width,
      blur: glow.blur ?? scaled.blur,
      pulseDuration: glow.pulseDuration ?? scaled.pulseDuration,
      minOpacity: glow.minOpacity ?? scaled.minOpacity,
      maxOpacity: glow.maxOpacity ?? scaled.maxOpacity,
    };
  }
  return scaled;
};

function ZSBorderBeam({
  children,
  colors,
  colorFrom,
  colorTo,
  beamLength = 0.35,
  trackColor,
  glow = true,
  duration = 5000,
  delay = 0,
  reverse = false,
  active = true,
  borderWidth = 2,
  borderRadius = 14,
  style,
  ...props
}: ZSBorderBeamProps) {
  const { palette } = useTheme();
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const rotationProgress = useSharedValue(0);
  const glowProgress = useSharedValue(0);

  const from = colorFrom || palette.primary.main;
  const to = colorTo || palette.secondary.main;
  const glowSettings = resolveGlow(glow);

  // 혜성 형태: 꼬리(투명)에서 머리(선명)로 갈수록 밝아지고, 머리 직후 짧게 컷오프.
  // beamLength < 1이면 positions로 광선을 둘레 일부에만 압축한다.
  const beam = useMemo(() => {
    const length = Math.min(Math.max(beamLength, 0.05), 1);
    const base =
      colors && colors.length >= 2
        ? colors
        : [transparentize(from), withAlpha(from, "66") ?? from, from, to];

    if (length >= 1) {
      const ring = colors && colors.length >= 2 ? colors : [...base, transparentize(to)];
      return { colors: ring, positions: undefined };
    }

    const head = base[base.length - 1] ?? to;
    const step = length / (base.length - 1);
    return {
      colors: [...base, transparentize(head), transparentize(head)],
      positions: [...base.map((_, index) => index * step), Math.min(length + 0.02, 1), 1],
    };
  }, [colors, from, to, beamLength]);

  const resolvedTrackColor =
    trackColor === "none" ? null : trackColor ?? withAlpha(from, "1F") ?? "#8080801F";

  useEffect(() => {
    if (IS_WEB) warnWebUnsupported("ZSBorderBeam");
  }, []);

  useEffect(() => {
    if (IS_WEB || !active) return;

    rotationProgress.value = 0;
    rotationProgress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false)
    );

    return () => cancelAnimation(rotationProgress);
  }, [active, duration, delay, reverse]);

  const glowPulseDuration = glowSettings?.pulseDuration;
  useEffect(() => {
    if (IS_WEB || !active || !glowPulseDuration) return;

    glowProgress.value = 0;
    glowProgress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: glowPulseDuration, easing: Easing.inOut(Easing.ease) }), -1, true)
    );

    return () => cancelAnimation(glowProgress);
  }, [active, delay, glowPulseDuration]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const glowPadding = glowSettings ? Math.ceil(glowSettings.blur + glowSettings.width) : 0;
  const canvasWidth = layout.width + glowPadding * 2;
  const canvasHeight = layout.height + glowPadding * 2;
  const hasLayout = layout.width > 0 && layout.height > 0;

  const frameX = glowPadding + borderWidth / 2;
  const frameY = glowPadding + borderWidth / 2;
  const frameWidth = Math.max(layout.width - borderWidth, 0);
  const frameHeight = Math.max(layout.height - borderWidth, 0);
  const frameRadius = Math.min(Math.max(borderRadius - borderWidth / 2, 0), Math.min(frameWidth, frameHeight) / 2);

  const centerVector = useMemo(() => vec(canvasWidth / 2, canvasHeight / 2), [canvasWidth, canvasHeight]);
  const direction = reverse ? -1 : 1;

  const glowMinOpacity = glowSettings?.minOpacity ?? 0;
  const glowMaxOpacity = glowSettings?.maxOpacity ?? 0;
  const glowWidth = glowSettings?.width ?? 0;

  const gradientTransform = useDerivedValue(() => [
    { rotate: direction * FULL_ROTATION_RADIANS * rotationProgress.value },
  ]);
  const glowOpacity = useDerivedValue(() =>
    interpolate(glowProgress.value, [0, 1], [glowMinOpacity, glowMaxOpacity])
  );
  const glowStrokeWidth = useDerivedValue(() =>
    interpolate(glowProgress.value, [0, 1], [borderWidth + glowWidth * 0.6, borderWidth + glowWidth])
  );

  // 웹 미지원: CanvasKit 미로딩 환경에서 Skia Canvas가 크래시하므로 광선 효과 없이 콘텐츠만 렌더링한다.
  // (rules-of-hooks 준수를 위해 분기는 모든 hook 호출 이후에 둔다)
  if (IS_WEB) {
    return (
      <View style={[styles.container, style]} {...props}>
        <View style={[styles.content, { borderRadius }]}>{children}</View>
      </View>
    );
  }

  const beamGradient = (
    <SweepGradient
      origin={centerVector}
      c={centerVector}
      colors={beam.colors}
      positions={beam.positions}
      transform={gradientTransform}
    />
  );

  return (
    <View style={[styles.container, style]} {...props}>
      <View onLayout={handleLayout} style={[styles.content, { borderRadius }]}>
        {children}
      </View>

      {active && hasLayout && (
        <Canvas
          pointerEvents="none"
          style={[
            styles.canvas,
            {
              width: canvasWidth,
              height: canvasHeight,
              top: -glowPadding,
              left: -glowPadding,
              zIndex: 1,
            },
          ]}
        >
          {resolvedTrackColor && (
            <RoundedRect
              x={frameX}
              y={frameY}
              width={frameWidth}
              height={frameHeight}
              r={frameRadius}
              style="stroke"
              strokeWidth={borderWidth}
              color={resolvedTrackColor}
            />
          )}

          {glowSettings && (
            <Group>
              <RoundedRect
                x={frameX}
                y={frameY}
                width={frameWidth}
                height={frameHeight}
                r={frameRadius}
                style="stroke"
                strokeWidth={glowStrokeWidth}
                opacity={glowOpacity}
              >
                {beamGradient}
              </RoundedRect>
              <Blur blur={glowSettings.blur} />
            </Group>
          )}

          <RoundedRect
            x={frameX}
            y={frameY}
            width={frameWidth}
            height={frameHeight}
            r={frameRadius}
            style="stroke"
            strokeWidth={borderWidth}
          >
            {beamGradient}
          </RoundedRect>
        </Canvas>
      )}
    </View>
  );
}

export default React.memo(ZSBorderBeam);

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    position: "relative",
  },
  canvas: {
    position: "absolute",
  },
  content: {
    position: "relative",
    overflow: "hidden",
  },
});
