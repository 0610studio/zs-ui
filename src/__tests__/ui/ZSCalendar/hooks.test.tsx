import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { buildEventIndex } from '../../../ui/ZSCalendar/core';
import { useCalendarAgenda } from '../../../ui/ZSCalendar/hooks/useCalendarAgenda';
import { useContainerSize } from '../../../ui/ZSCalendar/hooks/useContainerSize';
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
  it('선택한 하루의 일정만, 들어온 순서 그대로 준다', async () => {
    await render(<AgendaProbe index={index} selectedDate="2026-09-01" />);
    expect(screen.getByTestId('out').props.children).toBe('a,b');
  });

  it('다른 날짜를 고르면 그 날짜만 바뀐다', async () => {
    await render(<AgendaProbe index={index} selectedDate="2026-09-04" />);
    expect(screen.getByTestId('out').props.children).toBe('c');
  });

  it('일정이 없는 날짜는 빈 목록', async () => {
    await render(<AgendaProbe index={index} selectedDate="2026-09-02" />);
    expect(screen.getByTestId('out').props.children).toBe('');
  });

  it('선택일이 없으면 빈 목록', async () => {
    await render(<AgendaProbe index={index} selectedDate={null} />);
    expect(screen.getByTestId('out').props.children).toBe('');
  });

  it('달력 밖에서는 index 를 직접 넘겨야 한다', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<AgendaProbe selectedDate="2026-09-01" />)).rejects.toThrow('useCalendarAgenda');
    consoleError.mockRestore();
  });

  it('<ZSCalendar> 밖에서는 아무 일도 하지 않는 스크롤 바인딩이 온다', async () => {
    function BindingProbe() {
      const { bindScroll } = useCalendarAgenda<string>({ index, selectedDate: '2026-09-01' });
      return <Text testID="binding">{typeof bindScroll.onScroll}</Text>;
    }
    await render(<BindingProbe />);
    expect(screen.getByTestId('binding').props.children).toBe('function');
  });
});

function WidthProbe() {
  const { width, onLayout } = useContainerSize();
  return <Text testID="out" onLayout={onLayout}>{String(width)}</Text>;
}

function HeightProbe({ measureHeight = true }: { measureHeight?: boolean }) {
  const { height, onLayout } = useContainerSize({ measureHeight });
  return <Text testID="out" onLayout={onLayout}>{String(height)}</Text>;
}

describe('useContainerSize', () => {
  const layout = (width: number, height = 100) =>
    fireEvent(screen.getByTestId('out'), 'layout', {
      nativeEvent: { layout: { width, height, x: 0, y: 0 } },
    });

  it('높이도 같은 규칙으로 잰다 — label 표시가 행을 채울 때 쓴다', async () => {
    await render(<HeightProbe />);
    expect(screen.getByTestId('out').props.children).toBe('0');
    await layout(390, 600);
    await layout(390, 600.3);
    expect(screen.getByTestId('out').props.children).toBe('600');
    await layout(390, 480);
    expect(screen.getByTestId('out').props.children).toBe('480');
  });

  it('measureHeight 를 끄면(dot 표시) 높이 변화로 다시 렌더하지 않는다 — 달마다 애니메이션되는 그리드 높이', async () => {
    const rendersOnHeightChanges = async (measureHeight: boolean) => {
      let renders = 0;
      function CountingProbe() {
        renders += 1;
        const { width, height, onLayout } = useContainerSize({ measureHeight });
        return <Text testID="out" onLayout={onLayout}>{`${width}x${height}`}</Text>;
      }
      const tree = await render(<CountingProbe />);
      await layout(390, 300);
      const before = renders;
      for (const height of [360, 420, 480]) await layout(390, height);
      const delta = renders - before;
      const text = screen.getByTestId('out').props.children;
      await tree.unmount();
      return { delta, text };
    };

    const measured = await rendersOnHeightChanges(true);
    const unmeasured = await rendersOnHeightChanges(false);
    expect(measured).toEqual({ delta: 3, text: '390x480' });
    expect(unmeasured.text).toBe('390x0');
    expect(unmeasured.delta).toBeLessThanOrEqual(1);
  });

  it('측정 전에는 0 이고 onLayout 으로 채워진다', async () => {
    await render(<WidthProbe />);
    expect(screen.getByTestId('out').props.children).toBe('0');
    await layout(390);
    expect(screen.getByTestId('out').props.children).toBe('390');
  });

  it('0.5pt 미만 흔들림은 무시한다 — SkPicture 캐시가 매 프레임 버려지지 않도록', async () => {
    await render(<WidthProbe />);
    await layout(390);
    await layout(390.2);
    expect(screen.getByTestId('out').props.children).toBe('390');
    await layout(391);
    expect(screen.getByTestId('out').props.children).toBe('391');
  });
});
