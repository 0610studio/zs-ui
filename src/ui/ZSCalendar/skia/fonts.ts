import { Platform } from 'react-native';
import { matchFont, useFonts, type DataModule, type SkFont, type SkTypefaceFontProvider } from '@shopify/react-native-skia';
import type { ThemeFontAssets } from '../../../theme/typeScale';

export interface CalendarFonts {
  day: SkFont;
  daySelected: SkFont;
  provider?: SkTypefaceFontProvider | null;
  fontFamilies?: string[];
}

export interface CalendarFontRequest {
  dayFontSize: number;
  fontProvider?: SkTypefaceFontProvider | null;
}

export interface CalendarFontSources {
  regular?: DataModule;
  bold?: DataModule;
}

export const CALENDAR_FONT_FAMILY = 'ZSCalendar';

export function resolveCalendarFontSources(assets?: ThemeFontAssets): CalendarFontSources | undefined {
  if (!assets) return undefined;
  const pick = (weights: readonly (keyof ThemeFontAssets)[]) => {
    for (const weight of weights) {
      const asset = assets[weight];
      if (asset !== undefined) return asset as DataModule;
    }
    return undefined;
  };
  const regular = pick([400, 500, 300, 600, 200, 100]);
  const bold = pick([700, 800, 600, 900, 500]) ?? regular;
  if (!regular && !bold) return undefined;
  return { regular: regular ?? bold, bold };
}

const SYSTEM_FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';

export function useCalendarFontProvider(sources?: CalendarFontSources): SkTypefaceFontProvider | null {
  const modules = [sources?.regular, sources?.bold].filter(Boolean) as DataModule[];
  const provider = useFonts(modules.length > 0 ? { [CALENDAR_FONT_FAMILY]: modules } : {});

  return modules.length > 0 ? provider : null;
}

export function buildCalendarFonts({ dayFontSize, fontProvider }: CalendarFontRequest): CalendarFonts {
  const mgr = fontProvider ?? undefined;
  const family = { fontFamily: fontProvider ? CALENDAR_FONT_FAMILY : SYSTEM_FONT_FAMILY };

  return {
    day: matchFont({ ...family, fontSize: dayFontSize, fontWeight: '500' }, mgr),
    daySelected: matchFont({ ...family, fontSize: dayFontSize, fontWeight: '700' }, mgr),
    provider: fontProvider ?? null,
    fontFamilies: fontProvider ? [CALENDAR_FONT_FAMILY] : undefined,
  };
}
