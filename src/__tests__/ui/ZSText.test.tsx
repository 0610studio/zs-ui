import React, { createElement } from 'react';
import { render } from '@testing-library/react-native';
import ZSText from '../../ui/ZSText';

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

describe('ZSText', () => {
  it('텍스트를 표시한다', () => {
    const { getByText } = render(createElement(ZSText, null, 'hello-zs'));
    getByText('hello-zs');
  });
});



