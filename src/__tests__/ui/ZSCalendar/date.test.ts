import {
  addDays,
  addMonths,
  buildMonthMatrix,
  buildWeek,
  compareDate,
  dayOfWeek,
  daysInMonth,
  diffDays,
  endOfMonth,
  endOfWeek,
  fromEpochDay,
  isLeapYear,
  isSameMonth,
  isValidDateString,
  monthOfWeek,
  monthsBetween,
  parseDate,
  rotateWeekdays,
  startOfMonth,
  startOfWeek,
  toDateString,
  toEpochDay,
  todayDateString,
  weekRowOfMonth,
  weeksBetween,
  weeksInMonth,
} from '../../../ui/ZSCalendar/core/date';

describe('ZSCalendar core/date — 윤년·말일', () => {
  it.each([
    [2024, true],
    [2023, false],
    [2000, true],
    [1900, false],
    [2100, false],
  ])('isLeapYear(%i) === %s', (year, expected) => {
    expect(isLeapYear(year)).toBe(expected);
  });

  it('2월 길이가 윤년에 따라 달라진다', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(1900, 2)).toBe(28);
  });

  it('모든 달의 길이가 실제 달력과 일치한다', () => {
    const expected = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    expected.forEach((length, index) => expect(daysInMonth(2025, index + 1)).toBe(length));
  });
});

describe('ZSCalendar core/date — epochDay 왕복', () => {
  it('알려진 기준점이 맞는다', () => {
    expect(toEpochDay({ y: 1970, m: 1, d: 1 })).toBe(0);
    expect(toEpochDay({ y: 1969, m: 12, d: 31 })).toBe(-1);
    expect(toEpochDay({ y: 2000, m: 3, d: 1 })).toBe(11017);
  });

  it('1900~2100 전 구간에서 왕복이 무손실이다', () => {
    for (let epochDay = toEpochDay({ y: 1900, m: 1, d: 1 }); epochDay <= toEpochDay({ y: 2100, m: 12, d: 31 }); epochDay += 1) {
      expect(toEpochDay(fromEpochDay(epochDay))).toBe(epochDay);
    }
  });

  it('UTC Date 와 같은 결과를 낸다', () => {
    const samples = ['1999-12-31', '2000-01-01', '2024-02-29', '2025-09-01', '2100-03-01'];
    samples.forEach((date) => {
      const utcDays = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))) / 86_400_000;
      expect(toEpochDay(parseDate(date))).toBe(utcDays);
    });
  });
});

describe('ZSCalendar core/date — 문자열 파싱·검증', () => {
  it.each([
    ['2025-09-01', true],
    ['2024-02-29', true],
    ['2023-02-29', false],
    ['2025-13-01', false],
    ['2025-00-10', false],
    ['2025-04-31', false],
    ['2025-9-01', false],
    ['20250901', false],
    ['', false],
  ])('isValidDateString(%s) === %s', (value, expected) => {
    expect(isValidDateString(value)).toBe(expected);
  });

  it('문자열이 아닌 값도 안전하게 거른다', () => {
    [null, undefined, 20250901, {}, []].forEach((value) => expect(isValidDateString(value)).toBe(false));
  });

  it('toDateString 은 0 패딩을 유지한다', () => {
    expect(toDateString({ y: 2025, m: 9, d: 1 })).toBe('2025-09-01');
    expect(toDateString({ y: 999, m: 12, d: 31 })).toBe('0999-12-31');
  });

  it('parseDate 는 형식이 어긋나면 예외를 던진다', () => {
    expect(() => parseDate('2025/09/01')).toThrow('[ZSCalendar]');
  });

  it('todayDateString 은 로컬 타임존 기준이다', () => {
    // 로컬 자정 직후 — UTC 로 환산하면 전날이 될 수 있는 시각
    const localMidnight = new Date(2025, 8, 1, 0, 30, 0);
    expect(todayDateString(localMidnight)).toBe('2025-09-01');
  });
});

describe('ZSCalendar core/date — 요일과 DST 안전성', () => {
  it.each([
    ['1970-01-01', 4],
    ['2025-09-01', 1],
    ['2024-02-29', 4],
    ['2000-01-01', 6],
  ])('dayOfWeek(%s) === %i', (date, expected) => {
    expect(dayOfWeek(date)).toBe(expected);
  });

  it('DST 전환일을 넘어도 하루가 밀리지 않는다 (미국 봄 전환)', () => {
    expect(addDays('2025-03-08', 1)).toBe('2025-03-09');
    expect(addDays('2025-03-09', 1)).toBe('2025-03-10');
    expect(diffDays('2025-03-08', '2025-03-10')).toBe(2);
  });

  it('DST 가을 전환일에도 하루가 겹치지 않는다', () => {
    expect(addDays('2025-11-02', 1)).toBe('2025-11-03');
    expect(diffDays('2025-11-01', '2025-11-03')).toBe(2);
  });

  it('연·월 경계를 넘는 addDays', () => {
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    expect(addDays('2025-01-01', -1)).toBe('2024-12-31');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2023-02-28', 1)).toBe('2023-03-01');
  });
});

