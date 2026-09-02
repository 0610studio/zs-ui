import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Keyboard, Pressable, Text, View } from 'react-native';
import BottomSheetOverlay from '../../overlay/BottomSheetOverlay';
import type { BottomSheetContextProps } from '../../model/types';
import * as Reanimated from 'react-native-reanimated';

const createBottomSheetContext = (
  overrides: Partial<BottomSheetContextProps> = {}
): BottomSheetContextProps => ({
  bottomSheetVisible: true,
  setBottomSheetVisible: () => {},
  height: 300,
  maxHeight: 500,
  setHeight: () => {},
  ...overrides,
});

const mockUseBottomSheet = jest.fn<BottomSheetContextProps, []>(() => createBottomSheetContext());

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography }),
  };
});

jest.mock('../../model/useOverlay', () => ({
  useBottomSheet: () => mockUseBottomSheet(),
}));

jest.mock('../../model/useFoldingState', () => ({
  __esModule: true,
  default: () => ({ width: 390 })
}));

// 닫힘 오프셋 = 시트높이 + bottomSpace(marginBottom 10 + inset 0) + slack 100
const closeOffsetFor = (sheetHeight: number) => sheetHeight + 10 + 100;

// translateY 닫힘 호출만 골라낸다 (backdrop·scale·keyboard 와 구분)
const closeCallsOf = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter(([target]) => typeof target === 'number' && target > 100);

