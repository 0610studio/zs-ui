import { useCallback, useMemo, useRef } from 'react';
import { Skia, createPicture, type SkPicture } from '@shopify/react-native-skia';
import {
  addDays,
  addMonths,
  buildMonthMatrix,
  buildWeek,
  diffDays,
  monthOfWeek,
  startOfMonth,
  weekRowOfMonth,
  type CalendarTheme,
  type DateString,
  type EventIndex,
  type FirstDayOfWeek,
  type GridLayoutMetrics,
} from '../core';
import type { CalendarFonts } from './fonts';
import { drawMonthPane, getSharedPanePaints, SELECTED_CARD_SHADOW_BLEED } from './drawGrid';

/** 페이지 한 장의 단위 */
export type CalendarPagerUnit = 'month' | 'week';

export interface PaneInput {
  unit: CalendarPagerUnit;
  /** 페이지 0 에 해당하는 달 / 주의 첫날 */
  baseMonth: DateString;
  baseWeek: DateString;
  /** 접혔을 때 화면에 남는 주의 첫날 */
  anchorWeekStart: DateString;
  metrics: GridLayoutMetrics;
  theme: CalendarTheme;
  fonts: CalendarFonts;
  index: EventIndex;
  selectedDate: DateString | null;
  today: DateString;
  firstDayOfWeek: FirstDayOfWeek;
}

export interface Pane {
  /** 화면 x = page × gridWidth + translateX */
  page: number;
  matrix: DateString[][];
  rowCount: number;
  picture: SkPicture;
  /** 접혔을 때 남는 행. 나머지는 뷰포트 밖으로 밀려나 잘린다 */
  anchorRow: number;
}

const CACHE_LIMIT = 8;

const isInWeek = (weekStart: DateString, date: DateString): boolean => {
  const offset = diffDays(weekStart, date);
  return offset >= 0 && offset < 7;
};

/**
 * pane 을 SkPicture 로 기록해 페이지가 바뀌어도 살아남은 pane 은 재사용한다.
 * 스와이프 한 번에 새로 기록되는 건 새로 들어온 이웃 1개뿐이다.
 */
export function usePaneCache(input: PaneInput) {
  const { unit, baseMonth, baseWeek, anchorWeekStart, metrics, theme, fonts, index, selectedDate, today, firstDayOfWeek } = input;
  const cache = useRef(new Map<string, Pane>());

  // 레이아웃·테마 변경은 빈도가 낮아, 키를 잘게 쪼개는 것보다 통째로 버리는 편이 싸다
  const generation = useMemo(
    () => ({ metrics, theme, fonts, index, today, firstDayOfWeek }),
    [metrics, theme, fonts, index, today, firstDayOfWeek],
  );
  const lastGeneration = useRef(generation);
  if (lastGeneration.current !== generation) {
    lastGeneration.current = generation;
    cache.current.clear();
  }

  const getPane = useCallback(
    (page: number): Pane => {
      const isWeek = unit === 'week';
      const weekStart = isWeek ? addDays(baseWeek, page * 7) : null;
      // 주간 페이지에서 흐리게 처리할 기준 달은 그 주의 과반이 속한 달
      const month = weekStart ? monthOfWeek(weekStart) : startOfMonth(addMonths(baseMonth, page));

      // 선택 표시는 그 날짜를 품은 pane 만 다시 그리면 된다. 히트 여부는 매트릭스 없이 산술로 판정한다
      const holdsSelected =
        !!selectedDate
        && (weekStart ? isInWeek(weekStart, selectedDate) : weekRowOfMonth(selectedDate, month, firstDayOfWeek) >= 0);
      // 키는 내용(달/주)이다 — 페이지 번호는 원점이 옮겨지면 같은 그림을 다른 번호로 가리킨다
      const key = `${unit}|${weekStart ?? month}|${holdsSelected ? selectedDate : ''}`;

      // page·anchorRow 는 그림이 아니라 배치라, 캐시된 픽처를 그대로 쓰고 위치만 갈아끼운다
      const anchorRow = weekStart ? 0 : Math.max(weekRowOfMonth(anchorWeekStart, month, firstDayOfWeek), 0);

      const cached = cache.current.get(key);
      if (cached) {
        // 최근 사용을 뒤로 보내 오래 안 본 pane 부터 밀려나게 한다
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
        Skia.XYWHRect(0, 0, metrics.gridWidth, (isWeek ? metrics.rowHeight : metrics.rowsHeight) + SELECTED_CARD_SHADOW_BLEED),
      );

      const pane: Pane = { page, matrix, rowCount: matrix.length, picture, anchorRow };
      cache.current.set(key, pane);

      if (cache.current.size > CACHE_LIMIT) {
        const oldest = cache.current.keys().next().value;
        if (oldest !== undefined) cache.current.delete(oldest);
      }
      return pane;
    },
    [unit, baseMonth, baseWeek, anchorWeekStart, metrics, theme, fonts, index, selectedDate, today, firstDayOfWeek],
  );

  return { getPane };
}
