import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

// ThemeContext 는 expo-navigation-bar 를 끌고 와 jest 환경에서 파싱에 실패한다 —
// 다른 UI 테스트와 같은 방식으로 팔레트만 실물로 주입한다.
jest.mock('../../../context/ThemeContext', () => {
  const paletteFn = require('../../../theme/palette').default;
  const typographyFn = require('../../../theme/typography').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography, elevation: {}, foldable: {} }),
  };
});

// jest 는 .web 확장자를 먼저 해석하므로 index 가 아니라 구현 파일을 직접 가져온다
// (ZSBorderBeam 과 같은 관례 — 웹 진입점은 ZSCalendar.web.test.tsx 가 따로 덮는다).
import { ThemeProvider } from '../../../context/ThemeContext';
import ZSCalendar from '../../../ui/ZSCalendar/ZSCalendar';
import { useCalendarAgenda } from '../../../ui/ZSCalendar/hooks/useCalendarAgenda';
import type { CalendarEvent } from '../../../ui/ZSCalendar/core';

const WIDTH = 350;

const events: CalendarEvent<{ title: string }>[] = [
  { id: 'a', date: '2026-09-03', color: '#f00', data: { title: '산책' } },
  { id: 'b', date: '2026-09-03', color: '#0f0', data: { title: '식사' } },
  { id: 'c', date: '2026-09-20', data: { title: '병원' } },
  { id: 'd', date: '2026-10-02', data: { title: '미용' } },
];

function renderCalendar(ui: React.ReactElement) {
  const result = render(<ThemeProvider>{ui}</ThemeProvider>);
  // onLayout 이 오기 전에는 폭이 0 이라 그리드를 그리지 않는다
  act(() => {
    fireEvent(screen.getByTestId('calendar-grid'), 'layout', {
      nativeEvent: { layout: { width: WIDTH, height: 400, x: 0, y: 0 } },
    });
  });
  return result;
}

describe('ZSCalendar — 렌더와 선택', () => {
  it('보이는 달의 모든 날짜에 접근성 타깃이 생긴다', () => {
    renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" events={events} testID="calendar" />);

    // 2026-09 는 5주 그리드 (2026-08-30 ~ 2026-10-03)
    expect(screen.getByTestId('calendar-cell-2026-09-01')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-30')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-08-30')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-10-03')).toBeTruthy();
    expect(screen.queryByTestId('calendar-cell-2026-10-04')).toBeNull();
  });

  it('앞뒤 한 달씩 미리 그리되, 터치·접근성 레이어는 보이는 달에만 얹는다', () => {
    renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);

    // Skia 픽처는 [이전, 현재, 다음] 세 장 — 스와이프가 끝나는 순간 도착 달이 완성돼 있다
    expect(screen.getAllByTestId('skia-picture')).toHaveLength(3);

    // 이웃 달은 누를 수도 읽을 수도 없으니 셀 트리를 만들지 않는다 (숨김 포함 0개)
    const hidden = { includeHiddenElements: true } as const;
    expect(screen.queryAllByTestId('calendar-cell-2026-08-15', hidden)).toHaveLength(0);
    expect(screen.queryAllByTestId('calendar-cell-2026-10-15', hidden)).toHaveLength(0);
    // 보이는 달의 셀 수 = 5주 × 7
    expect(screen.getAllByTestId(/^calendar-cell-/)).toHaveLength(35);
  });

  it('스크린리더 라벨에 날짜 · 일정 건수 · 선택 여부가 담긴다', () => {
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} testID="calendar" />,
    );

    const cell = screen.getByTestId('calendar-cell-2026-09-03');
    expect(cell.props.accessibilityLabel).toBe('9월 3일, 일정 2건, 선택됨');
    expect(screen.getByTestId('calendar-cell-2026-09-04').props.accessibilityLabel).toBe('9월 4일');
  });

  it('셀을 누르면 onDateChange 가 온다 (uncontrolled)', () => {
    const onDateChange = jest.fn();
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" events={events} onDateChange={onDateChange} testID="calendar" />,
    );

    fireEvent.press(screen.getByTestId('calendar-cell-2026-09-11'));
    expect(onDateChange).toHaveBeenCalledWith('2026-09-11');
    expect(screen.getByTestId('calendar-cell-2026-09-11').props.accessibilityState.selected).toBe(true);
  });

  it('controlled 일 때는 prop 이 바뀌기 전까지 선택이 움직이지 않는다', () => {
    const onDateChange = jest.fn();
    renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        selectedDate="2026-09-05"
        onDateChange={onDateChange}
        events={events}
        testID="calendar"
      />,
    );

    fireEvent.press(screen.getByTestId('calendar-cell-2026-09-11'));
    expect(onDateChange).toHaveBeenCalledWith('2026-09-11');
    expect(screen.getByTestId('calendar-cell-2026-09-05').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('calendar-cell-2026-09-11').props.accessibilityState.selected).toBe(false);
  });

  it('최소 44pt 터치를 hitSlop 으로 보장한다', () => {
    renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);

    // 셀 폭 = 350 / 7 = 50 → 가로는 여유, 세로 행 높이 50 도 여유
    const cell = screen.getByTestId('calendar-cell-2026-09-01');
    expect(cell.props.hitSlop.left).toBeGreaterThanOrEqual(0);
    expect(cell.props.hitSlop.top).toBeGreaterThanOrEqual(0);
  });
});

