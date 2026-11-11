import type { BoxShadowValue, ViewStyle } from 'react-native';
import { contrastRatio, type ThemeColors } from './color';

export const SHADOW = { none: 0, xs: 1, sm: 3, md: 6, lg: 8, xl: 12 } as const;
export type ShadowToken = keyof typeof SHADOW;
export type ShadowStyles = Record<ShadowToken, Pick<ViewStyle, 'boxShadow'>>;

const KEY_SHADOW = { offset: 1, blur: 3, opacity: 0.08 } as const;
const AMBIENT_SHADOW = { offsetY: 1, blur: 2, opacity: 0.05 } as const;
const DARK_GROUND_OPACITY = { key: 0.45, ambient: 0.4 } as const;

function layers(dp: number, shadowColor: string, opacity: { key: number; ambient: number }): BoxShadowValue[] {
  if (dp <= 0) return [];
  const rgb = /^#([0-9a-f]{6})/i.exec(shadowColor)?.[1] ?? '000000';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(rgb.slice(i, i + 2), 16));
  const rgba = (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
  return [
    { offsetX: 0, offsetY: Math.max(1, Math.round(dp * KEY_SHADOW.offset)), blurRadius: dp * KEY_SHADOW.blur, color: rgba(opacity.key) },
    { offsetX: 0, offsetY: AMBIENT_SHADOW.offsetY, blurRadius: AMBIENT_SHADOW.blur, color: rgba(opacity.ambient) },
  ];
}

export function shadowFor(dp: number, shadowColor: string): BoxShadowValue[] {
  return layers(dp, shadowColor, { key: KEY_SHADOW.opacity, ambient: AMBIENT_SHADOW.opacity });
}

function isDarkGround(colors: Pick<ThemeColors, 'shadow'>): boolean {
  if (!('background' in colors) || typeof colors.background !== 'string' || !/^#[0-9a-f]{6}$/i.test(colors.background)) return false;
  return contrastRatio(colors.background, '#ffffff') > contrastRatio(colors.background, '#000000');
}

export function createShadows(colors: Pick<ThemeColors, 'shadow'>): ShadowStyles {
  const opacity = isDarkGround(colors) ? DARK_GROUND_OPACITY : { key: KEY_SHADOW.opacity, ambient: AMBIENT_SHADOW.opacity };
  const styles = {} as ShadowStyles;
  for (const token of Object.keys(SHADOW) as ShadowToken[]) {
    const dp = SHADOW[token];
    styles[token] = dp === 0 ? {} : { boxShadow: layers(dp, colors.shadow, opacity) };
  }
  return styles;
}
