import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import LoadingNotify from '../../overlay/LoadingNotify';

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
  useLoader: () => ({ loaderVisible: true })
}));

describe('LoadingNotify', () => {
  it('custom loaderComponent를 렌더한다', () => {
    const { getByText } = render(
      <LoadingNotify loaderComponent={() => <Text>loading...</Text>} />
    );
    getByText('loading...');
  });
});



