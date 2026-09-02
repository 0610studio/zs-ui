import {
  buildEventIndex,
  countEventsOn,
  dotColorsOn,
  eventsInRange,
  getEventsOn,
  visibleRangeOf,
} from '../../../ui/ZSCalendar/core/eventIndex';
import type { CalendarEvent } from '../../../ui/ZSCalendar/core/types';

const event = (id: string, date: string, color?: string): CalendarEvent<string> => ({
  id,
  date,
  color,
  data: id,
});

describe('ZSCalendar core/eventIndex — 인덱싱', () => {
  it('같은 날짜 이벤트를 입력 순서대로 묶는다', () => {
    const index = buildEventIndex([event('a', '2025-09-01'), event('b', '2025-09-01'), event('c', '2025-09-02')]);
    expect(index.get('2025-09-01')?.map((e) => e.id)).toEqual(['a', 'b']);
    expect(index.get('2025-09-02')?.map((e) => e.id)).toEqual(['c']);
    expect(index.size).toBe(2);
  });

  it('빈 입력·undefined 를 안전하게 처리한다', () => {
    expect(buildEventIndex(undefined).size).toBe(0);
    expect(buildEventIndex([]).size).toBe(0);
  });

  it('잘못된 날짜는 건너뛰고 1회 경고한다', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const index = buildEventIndex([
      event('ok', '2025-09-01'),
      event('bad', '2025-02-30'),
      { id: 'noDate' } as unknown as CalendarEvent<string>,
    ]);
    expect(index.size).toBe(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('2건');
    warn.mockRestore();
  });

  it('1만 건 인덱싱이 성능 목표(30ms) 안에 끝난다', () => {
    const events = Array.from({ length: 10_000 }, (_, i) =>
      event(`e${i}`, `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`),
    );
    const started = Date.now();
    const index = buildEventIndex(events);
    expect(Date.now() - started).toBeLessThan(30);
    expect(index.size).toBeGreaterThan(0);
  });
});

describe('ZSCalendar core/eventIndex — 조회', () => {
  const index = buildEventIndex([
    event('a', '2025-09-01', '#f00'),
    event('b', '2025-09-01', '#f00'),
    event('c', '2025-09-01', '#0f0'),
    event('d', '2025-09-01', '#00f'),
    event('e', '2025-09-05'),
  ]);

  it('getEventsOn 은 없는 날짜에 같은 빈 배열을 돌려준다', () => {
    expect(getEventsOn(index, '2025-09-01')).toHaveLength(4);
    const empty1 = getEventsOn(index, '2025-09-02');
    const empty2 = getEventsOn(index, '2025-09-03');
    expect(empty1).toHaveLength(0);
    expect(empty1).toBe(empty2);
  });

  it('countEventsOn', () => {
    expect(countEventsOn(index, '2025-09-01')).toBe(4);
    expect(countEventsOn(index, '2025-09-02')).toBe(0);
  });

  it('dotColorsOn 은 중복 색을 합치고 maxDots 로 자른다', () => {
    expect(dotColorsOn(index, '2025-09-01', 3, '#000')).toEqual(['#f00', '#0f0', '#00f']);
    expect(dotColorsOn(index, '2025-09-01', 2, '#000')).toEqual(['#f00', '#0f0']);
    expect(dotColorsOn(index, '2025-09-01', 0, '#000')).toEqual([]);
  });

  it('색 미지정 이벤트는 fallback 색을 쓴다', () => {
    expect(dotColorsOn(index, '2025-09-05', 3, '#123456')).toEqual(['#123456']);
    expect(dotColorsOn(index, '2025-09-09', 3, '#123456')).toEqual([]);
  });
});

describe('ZSCalendar core/eventIndex — eventsInRange', () => {
  const index = buildEventIndex([
    event('c', '2025-09-05'),
    event('a', '2025-09-01'),
    event('b', '2025-09-01'),
    event('d', '2025-10-01'),
  ]);

  it('날짜 오름차순으로 평탄화하고 같은 날 순서는 유지한다', () => {
    expect(eventsInRange(index, { startDate: '2025-09-01', endDate: '2025-09-30' }).map((e) => e.id)).toEqual([
      'a', 'b', 'c',
    ]);
  });

  it('구간 밖 이벤트는 제외한다', () => {
    expect(eventsInRange(index, { startDate: '2025-09-02', endDate: '2025-09-06' }).map((e) => e.id)).toEqual(['c']);
  });

  it('start > end 면 빈 배열', () => {
    expect(eventsInRange(index, { startDate: '2025-09-10', endDate: '2025-09-01' })).toEqual([]);
  });

  it('구간이 인덱스보다 커도(희소 스캔 경로) 같은 결과를 낸다', () => {
    expect(eventsInRange(index, { startDate: '2020-01-01', endDate: '2030-12-31' }).map((e) => e.id)).toEqual([
      'a', 'b', 'c', 'd',
    ]);
  });

  it('하루짜리 구간', () => {
    expect(eventsInRange(index, { startDate: '2025-09-01', endDate: '2025-09-01' }).map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('ZSCalendar core/eventIndex — visibleRangeOf (prefetch 힌트)', () => {
  it('월간은 앞뒤 1개월 그리드까지 포함한다', () => {
    // 2025-08 그리드 첫날 ~ 2025-10 그리드 마지막날
    expect(visibleRangeOf('2025-09-15', 'month', 0)).toEqual({
      startDate: '2025-07-27',
      endDate: '2025-11-01',
    });
  });

  it('주간은 앞뒤 1주까지 21일이다', () => {
    const range = visibleRangeOf('2025-09-03', 'week', 0);
    expect(range).toEqual({ startDate: '2025-08-24', endDate: '2025-09-13' });
  });

  it('firstDayOfWeek=1 이 반영된다', () => {
    expect(visibleRangeOf('2025-09-03', 'week', 1)).toEqual({
      startDate: '2025-08-25',
      endDate: '2025-09-14',
    });
  });

  it('연 경계를 넘는 월간 범위', () => {
    const range = visibleRangeOf('2025-01-10', 'month', 0);
    expect(range.startDate < '2025-01-01').toBe(true);
    expect(range.endDate > '2025-02-01').toBe(true);
  });

  it('neighborPages 를 늘리면 범위가 넓어진다', () => {
    const one = visibleRangeOf('2025-09-15', 'month', 0, 1);
    const two = visibleRangeOf('2025-09-15', 'month', 0, 2);
    expect(two.startDate < one.startDate).toBe(true);
    expect(two.endDate > one.endDate).toBe(true);
  });
});
