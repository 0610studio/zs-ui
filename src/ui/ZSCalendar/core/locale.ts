/**
 * 달력이 스스로 만드는 문자열 전부 — 요일, 월 제목, 접근성 라벨, 스크린리더 안내.
 * 한국어·영어만 내장한다. 다른 언어는 `labels` 로 요일·월 제목을 덮어쓰거나 이 객체를 통째로 만들어 넘긴다.
 */

import type { DateString } from './types';

export type CalendarLocaleCode = 'ko' | 'en';

export interface CalendarLocaleStrings {
  /** 항상 일요일부터 — firstDayOfWeek 에 맞춘 회전은 달력이 한다 */
  weekdays: ReadonlyArray<string>;
  monthTitle: (year: number, month: number) => string;
  /** 헤더 화살표 접근성 라벨 */
  prevMonth: string;
  nextMonth: string;
  /** 날짜 셀 접근성 라벨 — "9월 3일, 일정 2건, 선택됨" */
  cellLabel: (date: DateString, eventCount: number, selected: boolean) => string;
  /** 모드 전환 안내 */
  monthView: string;
  weekView: string;
}

/** 소비자가 요일·월 제목만 갈아끼울 때 쓰는 부분 집합 (locale 위에 덮어쓴다) */
export interface CalendarLabels {
  /** 항상 일요일 시작으로 준다 — 회전은 내부에서 한다 */
  weekdays?: ReadonlyArray<string>;
  monthTitle?: (year: number, month: number) => string;
}

const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ko: CalendarLocaleStrings = {
  weekdays: ['일', '월', '화', '수', '목', '금', '토'],
  monthTitle: (year, month) => `${year}년 ${month}월`,
  prevMonth: '이전 달',
  nextMonth: '다음 달',
  cellLabel: (date, eventCount, selected) => {
    const month = Number(date.slice(5, 7));
    const day = Number(date.slice(8, 10));
    const events = eventCount > 0 ? `, 일정 ${eventCount}건` : '';
    return `${month}월 ${day}일${events}${selected ? ', 선택됨' : ''}`;
  },
  monthView: '월간 보기',
  weekView: '주간 보기',
};

const en: CalendarLocaleStrings = {
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  monthTitle: (year, month) => `${EN_MONTHS[month - 1]} ${year}`,
  prevMonth: 'Previous month',
  nextMonth: 'Next month',
  cellLabel: (date, eventCount, selected) => {
    const month = EN_MONTHS[Number(date.slice(5, 7)) - 1];
    const day = Number(date.slice(8, 10));
    const events = eventCount > 0 ? `, ${eventCount} ${eventCount === 1 ? 'event' : 'events'}` : '';
    return `${month} ${day}${events}${selected ? ', selected' : ''}`;
  },
  monthView: 'Month view',
  weekView: 'Week view',
};

export const CALENDAR_LOCALES: Readonly<Record<CalendarLocaleCode, CalendarLocaleStrings>> = { ko, en };

/** locale 을 고르고 labels 가 있으면 그 항목만 덮어쓴다. 모르는 코드는 한국어로 */
export function resolveCalendarLocale(
  locale: CalendarLocaleCode | CalendarLocaleStrings = 'ko',
  labels?: CalendarLabels,
): CalendarLocaleStrings {
  const base = typeof locale === 'string' ? CALENDAR_LOCALES[locale] ?? ko : locale;
  if (!labels?.weekdays && !labels?.monthTitle) return base;
  return {
    ...base,
    weekdays: labels.weekdays ?? base.weekdays,
    monthTitle: labels.monthTitle ?? base.monthTitle,
  };
}

/** @deprecated `CALENDAR_LOCALES.ko.weekdays` — 0.21 호환용 */
export const DEFAULT_WEEKDAY_LABELS_KO: ReadonlyArray<string> = ko.weekdays;
/** @deprecated `CALENDAR_LOCALES.ko.monthTitle` — 0.21 호환용 */
export const defaultMonthTitle = ko.monthTitle;