describe('BottomSheetOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockUseBottomSheet.mockReset();
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext());
  });

  it('헤더/콘텐츠를 렌더한다', () => {
    const { getByText } = render(
      <BottomSheetOverlay
        headerComponent={<Text>header</Text>}
        component={<Text>content</Text>}
      />
    );
    getByText('header');
    getByText('content');
  });

  it('height가 auto여도 콘텐츠를 렌더한다', () => {
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ height: 'auto', maxHeight: 320 }));

    const { getByText } = render(
      <BottomSheetOverlay
        headerComponent={<Text>auto header</Text>}
        component={<Text>auto content</Text>}
      />
    );

    getByText('auto header');
    getByText('auto content');
  });

  it('닫히는 동안 layout 변경이 발생해도 close 애니메이션을 다시 시작하지 않는다', () => {
    const withTimingSpy = jest.spyOn(Reanimated, 'withTiming');

    const { getByText, queryByText, rerender, UNSAFE_getAllByType } = render(
      <BottomSheetOverlay
        headerComponent={<Text>header</Text>}
        component={<Text>content</Text>}
      />
    );

    const sheetContainer = UNSAFE_getAllByType(View).find((node) => typeof node.props.onLayout === 'function');

    expect(sheetContainer).toBeDefined();

    act(() => {
      sheetContainer!.props.onLayout({
        nativeEvent: { layout: { height: 280 } },
      });
    });

    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ bottomSheetVisible: false }));

    act(() => {
      rerender(
        <BottomSheetOverlay
          headerComponent={<Text>header</Text>}
          component={<Text>content</Text>}
        />
      );
    });

    expect(getByText('content')).toBeTruthy();

    expect(closeCallsOf(withTimingSpy)).toHaveLength(1);
    expect(closeCallsOf(withTimingSpy)[0][0]).toBe(closeOffsetFor(280));
    expect(closeCallsOf(withTimingSpy)[0][1]).toEqual(expect.objectContaining({ duration: 200 }));

    act(() => {
      sheetContainer!.props.onLayout({
        nativeEvent: { layout: { height: 420 } },
      });
    });

    expect(closeCallsOf(withTimingSpy)).toHaveLength(1);

    // setTimeout 지연이 아니라 애니메이션 완료 기준으로 언마운트된다
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(queryByText('content')).toBeNull();
  });

  it('dismissable: false면 배경 터치로 닫히지 않는다', () => {
    const setBottomSheetVisible = jest.fn();
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ setBottomSheetVisible }));

    const { UNSAFE_getAllByType } = render(
      <BottomSheetOverlay
        component={<Text>content</Text>}
        options={{ dismissable: false }}
      />
    );

    const backdropPressable = UNSAFE_getAllByType(Pressable)[0];
    fireEvent.press(backdropPressable);

    expect(setBottomSheetVisible).not.toHaveBeenCalled();
  });

  it('dismissable 미지정 시 isBackgroundTouchClose(deprecated)를 승계한다', () => {
    const setBottomSheetVisible = jest.fn();
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ setBottomSheetVisible }));

    const { UNSAFE_getAllByType } = render(
      <BottomSheetOverlay
        component={<Text>content</Text>}
        options={{ isBackgroundTouchClose: false }}
      />
    );

    fireEvent.press(UNSAFE_getAllByType(Pressable)[0]);
    expect(setBottomSheetVisible).not.toHaveBeenCalled();
  });

  it('기본값은 dismissable: true — 배경 터치로 닫힌다', () => {
    const setBottomSheetVisible = jest.fn();
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ setBottomSheetVisible }));

    const { UNSAFE_getAllByType } = render(
      <BottomSheetOverlay component={<Text>content</Text>} />
    );

    fireEvent.press(UNSAFE_getAllByType(Pressable)[0]);
    expect(setBottomSheetVisible).toHaveBeenCalledWith(false);
  });

  it('키보드 이벤트는 translateY가 아닌 별도 keyboardOffset을 움직인다', () => {
    const listeners: Record<string, (event?: any) => void> = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, cb: any) => {
      listeners[event] = cb;
      return { remove: jest.fn() };
    }) as any);
    const withTimingSpy = jest.spyOn(Reanimated, 'withTiming');

    render(<BottomSheetOverlay component={<Text>content</Text>} />);

    expect(listeners.keyboardWillShow).toBeDefined();

    act(() => {
      listeners.keyboardWillShow({ endCoordinates: { height: 300 } });
    });

    // keyboardOffset 목표값 -300(insets 0), duration 250 — translateY 닫힘과 무관
    const keyboardCall = withTimingSpy.mock.calls.find(([target]) => target === -300);
    expect(keyboardCall).toBeDefined();
    expect(keyboardCall![1]).toEqual(expect.objectContaining({ duration: 250 }));
    expect(closeCallsOf(withTimingSpy)).toHaveLength(0);
  });

  it('fixed 시트는 위로 드래그해도 translateY가 0에 고정된다 (바닥 유지)', () => {
    const { PanResponder } = require('react-native');
    const createSpy = jest.spyOn(PanResponder, 'create');
    const sharedValueSpy = jest.spyOn(Reanimated, 'useSharedValue');

    render(
      <BottomSheetOverlay component={<Text>content</Text>} options={{ type: 'fixed' }} />
    );

    // useSharedValue 생성 순서: translateY → keyboardOffset → backdropOpacity → scale → isGesturing
    const translateY = sharedValueSpy.mock.results[0].value;
    const config = createSpy.mock.calls[createSpy.mock.calls.length - 1][0];

    act(() => {
      config.onPanResponderMove({} as any, { dy: -60 } as any);
    });
    expect(translateY.value).toBe(0);

    act(() => {
      config.onPanResponderMove({} as any, { dy: 40 } as any);
    });
    expect(translateY.value).toBe(40);
  });

  it('floating 시트는 위로 드래그 시 감쇠 이동을 유지한다', () => {
    const { PanResponder } = require('react-native');
    const createSpy = jest.spyOn(PanResponder, 'create');
    const sharedValueSpy = jest.spyOn(Reanimated, 'useSharedValue');

    render(<BottomSheetOverlay component={<Text>content</Text>} />);

    const translateY = sharedValueSpy.mock.results[0].value;
    const config = createSpy.mock.calls[createSpy.mock.calls.length - 1][0];

    act(() => {
      config.onPanResponderMove({} as any, { dy: -60 } as any);
    });
    expect(translateY.value).toBe(-20);
  });

  it('fixed 시트는 드래그 중 scale 축소를 걸지 않고, 복귀 스프링에 overshootClamping을 준다', () => {
    const { PanResponder } = require('react-native');
    const createSpy = jest.spyOn(PanResponder, 'create');
    const withTimingSpy = jest.spyOn(Reanimated, 'withTiming');
    const withSpringSpy = jest.spyOn(Reanimated, 'withSpring');

    render(
      <BottomSheetOverlay component={<Text>content</Text>} options={{ type: 'fixed' }} />
    );

    const config = createSpy.mock.calls[createSpy.mock.calls.length - 1][0];
    withTimingSpy.mockClear();

    act(() => {
      config.onPanResponderGrant({} as any, {} as any);
    });
    expect(withTimingSpy.mock.calls.find(([target]) => target === 0.99)).toBeUndefined();

    act(() => {
      config.onPanResponderRelease({} as any, { dy: 20, vy: 0 } as any);
    });
    const restoreCall = withSpringSpy.mock.calls.find(
      ([target, springConfig]) => target === 0 && (springConfig as any)?.overshootClamping === true
    );
    expect(restoreCall).toBeDefined();
  });

  it('시트가 보이지 않을 때는 키보드 리스너를 등록하지 않는다', () => {
    const addListenerSpy = jest.spyOn(Keyboard, 'addListener');
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ bottomSheetVisible: false }));

    render(<BottomSheetOverlay component={<Text>content</Text>} />);

    expect(addListenerSpy).not.toHaveBeenCalled();
  });
});
