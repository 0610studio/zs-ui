import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { CalendarLocaleStrings, CalendarMode, DateString } from '../core';

export function useCalendarAnnouncements(
  visibleMonth: DateString,
  mode: CalendarMode,
  enabled: boolean,
  strings: Pick<CalendarLocaleStrings, 'monthTitle' | 'monthView' | 'weekView'>,
): void {
  const previous = useRef<{ month: string; mode: CalendarMode } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const monthKey = visibleMonth.slice(0, 7);
    const last = previous.current;
    previous.current = { month: monthKey, mode };
    if (!last) return;

    const announce = AccessibilityInfo?.announceForAccessibility;
    if (typeof announce !== 'function') return;

    if (last.month !== monthKey) {
      announce(strings.monthTitle(Number(visibleMonth.slice(0, 4)), Number(visibleMonth.slice(5, 7))));
    } else if (last.mode !== mode) {
      announce(mode === 'month' ? strings.monthView : strings.weekView);
    }
  }, [visibleMonth, mode, enabled, strings]);
}
