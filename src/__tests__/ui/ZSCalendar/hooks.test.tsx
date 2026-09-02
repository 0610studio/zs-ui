import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { buildEventIndex } from '../../../ui/ZSCalendar/core';
import { useCalendarAgenda } from '../../../ui/ZSCalendar/hooks/useCalendarAgenda';
import { useControllableState } from '../../../ui/ZSCalendar/hooks/useControllableState';
import { useContainerWidth } from '../../../ui/ZSCalendar/hooks/useContainerWidth';
import type { CalendarEvent } from '../../../ui/ZSCalendar/core';

const events: CalendarEvent<string>[] = [
  { id: '1', date: '2026-09-01', data: 'a' },
  { id: '2', date: '2026-09-01', data: 'b' },
  { id: '3', date: '2026-09-04', data: 'c' },
  { id: '4', date: '2026-10-02', data: 'd' },
];
const index = buildEventIndex(events);

function AgendaProbe(props: Parameters<typeof useCalendarAgenda<string>>[0]) {
  const { items } = useCalendarAgenda<string>(props);
  return <Text testID="out">{items.map((item) => item.data).join(',')}</Text>;
}

describe('useCalendarAgenda', () => {
  it('선택한 하루의 일정만, 들어온 순서 그대로 준다', () => {
    render(<AgendaProbe index={index} selectedDate="2026-09-01" />);
    expect(screen.getByTestId('out').props.children).toBe('a,b');
  });

  it('다른 날짜를 고르면 그 날짜만 바뀐다', () => {
    render(<AgendaProbe index={index} selectedDate="2026-09-04" />);
    expect(screen.getByTestId('out').props.children).toBe('c');
  });

  it('일정이 없는 날짜는 빈 목록', () => {
    render(<AgendaProbe index={index} selectedDate="2026-09-02" />);
    expect(screen.getByTestId('out').props.children).toBe('');
  });

  it('선택일이 없으면 빈 목록', () => {
    render(<AgendaProbe index={index} selectedDate={null} />);
    expect(screen.getByTestId('out').props.children).toBe('');
  });

  it('달력 밖에서는 index 를 직접 넘겨야 한다', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AgendaProbe selectedDate="2026-09-01" />)).toThrow('useCalendarAgenda');
    consoleError.mockRestore();
  });

  it('<ZSCalendar> 밖에서는 아무 일도 하지 않는 스크롤 바인딩이 온다', () => {
    function BindingProbe() {
      const { bindScroll } = useCalendarAgenda<string>({ index, selectedDate: '2026-09-01' });
      return <Text testID="binding">{typeof bindScroll.onScroll}</Text>;
    }
    render(<BindingProbe />);
    expect(screen.getByTestId('binding').props.children).toBe('function');
  });
});

function ControllableProbe({ value, onChange }: { value?: string; onChange?: (next: string) => void }) {
  const [current, set] = useControllableState(value, 'default', onChange);
  return (
    <Text testID="out" onPress={() => set('pressed')}>
      {current}
    </Text>
  );
}

describe('useControllableState', () => {
  it('uncontrolled 는 내부 상태를 바꾼다', () => {
    const onChange = jest.fn();
    render(<ControllableProbe onChange={onChange} />);
    expect(screen.getByTestId('out').props.children).toBe('default');

    fireEvent.press(screen.getByTestId('out'));
    expect(screen.getByTestId('out').props.children).toBe('pressed');
    expect(onChange).toHaveBeenCalledWith('pressed');
  });

  it('controlled 는 값을 유지하고 콜백만 부른다', () => {
    const onChange = jest.fn();
    render(<ControllableProbe value="fixed" onChange={onChange} />);

    fireEvent.press(screen.getByTestId('out'));
    expect(screen.getByTestId('out').props.children).toBe('fixed');
    expect(onChange).toHaveBeenCalledWith('pressed');
  });

  it('콜백이 없어도 안전하다', () => {
    render(<ControllableProbe />);
    expect(() => fireEvent.press(screen.getByTestId('out'))).not.toThrow();
  });
});

function WidthProbe() {
  const { width, onLayout } = useContainerWidth();
  return <Text testID="out" onLayout={onLayout}>{String(width)}</Text>;
}

describe('useContainerWidth', () => {
  const layout = (width: number) =>
    act(() => {
      fireEvent(screen.getByTestId('out'), 'layout', {
        nativeEvent: { layout: { width, height: 100, x: 0, y: 0 } },
      });
    });

  it('측정 전에는 0 이고 onLayout 으로 채워진다', () => {
    render(<WidthProbe />);
    expect(screen.getByTestId('out').props.children).toBe('0');
    layout(390);
    expect(screen.getByTestId('out').props.children).toBe('390');
  });

  it('0.5pt 미만 흔들림은 무시한다 — SkPicture 캐시가 매 프레임 버려지지 않도록', () => {
    render(<WidthProbe />);
    layout(390);
    layout(390.2);
    expect(screen.getByTestId('out').props.children).toBe('390');
    layout(391);
    expect(screen.getByTestId('out').props.children).toBe('391');
  });
});
