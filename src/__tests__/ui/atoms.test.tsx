import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import TextAtom from '../../ui/atoms/TextAtom';
import ViewAtom from '../../ui/atoms/ViewAtom';

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

describe('TextAtom', () => {
  it('children을 렌더한다', () => {
    const { getByText } = render(
      <TextAtom>Test Text</TextAtom>
    );

    expect(getByText('Test Text')).toBeTruthy();
  });

  it('style prop을 받는다', () => {
    const { getByText } = render(
      <TextAtom style={{ color: 'red' }}>Test Text</TextAtom>
    );

    expect(getByText('Test Text')).toBeTruthy();
  });
});

describe('ViewAtom', () => {
  it('children을 렌더한다', () => {
    const { getByText } = render(
      <ViewAtom>
        <Text>Test Content</Text>
      </ViewAtom>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('style prop을 받는다', () => {
    const { getByText } = render(
      <ViewAtom style={{ backgroundColor: 'red' }}>
        <Text>Test Content</Text>
      </ViewAtom>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
});

