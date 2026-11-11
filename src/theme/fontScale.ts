import type { DynamicTypeSizeValue } from '@expo/ui/swift-ui/modifiers';

export const DEFAULT_MAX_FONT_SIZE_MULTIPLIER = 2;

function isCap(value: number | undefined): value is number {
  return value !== undefined && value >= 1;
}

export function capFontScale(fontScale: number, max: number | undefined): number {
  return isCap(max) ? Math.min(fontScale, max) : fontScale;
}

export function minFontSizeMultiplier(own: number, app: number | undefined): number {
  return isCap(app) ? Math.min(own, app) : own;
}

const BODY_POINT_SIZES: readonly (readonly [DynamicTypeSizeValue, number])[] = [
  ['large', 17],
  ['xLarge', 19],
  ['xxLarge', 21],
  ['xxxLarge', 23],
  ['accessibility1', 28],
  ['accessibility2', 33],
  ['accessibility3', 40],
  ['accessibility4', 47],
  ['accessibility5', 53],
];
const BASE_BODY_POINT_SIZE = 17;

export function dynamicTypeSizeLimit(max: number | undefined): DynamicTypeSizeValue | undefined {
  if (!isCap(max)) return undefined;
  let limit: DynamicTypeSizeValue = 'large';
  for (const [size, points] of BODY_POINT_SIZES) {
    if (points / BASE_BODY_POINT_SIZE <= max) limit = size;
  }
  return limit === 'accessibility5' ? undefined : limit;
}
