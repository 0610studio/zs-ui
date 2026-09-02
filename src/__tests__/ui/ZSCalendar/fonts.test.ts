import type * as SkiaModule from '@shopify/react-native-skia';
import type * as FontsModule from '../../../ui/ZSCalendar/skia/fonts';

/**
 * RN Skia matchFont 의 기본 family 'System' 은 Android 시스템 폰트 매니저에 없어 typeface 가 null 이 되고
 * 날짜 숫자가 통째로 사라진다 — 플랫폼별로 존재하는 family 를 반드시 명시해야 한다.
 */
describe('ZSCalendar skia/fonts — 시스템 폰트 family', () => {
  // resetModules 뒤에는 모듈 인스턴스가 새로 생기므로 spy 도 같은 인스턴스에 걸어야 한다
  const load = (os: 'android' | 'ios') => {
    jest.resetModules();
    jest.doMock('react-native', () => ({ Platform: { OS: os } }));
    /* eslint-disable @typescript-eslint/no-var-requires */
    const skia = require('@shopify/react-native-skia') as typeof SkiaModule;
    const fonts = require('../../../ui/ZSCalendar/skia/fonts') as typeof FontsModule;
    /* eslint-enable @typescript-eslint/no-var-requires */
    return { fonts, matchFont: jest.spyOn(skia, 'matchFont') };
  };

  afterEach(() => {
    jest.dontMock('react-native');
    jest.restoreAllMocks();
  });

  it('Android 는 sans-serif 를 명시한다 — 기본값 System 은 typeface 를 못 찾는다', () => {
    const { fonts, matchFont } = load('android');
    fonts.buildCalendarFonts({ dayFontSize: 15 });
    expect(matchFont).toHaveBeenCalledWith(expect.objectContaining({ fontFamily: 'sans-serif', fontSize: 15, fontWeight: '500' }), undefined);
    expect(matchFont).toHaveBeenCalledWith(expect.objectContaining({ fontFamily: 'sans-serif', fontWeight: '700' }), undefined);
  });

  it('iOS 는 System 을 쓴다', () => {
    const { fonts, matchFont } = load('ios');
    fonts.buildCalendarFonts({ dayFontSize: 15 });
    expect(matchFont).toHaveBeenCalledWith(expect.objectContaining({ fontFamily: 'System' }), undefined);
  });

  it('폰트 provider 를 주면 등록한 family 와 provider 로 매칭한다', () => {
    const { fonts, matchFont } = load('android');
    const provider = { __provider: true } as unknown as SkiaModule.SkTypefaceFontProvider;
    fonts.buildCalendarFonts({ dayFontSize: 13, fontProvider: provider, fontFamily: fonts.CALENDAR_FONT_FAMILY });
    expect(matchFont).toHaveBeenCalledWith(expect.objectContaining({ fontFamily: fonts.CALENDAR_FONT_FAMILY }), provider);
  });
});

describe('ZSCalendar skia/fonts — 테마 폰트 파일 고르기', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { resolveCalendarFontSources } = require('../../../ui/ZSCalendar/skia/fonts') as typeof FontsModule;

  it('400 을 보통, 700 을 굵게로 쓴다', () => {
    expect(resolveCalendarFontSources({ 400: 1, 700: 2 })).toEqual({ regular: 1, bold: 2 });
  });

  it('정확한 굵기가 없으면 가까운 굵기로 내려간다', () => {
    expect(resolveCalendarFontSources({ 500: 5, 600: 6 })).toEqual({ regular: 5, bold: 6 });
  });

  it('보통만 있으면 굵게도 그 파일을 쓴다 — 선택 숫자가 사라지지 않게', () => {
    expect(resolveCalendarFontSources({ 400: 1 })).toEqual({ regular: 1, bold: 1 });
  });

  it('비어 있으면 undefined — 시스템 폰트로 간다', () => {
    expect(resolveCalendarFontSources(undefined)).toBeUndefined();
    expect(resolveCalendarFontSources({})).toBeUndefined();
  });
});
