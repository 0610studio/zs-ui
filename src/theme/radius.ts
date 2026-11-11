import { Platform, type ViewStyle } from 'react-native';

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  '3xl': 32,
  '4xl': 48,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof RADIUS;

export function radiusStyle(token: RadiusToken): Pick<ViewStyle, 'borderRadius' | 'borderCurve'> {
  return Platform.OS === 'ios' && token !== 'none' && token !== 'full'
    ? { borderRadius: RADIUS[token], borderCurve: 'continuous' }
    : { borderRadius: RADIUS[token] };
}
