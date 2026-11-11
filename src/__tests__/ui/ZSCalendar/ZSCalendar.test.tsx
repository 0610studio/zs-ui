import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { ThemeProvider } from '../../../context/ThemeContext';
import ZSCalendar from '../../../ui/ZSCalendar/ZSCalendar';
import { useCalendarAgenda } from '../../../ui/ZSCalendar/hooks/useCalendarAgenda';
import { CALENDAR_LOCALES, type CalendarEvent } from '../../../ui/ZSCalendar/core';
import { CHEVRON_PATHS } from '../../../assets/SvgChevron';
import { ICON_STROKE_WIDTH } from '../../../assets/iconStroke';
import { withOpacity } from '../../../theme/color';
import { springConfig } from '../../../theme/motion';
import { SPACE } from '../../../theme/spacing';
import { OPACITY } from '../../../theme/state';
import { getTestTheme } from '../../utils/theme';
import { queryAllByHostProps } from '../../utils/hostQueries';

jest.mock('../../../context/ThemeContext', () => require('../../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const WIDTH = 350;

const events: CalendarEvent<{ title: string }>[] = [
  { id: 'a', date: '2026-09-03', color: '#f00', data: { title: '산책' } },
  { id: 'b', date: '2026-09-03', color: '#0f0', data: { title: '식사' } },
  { id: 'c', date: '2026-09-20', data: { title: '병원' } },
  { id: 'd', date: '2026-10-02', data: { title: '미용' } },
];

async function renderCalendar(ui: React.ReactElement) {
  const result = await render(<ThemeProvider>{ui}</ThemeProvider>);
  await fireEvent(screen.getByTestId('calendar-grid'), 'layout', {
    nativeEvent: { layout: { width: WIDTH, height: 400, x: 0, y: 0 } },
  });
  return result;
}

describe('ZSCalendar — 렌더와 선택', () => {
  it('보이는 달의 모든 날짜에 접근성 타깃이 생긴다', async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" events={events} testID="calendar" />);

    expect(screen.getByTestId('calendar-cell-2026-09-01')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-30')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-08-30')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-10-03')).toBeTruthy();
    expect(screen.queryByTestId('calendar-cell-2026-10-04')).toBeNull();
  });

  it('앞뒤 한 달씩 미리 그리되, 터치·접근성 레이어는 보이는 달에만 얹는다', async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);

    expect(screen.getAllByTestId('skia-picture')).toHaveLength(3);

    const hidden = { includeHiddenElements: true } as const;
    expect(screen.queryAllByTestId('calendar-cell-2026-08-15', hidden)).toHaveLength(0);
    expect(screen.queryAllByTestId('calendar-cell-2026-10-15', hidden)).toHaveLength(0);
    expect(screen.getAllByTestId(/^calendar-cell-/)).toHaveLength(35);
  });

  it('스크린리더 라벨에 날짜 · 일정 건수 · 선택 여부가 담긴다', async () => {
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} testID="calendar" />,
    );

    const cell = screen.getByTestId('calendar-cell-2026-09-03');
    expect(cell.props.accessibilityLabel).toBe('9월 3일, 일정 2건, 선택됨');
    expect(screen.getByTestId('calendar-cell-2026-09-04').props.accessibilityLabel).toBe('9월 4일');
  });

  it('셀을 누르면 onDateChange 가 온다 (uncontrolled)', async () => {
    const onDateChange = jest.fn();
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" events={events} onDateChange={onDateChange} testID="calendar" />,
    );

    await fireEvent.press(screen.getByTestId('calendar-cell-2026-09-11'));
    expect(onDateChange).toHaveBeenCalledWith('2026-09-11');
    expect(screen.getByTestId('calendar-cell-2026-09-11').props.accessibilityState.selected).toBe(true);
  });

  it('controlled 일 때는 prop 이 바뀌기 전까지 선택이 움직이지 않는다', async () => {
    const onDateChange = jest.fn();
    await renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        selectedDate="2026-09-05"
        onDateChange={onDateChange}
        events={events}
        testID="calendar"
      />,
    );

    await fireEvent.press(screen.getByTestId('calendar-cell-2026-09-11'));
    expect(onDateChange).toHaveBeenCalledWith('2026-09-11');
    expect(screen.getByTestId('calendar-cell-2026-09-05').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('calendar-cell-2026-09-11').props.accessibilityState.selected).toBe(false);
  });

  it.each(['ios', 'android'] as const)('%s: 칸이 44pt 보다 작을 때만 hitSlop 으로 44 를 채운다', async (os) => {
    platform.OS = os;
    try {
      await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
      const cell = screen.getByTestId('calendar-cell-2026-09-01');
      const { width, height } = StyleSheet.flatten(cell.props.style);
      const { top, bottom, left, right } = cell.props.hitSlop;
      expect(height + top + bottom).toBeGreaterThanOrEqual(44);
      expect(width + left + right).toBeGreaterThanOrEqual(44);
      expect(Math.min(top, left)).toBeGreaterThanOrEqual(0);
      if (height >= 44) expect(top).toBe(0);
      if (width >= 44) expect(left).toBe(0);
    } finally {
      platform.OS = 'ios';
    }
  });
});

