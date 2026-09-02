import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import { CALENDAR_LOCALES, type CalendarLocaleStrings, type CalendarMode, type DateString } from '../core';

/** 월 이동·모드 전환은 화면만 바뀌고 포커스는 그대로라, 스크린리더로는 알 길이 없다 */
export function useCalendarAnnouncements(
  visibleMonth: DateString,
  mode: CalendarMode,
  enabled = true,
  strings: Pick<CalendarLocaleStrings, 'monthTitle' | 'monthView' | 'weekView'> = CALENDAR_LOCALES.ko,
): void {
  const previous = useRef<{ month: string; mode: CalendarMode } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const monthKey = visibleMonth.slice(0, 7);
    const last = previous.current;
    previous.current = { month: monthKey, mode };
    if (!last) return; // 첫 렌더는 알리지 않는다 — 화면 진입 안내와 겹친다

    // 일부 환경에는 AccessibilityInfo 가 없다 — 안내는 있으면 좋은 것이지 필수가 아니다
    const announce = AccessibilityInfo?.announceForAccessibility;
    if (typeof announce !== 'function') return;

    if (last.month !== monthKey) {
      announce(strings.monthTitle(Number(visibleMonth.slice(0, 4)), Number(visibleMonth.slice(5, 7))));
    } else if (last.mode !== mode) {
      announce(mode === 'month' ? strings.monthView : strings.weekView);
    }
  }, [visibleMonth, mode, enabled, strings]);
}
