import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { useHorizontalPager, type HorizontalPager } from '../../../ui/ZSCalendar/gestures/useHorizontalPager';
import { useModeTransition, type ModeTransition } from '../../../ui/ZSCalendar/gestures/useModeTransition';
import type { MockGesture } from '../../__mocks__/react-native-gesture-handler';

const PAGE_WIDTH = 300;
const EXPAND_DISTANCE = 200;

let pager: HorizontalPager;
let transition: ModeTransition;

function PagerProbe() {
  pager = useHorizontalPager({ pageWidth: PAGE_WIDTH, onPageChange: () => {} });
  return <Text>pager</Text>;
}

function TransitionProbe() {
  transition = useModeTransition({ expandDistance: EXPAND_DISTANCE, onModeChange: () => {} });
  return <Text>transition</Text>;
}

type PanHandlers = { onActivate: () => void; onUpdate: (event: object) => void; onDeactivate: (event: object) => void };
const configOf = (gesture: unknown) => (gesture as MockGesture).__config as unknown as PanHandlers;

// 기기가 바쁘면 마지막 onUpdate 가 손 뗀 위치까지 못 따라온 채 끝 이벤트가 온다 — 판정은 끝 이벤트의 이동량을 따라야 한다
describe('ZSCalendar 제스처 — 손 뗀 위치로 판정', () => {
  it('가로 넘김: 마지막 onUpdate 는 짧아도 끝 이벤트가 넘김 기준을 넘으면 다음 페이지로 간다', async () => {
    await render(<PagerProbe />);
    const config = configOf(pager.gesture);
    await act(() => {
      config.onActivate();
      config.onUpdate({ translationX: -30 });
      config.onDeactivate({ translationX: -PAGE_WIDTH * 0.4, velocityX: 0 });
    });
    expect(pager.translateX.value).toBe(-PAGE_WIDTH);
  });

  it('가로 넘김: 끝 이벤트가 기준에 못 미치면 제자리로 돌아간다', async () => {
    await render(<PagerProbe />);
    const config = configOf(pager.gesture);
    await act(() => {
      config.onActivate();
      config.onUpdate({ translationX: -PAGE_WIDTH * 0.4 });
      config.onDeactivate({ translationX: -PAGE_WIDTH * 0.1, velocityX: 0 });
    });
    expect(pager.translateX.value).toBe(-0);
  });

  it('월/주 전환: 마지막 onUpdate 는 조금만 접혔어도 끝 이벤트가 절반을 넘게 접었으면 주간으로 간다', async () => {
    await render(<TransitionProbe />);
    const config = configOf(transition.gesture);
    await act(() => {
      config.onActivate();
      config.onUpdate({ translationY: -20 });
      config.onDeactivate({ translationY: -EXPAND_DISTANCE * 0.75, velocityY: 0 });
    });
    expect(transition.progress.value).toBe(0);
  });
});
