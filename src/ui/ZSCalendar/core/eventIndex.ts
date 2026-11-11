import { addDays, addMonths, compareDate, diffDays, isValidDateString, startOfMonth, startOfWeek, weeksInMonth } from './date';
import type { CalendarEvent, CalendarMode, DateRange, DateString, EventIndex, FirstDayOfWeek } from './types';

const EMPTY: readonly never[] = [];

export function buildEventIndex<T>(events: readonly CalendarEvent<T>[] | undefined): EventIndex<T> {
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

export function getEventsOn<T>(index: EventIndex<T>, date: DateString): readonly CalendarEvent<T>[] {
  return index.get(date) ?? (EMPTY as readonly CalendarEvent<T>[]);
}

export const countEventsOn = <T>(index: EventIndex<T>, date: DateString): number =>
  getEventsOn(index, date).length;

export function dotColorsOn<T>(
  index: EventIndex<T>,
  date: DateString,
  maxDots: number,
  fallbackColor: string,
): string[] {
  const events = getEventsOn(index, date);
  if (events.length === 0 || maxDots <= 0) return [];

  const colors: string[] = [];
  for (const event of events) {
    const color = event.color ?? fallbackColor;
    if (colors.includes(color)) continue;
    colors.push(color);
    if (colors.length >= maxDots) break;
  }
  return colors;
}

export function labelChipsOn<T>(
  index: EventIndex<T>,
  date: DateString,
  lines: number,
): { chips: readonly CalendarEvent<T>[]; overflow: number } {
  const events = getEventsOn(index, date);
  if (lines <= 0) return { chips: EMPTY, overflow: events.length };
  if (events.length <= lines) return { chips: events, overflow: 0 };
  const visible = lines - 1;
  return { chips: events.slice(0, visible), overflow: events.length - visible };
}

export function eventsInRange<T>(
  index: EventIndex<T>,
  { startDate, endDate }: DateRange,
): CalendarEvent<T>[] {
  if (compareDate(startDate, endDate) > 0) return [];

  const span = diffDays(startDate, endDate);
  const result: CalendarEvent<T>[] = [];

  if (span + 1 <= index.size) {
    for (let offset = 0; offset <= span; offset += 1) {
      result.push(...getEventsOn(index, addDays(startDate, offset)));
    }
    return result;
  }

  const keys: DateString[] = [];
  index.forEach((_, key) => {
    if (compareDate(key, startDate) >= 0 && compareDate(key, endDate) <= 0) keys.push(key);
  });
  keys.sort();
  for (const key of keys) result.push(...getEventsOn(index, key));
  return result;
}

export function visibleRangeOf(
  anchorDate: DateString,
  mode: CalendarMode,
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

  const firstMonth = startOfMonth(addMonths(anchorDate, -neighborPages));
  const lastMonth = startOfMonth(addMonths(anchorDate, neighborPages));
  const lastGridStart = startOfWeek(lastMonth, firstDayOfWeek);
  return {
    startDate: startOfWeek(firstMonth, firstDayOfWeek),
    endDate: addDays(lastGridStart, weeksInMonth(lastMonth, firstDayOfWeek) * 7 - 1),
  };
}