describe('ZSCalendar — 기본 헤더(벡터 화살표·누름 표시·터치 영역)', () => {
  const { colors } = getTestTheme();
  const prev = () => screen.getByTestId('calendar-header-prev');
  const highlight = () => queryAllByHostProps({ pointerEvents: 'none' }, prev());
  afterEach(() => {
    platform.OS = 'ios';
    jest.restoreAllMocks();
  });

  it('화살표는 글자 ‹ › 대신 24 격자 벡터 셰브런이다 — 누르는 글리프라 먹(text), 아이콘 획 규칙(24 → 1.8)', async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
    expect(screen.queryByText('‹')).toBeNull();
    expect(screen.queryByText('›')).toBeNull();
    const left = queryAllByHostProps({ d: CHEVRON_PATHS.left }, prev());
    const right = queryAllByHostProps({ d: CHEVRON_PATHS.right }, screen.getByTestId('calendar-header-next'));
    expect(left).toHaveLength(1);
    expect(right).toHaveLength(1);
    [left[0], right[0]].forEach((path) => {
      expect(path?.props).toMatchObject({ stroke: colors.text, strokeWidth: ICON_STROKE_WIDTH, strokeLinecap: 'round' });
    });
    expect(queryAllByHostProps({ viewBox: '0 0 24 24', width: 24 }, prev())).toHaveLength(1);
  });

  it('iOS: 화살표 버튼은 44pt 원 — 보이는 크기가 곧 최소 터치 영역이고 주변 12 를 더 받는다', async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
    expect(StyleSheet.flatten(prev().props.style)).toMatchObject({ width: 44, height: 44, borderRadius: 9999, overflow: 'hidden' });
    expect(prev().props.hitSlop).toBe(SPACE.md);
    expect(prev().props.accessibilityRole).toBe('button');
  });

  it('Android: 화살표 버튼은 48dp 원에 원형 ripple(text 10%)', async () => {
    platform.OS = 'android';
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
    expect(StyleSheet.flatten(prev().props.style)).toMatchObject({ width: 48, height: 48, borderRadius: 9999, overflow: 'hidden' });
    expect(prev().props.android_ripple).toEqual({ color: withOpacity(colors.text, OPACITY.pressed), foreground: true });
    expect(highlight()).toHaveLength(0);
  });

  it('iOS: 누르는 즉시 하이라이트(text 10%)가 켜지고, 손을 떼면 ZSPressable 과 같은 fade spring(fast)으로 사라진다', async () => {
    const timing = jest.spyOn(Reanimated, 'withSpring');
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
    expect(prev().props.android_ripple).toBeUndefined();
    expect(highlight()).toHaveLength(1);
    const overlay = () => StyleSheet.flatten(highlight()[0]?.props.style);
    expect(overlay()).toMatchObject({ backgroundColor: withOpacity(colors.text, OPACITY.pressed), opacity: 0 });

    const ui = () => (
      <ThemeProvider>
        <ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />
      </ThemeProvider>
    );
    const fadeOut = () => timing.mock.calls.filter(([value]) => value === 0);
    await fireEvent(prev(), 'pressIn');
    await screen.rerender(ui());
    expect(overlay().opacity).toBe(1);
    expect(fadeOut()).toHaveLength(0);

    await fireEvent(prev(), 'pressOut');
    expect(fadeOut()).toEqual([[0, springConfig('fade', 'fast')]]);
    await screen.rerender(ui());
    expect(overlay().opacity).toBe(0);
  });

  it('연타해도 누름을 버리지 않는다 — 두 번 누르면 두 달 넘어간다(디바운스 없음)', async () => {
    const onMonthChange = jest.fn();
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" onMonthChange={onMonthChange} testID="calendar" />);
    await fireEvent.press(screen.getByTestId('calendar-header-next'));
    await fireEvent.press(screen.getByTestId('calendar-header-next'));
    expect(onMonthChange).toHaveBeenNthCalledWith(1, '2026-10-01');
    expect(onMonthChange).toHaveBeenNthCalledWith(2, '2026-11-01');
  });

  it('제목: onTitlePress 가 없으면 누름 없는 머리말, 있으면 같은 누름 표시의 알약 버튼(최소 높이 44)', async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
    const header = screen.getByTestId('calendar-header-title');
    expect(header.type).toBe('View');
    expect(header.props).toMatchObject({ accessible: true, accessibilityRole: 'header', accessibilityLabel: '2026년 9월' });
    expect(header.props.onPress).toBeUndefined();

    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" onTitlePress={jest.fn()} testID="calendar" />);
    const button = screen.getByTestId('calendar-header-title');
    expect(button.props.accessibilityRole).toBe('button');
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ minHeight: 44, paddingHorizontal: SPACE.md, borderRadius: 9999 });
    expect(within(button).getByText('2026년 9월')).toBeTruthy();
  });
});

