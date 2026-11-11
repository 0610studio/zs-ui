import { Platform } from 'react-native';
import { createTypography, fontFamilyFor, IOS_TEXT_STYLE, TYPE_SCALE, TEXT_VARIANTS } from '../../theme/typeScale';

const platform = Platform as { OS: string };

describe('TYPE_SCALE', () => {
  it('글자 스타일은 웹식 이름 11개다', () => {
    expect(TEXT_VARIANTS).toEqual(['h1', 'h2', 'h3', 'h4', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'label', 'overline']);
    expect(Object.keys(TYPE_SCALE.ios)).toEqual(TEXT_VARIANTS);
    expect(Object.keys(TYPE_SCALE.android)).toEqual(TEXT_VARIANTS);
  });

  it('두 플랫폼 같은 크기표다 — JS 로 그리는 컴포넌트가 iOS·Android 에서 같은 모양', () => {
    expect(TYPE_SCALE.android).toEqual(TYPE_SCALE.ios);
  });

  it('크기·행간·굵기는 표다(iOS Dynamic Type Large 기준, 한글 행간 1.4 안팎)', () => {
    const table = TEXT_VARIANTS.map((variant) => {
      const { fontSize, lineHeight, weight, emphasizedWeight } = TYPE_SCALE.ios[variant];
      return [variant, fontSize, lineHeight, weight, emphasizedWeight];
    });
    expect(table).toEqual([
      ['h1', 34, 42, 700, 700],
      ['h2', 28, 36, 700, 700],
      ['h3', 22, 30, 700, 700],
      ['h4', 20, 28, 700, 700],
      ['subtitle1', 17, 24, 600, 700],
      ['subtitle2', 15, 22, 600, 700],
      ['body1', 17, 24, 400, 500],
      ['body2', 15, 22, 400, 600],
      ['caption', 13, 18, 400, 600],
      ['label', 12, 16, 600, 700],
      ['overline', 11, 14, 600, 700],
    ]);
  });

  it('행간은 글자 크기보다 크다(줄이 겹치지 않는다)', () => {
    for (const variant of TEXT_VARIANTS) expect(TYPE_SCALE.ios[variant].lineHeight).toBeGreaterThan(TYPE_SCALE.ios[variant].fontSize);
  });

  it('강조 굵기는 기본 굵기보다 가늘지 않다', () => {
    for (const variant of TEXT_VARIANTS) expect(TYPE_SCALE.ios[variant].emphasizedWeight).toBeGreaterThanOrEqual(TYPE_SCALE.ios[variant].weight);
  });

  it('iOS Dynamic Type 텍스트 스타일은 기본 크기가 같은 스타일이다 — body2(15) 는 subheadline', () => {
    expect(IOS_TEXT_STYLE.body2).toBe('subheadline');
    expect(IOS_TEXT_STYLE.subtitle2).toBe('subheadline');
    expect(IOS_TEXT_STYLE.body1).toBe('body');
    expect(IOS_TEXT_STYLE.h1).toBe('largeTitle');
  });

  describe('제목 위계', () => {
    const HEADINGS = ['h1', 'h2', 'h3', 'h4'] as const;
    const REST = TEXT_VARIANTS.filter((variant) => !(HEADINGS as readonly string[]).includes(variant));

    it('제목(h1~h4)은 기본부터 Bold(700)다', () => {
      for (const variant of HEADINGS) expect(TYPE_SCALE.ios[variant]).toMatchObject({ weight: 700, emphasizedWeight: 700 });
    });

    it('기본 제목은 기본 본문보다 굵다', () => {
      for (const variant of HEADINGS) expect(TYPE_SCALE.ios[variant].weight).toBeGreaterThan(TYPE_SCALE.ios.body1.weight);
    });

    it('강조 제목은 강조한 나머지 글자보다 가볍지 않다 — 강조 subtitle 이 강조 제목보다 무거운 역전이 없다', () => {
      const lightestHeading = Math.min(...HEADINGS.map((variant) => TYPE_SCALE.ios[variant].emphasizedWeight));
      const heaviestRest = Math.max(...REST.map((variant) => TYPE_SCALE.ios[variant].emphasizedWeight));
      expect(lightestHeading).toBeGreaterThanOrEqual(heaviestRest);
    });
  });
});

