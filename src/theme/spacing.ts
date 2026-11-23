export const SPACE = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

/** `SPACE`의 키 */
export type SpaceToken = keyof typeof SPACE;

export const CONTENT_INSET = SPACE.lg;

export const SCREEN_INSET = SPACE.xl;
