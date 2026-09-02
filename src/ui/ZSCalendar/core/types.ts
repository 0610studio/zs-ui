/** 'YYYY-MM-DD' 로컬 날짜 문자열. timestamp 를 쓰지 않아 타임존·DST 모호성이 없다 */
export type DateString = string;

/** m 은 1~12 */
export interface CivilDate {
  y: number;
  m: number;
  d: number;
}

/** 0=일요일 … 6=토요일 */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 0=일, 1=월 */
export type FirstDayOfWeek = 0 | 1;

export type CalendarMode = 'week' | 'month';

/** 달력 dot 과 아젠다 리스트가 공유하는 단일 소스 */
export interface CalendarEvent<T = unknown> {
  id: string;
  date: DateString;
  /** dot 색. 미지정 시 팔레트 primary */
  color?: string;
  /** 리스트 렌더링에 쓸 소비자 페이로드 */
  data?: T;
}

/** 날짜 → 이벤트 배열 O(1) 조회 */
export type EventIndex<T = unknown> = ReadonlyMap<DateString, ReadonlyArray<CalendarEvent<T>>>;

/** 시작·끝 모두 포함하는 구간 */
export interface DateRange {
  startDate: DateString;
  endDate: DateString;
}
