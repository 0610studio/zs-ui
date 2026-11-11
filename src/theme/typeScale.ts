import { Platform, type TextStyle } from 'react-native';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'label'
  | 'overline';

export type FontWeight = 400 | 500 | 600 | 700;

export interface TypeMetric {
  fontSize: number;
  lineHeight: number;
  weight: FontWeight;
  emphasizedWeight: FontWeight;
}

export const IOS_TEXT_STYLE = {
  h1: 'largeTitle',
  h2: 'title1',
  h3: 'title2',
  h4: 'title3',
  subtitle1: 'headline',
  subtitle2: 'subheadline',
  body1: 'body',
  body2: 'subheadline',
  caption: 'footnote',
  label: 'caption1',
  overline: 'caption2',
} as const satisfies Record<TextVariant, string>;

const SCALE: Record<TextVariant, TypeMetric> = {
  h1: { fontSize: 34, lineHeight: 42, weight: 700, emphasizedWeight: 700 },
  h2: { fontSize: 28, lineHeight: 36, weight: 700, emphasizedWeight: 700 },
  h3: { fontSize: 22, lineHeight: 30, weight: 700, emphasizedWeight: 700 },
  h4: { fontSize: 20, lineHeight: 28, weight: 700, emphasizedWeight: 700 },
  subtitle1: { fontSize: 17, lineHeight: 24, weight: 600, emphasizedWeight: 700 },
  subtitle2: { fontSize: 15, lineHeight: 22, weight: 600, emphasizedWeight: 700 },
  body1: { fontSize: 17, lineHeight: 24, weight: 400, emphasizedWeight: 500 },
  body2: { fontSize: 15, lineHeight: 22, weight: 400, emphasizedWeight: 600 },
  caption: { fontSize: 13, lineHeight: 18, weight: 400, emphasizedWeight: 600 },
  label: { fontSize: 12, lineHeight: 16, weight: 600, emphasizedWeight: 700 },
  overline: { fontSize: 11, lineHeight: 14, weight: 600, emphasizedWeight: 700 },
};

export const TYPE_SCALE = { ios: SCALE, android: SCALE } as const;

const TRACKING: Record<TextVariant, number> = {
  h1: -0.8,
  h2: -0.5,
  h3: -0.3,
  h4: -0.3,
  subtitle1: -0.2,
  subtitle2: 0,
  body1: -0.1,
  body2: 0,
  caption: 0,
  label: 0,
  overline: 0,
};

export const TEXT_VARIANTS = Object.keys(SCALE) as TextVariant[];

export type ThemeFonts = Partial<Record<FontWeight | 100 | 200 | 300 | 800 | 900, string>>;

export type FontAsset = number | { uri: string };
export type ThemeFontAssets = Partial<Record<keyof ThemeFonts, FontAsset>>;

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export function fontFamilyFor(fonts: ThemeFonts | undefined, weight: number): string | undefined {
  if (!fonts) return undefined;
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const w of WEIGHTS) {
    const family = fonts[w];
    if (!family) continue;
    const distance = Math.abs(w - weight) + (w < weight ? 0.5 : 0);
    if (distance < bestDistance) {
      best = family;
      bestDistance = distance;
    }
  }
  return best;
}

export type TypographyStyles = Record<TextVariant, TextStyle> & { emphasized: Record<TextVariant, TextStyle> };

function styleFor(metric: TypeMetric, weight: FontWeight, tracking: number, fonts: ThemeFonts | undefined): TextStyle {
  const fontFamily = fontFamilyFor(fonts, weight);
  return {
    fontSize: metric.fontSize,
    lineHeight: metric.lineHeight,
    ...(tracking !== 0 ? { letterSpacing: tracking } : null),
    ...(fontFamily ? { fontFamily } : { fontWeight: String(weight) as TextStyle['fontWeight'] }),
  };
}

export function createTypography(fonts: ThemeFonts | undefined, platform: 'ios' | 'android' = Platform.OS === 'android' ? 'android' : 'ios'): TypographyStyles {
  const scale = TYPE_SCALE[platform];
  const base = {} as Record<TextVariant, TextStyle>;
  const emphasized = {} as Record<TextVariant, TextStyle>;
  for (const variant of TEXT_VARIANTS) {
    base[variant] = styleFor(scale[variant], scale[variant].weight, TRACKING[variant], fonts);
    emphasized[variant] = styleFor(scale[variant], scale[variant].emphasizedWeight, TRACKING[variant], fonts);
  }
  return { ...base, emphasized };
}
