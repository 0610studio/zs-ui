/** 달력 dot 과 아젠다 리스트가 같은 배열에서 파생된다 — 1회 순회 후 조회는 전부 O(1) */

import { addDays, addMonths, compareDate, diffDays, isValidDateString, startOfMonth, startOfWeek, weeksInMonth } from './date';
import type { CalendarEvent, DateRange, DateString, EventIndex, FirstDayOfWeek } from './types';

const EMPTY: ReadonlyArray<never> = [];

/** 잘못된 date 는 건너뛴다 — 응답 한 건 때문에 달력 전체가 죽는 것보다 낫다 */
export function buildEventIndex<T>(events: ReadonlyArray<CalendarEvent<T>> | undefined): EventIndex<T> {
  const index = new Map<DateString, CalendarEvent<T>[]>();
  if (!events || events.length === 0) return index;

  let skipped = 0;
  for (const event of events) {
    if (!isValidDateString(event?.date)) {
      skipped += 1;
      continue;
    }
    const bucket = index.get(event.date);
    if (bucket) bucket.push(event);
    else index.set(event.date, [event]);
  }

  if (skipped > 0 && __DEV__) {
    console.warn(`[ZSCalendar] 날짜 형식이 잘못된 이벤트 ${skipped}건을 건너뛰었습니다 ('YYYY-MM-DD' 필요).`);
  }
  return index;
}

export function getEventsOn<T>(index: EventIndex<T>, date: DateString): ReadonlyArray<CalendarEvent<T>> {
  return index.get(date) ?? (EMPTY as ReadonlyArray<CalendarEvent<T>>);
}

export const countEventsOn = <T>(index: EventIndex<T>, date: DateString): number =>
  index.get(date)?.length ?? 0;

/** 중복 색은 합치고 maxDots 개로 자른다 */
export function dotColorsOn<T>(
  index: EventIndex<T>,
  date: DateString,
  maxDots: number,
  fallbackColor: string,
): string[] {
  const events = index.get(date);
  if (!events || events.length === 0 || maxDots <= 0) return [];

  const colors: string[] = [];
  for (const event of events) {
    const color = event.color ?? fallbackColor;
    if (colors.includes(color)) continue;
    colors.push(color);
    if (colors.length >= maxDots) break;
  }
  return colors;
}

/** 날짜 오름차순으로 평탄화. 같은 날 안에서는 입력 순서를 유지한다 */
export function eventsInRange<T>(
  index: EventIndex<T>,
  { startDate, endDate }: DateRange,
): CalendarEvent<T>[] {
  if (compareDate(startDate, endDate) > 0) return [];

  const span = diffDays(startDate, endDate);
  const result: CalendarEvent<T>[] = [];

  // 구간이 인덱스보다 작은 게 일반적이라, 전체 정렬 대신 구간 길이만큼만 훑는다
  if (span + 1 <= index.size) {
    for (let offset = 0; offset <= span; offset += 1) {
      const bucket = index.get(addDays(startDate, offset));
      if (bucket) result.push(...bucket);
    }
    return result;
  }

  const keys: DateString[] = [];
  index.forEach((_, key) => {
    if (compareDate(key, startDate) >= 0 && compareDate(key, endDate) <= 0) keys.push(key);
  });
  keys.sort();
  for (const key of keys) result.push(...(index.get(key) ?? []));
  return result;
}

/**
 * 페이저가 실제로 그리는 구간 — 현재 페이지와 앞뒤 각 1페이지.
 * 이 범위만 prefetch 하면 스와이프 도착 시점에 dot 이 이미 그려져 있다.
 */
export function visibleRangeOf(
  anchorDate: DateString,
  mode: 'week' | 'month',
  firstDayOfWeek: FirstDayOfWeek = 0,
  neighborPages = 1,
): DateRange {
  if (mode === 'week') {
    const start = startOfWeek(anchorDate, firstDayOfWeek);
    return {
      startDate: addDays(start, -7 * neighborPages),
      endDate: addDays(start, 7 * (neighborPages + 1) - 1),
    };
  }

  // 그리드의 첫 칸과 마지막 칸만 필요하다 — 매트릭스를 통째로 만들 이유가 없다
  const firstMonth = startOfMonth(addMonths(anchorDate, -neighborPages));
  const lastMonth = startOfMonth(addMonths(anchorDate, neighborPages));
  const lastGridStart = startOfWeek(lastMonth, firstDayOfWeek);
  return {
    startDate: startOfWeek(firstMonth, firstDayOfWeek),
    endDate: addDays(lastGridStart, weeksInMonth(lastMonth, firstDayOfWeek) * 7 - 1),
  };
}
