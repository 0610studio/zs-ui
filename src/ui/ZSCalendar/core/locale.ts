import type { DateString } from './types';

export type CalendarLocaleCode = 'ko' | 'en';

export interface CalendarLocaleStrings {
  weekdays: readonly string[];
  monthTitle: (year: number, month: number) => string;
  prevMonth: string;
  nextMonth: string;
  cellLabel: (date: DateString, eventCount: number, selected: boolean) => string;
  monthView: string;
  weekView: string;
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

export function resolveCalendarLocale(
  locale: CalendarLocaleCode | CalendarLocaleStrings = 'ko',
): CalendarLocaleStrings {
  return typeof locale === 'string' ? CALENDAR_LOCALES[locale] ?? ko : locale;
}
