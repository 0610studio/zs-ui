import { withOpacity, type ColorMode, type ThemeColors } from '../../../theme/color';

export interface CalendarTheme {
  background: string;
  dayText: string;
  outsideDayText: string;
  sundayText: string;
  saturdayText: string;
  selectedBackground: string;
  selectedText: string;
  todayBackground: string;
  todayText: string;
  weekdayText: string;
  dotColor: string;
}

export type CalendarThemeOverride = Partial<Omit<CalendarTheme, 'selectedBackground' | 'todayBackground'>>;

export interface ResolvedCalendarTheme extends CalendarTheme {
  chipTextDark: string;
  chipTextLight: string;
}

export function resolveCalendarTheme(colors: ThemeColors, mode: ColorMode, override?: CalendarThemeOverride): ResolvedCalendarTheme {
  const base: ResolvedCalendarTheme = {
    background: 'transparent',
    dayText: colors.text,
    outsideDayText: withOpacity(colors.text, 0.38),
    sundayText: colors.error,
    saturdayText: colors.text,
    selectedBackground: mode === 'dark' ? colors.surface5 : colors.surface1,
    selectedText: colors.primaryMark,
    todayBackground: colors.surface4,
    todayText: colors.text,
    weekdayText: colors.textSecondary,
    dotColor: colors.textSecondary,
    chipTextDark: mode === 'dark' ? colors.textInverse : colors.text,
    chipTextLight: mode === 'dark' ? colors.text : colors.textInverse,
  };
  if (!override) return base;
  const theme = { ...base, ...override };
  if (override.saturdayText === undefined) theme.saturdayText = theme.dayText;
  return theme;
}

export const weekdayColor = (weekday: number, theme: CalendarTheme, fallback: string): string =>
  weekday === 0 ? theme.sundayText : weekday === 6 ? theme.saturdayText : fallback;

export function weekdayHeaderColor(weekday: number, theme: CalendarTheme): string {
  const color = weekdayColor(weekday, theme, theme.weekdayText);
  return color === theme.dayText ? theme.weekdayText : color;
}

function parseHex(color: string): [number, number, number] | null {
  const hex = color.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null;
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: string, b: string): number {
  const rgbA = parseHex(a);
  const rgbB = parseHex(b);
  if (!rgbA || !rgbB) return 0;
  const [high, low] = [relativeLuminance(rgbA), relativeLuminance(rgbB)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

const CHIP_TEXT_MIN_CONTRAST = 4.5;

export function readableChipTextColor(background: string, dark: string, light: string): string {
  if (!parseHex(background)) return dark;
  const darkContrast = contrastRatio(dark, background);
  const lightContrast = contrastRatio(light, background);
  const best = darkContrast >= lightContrast ? dark : light;
  if (Math.max(darkContrast, lightContrast) >= CHIP_TEXT_MIN_CONTRAST) return best;
  return contrastRatio('#000000', background) >= contrastRatio('#ffffff', background) ? '#000000' : '#ffffff';
}
