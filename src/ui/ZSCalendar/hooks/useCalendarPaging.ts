import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import {
  addDays,
  addMonths,
  isSameMonth,
  monthsBetween,
  resolveWeekMonth,
  startOfMonth,
  startOfWeek,
  weeksBetween,
  weeksInMonth,
  type CalendarMode,
  type DateString,
  type FirstDayOfWeek,
} from '../core';

export interface CalendarPaging {
  unit: CalendarMode;
  page: number;
  setPage: (page: number) => void;
  baseMonth: DateString;
  baseWeek: DateString;
  weekAnchor: { week: DateString; month: DateString };
  currentWeekStart: DateString;
  derivedMonth: DateString;
  rowCount: number;
  switchUnit: (next: CalendarMode) => void;
  jumpToMonth: (month: DateString) => number;
}

export function useCalendarPaging({
  visibleMonth,
  selectedDate,
  firstDayOfWeek,
  initialMode,
}: {
  visibleMonth: DateString;
  selectedDate: DateString | null;
  firstDayOfWeek: FirstDayOfWeek;
  initialMode: CalendarMode;
}): CalendarPaging {
  const [unit, setUnit] = useState<CalendarMode>(initialMode);
  const [page, setPage] = useState(0);

  const [initialWeek] = useState(() =>
    startOfWeek(selectedDate && isSameMonth(selectedDate, visibleMonth) ? selectedDate : visibleMonth, firstDayOfWeek),
  );
  const [baseMonth, setBaseMonth] = useState(visibleMonth);
  const [baseWeekRaw, setBaseWeek] = useState(initialWeek);
  const baseWeek = useMemo(() => startOfWeek(baseWeekRaw, firstDayOfWeek), [baseWeekRaw, firstDayOfWeek]);
  const [weekAnchor, setWeekAnchor] = useState(() => ({ week: initialWeek, month: startOfMonth(visibleMonth) }));

  const currentWeekStart = useMemo(() => {
    if (unit === 'week') return addDays(baseWeek, page * 7);
    const month = startOfMonth(addMonths(baseMonth, page));
    return selectedDate && isSameMonth(selectedDate, month)
      ? startOfWeek(selectedDate, firstDayOfWeek)
      : startOfWeek(startOfMonth(month), firstDayOfWeek);
  }, [unit, page, baseWeek, baseMonth, selectedDate, firstDayOfWeek]);

  const derivedMonth = useMemo(
    () =>
      unit === 'week'
        ? resolveWeekMonth(currentWeekStart, weekAnchor.week, weekAnchor.month)
        : startOfMonth(addMonths(baseMonth, page)),
    [unit, currentWeekStart, weekAnchor, baseMonth, page],
  );
  const rowCount = useMemo(() => weeksInMonth(derivedMonth, firstDayOfWeek), [derivedMonth, firstDayOfWeek]);

  const stateRef = useRef({ unit, page, currentWeekStart, baseWeek, baseMonth, derivedMonth, firstDayOfWeek });
  stateRef.current = { unit, page, currentWeekStart, baseWeek, baseMonth, derivedMonth, firstDayOfWeek };

  const switchUnit = useCallback((next: CalendarMode) => {
    const current = stateRef.current;
    if (current.unit === next) return;

    if (next === 'week') {
      setWeekAnchor({ week: current.currentWeekStart, month: current.derivedMonth });
      setBaseWeek(addDays(current.currentWeekStart, -7 * current.page));
    } else {
      setBaseMonth(addMonths(current.derivedMonth, -current.page));
    }
    setUnit(next);
  }, []);

  const jumpToMonth = useCallback((month: DateString) => {
    const current = stateRef.current;
    let target: number;
    if (current.unit === 'week') {
      const week = startOfWeek(month, current.firstDayOfWeek);
      target = weeksBetween(current.baseWeek, week);
      setWeekAnchor({ week, month: startOfMonth(month) });
    } else {
      target = monthsBetween(current.baseMonth, month);
    }
    setPage(target);
    return target;
  }, []);

  return {
    unit,
    page,
    setPage,
    baseMonth,
    baseWeek,
    weekAnchor,
    currentWeekStart,
    derivedMonth,
    rowCount,
    switchUnit,
    jumpToMonth,
  };
}

export function useCalendarPagingSync(
  { unit, derivedMonth, switchUnit, jumpToMonth }: CalendarPaging,
  {
    progress,
    mode,
    driveMode,
    goToPage,
    visibleMonth,
    setVisibleMonth,
  }: {
    progress: SharedValue<number>;
    mode: CalendarMode;
    driveMode: (mode: CalendarMode) => void;
    goToPage: (page: number) => void;
    visibleMonth: DateString;
    setVisibleMonth: (month: DateString) => void;
  },
): boolean {
  useAnimatedReaction(
    () => progress.value > 0.001,
    (needsMonthGrid, previous) => {
      if (previous !== null && needsMonthGrid === previous) return;
      scheduleOnRN(switchUnit, needsMonthGrid ? 'month' : 'week');
    },
  );

  const [midTransition, setMidTransition] = useState(false);
  useAnimatedReaction(
    () => progress.value > 0.001 && progress.value < 0.999,
    (mid, previous) => {
      if (mid !== previous) scheduleOnRN(setMidTransition, mid);
    },
  );

  const lastMonthRef = useRef(visibleMonth);
  useEffect(() => {
    if (derivedMonth !== lastMonthRef.current) {
      lastMonthRef.current = derivedMonth;
      setVisibleMonth(derivedMonth);
      return;
    }
    if (visibleMonth === derivedMonth) return;

    lastMonthRef.current = visibleMonth;
    goToPage(jumpToMonth(visibleMonth));
  }, [derivedMonth, visibleMonth, setVisibleMonth, goToPage, jumpToMonth]);

  const lastModeRef = useRef(mode);
  useEffect(() => {
    if (lastModeRef.current === mode) return;
    lastModeRef.current = mode;
    if (mode === 'month') switchUnit('month');
    driveMode(mode);
  }, [mode, driveMode, switchUnit]);

  return unit === 'month' && (midTransition || mode !== 'month');
}
