import { act, render, renderHook } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LayoutProvider } from '../../layout/LayoutProvider';
import { useBarAxis, useDevicePosture, useDisplayFeatures, useWindowLayout } from '../../layout/LayoutContext';
import type { WindowObserverProps } from '../../layout/WindowObserver.types';
import { __listenerCount, __setHinge } from '../__mocks__/expo-hinge';

let observe: WindowObserverProps['onObserve'] = () => {};

jest.mock('../../layout/WindowObserver', () => ({
  __esModule: true,
  default: ({ onObserve, children }: WindowObserverProps) => {
    observe = onObserve;
    return children;
  },
}));

function Probe({ onRender }: { onRender: (value: ReturnType<typeof useWindowLayout>) => void }) {
  const layout = useWindowLayout();
  onRender(layout);
  return <Text>{`${layout.widthClass}-${layout.measured}`}</Text>;
}

describe('LayoutProvider', () => {
  it('Provider 밖에서 쓰면 명확한 에러를 던진다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useWindowLayout())).rejects.toThrow('useWindowLayout must be used within a LayoutProvider');
    jest.mocked(console.error).mockRestore();
  });

  it('첫 렌더는 추정값(measured=false), 관찰자 측정으로 확정된다', async () => {
    const onRender = jest.fn();
    const { getByText } = await render(
      <LayoutProvider>
        <Probe onRender={onRender} />
      </LayoutProvider>,
    );
    expect(onRender.mock.calls[0][0].measured).toBe(false);

    await act(() => observe({ width: 1210, height: 834, horizontalSizeClass: 'regular', verticalSizeClass: 'regular' }));
    expect(getByText('expanded-true')).toBeTruthy();
  });

  it('같은 값이 다시 와도 구독자를 리렌더하지 않는다', async () => {
    const onRender = jest.fn();
    await render(
      <LayoutProvider>
        <Probe onRender={onRender} />
      </LayoutProvider>,
    );
    const observation = { width: 402, height: 874, horizontalSizeClass: 'compact', verticalSizeClass: 'regular' } as const;
    await act(() => observe(observation));
    const count = onRender.mock.calls.length;
    await act(() => observe(observation));
    expect(onRender.mock.calls.length).toBe(count);
  });
});

describe('LayoutProvider readableMaxWidth', () => {
  function Readable() {
    return <Text>{`readable-${useWindowLayout().readableMaxWidth}`}</Text>;
  }

  it('prop 이 바뀌면 마지막 관찰값으로 다시 해석한다', async () => {
    const { getByText, rerender } = await render(
      <LayoutProvider>
        <Readable />
      </LayoutProvider>,
    );
    await act(() => observe({ width: 834, height: 1210, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 672 }));
    expect(getByText('readable-672')).toBeTruthy();

    await rerender(
      <LayoutProvider readableMaxWidth={600}>
        <Readable />
      </LayoutProvider>,
    );
    expect(getByText('readable-600')).toBeTruthy();
  });
});

describe('LayoutProvider 접힘선·자세', () => {
  const unfolded = { width: 749.7, height: 832, widthClass: 'medium', heightClass: 'medium', minWidthDp: 600, minHeightDp: 480 } as const;
  const foldAt = (state: 'flat' | 'halfOpened') => ({
    ...unfolded,
    displayFeatures: [
      { type: 'fold', x: 374.9, y: 0, width: 0, height: 832, orientation: 'vertical', state, active: state === 'halfOpened' },
    ] as const,
  });

  it('Provider 밖에서 쓰면 hook 이름이 들어간 에러를 던진다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useDisplayFeatures())).rejects.toThrow('useDisplayFeatures must be used within a LayoutProvider');
    await expect(renderHook(() => useDevicePosture())).rejects.toThrow('useDevicePosture must be used within a LayoutProvider');
    jest.mocked(console.error).mockRestore();
  });

  it('첫 렌더는 접힘선 없음·자세 unknown, 관찰값으로 갱신된다', async () => {
    function Fold() {
      const { fold } = useDisplayFeatures();
      const { posture } = useDevicePosture();
      return <Text>{`${fold ? `${fold.rect.x}-${fold.state}` : 'none'}-${posture}`}</Text>;
    }
    const { getByText } = await render(
      <LayoutProvider>
        <Fold />
      </LayoutProvider>,
    );
    expect(getByText('none-unknown')).toBeTruthy();
    await act(() => observe(foldAt('flat') as any));
    expect(getByText('374.9-flat-flat')).toBeTruthy();
    await act(() => observe(foldAt('halfOpened') as any));
    expect(getByText('374.9-halfOpened-book')).toBeTruthy();
    await act(() => observe(unfolded as any));
    expect(getByText('none-unknown')).toBeTruthy();
  });

  it('자세만 바뀌면 창 크기 구독자는 리렌더하지 않는다 (분리 구독)', async () => {
    const onRender = jest.fn();
    await render(
      <LayoutProvider>
        <Probe onRender={onRender} />
      </LayoutProvider>,
    );
    await act(() => observe(foldAt('flat') as any));
    const count = onRender.mock.calls.length;
    await act(() => observe(foldAt('halfOpened') as any));
    expect(onRender.mock.calls.length).toBe(count);
  });
});

