import React from 'react';
import { act, render } from '@testing-library/react-native';
import { BackHandler, Text } from 'react-native';
import { OverlayProvider } from '../../context/OverlayContext';
import { useOverlay } from '../../model/useOverlay';
import type { OverlayContextProps } from '../../model/types';

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

jest.mock('../../model/useFoldingState', () => ({
  __esModule: true,
  useFoldingState: () => ({ width: 390 }),
  default: () => ({ width: 390 }),
}));

const pressBack = () => (BackHandler as any).mockPressBack() as boolean;

let overlay: OverlayContextProps;

function CaptureOverlay() {
  overlay = useOverlay();
  return null;
}

const renderProvider = () =>
  render(
    <OverlayProvider>
      <CaptureOverlay />
    </OverlayProvider>
  );

describe('OverlayProvider 통합', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('시트 위에 Alert가 떠 있으면 back 한 번에 Alert만 닫히고, 다시 back에 시트가 닫힌다', () => {
    const { getByText, queryByText } = renderProvider();

    act(() => {
      overlay.showBottomSheet({ component: <Text>sheet-body</Text> });
    });
    act(() => {
      overlay.showAlert({ title: 'alert-title', actions: { primary: { label: '확인' } } });
    });

    getByText('sheet-body');
    getByText('alert-title');

    act(() => {
      expect(pressBack()).toBe(true);
    });
    expect(queryByText('alert-title')).toBeNull();
    expect(getByText('sheet-body')).toBeTruthy();

    act(() => {
      expect(pressBack()).toBe(true);
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(queryByText('sheet-body')).toBeNull();
  });

  it('dismissable: false 시트는 back을 소비만 하고 닫히지 않는다', () => {
    const { getByText } = renderProvider();

    act(() => {
      overlay.showBottomSheet({
        component: <Text>locked-sheet</Text>,
        options: { dismissable: false },
      });
    });

    let consumed = false;
    act(() => {
      consumed = pressBack();
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(consumed).toBe(true);
    expect(getByText('locked-sheet')).toBeTruthy();
  });

  it('onClose는 hideOverlay 경로에서 정확히 한 번 발화한다', () => {
    const onClose = jest.fn();
    renderProvider();

    act(() => {
      overlay.showBottomSheet({ component: <Text>sheet</Text>, options: { onClose } });
    });
    act(() => {
      overlay.hideOverlay('bottomSheet');
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    // 이미 닫힌 뒤 다시 닫아도 재발화하지 않는다
    act(() => {
      overlay.hideOverlay('all');
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('onClose는 back으로 닫혀도 발화하고, 재열림 시 새 onClose로 교체된다', () => {
    const firstClose = jest.fn();
    const secondClose = jest.fn();
    renderProvider();

    act(() => {
      overlay.showBottomSheet({ component: <Text>sheet</Text>, options: { onClose: firstClose } });
    });
    act(() => {
      pressBack();
    });
    expect(firstClose).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    act(() => {
      overlay.showBottomSheet({ component: <Text>sheet2</Text>, options: { onClose: secondClose } });
    });
    act(() => {
      overlay.hideOverlay('bottomSheet');
    });

    expect(firstClose).toHaveBeenCalledTimes(1);
    expect(secondClose).toHaveBeenCalledTimes(1);
  });

  it('hideOverlay() 인자 생략 시 모든 오버레이를 닫는다', () => {
    const { queryByText } = renderProvider();

    act(() => {
      overlay.showBottomSheet({ component: <Text>sheet-body</Text> });
    });
    act(() => {
      overlay.showAlert({ title: 'alert-title', actions: { primary: { label: '확인' } } });
    });

    act(() => {
      overlay.hideOverlay();
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(queryByText('alert-title')).toBeNull();
    expect(queryByText('sheet-body')).toBeNull();
  });

  it('로더가 떠 있으면 back을 소비만 하고 아무것도 닫지 않는다', () => {
    const { getByText } = renderProvider();

    act(() => {
      overlay.showBottomSheet({ component: <Text>sheet-body</Text> });
    });
    act(() => {
      overlay.showLoader();
    });

    let consumed = false;
    act(() => {
      consumed = pressBack();
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(consumed).toBe(true);
    expect(getByText('sheet-body')).toBeTruthy();
  });
});
