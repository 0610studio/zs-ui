import { Platform } from 'react-native';
import { matchFont, useFonts, type DataModule, type SkFont, type SkTypefaceFontProvider } from '@shopify/react-native-skia';
import type { ThemeFontAssets } from '../../../theme/types';

/**
 * 날짜 숫자 전용 폰트. drawText 는 폰트 폴백을 하지 않아 한글 같은 비-ASCII 가
 * 깨지므로, 요일 라벨 등 나머지 텍스트는 RN 뷰가 그린다.
 */
export interface CalendarFonts {
  day: SkFont;
  daySelected: SkFont;
}

export interface CalendarFontRequest {
  dayFontSize: number;
  /** 미주입 시 시스템 폰트 */
  fontProvider?: SkTypefaceFontProvider | null;
  fontFamily?: string;
}

/** 미주입이면 시스템 폰트로 동작한다 */
export interface CalendarFontSources {
  regular?: DataModule;
  bold?: DataModule;
}

export const CALENDAR_FONT_FAMILY = 'ZSCalendar';

/**
 * ThemeProvider 의 굵기별 폰트 파일에서 날짜 숫자용(보통 400)·선택 숫자용(굵게, 700) 을 고른다.
 * 정확한 굵기가 없으면 가장 가까운 것으로 내려간다. 하나도 없으면 undefined — 시스템 폰트로 간다.
 */
export function resolveCalendarFontSources(assets?: ThemeFontAssets): CalendarFontSources | undefined {
  if (!assets) return undefined;
  const pick = (weights: ReadonlyArray<keyof ThemeFontAssets>) => {
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

/**
 * matchFont 의 기본 family 'System' 은 iOS(CoreText)만 해석한다. Android 시스템 폰트 매니저에는
 * 그런 family 가 없어 typeface 가 null 이 되고 날짜 숫자가 통째로 그려지지 않는다.
 */
const SYSTEM_FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';

/** 미주입이면 null — matchFont 가 시스템 폰트로 폴백한다 */
export function useCalendarFontProvider(sources?: CalendarFontSources): SkTypefaceFontProvider | null {
  const modules = [sources?.regular, sources?.bold].filter(Boolean) as DataModule[];
  // 훅이라 조건부 호출이 안 되므로 빈 목록도 그대로 넘긴다
  const provider = useFonts(modules.length > 0 ? { [CALENDAR_FONT_FAMILY]: modules } : {});

  // 빈 provider 를 그대로 쓰면 matchFont 가 "Could not find font family" 로 죽는다
  return modules.length > 0 ? provider : null;
}

/** matchFont 는 매 호출마다 새 SkFont 를 만든다 — 호출부에서 useMemo 로 감쌀 것 */
export function buildCalendarFonts({ dayFontSize, fontProvider, fontFamily }: CalendarFontRequest): CalendarFonts {
  const mgr = fontProvider ?? undefined;
  const family = { fontFamily: fontProvider && fontFamily ? fontFamily : SYSTEM_FONT_FAMILY };

  return {
    day: matchFont({ ...family, fontSize: dayFontSize, fontWeight: '500' }, mgr),
    daySelected: matchFont({ ...family, fontSize: dayFontSize, fontWeight: '700' }, mgr),
  };
}