describe('LayoutProvider 아이폰 듀오 힌지 (expo-hinge)', () => {
  const regularWindow = { width: 834, height: 1000, horizontalSizeClass: 'regular', verticalSizeClass: 'regular' } as const;
  const withFold = (orientation: 'vertical' | 'horizontal') => ({
    ...regularWindow,
    displayFeatures: [{ type: 'fold', x: 417, y: 0, width: 0, height: 1000, orientation, state: 'unknown', active: true }] as const,
  });

  function Posture() {
    const { posture, hingeAngle } = useDevicePosture();
    return <Text>{`${posture}-${hingeAngle}`}</Text>;
  }

  afterEach(() => {
    __setHinge(null);
  });

  it('첫 렌더부터 네이티브가 들고 있는 힌지 값을 쓴다', async () => {
    __setHinge({ status: 'closed', angle: 3 });
    const { getByText } = await render(
      <LayoutProvider>
        <Posture />
      </LayoutProvider>,
    );
    expect(getByText('closed-3')).toBeTruthy();
  });

  it('힌지가 바뀌면 자세·각도가 따라간다', async () => {
    const { getByText } = await render(
      <LayoutProvider>
        <Posture />
      </LayoutProvider>,
    );
    expect(getByText('unknown-null')).toBeTruthy();
    await act(() => __setHinge({ status: 'fullyOpen', angle: 180 }));
    expect(getByText('flat-180')).toBeTruthy();
    await act(() => __setHinge({ status: 'partiallyOpen', angle: 100 }));
    expect(getByText('unknown-100')).toBeTruthy();
    await act(() => __setHinge(null));
    expect(getByText('unknown-null')).toBeTruthy();
  });

  it('반쯤 열림은 접힘선 방향으로 book·tabletop — 접힘선이 나중에 와도 마지막 힌지로 다시 정한다', async () => {
    const { getByText } = await render(
      <LayoutProvider>
        <Posture />
      </LayoutProvider>,
    );
    await act(() => __setHinge({ status: 'partiallyOpen', angle: 90 }));
    await act(() => observe(withFold('vertical') as any));
    expect(getByText('book-90')).toBeTruthy();
    await act(() => observe(withFold('horizontal') as any));
    expect(getByText('tabletop-90')).toBeTruthy();
  });

  it('힌지 각도만 바뀌면 창 크기 구독자는 리렌더하지 않는다', async () => {
    const onRender = jest.fn();
    await render(
      <LayoutProvider>
        <Probe onRender={onRender} />
      </LayoutProvider>,
    );
    await act(() => observe(regularWindow));
    const count = onRender.mock.calls.length;
    await act(() => __setHinge({ status: 'partiallyOpen', angle: 80 }));
    await act(() => __setHinge({ status: 'partiallyOpen', angle: 81 }));
    expect(onRender.mock.calls.length).toBe(count);
  });

  it('언마운트하면 힌지 구독을 끊는다', async () => {
    const { unmount } = await render(
      <LayoutProvider>
        <Posture />
      </LayoutProvider>,
    );
    expect(__listenerCount()).toBe(1);
    await unmount();
    expect(__listenerCount()).toBe(0);
  });
});