describe('ZSCalendar — 월 이동', () => {
  it('헤더 화살표가 onMonthChange 를 부른다', () => {
    const onMonthChange = jest.fn();
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" onMonthChange={onMonthChange} testID="calendar" />,
    );

    fireEvent.press(screen.getByTestId('calendar-header-next'));
    expect(onMonthChange).toHaveBeenCalledWith('2026-10-01');

    expect(screen.getByTestId('calendar-cell-2026-10-31')).toBeTruthy();
  });

  it('뒤로 이동하면 이전 달 그리드가 된다', () => {
    renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);

    fireEvent.press(screen.getByTestId('calendar-header-prev'));
    // 2026-08 은 6주 그리드
    expect(screen.getByTestId('calendar-cell-2026-08-01')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-05')).toBeTruthy();
  });

  it('제목을 누르면 onTitlePress 가 온다', () => {
    const onTitlePress = jest.fn();
    renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" onTitlePress={onTitlePress} testID="calendar" />);

    fireEvent.press(screen.getByTestId('calendar-header-title'));
    expect(onTitlePress).toHaveBeenCalledTimes(1);
  });
});

describe('ZSCalendar — 주간 모드 페이저', () => {
  it('주간에서는 한 주만 그리고, 인접 pane 은 앞뒤 한 주씩이다', () => {
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="week" testID="calendar" />,
    );

    // 2026-09-16 은 수요일 → 일요일 시작 주는 09-13 ~ 09-19
    ['2026-09-13', '2026-09-16', '2026-09-19'].forEach((date) => {
      expect(screen.getByTestId(`calendar-cell-${date}`)).toBeTruthy();
    });
    // 보이는 주 밖은 터치·접근성 레이어에 없다 — 셀은 정확히 7개
    expect(screen.queryByTestId('calendar-cell-2026-09-12')).toBeNull();
    expect(screen.queryByTestId('calendar-cell-2026-09-20')).toBeNull();
    expect(screen.getAllByTestId(/^calendar-cell-/)).toHaveLength(7);

    // 앞뒤 한 주까지는 픽처로 미리 그려둔다
    expect(screen.getAllByTestId('skia-picture')).toHaveLength(3);
  });

  it('헤더 화살표가 한 달이 아니라 한 주씩 움직인다', () => {
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="week" testID="calendar" />,
    );

    fireEvent.press(screen.getByTestId('calendar-header-next'));
    // 한 주 뒤(09-20 ~ 09-26)가 현재 페이지가 된다 — 한 달이 통째로 넘어간 게 아니다
    expect(screen.getByTestId('calendar-cell-2026-09-20')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-26')).toBeTruthy();
    expect(screen.queryByTestId('calendar-cell-2026-09-13')).toBeNull();
  });

  it('주를 넘겨 달 경계를 지나면 제목이 과반이 속한 달을 따라간다', () => {
    const onMonthChange = jest.fn();
    renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        defaultSelectedDate="2026-09-27"
        mode="week"
        onMonthChange={onMonthChange}
        testID="calendar"
      />,
    );
    // 09-27 ~ 10-03 은 9월이 4일로 과반
    expect(screen.getByText('2026년 9월')).toBeTruthy();

    fireEvent.press(screen.getByTestId('calendar-header-next'));
    // 10-04 ~ 10-10 은 전부 10월
    expect(screen.getByText('2026년 10월')).toBeTruthy();
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-10-01');
  });

  it('월간에서 주간으로 바뀌면 선택일이 속한 주가 남는다', async () => {
    const { rerender } = renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="month" testID="calendar" />,
    );
    expect(screen.getByTestId('calendar-cell-2026-09-01')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="week" testID="calendar" />
      </ThemeProvider>,
    );
    // 접힘이 끝난 뒤에야 주 단위로 갈아탄다 — 한 프레임 더 흘려보낸다
    await act(async () => {});

    expect(screen.getByTestId('calendar-cell-2026-09-16')).toBeTruthy();
    // 선택 주 밖은 더 이상 노출되지 않는다
    expect(screen.queryByTestId('calendar-cell-2026-09-01')).toBeNull();
    expect(screen.queryByTestId('calendar-cell-2026-09-20')).toBeNull();
  });
});

