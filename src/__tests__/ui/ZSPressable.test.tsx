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
});
