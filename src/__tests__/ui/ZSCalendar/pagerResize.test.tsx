import { act, renderHook } from '@testing-library/react-native';
import { useHorizontalPager } from '../../../ui/ZSCalendar/gestures/useHorizontalPager';
import type { MockGesture } from '../../__mocks__/react-native-gesture-handler';

type PanHandlers = {
  onActivate: () => void;
  onUpdate: (event: { translationX: number }) => void;
  onDeactivate: (event: { translationX: number; velocityX: number }) => void;
};

describe('ZSCalendar 가로 페이지 — 접기·펼치기', () => {
  it('현재 월/주를 유지하며 새 폭으로 즉시 정렬한다 — 0폭 뒤에도 같은 페이지로 돌아온다', async () => {
    const onPageChange = jest.fn();
    const { result, rerender } = await renderHook(
      ({ pageWidth }: { pageWidth: number }) => useHorizontalPager({ pageWidth, onPageChange }),
      { initialProps: { pageWidth: 700 } },
    );
    await act(() => result.current.goToPage(3));
    expect(result.current.translateX.value).toBe(-2100);
    onPageChange.mockClear();
    for (const pageWidth of [320, 650, 0, 400]) {
      await rerender({ pageWidth });
      expect(result.current.translateX.value).toBe(-3 * pageWidth);
    }
    expect(onPageChange).not.toHaveBeenCalled();
    await act(() => result.current.stepPage(-1));
    expect(result.current.translateX.value).toBe(-800);
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it('끌던 도중 폭이 바뀌면 옛 손짓을 버려 의도하지 않은 월/주 이동을 막는다', async () => {
    const onPageChange = jest.fn();
    const { result, rerender } = await renderHook(
      ({ pageWidth }: { pageWidth: number }) => useHorizontalPager({ pageWidth, onPageChange }),
      { initialProps: { pageWidth: 700 } },
    );
    await act(() => result.current.goToPage(2));
    const handlers = () => (result.current.gesture as unknown as MockGesture).__config as unknown as PanHandlers;
    await act(() => {
      handlers().onActivate();
      handlers().onUpdate({ translationX: -200 });
    });
    for (const pageWidth of [320, 700]) await rerender({ pageWidth });
    expect(result.current.translateX.value).toBe(-1400);
    onPageChange.mockClear();
    await act(() => {
      handlers().onUpdate({ translationX: -250 });
      handlers().onDeactivate({ translationX: -300, velocityX: -900 });
    });
    expect(result.current.translateX.value).toBe(-1400);
    expect(onPageChange).not.toHaveBeenCalled();
    await act(() => {
      handlers().onActivate();
      handlers().onUpdate({ translationX: -350 });
      handlers().onDeactivate({ translationX: -350, velocityX: 0 });
    });
    expect(result.current.translateX.value).toBe(-2100);
  });
});