describe('ZSCalendar core/date — 월 이동', () => {
  it('말일이 없는 달로 이동하면 클램프된다', () => {
    expect(addMonths('2025-01-31', 1)).toBe('2025-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMonths('2025-03-31', -1)).toBe('2025-02-28');
  });

  it('연 경계를 넘는다', () => {
    expect(addMonths('2025-12-01', 1)).toBe('2026-01-01');
    expect(addMonths('2025-01-01', -1)).toBe('2024-12-01');
    expect(addMonths('2025-01-01', -13)).toBe('2023-12-01');
  });

  it('startOfMonth / endOfMonth', () => {
    expect(startOfMonth('2025-09-17')).toBe('2025-09-01');
    expect(endOfMonth('2025-09-17')).toBe('2025-09-30');
    expect(endOfMonth('2024-02-10')).toBe('2024-02-29');
  });
});

describe('ZSCalendar core/date — 주 계산', () => {
  it('일요일 시작 기준 startOfWeek', () => {
    expect(startOfWeek('2025-09-01', 0)).toBe('2025-08-31');
    expect(startOfWeek('2025-08-31', 0)).toBe('2025-08-31');
    expect(endOfWeek('2025-09-01', 0)).toBe('2025-09-06');
  });

  it('월요일 시작 기준 startOfWeek', () => {
    expect(startOfWeek('2025-09-01', 1)).toBe('2025-09-01');
    expect(startOfWeek('2025-08-31', 1)).toBe('2025-08-25');
    expect(endOfWeek('2025-09-07', 1)).toBe('2025-09-07');
  });

  it('buildWeek 은 항상 firstDayOfWeek 부터 7칸', () => {
    expect(buildWeek('2025-09-03', 0)).toEqual([
      '2025-08-31', '2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06',
    ]);
    expect(buildWeek('2025-09-03', 1)[0]).toBe('2025-09-01');
  });
});

describe('ZSCalendar core/date — 월 그리드 주 수 (4·5·6주 경계)', () => {
  it('6주가 필요한 달', () => {
    // 2025-08-01 은 금요일 → 일요일 시작 시 앞 5칸 + 31일 = 6주
    expect(weeksInMonth('2025-08-01', 0)).toBe(6);
  });

  it('5주가 일반적인 달', () => {
    expect(weeksInMonth('2025-09-01', 0)).toBe(5);
  });

  it('평년 2월이 일요일에 시작하면 4주', () => {
    // 2026-02-01 은 일요일, 28일 → 정확히 4주
    expect(weeksInMonth('2026-02-01', 0)).toBe(4);
    // 월요일 시작 기준으로는 같은 달이 5주가 된다
    expect(weeksInMonth('2026-02-01', 1)).toBe(5);
  });

  it('1900~2100 모든 달의 주 수는 4~6 범위다', () => {
    for (let year = 1900; year <= 2100; year += 1) {
      for (let month = 1; month <= 12; month += 1) {
        const anchor = toDateString({ y: year, m: month, d: 1 });
        [0, 1].forEach((first) => {
          const weeks = weeksInMonth(anchor, first as 0 | 1);
          expect(weeks).toBeGreaterThanOrEqual(4);
          expect(weeks).toBeLessThanOrEqual(6);
        });
      }
    }
  });
});

describe('ZSCalendar core/date — buildMonthMatrix', () => {
  it('행 × 7 이 빈틈 없이 연속한다', () => {
    const matrix = buildMonthMatrix('2025-09-01', 0);
    expect(matrix).toHaveLength(5);
    matrix.forEach((row) => expect(row).toHaveLength(7));
    expect(matrix[0][0]).toBe('2025-08-31');
    expect(matrix[4][6]).toBe('2025-10-04');

    const flat = matrix.flat();
    flat.forEach((date, index) => {
      if (index === 0) return;
      expect(diffDays(flat[index - 1], date)).toBe(1);
    });
  });

  it('첫 칸은 항상 firstDayOfWeek 요일이다', () => {
    [0, 1].forEach((first) => {
      for (let month = 1; month <= 12; month += 1) {
        const matrix = buildMonthMatrix(toDateString({ y: 2025, m: month, d: 1 }), first as 0 | 1);
        expect(dayOfWeek(matrix[0][0])).toBe(first);
      }
    });
  });

  it('해당 월의 모든 날짜를 포함한다', () => {
    const matrix = buildMonthMatrix('2024-02-15', 1);
    const flat = matrix.flat();
    for (let day = 1; day <= 29; day += 1) {
      expect(flat).toContain(toDateString({ y: 2024, m: 2, d: day }));
    }
  });
});

describe('ZSCalendar core/date — weekRowOfMonth (주↔월 anchor)', () => {
  it('선택일이 속한 행을 찾는다', () => {
    expect(weekRowOfMonth('2025-09-01', '2025-09-01', 0)).toBe(0);
    expect(weekRowOfMonth('2025-09-10', '2025-09-01', 0)).toBe(1);
    expect(weekRowOfMonth('2025-09-30', '2025-09-01', 0)).toBe(4);
  });

  it('그리드에 걸친 인접 달 날짜도 행을 갖는다', () => {
    expect(weekRowOfMonth('2025-08-31', '2025-09-01', 0)).toBe(0);
    expect(weekRowOfMonth('2025-10-04', '2025-09-01', 0)).toBe(4);
  });

  it('그리드 밖이면 -1', () => {
    expect(weekRowOfMonth('2025-08-30', '2025-09-01', 0)).toBe(-1);
    expect(weekRowOfMonth('2025-10-05', '2025-09-01', 0)).toBe(-1);
  });
});

describe('ZSCalendar core/date — 비교 유틸', () => {
  it('compareDate 는 문자열 순서를 그대로 쓴다', () => {
    expect(compareDate('2025-09-01', '2025-09-02')).toBe(-1);
    expect(compareDate('2025-09-02', '2025-09-01')).toBe(1);
    expect(compareDate('2025-09-01', '2025-09-01')).toBe(0);
  });

  it('isSameMonth', () => {
    expect(isSameMonth('2025-09-01', '2025-09-30')).toBe(true);
    expect(isSameMonth('2025-09-30', '2025-10-01')).toBe(false);
  });

  it('rotateWeekdays 는 월요일 시작 라벨을 만든다', () => {
    const labels = ['일', '월', '화', '수', '목', '금', '토'];
    expect(rotateWeekdays(labels, 0)).toEqual(labels);
    expect(rotateWeekdays(labels, 1)).toEqual(['월', '화', '수', '목', '금', '토', '일']);
  });
});

describe('ZSCalendar core/date — monthsBetween (페이지 번호 변환)', () => {
  it('같은 해 안에서', () => {
    expect(monthsBetween('2026-09-01', '2026-12-01')).toBe(3);
    expect(monthsBetween('2026-12-01', '2026-09-01')).toBe(-3);
    expect(monthsBetween('2026-09-01', '2026-09-30')).toBe(0);
  });

  it('연 경계를 넘어서', () => {
    expect(monthsBetween('2025-11-01', '2026-02-01')).toBe(3);
    expect(monthsBetween('2026-02-01', '2024-02-01')).toBe(-24);
  });

  it('addMonths 와 왕복한다', () => {
    for (let delta = -30; delta <= 30; delta += 1) {
      expect(monthsBetween('2026-09-01', addMonths('2026-09-01', delta))).toBe(delta);
    }
  });
});

describe('ZSCalendar core/date — 주 단위 페이지 변환', () => {
  it('weeksBetween 은 주 시작일끼리 정수를 준다', () => {
    expect(weeksBetween('2026-08-30', '2026-09-06')).toBe(1);
    expect(weeksBetween('2026-09-06', '2026-08-30')).toBe(-1);
    expect(weeksBetween('2026-08-30', '2026-08-30')).toBe(0);
  });

  it('연 경계를 넘어도 addDays 와 왕복한다', () => {
    const base = startOfWeek('2026-01-01', 0);
    for (let delta = -60; delta <= 60; delta += 1) {
      expect(weeksBetween(base, addDays(base, delta * 7))).toBe(delta);
    }
  });

  it('monthOfWeek 은 그 주의 과반이 속한 달을 고른다', () => {
    // 2026-08-30(일)~09-05: 8월 2일 + 9월 5일 → 9월
    expect(monthOfWeek('2026-08-30')).toBe('2026-09-01');
    // 2026-09-27(일)~10-03: 9월 4일 + 10월 3일 → 9월
    expect(monthOfWeek('2026-09-27')).toBe('2026-09-01');
    // 2026-10-04(일)~10-10: 전부 10월
    expect(monthOfWeek('2026-10-04')).toBe('2026-10-01');
    expect(monthOfWeek('2026-09-06')).toBe('2026-09-01');
  });

  it('monthOfWeek 은 그 주를 품은 달 그리드에 항상 존재하는 행을 가리킨다', () => {
    let week = startOfWeek('2026-01-01', 0);
    for (let index = 0; index < 120; index += 1) {
      const month = monthOfWeek(week);
      expect(weekRowOfMonth(week, month, 0)).toBeGreaterThanOrEqual(0);
      week = addDays(week, 7);
    }
  });
});
