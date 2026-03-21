import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
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

describe('BottomSheetOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
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

    const { getByText, rerender, UNSAFE_getAllByType } = render(
      <BottomSheetOverlay
        headerComponent={<Text>header</Text>}
        component={<Text>content</Text>}
      />
    );

    const sheetContainer = UNSAFE_getAllByType(View).find((node) => typeof node.props.onLayout === 'function');

    expect(sheetContainer).toBeDefined();

    act(() => {
      fireEvent(sheetContainer!, 'layout', {
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
    expect(withTimingSpy).toHaveBeenCalledTimes(1);
    expect(withTimingSpy).toHaveBeenLastCalledWith(380, { duration: 150 });

    act(() => {
      fireEvent(sheetContainer!, 'layout', {
        nativeEvent: { layout: { height: 420 } },
      });
    });

    expect(withTimingSpy).toHaveBeenCalledTimes(1);
  });
});