describe('LayoutProvider barAxis', () => {
  const platform = Platform as { OS: string };
  const setBehavior = jest.mocked(StatusBar.setVerticalBarBehaviorIOS);

  beforeEach(() => setBehavior.mockClear());
  afterEach(() => {
    platform.OS = 'ios';
  });

  function Axis() {
    const [barAxis] = useBarAxis();
    return <Text>{`axis-${barAxis}`}</Text>;
  }

  let setAxis: (next: 'vertical' | 'horizontal') => void = () => {};
  function AxisSetter() {
    const [barAxis, setBarAxis] = useBarAxis();
    setAxis = setBarAxis;
    return <Text>{`axis-${barAxis}`}</Text>;
  }

  it("기본은 'vertical' 이고 iOS 세로 바를 건드리지 않는다", async () => {
    const { getByText } = await render(
      <LayoutProvider>
        <Axis />
      </LayoutProvider>,
    );
    expect(getByText('axis-vertical')).toBeTruthy();
    expect(setBehavior).not.toHaveBeenCalled();
  });

  it("iOS 'horizontal' 은 세로 바를 끄고, 'vertical' 로 바꾸거나 언마운트하면 되돌린다", async () => {
    const { getByText, rerender, unmount } = await render(
      <LayoutProvider barAxis="horizontal">
        <Axis />
      </LayoutProvider>,
    );
    expect(getByText('axis-horizontal')).toBeTruthy();
    expect(setBehavior).toHaveBeenLastCalledWith('disabled');

    await rerender(
      <LayoutProvider barAxis="vertical">
        <Axis />
      </LayoutProvider>,
    );
    expect(getByText('axis-vertical')).toBeTruthy();
    expect(setBehavior).toHaveBeenLastCalledWith('automatic');

    await rerender(
      <LayoutProvider barAxis="horizontal">
        <Axis />
      </LayoutProvider>,
    );
    setBehavior.mockClear();
    await unmount();
    expect(setBehavior).toHaveBeenCalledWith('automatic');
  });

  it('useBarAxis 로 바꾸면 iOS 세로 바도 따라 바뀌고, prop 이 바뀌면 prop 값으로 돌아간다', async () => {
    const { getByText, rerender } = await render(
      <LayoutProvider barAxis="horizontal">
        <AxisSetter />
      </LayoutProvider>,
    );
    expect(setBehavior).toHaveBeenLastCalledWith('disabled');

    await act(() => setAxis('vertical'));
    expect(getByText('axis-vertical')).toBeTruthy();
    expect(setBehavior).toHaveBeenLastCalledWith('automatic');

    await act(() => setAxis('horizontal'));
    expect(getByText('axis-horizontal')).toBeTruthy();
    expect(setBehavior).toHaveBeenLastCalledWith('disabled');

    await act(() => setAxis('vertical'));
    await rerender(
      <LayoutProvider barAxis="horizontal" readableMaxWidth={600}>
        <AxisSetter />
      </LayoutProvider>,
    );
    expect(getByText('axis-vertical')).toBeTruthy();
    await rerender(
      <LayoutProvider barAxis="vertical">
        <AxisSetter />
      </LayoutProvider>,
    );
    await act(() => setAxis('horizontal'));
    await rerender(
      <LayoutProvider barAxis="horizontal">
        <AxisSetter />
      </LayoutProvider>,
    );
    expect(getByText('axis-horizontal')).toBeTruthy();
    await rerender(
      <LayoutProvider barAxis="vertical">
        <AxisSetter />
      </LayoutProvider>,
    );
    expect(getByText('axis-vertical')).toBeTruthy();
  });

  it('Android 는 값만 공급하고 iOS 세로 바 API 를 부르지 않는다', async () => {
    platform.OS = 'android';
    const { getByText } = await render(
      <LayoutProvider barAxis="horizontal">
        <Axis />
      </LayoutProvider>,
    );
    expect(getByText('axis-horizontal')).toBeTruthy();
    expect(setBehavior).not.toHaveBeenCalled();
  });

  it('Provider 밖에서 쓰면 hook 이름이 들어간 에러를 던진다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useBarAxis())).rejects.toThrow('useBarAxis must be used within a LayoutProvider');
    jest.mocked(console.error).mockRestore();
  });
});
