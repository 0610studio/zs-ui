import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSView from '../../ui/ZSView';

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

jest.mock('../../ui/atoms/AnimatedWrapper', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

describe('ZSView', () => {
  it('children을 렌더한다', () => {
    const { getByText } = render(
      <ZSView>
        <Text>Test Content</Text>
      </ZSView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('기본 props를 적용한다', () => {
    const { getByText } = render(
      <ZSView isAnimation={false} elevationLevel={2}>
        <Text>Test Content</Text>
      </ZSView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('color prop을 받는다', () => {
    const { getByText } = render(
      <ZSView color="primary">
        <Text>Test Content</Text>
      </ZSView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
});