describe('fontFamilyFor()', () => {
  it('글꼴이 없으면 undefined 다', () => {
    expect(fontFamilyFor(undefined, 400)).toBeUndefined();
    expect(fontFamilyFor({}, 400)).toBeUndefined();
  });

  it('같은 굵기가 있으면 그 글꼴이다', () => {
    expect(fontFamilyFor({ 400: 'Regular', 700: 'Bold' }, 700)).toBe('Bold');
  });

  it('없는 굵기는 가장 가까운 굵기로 대신한다', () => {
    const fonts = { 300: 'Light', 700: 'Bold' };
    expect(fontFamilyFor(fonts, 400)).toBe('Light');
    expect(fontFamilyFor(fonts, 600)).toBe('Bold');
    expect(fontFamilyFor({ 900: 'Black' }, 100)).toBe('Black');
  });

  it('거리가 같으면 더 굵은 쪽을 고른다', () => {
    expect(fontFamilyFor({ 400: 'Regular', 600: 'SemiBold' }, 500)).toBe('SemiBold');
  });
});

describe('createTypography()', () => {
  afterEach(() => {
    platform.OS = 'ios';
  });

  it('글꼴이 없으면 시스템 글꼴에 fontWeight 를 문자열로 준다', () => {
    const typography = createTypography(undefined, 'ios');
    expect(typography.body2).toEqual({ fontSize: 15, lineHeight: 22, fontWeight: '400' });
    expect(typography.emphasized.body2).toEqual({ fontSize: 15, lineHeight: 22, fontWeight: '600' });
    expect(typography.h2.fontWeight).toBe('700');
    expect(typography.emphasized.subtitle1.fontWeight).toBe('700');
  });

  it('자간은 큰 제목일수록 좁고(h1 −0.8 · h2 −0.5 · h3·h4 −0.3 · subtitle1 −0.2 · body1 −0.1), 0 이면 넣지 않는다', () => {
    const typography = createTypography(undefined, 'ios');
    const tracking = TEXT_VARIANTS.map((variant) => [variant, typography[variant].letterSpacing]);
    expect(tracking).toEqual([
      ['h1', -0.8],
      ['h2', -0.5],
      ['h3', -0.3],
      ['h4', -0.3],
      ['subtitle1', -0.2],
      ['subtitle2', undefined],
      ['body1', -0.1],
      ['body2', undefined],
      ['caption', undefined],
      ['label', undefined],
      ['overline', undefined],
    ]);
    expect(typography.emphasized.h1.letterSpacing).toBe(-0.8);
    expect(typography.caption).not.toHaveProperty('letterSpacing');
  });

  it('글꼴이 있으면 굵기별 글꼴 이름만 주고 fontWeight 는 넣지 않는다', () => {
    const typography = createTypography({ 400: 'Pretendard-Regular', 600: 'Pretendard-SemiBold', 700: 'Pretendard-Bold' }, 'ios');
    expect(typography.body1).toEqual({ fontSize: 17, lineHeight: 24, letterSpacing: -0.1, fontFamily: 'Pretendard-Regular' });
    expect(typography.subtitle1).toEqual({ fontSize: 17, lineHeight: 24, letterSpacing: -0.2, fontFamily: 'Pretendard-SemiBold' });
    expect(typography.h1.fontFamily).toBe('Pretendard-Bold');
    expect(typography.emphasized.subtitle1.fontFamily).toBe('Pretendard-Bold');
    expect(typography.body1).not.toHaveProperty('fontWeight');
  });

  it('500 글꼴이 없으면 강조 본문은 가까운 굵은 쪽(600) 글꼴을 쓴다', () => {
    const typography = createTypography({ 400: 'Pretendard-Regular', 600: 'Pretendard-SemiBold' }, 'ios');
    expect(typography.emphasized.body1.fontFamily).toBe('Pretendard-SemiBold');
  });

  it('Android 도 같은 크기·굵기·자간이다', () => {
    expect(createTypography(undefined, 'android')).toEqual(createTypography(undefined, 'ios'));
    expect(createTypography(undefined, 'android').body1).toEqual({ fontSize: 17, lineHeight: 24, letterSpacing: -0.1, fontWeight: '400' });
  });

  it('플랫폼을 넘기지 않으면 현재 Platform.OS 를 따른다', () => {
    expect(createTypography(undefined).h1).toEqual(createTypography(undefined, 'ios').h1);
    platform.OS = 'android';
    expect(createTypography(undefined).h1).toEqual(createTypography(undefined, 'android').h1);
  });

  it('모든 variant 에 기본·강조 스타일이 있다', () => {
    const typography = createTypography(undefined, 'ios');
    for (const role of TEXT_VARIANTS) {
      expect(typography[role].fontSize).toBe(TYPE_SCALE.ios[role].fontSize);
      expect(typography.emphasized[role].lineHeight).toBe(TYPE_SCALE.ios[role].lineHeight);
    }
  });
});
