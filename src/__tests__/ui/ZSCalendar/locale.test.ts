import { CALENDAR_LOCALES, resolveCalendarLocale } from '../../../ui/ZSCalendar/core/locale';

describe('ZSCalendar core/locale', () => {
  it('한국어 — 요일·월 제목·셀 라벨', () => {
    const ko = CALENDAR_LOCALES.ko;
    expect(ko.weekdays[0]).toBe('일');
    expect(ko.monthTitle(2026, 9)).toBe('2026년 9월');
    expect(ko.cellLabel('2026-09-03', 2, true)).toBe('9월 3일, 일정 2건, 선택됨');
    expect(ko.cellLabel('2026-09-04', 0, false)).toBe('9월 4일');
    expect(ko.prevMonth).toBe('이전 달');
    expect(ko.monthView).toBe('월간 보기');
  });

  it('영어 — 월 이름과 단수·복수', () => {
    const en = CALENDAR_LOCALES.en;
    expect(en.weekdays).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(en.monthTitle(2026, 9)).toBe('September 2026');
    expect(en.cellLabel('2026-09-03', 2, true)).toBe('September 3, 2 events, selected');
    expect(en.cellLabel('2026-09-04', 1, false)).toBe('September 4, 1 event');
    expect(en.cellLabel('2026-12-25', 0, false)).toBe('December 25');
    expect(en.nextMonth).toBe('Next month');
    expect(en.weekView).toBe('Week view');
  });

  it('기본은 한국어이고, 모르는 코드도 한국어로 떨어진다', () => {
    expect(resolveCalendarLocale()).toBe(CALENDAR_LOCALES.ko);
    expect(resolveCalendarLocale('fr' as never)).toBe(CALENDAR_LOCALES.ko);
  });

  it('labels 는 locale 위에 요일·월 제목만 덮어쓴다 — 접근성 문구는 로케일을 따른다', () => {
    const resolved = resolveCalendarLocale('en', { monthTitle: (y, m) => `${m}/${y}` });
    expect(resolved.monthTitle(2026, 9)).toBe('9/2026');
    expect(resolved.weekdays).toEqual(CALENDAR_LOCALES.en.weekdays);
    expect(resolved.prevMonth).toBe('Previous month');
  });

  it('문자열 묶음을 직접 넘기면 그대로 쓴다', () => {
    const custom = { ...CALENDAR_LOCALES.en, monthView: 'Monat' };
    expect(resolveCalendarLocale(custom).monthView).toBe('Monat');
  });
});
