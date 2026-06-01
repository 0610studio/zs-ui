import { createElement } from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
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

  it('semantic palette의 main 키 색상을 적용한다', () => {
    const paletteFn = require('../../theme/palette').default;
    const palette = paletteFn({ mode: 'light' });
    const { getByText } = render(
      <ZSText color={'primary.main' as any}>semantic-main</ZSText>
    );

    const style = StyleSheet.flatten(getByText('semantic-main').props.style);
    expect(style.color).toBe(palette.primary.main);
  });

  it('잘못된 dot 색상 값이 들어와도 렌더링한다', () => {
    const { getByText } = render(
      <ZSText color={'unknown.50' as any}>invalid-color</ZSText>
    );

    expect(getByText('invalid-color')).toBeTruthy();
  });
});

