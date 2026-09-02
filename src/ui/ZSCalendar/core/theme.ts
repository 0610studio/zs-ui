/** 기본값을 전부 팔레트에서 파생하므로 다크 모드를 캘린더가 따로 처리하지 않는다 */

import type { Theme } from '../../../theme/types';
import { transparency } from '../../../theme/palette';

export interface CalendarTheme {
  /** 투명하게 두면 컨테이너 배경이 비친다 */
  background: string;
  dayText: string;
  /** 인접 달 날짜 숫자 */
  outsideDayText: string;
  sundayText: string;
  saturdayText: string;
  /** 선택 카드 배경 — 라이트는 `background.base`, 다크는 `grey[20]`. 팔레트에서 정해지므로 override 대상이 아니다 */
  selectedBackground: string;
  selectedText: string;
  /** 오늘 배경 — 글자색 4% 로 옅게 채운 원. 배경에서 파생되므로 override 대상이 아니다 */
  todayRing: string;
  todayText: string;
  weekdayText: string;
  /** color 미지정 이벤트의 dot */
  dotColor: string;
}

export type CalendarThemeOverride = Partial<Omit<CalendarTheme, 'selectedBackground' | 'todayRing'>>;

/** 소비자가 준 override 가 항상 이긴다 */
export function resolveCalendarTheme(palette: Theme, override?: CalendarThemeOverride): CalendarTheme {
  const base: CalendarTheme = {
    background: 'transparent',
    // text.primary 는 브랜드 강조색이라 본문 색인 text.base 를 쓴다
    dayText: palette.text.base,
    outsideDayText: palette.text.disabled,
    sundayText: palette.danger[50],
    saturdayText: palette.information[50],
    // 라이트에서는 배경과 같은 흰 카드가 그림자만으로 떠 보인다. 다크에서는 그림자가 묻히므로 회색으로 띄운다
    selectedBackground: palette.mode === 'dark' ? palette.grey[20] : palette.background.base,
    selectedText: palette.primary.main,
    // 본문 글자색을 4% 만 깔아 라이트·다크 어디서든 배경보다 한 톤 짙어진다
    todayRing: `${palette.text.base}${transparency['4%']}`,
    todayText: palette.text.base,
    weekdayText: palette.text.secondary,
    dotColor: palette.primary.main,
  };
  return override ? { ...base, ...override } : base;
}
