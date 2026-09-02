/**
 * 외부 의존 없는 날짜 엔진. Date·timestamp 산술은 DST 전환일에 하루가 밀리므로,
 * days-from-civil(Hinnant) 로 {y,m,d} ↔ epochDay 를 정수로만 왕복한다.
 */

import type { CivilDate, DateString, FirstDayOfWeek, WeekdayIndex } from './types';

const DATE_STRING_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad2 = (value: number): string => (value < 10 ? `0${value}` : `${value}`);

const floorDiv = (a: number, b: number): number => Math.floor(a / b);

export const isLeapYear = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const daysInMonth = (y: number, m: number): number =>
  m === 2 && isLeapYear(y) ? 29 : (MONTH_LENGTHS[m - 1] as number);

/** 1970-01-01 을 0 으로 하는 일련 일수 */
export function toEpochDay({ y, m, d }: CivilDate): number {
  const shiftedYear = m <= 2 ? y - 1 : y;
  const era = floorDiv(shiftedYear, 400);
  const yearOfEra = shiftedYear - era * 400;
  const dayOfYear = floorDiv(153 * (m + (m > 2 ? -3 : 9)) + 2, 5) + d - 1;
  const dayOfEra = yearOfEra * 365 + floorDiv(yearOfEra, 4) - floorDiv(yearOfEra, 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

export function fromEpochDay(epochDay: number): CivilDate {
  const z = epochDay + 719468;
  const era = floorDiv(z, 146097);
  const dayOfEra = z - era * 146097;
  const yearOfEra = floorDiv(
    dayOfEra - floorDiv(dayOfEra, 1460) + floorDiv(dayOfEra, 36524) - floorDiv(dayOfEra, 146096),
    365,
  );
  const year = yearOfEra + era * 400;
  const dayOfYear = dayOfEra - (365 * yearOfEra + floorDiv(yearOfEra, 4) - floorDiv(yearOfEra, 100));
  const mp = floorDiv(5 * dayOfYear + 2, 153);
  const d = dayOfYear - floorDiv(153 * mp + 2, 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return { y: m <= 2 ? year + 1 : year, m, d };
}

/** 달력상 실재 여부까지 본다 — '2025-02-30' 은 false */
export function isValidDateString(value: unknown): value is DateString {
  if (typeof value !== 'string') return false;
  const matched = DATE_STRING_PATTERN.exec(value);
  if (!matched) return false;
  const y = Number(matched[1]);
  const m = Number(matched[2]);
  const d = Number(matched[3]);
  if (m < 1 || m > 12) return false;
  return d >= 1 && d <= daysInMonth(y, m);
}

export const toDateString = ({ y, m, d }: CivilDate): DateString => `${y.toString().padStart(4, '0')}-${pad2(m)}-${pad2(d)}`;

/** 형식이 어긋나면 예외 — 외부 입력은 isValidDateString 으로 먼저 거른다 */
export function parseDate(date: DateString): CivilDate {
  const matched = DATE_STRING_PATTERN.exec(date);
  if (!matched) throw new Error(`[ZSCalendar] 잘못된 날짜 문자열: ${date}`);
  return { y: Number(matched[1]), m: Number(matched[2]), d: Number(matched[3]) };
}

/** 로컬 타임존 기준 오늘 */
export function todayDateString(now: Date = new Date()): DateString {
  return toDateString({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
}

/** 0=일 … 6=토. 상수 11 은 1970-01-01 이 목요일(4)이라서 나온다 */
export function dayOfWeek(date: DateString): WeekdayIndex {
  const epochDay = toEpochDay(parseDate(date));
  return (((epochDay % 7) + 11) % 7) as WeekdayIndex;
}

export const addDays = (date: DateString, amount: number): DateString =>
  toDateString(fromEpochDay(toEpochDay(parseDate(date)) + amount));

/** 대상 월에 없는 일자는 말일로 클램프한다 (1/31 + 1개월 = 2/28) */
export function addMonths(date: DateString, amount: number): DateString {
  const { y, m, d } = parseDate(date);
  const totalMonths = y * 12 + (m - 1) + amount;
  const nextYear = floorDiv(totalMonths, 12);
  const nextMonth = totalMonths - nextYear * 12 + 1;
  return toDateString({ y: nextYear, m: nextMonth, d: Math.min(d, daysInMonth(nextYear, nextMonth)) });
}

/** b - a (월 단위) */
export function monthsBetween(a: DateString, b: DateString): number {
  const from = parseDate(a);
  const to = parseDate(b);
  return (to.y - from.y) * 12 + (to.m - from.m);
}

export const compareDate = (a: DateString, b: DateString): number => (a < b ? -1 : a > b ? 1 : 0);

export const isSameDate = (a: DateString, b: DateString): boolean => a === b;

export const isSameMonth = (a: DateString, b: DateString): boolean => a.slice(0, 7) === b.slice(0, 7);

/** b - a (일 단위) */
export const diffDays = (a: DateString, b: DateString): number =>
  toEpochDay(parseDate(b)) - toEpochDay(parseDate(a));

export const startOfMonth = (date: DateString): DateString => `${date.slice(0, 7)}-01`;

export function endOfMonth(date: DateString): DateString {
  const { y, m } = parseDate(date);
  return toDateString({ y, m, d: daysInMonth(y, m) });
}

export function startOfWeek(date: DateString, firstDayOfWeek: FirstDayOfWeek = 0): DateString {
  const offset = (dayOfWeek(date) - firstDayOfWeek + 7) % 7;
  return addDays(date, -offset);
}

export const endOfWeek = (date: DateString, firstDayOfWeek: FirstDayOfWeek = 0): DateString =>
  addDays(startOfWeek(date, firstDayOfWeek), 6);

/** 그 달을 덮는 데 필요한 주 수. 2월이 딱 맞아떨어지면 4주까지 내려간다 */
export function weeksInMonth(date: DateString, firstDayOfWeek: FirstDayOfWeek = 0): number {
  const first = startOfMonth(date);
  const leadingBlanks = (dayOfWeek(first) - firstDayOfWeek + 7) % 7;
  const { y, m } = parseDate(first);
  return Math.ceil((leadingBlanks + daysInMonth(y, m)) / 7);
}

/** b - a (주 단위). 양쪽 모두 같은 firstDayOfWeek 의 주 시작일이어야 한다 */
export const weeksBetween = (a: DateString, b: DateString): number => Math.round(diffDays(a, b) / 7);

/**
 * 한 주의 과반이 속한 달. 고른 달의 그리드에는 그 주가 반드시 한 행으로 들어 있다 —
 * 주간↔월간 전환이 같은 주를 제자리에 남기는 근거다.
 */
export const monthOfWeek = (weekStart: DateString): DateString => startOfMonth(addDays(weekStart, 3));

/** 시작일을 epochDay 로 한 번만 풀고 7칸을 포맷만 한다 — 칸마다 파싱하지 않는다 */
export function buildWeek(date: DateString, firstDayOfWeek: FirstDayOfWeek = 0): DateString[] {
  const first = toEpochDay(parseDate(startOfWeek(date, firstDayOfWeek)));
  return Array.from({ length: 7 }, (_, index) => toDateString(fromEpochDay(first + index)));
}

/** 4~6행 × 7열. 빈 칸 대신 인접 달 날짜로 채워야 주↔월 전환에서 행이 튀지 않는다 */
export function buildMonthMatrix(date: DateString, firstDayOfWeek: FirstDayOfWeek = 0): DateString[][] {
  const rowCount = weeksInMonth(date, firstDayOfWeek);
  const gridStart = toEpochDay(parseDate(startOfWeek(startOfMonth(date), firstDayOfWeek)));
  return Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => toDateString(fromEpochDay(gridStart + row * 7 + column))),
  );
}

/** 그리드 밖이면 -1 */
export function weekRowOfMonth(
  date: DateString,
  monthAnchor: DateString,
  firstDayOfWeek: FirstDayOfWeek = 0,
): number {
  const gridStart = startOfWeek(startOfMonth(monthAnchor), firstDayOfWeek);
  const offset = diffDays(gridStart, date);
  if (offset < 0) return -1;
  const row = Math.floor(offset / 7);
  return row < weeksInMonth(monthAnchor, firstDayOfWeek) ? row : -1;
}

/** labels 는 항상 일요일 시작으로 받아 firstDayOfWeek 기준으로 회전시킨다 */
export function rotateWeekdays<T>(labels: ReadonlyArray<T>, firstDayOfWeek: FirstDayOfWeek = 0): T[] {
  return labels.map((_, index) => labels[(index + firstDayOfWeek) % labels.length] as T);
}
