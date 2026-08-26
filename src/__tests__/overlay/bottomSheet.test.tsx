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

// translateY 닫힘 호출만 골라낸다 (backdrop 0/1, scale, keyboard 호출과 구분).
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

    // 닫힘 애니메이션이 도는 동안에는 아직 마운트되어 있다.
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

    // 닫힘 timing 완료 콜백이 실행되면 언마운트된다 (setTimeout 지연이 아니라 애니메이션 완료 기준).
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

    // keyboardOffset 목표값 -300 (insets 0), duration 250 — translateY 닫힘 timing과 무관.
    const keyboardCall = withTimingSpy.mock.calls.find(([target]) => target === -300);
    expect(keyboardCall).toBeDefined();
    expect(keyboardCall![1]).toEqual(expect.objectContaining({ duration: 250 }));
    expect(closeCallsOf(withTimingSpy)).toHaveLength(0);
  });

  it('시트가 보이지 않을 때는 키보드 리스너를 등록하지 않는다', () => {
    const addListenerSpy = jest.spyOn(Keyboard, 'addListener');
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ bottomSheetVisible: false }));

    render(<BottomSheetOverlay component={<Text>content</Text>} />);

    expect(addListenerSpy).not.toHaveBeenCalled();
  });
});