describe('ZSCalendar — eventDisplay', () => {
  const { DEFAULT_WEEKDAY_HEADER_HEIGHT } = require('../../../ui/ZSCalendar/core/layout');
  const cellHeight = (date: string) => {
    const flat = Object.assign({}, ...[screen.getByTestId(`calendar-cell-${date}`).props.style].flat());
    return flat.height as number;
  };

  it("'label' 은 그리드가 남는 높이를 채우고 보이는 달의 주 수로 행을 나눈다", async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" events={events} eventDisplay="label" testID="calendar" />);
    const grid = screen.getByTestId('calendar-grid');
    expect(Object.assign({}, ...[grid.props.style].flat())).toMatchObject({ flexGrow: 1, flexShrink: 1 });

    await fireEvent(grid, 'layout', { nativeEvent: { layout: { width: WIDTH, height: 640, x: 0, y: 0 } } });
    const { SELECTED_CARD_SHADOW_BLEED } = require('../../../ui/ZSCalendar/skia/drawGrid');
    expect(SELECTED_CARD_SHADOW_BLEED).toBeGreaterThan(0);
    expect(cellHeight('2026-09-15')).toBe(Math.floor((640 - DEFAULT_WEEKDAY_HEADER_HEIGHT - SELECTED_CARD_SHADOW_BLEED) / 5));
  });

  it("'label' + 전환 없는 주간 고정이면 한 주가 높이를 다 채운다 (테이블탑 위 pane)", async () => {
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-15" events={events} eventDisplay="label" mode="week" enableModeTransition={false} testID="calendar" />,
    );
    await fireEvent(screen.getByTestId('calendar-grid'), 'layout', { nativeEvent: { layout: { width: WIDTH, height: 200, x: 0, y: 0 } } });
    const { SELECTED_CARD_SHADOW_BLEED } = require('../../../ui/ZSCalendar/skia/drawGrid');
    expect(cellHeight('2026-09-15')).toBe(200 - DEFAULT_WEEKDAY_HEADER_HEIGHT - SELECTED_CARD_SHADOW_BLEED);
  });

  it("'dot' 은 달을 넘겨도 그리드 metrics 가 그대로다 — 픽처 캐시를 버리지 않는다", async () => {
    const layoutModule = require('../../../ui/ZSCalendar/core/layout');
    const spy = jest.spyOn(layoutModule, 'computeGridLayout');
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" events={events} testID="calendar" />);
    const before = spy.mock.calls.length;
    expect(before).toBeGreaterThan(0);
    await fireEvent.press(screen.getByLabelText('이전 달'));
    expect(spy.mock.calls.length).toBe(before);
    spy.mockRestore();
  });

  it("기본 'dot' 은 높이와 무관한 행 높이다", async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" events={events} testID="calendar" />);
    const before = cellHeight('2026-09-15');
    await fireEvent(screen.getByTestId('calendar-grid'), 'layout', { nativeEvent: { layout: { width: WIDTH, height: 900, x: 0, y: 0 } } });
    expect(cellHeight('2026-09-15')).toBe(before);
  });
});

