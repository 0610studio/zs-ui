import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import BottomSheetOverlay from '../../overlay/BottomSheetOverlay';

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
  useBottomSheet: () => ({ bottomSheetVisible: true, setBottomSheetVisible: () => {}, height: 300 })
}));

jest.mock('../../model/useFoldingState', () => ({
  __esModule: true,
  default: () => ({ width: 390 })
}));

describe('BottomSheetOverlay', () => {
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
});



