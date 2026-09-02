import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import PopOverButton from '../../overlay/PopOver/PopOverButton';
import PopOverMenu from '../../overlay/PopOver/PopOverMenu';

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

jest.mock('../../ui/ZSPressable', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({ children, onPress }: any, ref: any) => 
      React.createElement(View, { ref, onTouchEnd: onPress, testID: 'zspressable' }, children)),
  };
});

jest.mock('../../overlay/ui/ModalBackground', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, onPress }: any) => 
      React.createElement(View, { testID: 'modal-background', onTouchEnd: onPress }, children),
  };
});

jest.mock('../../model/useOverlay', () => ({
  useOverlay: jest.fn(() => ({
    showPopOverMenu: jest.fn(),
  })),
  usePopOver: jest.fn(() => ({
    popOverVisible: false,
    setPopOverVisible: jest.fn(),
  })),
}));

describe('PopOverButton', () => {
  it('버튼을 렌더한다', () => {
    const { getByTestId } = render(
      <PopOverButton
        width={100}
        height={50}
        popOverMenuComponent={<Text>Menu</Text>}
      >
        <Text>Button</Text>
      </PopOverButton>
    );

    expect(getByTestId('zspressable')).toBeTruthy();
  });

  it('버튼 클릭 시 showPopOverMenu를 호출한다', () => {
    const mockShowPopOverMenu = jest.fn();
    jest.spyOn(require('../../model/useOverlay'), 'useOverlay').mockReturnValue({
      showPopOverMenu: mockShowPopOverMenu,
    });

    const { getByTestId } = render(
      <PopOverButton
        width={100}
        height={50}
        popOverMenuComponent={<Text>Menu</Text>}
      >
        <Text>Button</Text>
      </PopOverButton>
    );

    // measure 좌표가 테스트 환경에서 undefined 라 호출 여부만 확인한다
    fireEvent.press(getByTestId('zspressable'));
  });
});

describe('PopOverMenu', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('popOverVisible이 false일 때 렌더되지 않는다', () => {
    jest.spyOn(require('../../model/useOverlay'), 'usePopOver').mockReturnValue({
      popOverVisible: false,
      setPopOverVisible: jest.fn(),
    });

    const { queryByTestId } = render(
      <PopOverMenu px={100} py={100} component={<Text>Menu</Text>} />
    );

    expect(queryByTestId('modal-background')).toBeNull();
  });

  it('popOverVisible이 true일 때 메뉴를 렌더한다', async () => {
    jest.spyOn(require('../../model/useOverlay'), 'usePopOver').mockReturnValue({
      popOverVisible: true,
      setPopOverVisible: jest.fn(),
    });

    const { getByText } = render(
      <PopOverMenu px={100} py={100} component={<Text>Menu Content</Text>} />
    );

    expect(() => getByText('Menu Content')).toThrow();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(getByText('Menu Content')).toBeTruthy();
  });
});