describe('ZSCalendar — 월 이동', () => {
  it('헤더 화살표가 onMonthChange 를 부른다', async () => {
    const onMonthChange = jest.fn();
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" onMonthChange={onMonthChange} testID="calendar" />,
    );

    await fireEvent.press(screen.getByTestId('calendar-header-next'));
    expect(onMonthChange).toHaveBeenCalledWith('2026-10-01');

    expect(screen.getByTestId('calendar-cell-2026-10-31')).toBeTruthy();
  });

  it('뒤로 이동하면 이전 달 그리드가 된다', async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);

    await fireEvent.press(screen.getByTestId('calendar-header-prev'));
    expect(screen.getByTestId('calendar-cell-2026-08-01')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-05')).toBeTruthy();
  });

  it('제목을 누르면 onTitlePress 가 온다', async () => {
    const onTitlePress = jest.fn();
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" onTitlePress={onTitlePress} testID="calendar" />);

    await fireEvent.press(screen.getByTestId('calendar-header-title'));
    expect(onTitlePress).toHaveBeenCalledTimes(1);
  });
});

describe('ZSCalendar — 넓은 창의 기본 헤더', () => {
  const WIDE = 800;

  async function renderWide(ui: React.ReactElement) {
    await render(<ThemeProvider>{ui}</ThemeProvider>);
    await fireEvent(screen.getByTestId('calendar-grid'), 'layout', {
      nativeEvent: { layout: { width: WIDE, height: 400, x: 0, y: 0 } },
    });
  }

  const gridWidth = (): number => StyleSheet.flatten(screen.getByTestId('calendar-cell-2026-09-01').props.style).width * 7;
  const headerStyle = () => StyleSheet.flatten(screen.getByTestId('calendar-header').props.style);

  it('기본은 그리드와 기본 헤더가 부모 폭을 채운다 — 화면 여백 안에서 꽉 찬다', async () => {
    await renderWide(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);

    expect(gridWidth()).toBeCloseTo(WIDE);
    expect(headerStyle().maxWidth).toBeUndefined();
  });

  it('maxContentWidth 를 주면 기본 헤더가 그리드와 같은 폭의 가운데 열에 선다 — 화살표가 그리드 끝에 맞는다', async () => {
    await renderWide(<ZSCalendar defaultVisibleMonth="2026-09-01" maxContentWidth={400} testID="calendar" />);

    expect(gridWidth()).toBeCloseTo(400);
    expect(headerStyle()).toMatchObject({ width: '100%', maxWidth: 400, alignSelf: 'center' });
  });

  it('maxContentWidth={false} 면 그리드와 함께 헤더도 전폭이다', async () => {
    await renderWide(<ZSCalendar defaultVisibleMonth="2026-09-01" maxContentWidth={false} testID="calendar" />);

    expect(gridWidth()).toBeCloseTo(WIDE);
    expect(headerStyle().maxWidth).toBeUndefined();
  });

  it('renderHeader 헤더는 감싸지 않아 폭을 앱이 정한다', async () => {
    await renderWide(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        renderHeader={() => <View testID="custom-header" />}
        testID="calendar"
      />,
    );

    expect(screen.queryByTestId('calendar-header')).toBeNull();
    expect(screen.getByTestId('custom-header').parent?.props.testID).toBe('calendar');
  });
});

