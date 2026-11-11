/** 로컬 날짜 문자열: YYYY-MM-DD. */
export type DateString = string;

export interface CivilDate {
  y: number;
  m: number;
  d: number;
}

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type FirstDayOfWeek = 0 | 1;

export type CalendarMode = 'week' | 'month';

export type CalendarEventDisplay = 'dot' | 'label';

export interface CalendarEvent<T = unknown> {
  id: string;
  date: DateString;
  color?: string;
  label?: string;
  textColor?: string;
  data?: T;
}

export type EventIndex<T = unknown> = ReadonlyMap<DateString, readonly CalendarEvent<T>[]>;

export interface DateRange {
  startDate: DateString;
  endDate: DateString;
}
