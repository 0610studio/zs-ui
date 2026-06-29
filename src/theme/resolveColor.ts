import { ColorPalette, Theme, ThemeBackground, ThemeTextType } from './types';

type SemanticPaletteKey = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'information' | 'grey';
type PaletteShade = keyof ColorPalette;

function isColorMap(value: unknown): value is Record<string, string> {
  return typeof value === 'object' && value !== null;
}

export function resolveTextColor(palette: Theme, color: string): string | undefined {
  const [c01, c02] = color.split('.') as [string, string | undefined];
  if (!c02) return palette.text[c01 as keyof ThemeTextType];
  if (c01 === 'text') return palette.text[c02 as keyof ThemeTextType];
  if (c01 === 'background') return palette.background[c02 as keyof ThemeBackground];

  const semanticPalette = palette[c01 as SemanticPaletteKey];
  return isColorMap(semanticPalette) ? semanticPalette[c02 as PaletteShade] : undefined;
}

export function resolveViewColor(palette: Theme, color: string): string | undefined {
  const [c01, c02] = color.split('.') as [string, string | undefined];
  if (c02) {
    if (c01 === 'background') return palette.background[c02 as keyof ThemeBackground];
    if (c01 === 'text') return palette.text[c02 as keyof ThemeTextType];

    const semanticPalette = palette[c01 as SemanticPaletteKey];
    return isColorMap(semanticPalette) ? semanticPalette[c02 as PaletteShade] : undefined;
  }
  if (c01) return palette.background[c01 as keyof ThemeBackground] ?? palette[c01 as SemanticPaletteKey]?.main;
  return undefined;
}