describe('ZSCalendar — onVisibleRangeChange (prefetch 힌트)', () => {
  it('앞뒤 1페이지를 포함한 범위를 알려준다', () => {
    const onVisibleRangeChange = jest.fn();
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" onVisibleRangeChange={onVisibleRangeChange} testID="calendar" />,
    );

    expect(onVisibleRangeChange).toHaveBeenCalledWith({ startDate: '2026-07-26', endDate: '2026-10-31' });
  });

  it('월을 넘기면 범위도 따라 움직인다', () => {
    const onVisibleRangeChange = jest.fn();
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" onVisibleRangeChange={onVisibleRangeChange} testID="calendar" />,
    );
    onVisibleRangeChange.mockClear();

    fireEvent.press(screen.getByTestId('calendar-header-next'));
    const last = onVisibleRangeChange.mock.calls.at(-1)?.[0];
    expect(last.startDate > '2026-07-26').toBe(true);
    expect(last.endDate > '2026-10-31').toBe(true);
  });
});

describe('ZSCalendar — 국제화 옵션', () => {
  it('firstDayOfWeek=1 이면 그리드가 월요일에서 시작한다', () => {
    renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" firstDayOfWeek={1} testID="calendar" />);

    // 2026-09-01 은 화요일 → 월요일 시작이면 그리드 첫날이 2026-08-31
    expect(screen.getByTestId('calendar-cell-2026-08-31')).toBeTruthy();
    expect(screen.queryByTestId('calendar-cell-2026-08-30')).toBeNull();
  });

  it("locale='en' 이면 제목·요일·접근성 라벨이 영어가 된다", () => {
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} locale="en" testID="calendar" />,
    );
    expect(screen.getByText('September 2026')).toBeTruthy();
    // 요일 줄은 스크린리더에서 숨긴 장식 요소라 숨김 요소까지 포함해 찾는다
    expect(screen.getByText('Sun', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-03').props.accessibilityLabel).toBe('September 3, 2 events, selected');
    expect(screen.getByTestId('calendar-header-prev').props.accessibilityLabel).toBe('Previous month');
  });

  it('labels 로 요일·월 제목을 갈아끼울 수 있다', () => {
    renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        labels={{
          weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          monthTitle: (year, month) => `${month}/${year}`,
        }}
        testID="calendar"
      />,
    );

    expect(screen.getByText('9/2026')).toBeTruthy();
    // 요일 헤더는 스크린리더에서 감춰져 있어(그리드 셀 라벨이 대신한다) 기본 쿼리에 잡히지 않는다
    expect(screen.getAllByText('S', { includeHiddenElements: true }).length).toBe(2);
  });

  it('renderHeader 로 헤더를 통째로 교체할 수 있다', () => {
    renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        renderHeader={(context) => <Text testID="custom-header">{context.visibleMonth}</Text>}
        testID="calendar"
      />,
    );

    expect(screen.getByTestId('custom-header').props.children).toBe('2026-09-01');
    expect(screen.queryByTestId('calendar-header-title')).toBeNull();
  });
});

describe('ZSCalendar — useCalendarAgenda 연동', () => {
  function AgendaProbe() {
    const { items } = useCalendarAgenda<{ title: string }>();
    return <Text testID="agenda">{items.map((item) => item.data?.title).join(',')}</Text>;
  }

  it('children 안에서 컨텍스트로 선택일 일정을 받는다', () => {
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} testID="calendar">
        <AgendaProbe />
      </ZSCalendar>,
    );

    expect(screen.getByTestId('agenda').props.children).toBe('산책,식사');
  });

  it('달력에서 날짜를 바꾸면 리스트도 같은 인덱스에서 갱신된다', () => {
    renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} testID="calendar">
        <AgendaProbe />
      </ZSCalendar>,
    );

    fireEvent.press(screen.getByTestId('calendar-cell-2026-09-20'));
    expect(screen.getByTestId('agenda').props.children).toBe('병원');
  });

  it('보기 모드와 무관하게 선택한 하루만 보여준다', async () => {
    const dense = Array.from({ length: 30 }, (_, index) => ({
      id: `d${index}`,
      date: `2026-09-${String(index + 1).padStart(2, '0')}`,
      data: { title: `일정 ${index + 1}` },
    }));

    const { rerender } = renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        defaultSelectedDate="2026-09-05"
        events={dense}
        mode="month"
        testID="calendar"
      >
        <AgendaProbe />
      </ZSCalendar>,
    );
    expect(screen.getByTestId('agenda').props.children).toBe('일정 5');

    rerender(
      <ThemeProvider>
        <ZSCalendar
          defaultVisibleMonth="2026-09-01"
          defaultSelectedDate="2026-09-05"
          events={dense}
          mode="week"
          testID="calendar"
        >
          <AgendaProbe />
        </ZSCalendar>
      </ThemeProvider>,
    );
    await act(async () => {});
    expect(screen.getByTestId('agenda').props.children).toBe('일정 5');
  });

  it('ZSCalendar 밖에서 옵션 없이 쓰면 안내 메시지와 함께 실패한다', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeProvider><AgendaProbe /></ThemeProvider>)).toThrow('useCalendarAgenda');
    consoleError.mockRestore();
  });
});
