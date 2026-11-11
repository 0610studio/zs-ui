import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { useModeTransition, type ModeTransition } from '../../../ui/ZSCalendar/gestures/useModeTransition';
import type { CalendarMode } from '../../../ui/ZSCalendar/core';

const EXPAND_DISTANCE = 200;

let transition: ModeTransition;

function Probe({
  onModeChange,
  initialMode = 'month',
  enabled,
  scrollEnabled,
}: { onModeChange: (mode: CalendarMode) => void; initialMode?: CalendarMode; enabled?: boolean; scrollEnabled?: boolean }) {
  transition = useModeTransition({ expandDistance: EXPAND_DISTANCE, onModeChange, initialMode, enabled, scrollEnabled });
  return <Text testID="progress">{String(transition.progress.value)}</Text>;
}

const scrollEvent = (y: number, sizes?: { content: number; viewport: number }) =>
  ({
    nativeEvent: {
      contentOffset: { y },
      ...(sizes ? { contentSize: { height: sizes.content, width: 0 }, layoutMeasurement: { height: sizes.viewport, width: 0 } } : {}),
    },
  }) as never;

const scrollTo = (y: number) => act(() => transition.bindScroll.onScroll(scrollEvent(y)));
const stopAt = (y: number) => act(() => transition.bindScroll.onMomentumScrollEnd(scrollEvent(y)));
const liftAt = (y: number) => act(() => transition.bindScroll.onScrollEndDrag(scrollEvent(y)));

describe('useModeTransition — 리스트 스크롤 구동', () => {
  const setup = async (initialMode: CalendarMode = 'month') => {
    const onModeChange = jest.fn();
    await render(<Probe onModeChange={onModeChange} initialMode={initialMode} />);
    return onModeChange;
  };

  it('아래로 스크롤하면 오프셋에 비례해 접힌다', async () => {
    await setup();
    expect(transition.progress.value).toBe(1);

    await scrollTo(50);
    expect(transition.progress.value).toBeCloseTo(0.75, 5);

    await scrollTo(EXPAND_DISTANCE);
    expect(transition.progress.value).toBe(0);
  });

  it('되돌아오는 스크롤 중에는 펼쳐지지 않는다 — 이게 리스트와 부딪히던 원인이다', async () => {
    await setup();
    await scrollTo(EXPAND_DISTANCE);
    expect(transition.progress.value).toBe(0);

    await scrollTo(150);
    await scrollTo(80);
    await scrollTo(10);
    expect(transition.progress.value).toBe(0);
  });

  it('맨 위에서 완전히 멈췄을 때만 월간으로 펼친다', async () => {
    const onModeChange = await setup();
    await scrollTo(EXPAND_DISTANCE);
    await scrollTo(0);
    expect(transition.progress.value).toBe(0);

    await stopAt(0);
    expect(transition.progress.value).toBe(1);
    expect(onModeChange).toHaveBeenLastCalledWith('month');
  });

  it('맨 위가 아닌 곳에서 멈추면 주간으로 스냅한다 — 반쯤 접힌 채 남지 않는다', async () => {
    await setup();
    await scrollTo(60);
    expect(transition.progress.value).toBeCloseTo(0.7, 5);

    await liftAt(60);
    expect(transition.progress.value).toBe(0);
  });

  it('접힘 거리만큼 스크롤할 여유가 없는 짧은 목록은 당겨도 접히지 않고, 놓아도 주간으로 스냅하지 않는다', async () => {
    const onModeChange = await setup();
    const short = { content: 500, viewport: 450 };
    await act(() => transition.bindScroll.onScroll(scrollEvent(40, short)));
    expect(transition.progress.value).toBe(1);

    await act(() => transition.bindScroll.onScrollEndDrag(scrollEvent(40, short)));
    expect(transition.progress.value).toBe(1);
    expect(onModeChange).not.toHaveBeenCalledWith('week');
  });

  it('여유가 접힘 거리 이상인 긴 목록은 그대로 접힌다 — 뷰포트가 커진 뒤에도 내용이 남아 왕복하지 않는다', async () => {
    await setup();
    const long = { content: 1400, viewport: 450 };
    await act(() => transition.bindScroll.onScroll(scrollEvent(100, long)));
    expect(transition.progress.value).toBeCloseTo(0.5, 5);

    await act(() => transition.bindScroll.onScroll(scrollEvent(EXPAND_DISTANCE, { content: 1400, viewport: 550 })));
    expect(transition.progress.value).toBe(0);
  });

  it('scrollEnabled=false 면 스크롤이 아무것도 건드리지 않는다', async () => {
    const onModeChange = jest.fn();
    await render(<Probe onModeChange={onModeChange} scrollEnabled={false} />);
    await scrollTo(EXPAND_DISTANCE);
    await liftAt(EXPAND_DISTANCE);
    expect(transition.progress.value).toBe(1);
    expect(onModeChange).not.toHaveBeenCalledWith('week');
  });

  it('enabled=false 면 스크롤도 함께 꺼진다 — 현재 모드 고정 약속을 지킨다', async () => {
    const onModeChange = jest.fn();
    await render(<Probe onModeChange={onModeChange} enabled={false} />);
    await scrollTo(EXPAND_DISTANCE);
    await stopAt(EXPAND_DISTANCE);
    expect(transition.progress.value).toBe(1);
  });

  it('맨 위를 벗어난 적이 없으면 스크롤이 멈춰도 펼치지 않는다', async () => {
    await setup('week');
    expect(transition.progress.value).toBe(0);

    await scrollTo(0);
    await stopAt(0);
    expect(transition.progress.value).toBe(0);
  });

  it('바운스로 오프셋이 음수가 되어도 안전하다', async () => {
    await setup();
    await scrollTo(EXPAND_DISTANCE);
    await scrollTo(-12);
    expect(transition.progress.value).toBe(0);

    await stopAt(-12);
    expect(transition.progress.value).toBe(1);
  });

  it('펼친 뒤 다시 펼치려면 맨 위를 한 번 벗어나야 한다', async () => {
    await setup();
    await scrollTo(EXPAND_DISTANCE);
    await stopAt(0);
    expect(transition.progress.value).toBe(1);

    await stopAt(0);
    expect(transition.progress.value).toBe(1);
  });

  it('setMode 는 progress 를 그대로 몰아준다', async () => {
    await setup();
    await act(() => transition.setMode('week'));
    expect(transition.progress.value).toBe(0);
    await act(() => transition.setMode('month'));
    expect(transition.progress.value).toBe(1);
  });
});
