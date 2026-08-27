import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSPressable from '../../ui/ZSPressable';

jest.mock('../../ui/atoms/AnimatedWrapper', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

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

describe('ZSPressable', () => {
  it('children을 렌더한다', () => {
    const { getByText } = render(
      <ZSPressable>
        <Text>Test Button</Text>
      </ZSPressable>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('onPress 핸들러를 호출한다', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ZSPressable onPress={mockOnPress}>
        <Text>Test Button</Text>
      </ZSPressable>
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('onLongPress 핸들러를 호출한다', () => {
    const mockOnLongPress = jest.fn();
    const { getByText } = render(
      <ZSPressable onLongPress={mockOnLongPress}>
        <Text>Test Button</Text>
      </ZSPressable>
    );

    fireEvent(getByText('Test Button'), 'onLongPress');
    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  it('isAnimation prop을 받는다', () => {
    const { getByText } = render(
      <ZSPressable isAnimation={false}>
        <Text>Test Button</Text>
      </ZSPressable>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('fullWidth prop을 받는다', () => {
    const { getByText } = render(
      <ZSPressable fullWidth={true}>
        <Text>Test Button</Text>
      </ZSPressable>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  describe('preventDoublePress', () => {
    let now = 0;

    beforeEach(() => {
      now = 1_000_000;
      jest.spyOn(Date, 'now').mockImplementation(() => now);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('기본 디바운스(300ms)가 지나면 다시 눌린다', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <ZSPressable onPress={onPress}>
          <Text>Test Button</Text>
        </ZSPressable>
      );

      fireEvent.press(getByText('Test Button'));
      now += 300;
      fireEvent.press(getByText('Test Button'));

      expect(onPress).toHaveBeenCalledTimes(2);
    });

    it('true면 2초 잠금이 걸려 그 사이 연타가 막힌다', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <ZSPressable onPress={onPress} preventDoublePress>
          <Text>Test Button</Text>
        </ZSPressable>
      );

      fireEvent.press(getByText('Test Button'));
      now += 300;
      fireEvent.press(getByText('Test Button'));
      expect(onPress).toHaveBeenCalledTimes(1);

      now += 1700;
      fireEvent.press(getByText('Test Button'));
      expect(onPress).toHaveBeenCalledTimes(2);
    });
  });
});