describe('ZSCalendar — 주간 모드 페이저', () => {
  it('주간에서는 한 주만 그리고, 인접 pane 은 앞뒤 한 주씩이다', async () => {
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="week" testID="calendar" />,
    );

    ['2026-09-13', '2026-09-16', '2026-09-19'].forEach((date) => {
      expect(screen.getByTestId(`calendar-cell-${date}`)).toBeTruthy();
    });
    expect(screen.queryByTestId('calendar-cell-2026-09-12')).toBeNull();
    expect(screen.queryByTestId('calendar-cell-2026-09-20')).toBeNull();
    expect(screen.getAllByTestId(/^calendar-cell-/)).toHaveLength(7);

    expect(screen.getAllByTestId('skia-picture')).toHaveLength(3);
  });

  it('controlled mode="week" 는 전환 반응 없이도 첫 렌더부터 주 단위로 그린다', async () => {
    const reanimated = require('react-native-reanimated');
    const spy = jest.spyOn(reanimated, 'useAnimatedReaction').mockImplementation(() => {});
    try {
      await renderCalendar(
        <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="week" testID="calendar" />,
      );
      expect(screen.getAllByTestId(/^calendar-cell-/)).toHaveLength(7);
      expect(screen.getByTestId('calendar-cell-2026-09-13')).toBeTruthy();
      expect(screen.getByTestId('calendar-cell-2026-09-19')).toBeTruthy();
    } finally {
      spy.mockRestore();
    }
  });

  it('헤더 화살표가 한 달이 아니라 한 주씩 움직인다', async () => {
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="week" testID="calendar" />,
    );

    await fireEvent.press(screen.getByTestId('calendar-header-next'));
    expect(screen.getByTestId('calendar-cell-2026-09-20')).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-26')).toBeTruthy();
    expect(screen.queryByTestId('calendar-cell-2026-09-13')).toBeNull();
  });

  it('주를 넘겨 달 경계를 지나면 제목이 과반이 속한 달을 따라간다', async () => {
    const onMonthChange = jest.fn();
    await renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        defaultSelectedDate="2026-09-27"
        mode="week"
        onMonthChange={onMonthChange}
        testID="calendar"
      />,
    );
    expect(screen.getByText('2026년 9월')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('calendar-header-next'));
    expect(screen.getByText('2026년 10월')).toBeTruthy();
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-10-01');
  });

  it('월간에서 주간으로 바뀌면 선택일이 속한 주가 남는다', async () => {
    const { rerender } = await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="month" testID="calendar" />,
    );
    expect(screen.getByTestId('calendar-cell-2026-09-01')).toBeTruthy();

    await rerender(
      <ThemeProvider>
        <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-16" mode="week" testID="calendar" />
      </ThemeProvider>,
    );
    await act(async () => {});

    expect(screen.getByTestId('calendar-cell-2026-09-16')).toBeTruthy();
    expect(screen.queryByTestId('calendar-cell-2026-09-01')).toBeNull();
    expect(screen.queryByTestId('calendar-cell-2026-09-20')).toBeNull();
  });

  describe('경계 주로 접혀도 보고 있던 달을 유지한다', () => {
    const scene = (mode: 'month' | 'week', props: Record<string, unknown>) => (
      <ZSCalendar mode={mode} testID="calendar" {...props} />
    );
    const title = () => screen.getByTestId('calendar-header-title').props.accessibilityLabel;
    const settle = async () => {
      await act(async () => {});
      await act(async () => {});
    };

    it('선택일이 다른 달이면 첫 주를 남기고, 선택은 그대로 둔다', async () => {
      const onMonthChange = jest.fn();
      const props = { defaultVisibleMonth: '2025-06-01', defaultSelectedDate: '2025-06-03', onMonthChange };
      const { rerender } = await renderCalendar(scene('month', props));
      const show = (mode: 'month' | 'week') => rerender(<ThemeProvider>{scene(mode, props)}</ThemeProvider>);

      await fireEvent.press(screen.getByTestId('calendar-header-prev'));
      await settle();
      expect(title()).toBe('2025년 5월');

      await show('week');
      await settle();

      expect(title()).toBe('2025년 5월');
      expect(onMonthChange).toHaveBeenLastCalledWith('2025-05-01');
      expect(screen.getByTestId('calendar-cell-2025-04-27')).toBeTruthy();
      expect(screen.getByTestId('calendar-cell-2025-05-03')).toBeTruthy();
      expect(screen.queryByTestId('calendar-cell-2025-05-04')).toBeNull();

      await show('month');
      await settle();
      expect(title()).toBe('2025년 5월');

      await fireEvent.press(screen.getByTestId('calendar-header-next'));
      await settle();
      expect(title()).toBe('2025년 6월');
      expect(screen.getByTestId('calendar-cell-2025-06-03').props.accessibilityState.selected).toBe(true);
    });

    it('선택일이 이 달의 첫 행에 있어도 달이 밀리지 않는다', async () => {
      const onMonthChange = jest.fn();
      const props = { defaultVisibleMonth: '2025-05-01', defaultSelectedDate: '2025-05-02', onMonthChange };
      const { rerender } = await renderCalendar(scene('month', props));
      expect(title()).toBe('2025년 5월');

      await rerender(<ThemeProvider>{scene('week', props)}</ThemeProvider>);
      await settle();

      expect(title()).toBe('2025년 5월');
      expect(onMonthChange).not.toHaveBeenCalled();
      expect(screen.getByTestId('calendar-cell-2025-05-02').props.accessibilityState.selected).toBe(true);
    });

    it('주간에서 그 달 그리드를 벗어나면 그때 달이 넘어간다', async () => {
      await renderCalendar(scene('week', { defaultVisibleMonth: '2025-05-01', defaultSelectedDate: '2025-05-02' }));
      await settle();

      expect(screen.getByTestId('calendar-cell-2025-04-27')).toBeTruthy();
      expect(title()).toBe('2025년 5월');

      await fireEvent.press(screen.getByTestId('calendar-header-prev'));
      await settle();
      expect(screen.getByTestId('calendar-cell-2025-04-20')).toBeTruthy();
      expect(title()).toBe('2025년 4월');
    });
  });
});

