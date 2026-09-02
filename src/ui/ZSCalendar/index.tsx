// 네이티브 진입점 — 웹은 index.web.tsx 가 대체한다.
// 구현이 ZSCalendar.tsx 로 분리된 건 jest 가 web.tsx 를 먼저 해석해서다 (테스트는 명시 import).
export { default } from './ZSCalendar';
export type { ZSCalendarProps, CalendarHeaderContext } from './ZSCalendar';
