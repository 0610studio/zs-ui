import { useCallback, useMemo, useRef } from 'react';
import { Skia, createPicture, type SkPicture } from 'react-native-skia';
import {
  addDays,
  addMonths,
  buildMonthMatrix,
  buildWeek,
  diffDays,
  resolveWeekMonth,
  startOfMonth,
  weekRowOfMonth,
  type CalendarMode,
  type DateString,
  type EventIndex,
  type FirstDayOfWeek,
  type GridLayoutMetrics,
  type ResolvedCalendarTheme,
} from '../core';
import type { CalendarFonts } from './fonts';
import { drawMonthPane, getSharedPanePaints } from './drawGrid';

export interface PaneInput {
  unit: CalendarMode;
  baseMonth: DateString;
  baseWeek: DateString;
  weekAnchor: { week: DateString; month: DateString };
  anchorWeekStart: DateString;
  metrics: GridLayoutMetrics;
  theme: ResolvedCalendarTheme;
  fonts: CalendarFonts;
  index: EventIndex;
  selectedDate: DateString | null;
  today: DateString;
  firstDayOfWeek: FirstDayOfWeek;
}

export interface Pane {
  page: number;
  matrix: DateString[][];
  picture: SkPicture;
  anchorRow: number;
}

const CACHE_LIMIT = 8;

const isInWeek = (weekStart: DateString, date: DateString): boolean => {
  const offset = diffDays(weekStart, date);
  return offset >= 0 && offset < 7;
};

export function usePaneCache(input: PaneInput): (page: number) => Pane {
  const { unit, baseMonth, baseWeek, weekAnchor, anchorWeekStart, metrics, theme, fonts, index, selectedDate, today, firstDayOfWeek } = input;
  const cache = useRef(new Map<string, Pane>());

  const generation = useMemo(
    () => ({ metrics, theme, fonts, index, today, firstDayOfWeek }),
    [metrics, theme, fonts, index, today, firstDayOfWeek],
  );
  const lastGeneration = useRef(generation);
  if (lastGeneration.current !== generation) {
    lastGeneration.current = generation;
    cache.current.clear();
  }

  return useCallback(
    (page: number): Pane => {
      const isWeek = unit === 'week';
      const weekStart = isWeek ? addDays(baseWeek, page * 7) : null;
      const month = weekStart
        ? resolveWeekMonth(weekStart, weekAnchor.week, weekAnchor.month)
        : startOfMonth(addMonths(baseMonth, page));

      const holdsSelected =
        !!selectedDate
        && (weekStart ? isInWeek(weekStart, selectedDate) : weekRowOfMonth(selectedDate, month, firstDayOfWeek) >= 0);
      const key = `${unit}|${weekStart ?? ''}|${month}|${holdsSelected ? selectedDate : ''}`;

      const anchorRow = weekStart ? 0 : Math.max(weekRowOfMonth(anchorWeekStart, month, firstDayOfWeek), 0);

      const cached = cache.current.get(key);
      if (cached) {
        cache.current.delete(key);
        cache.current.set(key, cached);
        return cached.anchorRow === anchorRow && cached.page === page ? cached : { ...cached, page, anchorRow };
      }

      const matrix = weekStart ? [buildWeek(weekStart, firstDayOfWeek)] : buildMonthMatrix(month, firstDayOfWeek);
      const picture = createPicture(
        (canvas) => {
          drawMonthPane(
            canvas,
            {
              matrix,
              monthKey: month.slice(0, 7),
              selectedDate: holdsSelected ? selectedDate : null,
              today,
              index,
              metrics,
              theme,
              fonts,
              firstDayOfWeek,
            },
            getSharedPanePaints(),
          );
        },
        Skia.XYWHRect(0, 0, metrics.gridWidth, (isWeek ? metrics.rowHeight : metrics.rowsHeight)),
      );

      const pane: Pane = { page, matrix, picture, anchorRow };
      cache.current.set(key, pane);

      if (cache.current.size > CACHE_LIMIT) {
        const oldest = cache.current.keys().next().value;
        if (oldest !== undefined) cache.current.delete(oldest);
      }
      return pane;
    },
    [unit, baseMonth, baseWeek, weekAnchor, anchorWeekStart, metrics, theme, fonts, index, selectedDate, today, firstDayOfWeek],
  );
}
