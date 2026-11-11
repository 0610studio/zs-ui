import { render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import ZSText from '../../ui/ZSText';
import { getTestTheme, setTestTheme } from '../utils/theme';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const styleOf = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style);

describe('ZSText', () => {
  afterEach(() => {
    platform.OS = 'ios';
    setTestTheme();
  });

  it('기본은 body1 스타일·text 색이다', async () => {
    const { typography, colors } = getTestTheme();
    await render(<ZSText>본문</ZSText>);
    expect(styleOf('본문')).toEqual({ ...typography.body1, color: colors.text });
  });

  it('variant 스타일의 크기·굵기를 쓴다', async () => {
    const { typography } = getTestTheme();
    await render(<ZSText variant="h1">제목</ZSText>);
    expect(styleOf('제목')).toMatchObject({ fontSize: typography.h1.fontSize, lineHeight: typography.h1.lineHeight, fontWeight: typography.h1.fontWeight });
  });

  it('emphasized 면 강조 굵기를 쓴다', async () => {
    await render(
      <>
        <ZSText variant="body1">보통</ZSText>
        <ZSText variant="body1" emphasized>강조</ZSText>
      </>,
    );
    const { typography } = getTestTheme();
    expect(styleOf('보통').fontWeight).toBe(typography.body1.fontWeight);
    expect(styleOf('강조').fontWeight).toBe(typography.emphasized.body1.fontWeight);
    expect(styleOf('보통').fontWeight).not.toBe(styleOf('강조').fontWeight);
  });

  it('color 는 테마 색 이름이면 그 색, 아니면 직접 지정한 색이다', async () => {
    const { colors } = getTestTheme();
    await render(
      <>
        <ZSText color="error">테마</ZSText>
        <ZSText color="#123456">직접</ZSText>
      </>,
    );
    expect(styleOf('테마').color).toBe(colors.error);
    expect(styleOf('직접').color).toBe('#123456');
  });

  it('다크 테마면 다크 text 를 쓴다', async () => {
    const light = getTestTheme().colors.text;
    const dark = setTestTheme({ mode: 'dark' }).colors.text;
    await render(<ZSText>다크</ZSText>);
    expect(styleOf('다크').color).toBe(dark);
    expect(dark).not.toBe(light);
  });

  it('style 이 테마 스타일보다 우선한다', async () => {
    await render(
      <ZSText variant="caption" color="primary" style={{ color: 'red', fontSize: 40 }}>
        덮어쓰기
      </ZSText>,
    );
    expect(styleOf('덮어쓰기')).toMatchObject({ color: 'red', fontSize: 40, lineHeight: 18 });
  });

  it('iOS 는 스타일에 맞는 Dynamic Type 텍스트 스타일을 램프로 지정한다', async () => {
    await render(
      <>
        <ZSText variant="overline">램프</ZSText>
        <ZSText variant="subtitle1">제목 램프</ZSText>
      </>,
    );
    expect(screen.getByText('램프').props.dynamicTypeRamp).toBe('caption2');
    expect(screen.getByText('제목 램프').props.dynamicTypeRamp).toBe('headline');
  });

  it('Android 는 dynamicTypeRamp 를 넘기지 않는다', async () => {
    platform.OS = 'android';
    await render(<ZSText variant="overline">안드로이드</ZSText>);
    expect(screen.getByText('안드로이드').props.dynamicTypeRamp).toBeUndefined();
  });

  describe('한국어 줄바꿈', () => {
    it('iOS 는 기본으로 어절(띄어쓰기) 단위로 줄을 바꾼다', async () => {
      await render(<ZSText>띄어쓰기 단위로 줄을 바꾼다</ZSText>);
      expect(screen.getByText('띄어쓰기 단위로 줄을 바꾼다').props.lineBreakStrategyIOS).toBe('hangul-word');
    });

    it('앱이 lineBreakStrategyIOS 를 주면 그 값을 쓴다', async () => {
      await render(<ZSText lineBreakStrategyIOS="standard">덮어쓰기</ZSText>);
      expect(screen.getByText('덮어쓰기').props.lineBreakStrategyIOS).toBe('standard');
    });

    it('Android 는 넘기지 않는다 — React Native 에 단어 단위 줄바꿈 수단이 없다', async () => {
      platform.OS = 'android';
      await render(<ZSText>안드로이드</ZSText>);
      expect(screen.getByText('안드로이드').props.lineBreakStrategyIOS).toBeUndefined();
    });
  });

  describe('글자 확대 상한', () => {
    it('prop 이 없으면 앱 상한(ThemeProvider, 기본 2배)을 쓴다', async () => {
      await render(<ZSText>기본</ZSText>);
      expect(screen.getByText('기본').props.maxFontSizeMultiplier).toBe(2);
      setTestTheme({ maxFontSizeMultiplier: 1.5 });
      await render(<ZSText>앱 상한</ZSText>);
      expect(screen.getByText('앱 상한').props.maxFontSizeMultiplier).toBe(1.5);
    });

    it('prop 이 앱 상한보다 우선한다 — undefined 로 넘겨도 앱 상한이 빠지지 않는다', async () => {
      await render(<ZSText maxFontSizeMultiplier={1.2}>좁은 곳</ZSText>);
      expect(screen.getByText('좁은 곳').props.maxFontSizeMultiplier).toBe(1.2);
      await render(<ZSText maxFontSizeMultiplier={undefined}>그대로 전달</ZSText>);
      expect(screen.getByText('그대로 전달').props.maxFontSizeMultiplier).toBe(2);
    });

    it('앱 상한이 0 이면 제한하지 않는다(RN 규칙)', async () => {
      setTestTheme({ maxFontSizeMultiplier: 0 });
      await render(<ZSText>제한 없음</ZSText>);
      expect(screen.getByText('제한 없음').props.maxFontSizeMultiplier).toBe(0);
    });
  });

  it('ZSSkeleton 밖에서는 onTextLayout 을 그대로 넘긴다', async () => {
    const onTextLayout = jest.fn();
    await render(<ZSText onTextLayout={onTextLayout}>배치</ZSText>);
    expect(screen.getByText('배치').props.onTextLayout).toBe(onTextLayout);
  });

  it('나머지 Text props 를 그대로 넘긴다', async () => {
    await render(
      <ZSText numberOfLines={2} accessibilityRole="header">
        props
      </ZSText>,
    );
    expect(screen.getByText('props').props).toMatchObject({ numberOfLines: 2, accessibilityRole: 'header' });
  });
});
