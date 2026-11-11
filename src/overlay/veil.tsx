import { createContext, useContext, useEffect, useState, type Context, type ReactNode, type RefObject } from 'react';
import { AccessibilityInfo, PixelRatio, Platform, StyleSheet, View, type HostInstance, type ViewProps } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { BlurTargetView, BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { withOpacity, type ThemeColors } from '../theme/color';
import { radiusStyle, type RadiusToken } from '../theme/radius';
import { OPACITY } from '../theme/state';

export type VeilKind = 'veil' | 'inv' | 'scrim';
export type VeilEdge = 'around' | 'bottom' | 'none';

export const VEIL_BLUR: Record<VeilKind, number> = { veil: 22, inv: 22, scrim: 10 };

export const VEIL_OPACITY: Record<VeilKind, readonly [number, number]> = {
  veil: [0.8, 0.8],
  inv: [0.88, 0.92],
  scrim: [OPACITY.backdrop, 0.52],
};

export const VEIL_FALLBACK_OPACITY: Record<VeilKind, readonly [number, number]> = {
  veil: [0.96, 0.96],
  inv: [0.96, 0.96],
  scrim: [0.48, 0.6],
};

export const VEIL_EDGE_OPACITY: readonly [number, number] = [0.08, 0.1];

export const VEIL_ANDROID_MIN_API = 31;

const IOS_FULL_BLUR_RADIUS = 30;
const DIMEZIS_SCALE_FACTOR = 4;
const RENDER_EFFECT_SIGMA_PER_RADIUS = 0.57735;
const RENDER_EFFECT_SIGMA_OFFSET = 0.5;

export interface VeilBlur {
  intensity: number;
  blurReductionFactor?: number;
}

export function veilBlur(kind: VeilKind, pixelRatio: number): VeilBlur {
  const radius = VEIL_BLUR[kind];
  const intensity = Math.round(Math.min(1, radius / IOS_FULL_BLUR_RADIUS) * 100);
  if (Platform.OS !== 'android') return { intensity };
  const radiusPx = Math.max(1, (radius * pixelRatio - RENDER_EFFECT_SIGMA_OFFSET) / RENDER_EFFECT_SIGMA_PER_RADIUS);
  return { intensity, blurReductionFactor: (intensity * DIMEZIS_SCALE_FACTOR) / radiusPx };
}

export function veilColor(colors: ThemeColors, kind: VeilKind, dark: boolean): string {
  if (kind === 'inv') return colors.backgroundInverse;
  if (kind === 'scrim') return colors.backdrop;
  return dark ? colors.surface3 : colors.surface1;
}

export const VeilTargetContext: Context<RefObject<HostInstance | null> | null> = createContext<RefObject<HostInstance | null> | null>(null);

export function VeilScreen({ target, children }: { target: RefObject<HostInstance | null>; children: ReactNode }) {
  if (Platform.OS !== 'android') return <>{children}</>;
  return (
    <BlurTargetView ref={target} style={styles.screen}>
      <VeilTargetContext.Provider value={null}>{children}</VeilTargetContext.Provider>
    </BlurTargetView>
  );
}

let lastReduceTransparency = false;

export function useReduceTransparency(): boolean {
  const [reduce, setReduce] = useState(lastReduceTransparency);

  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    let mounted = true;
    let changed = false;
    const apply = (on: boolean) => {
      lastReduceTransparency = on;
      if (mounted) setReduce(on);
    };
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled === 'function') {
      AccessibilityInfo.isReduceTransparencyEnabled()
        .then((on) => {
          if (!changed) apply(on);
        })
        .catch(() => {});
    }
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', (on) => {
      changed = true;
      apply(on);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduce;
}

function canBlur(target: RefObject<HostInstance | null> | null): boolean {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS !== 'android') return false;
  if (typeof Platform.Version === 'number' && Platform.Version < VEIL_ANDROID_MIN_API) return false;
  return target != null;
}

export interface VeilMaterial {
  blurred: boolean;
  color: string;
  opacity: number;
  fill: string;
  edge: string;
  target: RefObject<HostInstance | null> | null;
}

export function useVeilMaterial(kind: VeilKind, blurTarget?: RefObject<HostInstance | null> | null): VeilMaterial {
  const { colors, mode } = useTheme();
  const contextTarget = useContext(VeilTargetContext);
  const reduceTransparency = useReduceTransparency();
  const dark = mode === 'dark';
  const tone = dark ? 1 : 0;
  const target = blurTarget === undefined ? contextTarget : blurTarget;
  const blurred = !reduceTransparency && canBlur(target);
  const color = veilColor(colors, kind, dark);
  const opacity = (blurred ? VEIL_OPACITY : VEIL_FALLBACK_OPACITY)[kind][tone];
  return {
    blurred,
    color,
    opacity,
    fill: withOpacity(color, opacity),
    edge: withOpacity(colors.text, VEIL_EDGE_OPACITY[tone]),
    target: blurred ? target : null,
  };
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export interface VeilProps extends Omit<ViewProps, 'children'> {
  kind?: VeilKind;
  blurTarget?: RefObject<HostInstance | null> | null;
  radius?: RadiusToken;
  edge?: VeilEdge;
  floating?: boolean;
  progress?: SharedValue<number>;
  children?: ReactNode;
}

export function Veil({ kind = 'veil', blurTarget, radius = 'none', edge, floating, progress, style, children, ...props }: VeilProps) {
  const { mode, shadows } = useTheme();
  const material = useVeilMaterial(kind, blurTarget);
  const blur = veilBlur(kind, PixelRatio.get());
  const intensity = blur.intensity;
  const corner = radiusStyle(radius);
  const edgeMode = edge ?? (kind === 'veil' ? 'around' : 'none');
  const lifted = floating ?? kind !== 'scrim';

  const fadeStyle = useAnimatedStyle(() => ({ opacity: progress ? progress.value : 1 }));
  const blurProps = useAnimatedProps(() => ({ intensity: progress ? intensity * progress.value : intensity }));
  const fade = progress ? fadeStyle : null;

  return (
    <View {...props} style={[corner, style]}>
      {lifted ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, corner, shadows.md, fade]} /> : null}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, corner, styles.clip]}>
        {material.blurred ? (
          <AnimatedBlurView
            blurTarget={material.target ?? undefined}
            blurMethod="dimezisBlurViewSdk31Plus"
            tint={mode === 'dark' ? 'dark' : 'light'}
            blurReductionFactor={blur.blurReductionFactor}
            {...(progress ? { animatedProps: blurProps } : { intensity })}
            style={[StyleSheet.absoluteFill, corner]}
          />
        ) : null}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: material.fill }, fade]} />
      </View>
      {edgeMode === 'around' ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, corner, styles.edgeAround, { borderColor: material.edge }, fade]} />
      ) : null}
      {edgeMode === 'bottom' ? <Animated.View pointerEvents="none" style={[styles.edgeBottom, { backgroundColor: material.edge }, fade]} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  clip: { overflow: 'hidden' },
  edgeAround: { borderWidth: StyleSheet.hairlineWidth },
  edgeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
});