describe('ZSCalendar — onVisibleRangeChange (prefetch 힌트)', () => {
  it('앞뒤 1페이지를 포함한 범위를 알려준다', async () => {
    const onVisibleRangeChange = jest.fn();
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" onVisibleRangeChange={onVisibleRangeChange} testID="calendar" />,
    );

    expect(onVisibleRangeChange).toHaveBeenCalledWith({ startDate: '2026-07-26', endDate: '2026-10-31' });
  });

  it('월을 넘기면 범위도 따라 움직인다', async () => {
    const onVisibleRangeChange = jest.fn();
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" onVisibleRangeChange={onVisibleRangeChange} testID="calendar" />,
    );
    onVisibleRangeChange.mockClear();

    await fireEvent.press(screen.getByTestId('calendar-header-next'));
    const last = onVisibleRangeChange.mock.calls.at(-1)?.[0];
    expect(last.startDate > '2026-07-26').toBe(true);
    expect(last.endDate > '2026-10-31').toBe(true);
  });
});

describe('ZSCalendar — 국제화 옵션', () => {
  it('firstDayOfWeek=1 이면 그리드가 월요일에서 시작한다', async () => {
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" firstDayOfWeek={1} testID="calendar" />);

    expect(screen.getByTestId('calendar-cell-2026-08-31')).toBeTruthy();
    expect(screen.queryByTestId('calendar-cell-2026-08-30')).toBeNull();
  });

  it("locale='en' 이면 제목·요일·접근성 라벨이 영어가 된다", async () => {
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} locale="en" testID="calendar" />,
    );
    expect(screen.getByText('September 2026')).toBeTruthy();
    expect(screen.getByText('Sun', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('calendar-cell-2026-09-03').props.accessibilityLabel).toBe('September 3, 2 events, selected');
    expect(screen.getByTestId('calendar-header-prev').props.accessibilityLabel).toBe('Previous month');
  });

  it('locale 에 내장 묶음을 펼쳐 넘기면 요일·월 제목만 갈아끼울 수 있다', async () => {
    await renderCalendar(
      <ZSCalendar
        defaultVisibleMonth="2026-09-01"
        locale={{
          ...CALENDAR_LOCALES.ko,
          weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          monthTitle: (year, month) => `${month}/${year}`,
        }}
        testID="calendar"
      />,
    );

    expect(screen.getByText('9/2026')).toBeTruthy();
    expect(screen.getAllByText('S', { includeHiddenElements: true }).length).toBe(2);
    expect(screen.getByTestId('calendar-header-prev').props.accessibilityLabel).toBe('이전 달');
  });

  it('renderHeader 로 헤더를 통째로 교체할 수 있다', async () => {
    await renderCalendar(
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

  it('children 안에서 컨텍스트로 선택일 일정을 받는다', async () => {
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} testID="calendar">
        <AgendaProbe />
      </ZSCalendar>,
    );

    expect(screen.getByTestId('agenda').props.children).toBe('산책,식사');
  });

  it('달력에서 날짜를 바꾸면 리스트도 같은 인덱스에서 갱신된다', async () => {
    await renderCalendar(
      <ZSCalendar defaultVisibleMonth="2026-09-01" defaultSelectedDate="2026-09-03" events={events} testID="calendar">
        <AgendaProbe />
      </ZSCalendar>,
    );

    await fireEvent.press(screen.getByTestId('calendar-cell-2026-09-20'));
    expect(screen.getByTestId('agenda').props.children).toBe('병원');
  });

  it('보기 모드와 무관하게 선택한 하루만 보여준다', async () => {
    const dense = Array.from({ length: 30 }, (_, index) => ({
      id: `d${index}`,
      date: `2026-09-${String(index + 1).padStart(2, '0')}`,
      data: { title: `일정 ${index + 1}` },
    }));

    const { rerender } = await renderCalendar(
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

    await rerender(
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

  it('ZSCalendar 밖에서 옵션 없이 쓰면 안내 메시지와 함께 실패한다', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<ThemeProvider><AgendaProbe /></ThemeProvider>)).rejects.toThrow('useCalendarAgenda');
    consoleError.mockRestore();
  });
});

describe('ZSCalendar — 요일 머리 색', () => {
  it('일요일 머리는 error, 토요일 머리는 평일 머리와 같은 보조색이다(토요일 숫자는 본문색)', async () => {
    const { colors } = getTestTheme();
    await renderCalendar(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
    const color = (label: string) => StyleSheet.flatten(screen.getByText(label, { includeHiddenElements: true }).props.style).color;
    expect(color('일')).toBe(colors.error);
    expect(color('토')).toBe(colors.textSecondary);
    expect(color('수')).toBe(colors.textSecondary);
  });
});
