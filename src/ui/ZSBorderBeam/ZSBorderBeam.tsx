import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, View, type LayoutChangeEvent, type ViewProps } from "react-native";
import { Blur, Canvas, Group, Path, RoundedRect, SweepGradient, vec, type AnimatedProp } from "@shopify/react-native-skia";
import {
  Easing,
  cancelAnimation,
  interpolate,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";
import { RADIUS } from "../../theme/radius";
import { withAlpha } from "../hexColor";
import { continuousRoundedRectPath } from "./continuousCorner";

const FULL_ROTATION_RADIANS = Math.PI * 2;
const DEFAULT_GLOW_INTENSITY = 0.5;
const GLOW_PULSE_DURATION = 2400;

export interface ZSBorderBeamGlowConfig {
  width?: number;
  blur?: number;
  pulseDuration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

export interface ZSBorderBeamProps extends ViewProps {
  colors?: string[];
  colorFrom?: string;
  colorTo?: string;
  beamLength?: number;
  trackColor?: string;
  glow?: boolean | number | ZSBorderBeamGlowConfig;
  duration?: number;
  delay?: number;
  reverse?: boolean;
  active?: boolean;
  borderWidth?: number;
  borderRadius?: number;
}

const transparentize = (color: string): string => withAlpha(color, "00") ?? "#00000000";

interface FrameStrokeProps {
  strokeWidth: AnimatedProp<number>;
  color?: string;
  opacity?: AnimatedProp<number>;
  children?: React.ReactNode;
}

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
  borderRadius = RADIUS.lg,
  style,
  ...props
}: ZSBorderBeamProps) {
  const { colors: roles } = useTheme();
  const reduceMotion = useReducedMotion();
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const rotationProgress = useSharedValue(0);
  const glowProgress = useSharedValue(0);

  const from = colorFrom || roles.primary;
  const to = colorTo || roles.tertiary;
  const glowSettings = resolveGlow(glow);

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
    if (!active || reduceMotion) return;

    rotationProgress.value = 0;
    rotationProgress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false)
    );

    return () => cancelAnimation(rotationProgress);
  }, [active, duration, delay, reverse, reduceMotion]);

  const glowPulseDuration = glowSettings?.pulseDuration;
  useEffect(() => {
    if (!active || !glowPulseDuration || reduceMotion) return;

    glowProgress.value = 0;
    glowProgress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: glowPulseDuration, easing: Easing.inOut(Easing.ease) }), -1, true)
    );

    return () => cancelAnimation(glowProgress);
  }, [active, delay, glowPulseDuration, reduceMotion]);

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
  const continuousFrame = useMemo(
    () => (Platform.OS === "ios" ? continuousRoundedRectPath(frameX, frameY, frameWidth, frameHeight, frameRadius) : null),
    [frameX, frameY, frameWidth, frameHeight, frameRadius]
  );
  const frameStroke = ({ children: shader, ...paint }: FrameStrokeProps) =>
    continuousFrame ? (
      <Path path={continuousFrame} style="stroke" {...paint}>
        {shader}
      </Path>
    ) : (
      <RoundedRect x={frameX} y={frameY} width={frameWidth} height={frameHeight} r={frameRadius} style="stroke" {...paint}>
        {shader}
      </RoundedRect>
    );

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
      <View onLayout={handleLayout} style={[styles.content, { borderRadius }, Platform.OS === "ios" ? styles.continuous : null]}>
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
          {resolvedTrackColor && frameStroke({ strokeWidth: borderWidth, color: resolvedTrackColor })}

          {glowSettings && (
            <Group>
              {frameStroke({ strokeWidth: glowStrokeWidth, opacity: glowOpacity, children: beamGradient })}
              <Blur blur={glowSettings.blur} />
            </Group>
          )}

          {frameStroke({ strokeWidth: borderWidth, children: beamGradient })}
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
  continuous: {
    borderCurve: "continuous",
  },
});
