import { capFontScale, DEFAULT_MAX_FONT_SIZE_MULTIPLIER, dynamicTypeSizeLimit, minFontSizeMultiplier } from '../../theme/fontScale';

describe('글자 확대 상한', () => {
  it('기본 상한은 Android 시스템 최대(200%)와 같은 2배다', () => {
    expect(DEFAULT_MAX_FONT_SIZE_MULTIPLIER).toBe(2);
  });

  it('capFontScale — 1 이상이면 그 배율까지, 0·미지정은 시스템 배율 그대로', () => {
    expect(capFontScale(3.571, 2)).toBe(2);
    expect(capFontScale(1.5, 2)).toBe(1.5);
    expect(capFontScale(3.571, 0)).toBe(3.571);
    expect(capFontScale(3.571, undefined)).toBe(3.571);
  });

  it('minFontSizeMultiplier — 컴포넌트 자체 상한보다 앱 상한이 낮으면 앱 상한', () => {
    expect(minFontSizeMultiplier(1.6, 2)).toBe(1.6);
    expect(minFontSizeMultiplier(1.6, 1.3)).toBe(1.3);
    expect(minFontSizeMultiplier(1.6, 0)).toBe(1.6);
    expect(minFontSizeMultiplier(1.6, undefined)).toBe(1.6);
  });

  it('dynamicTypeSizeLimit — body 배율(HIG 크기표 ÷ 17pt)이 상한을 넘지 않는 가장 큰 단계', () => {
    expect(dynamicTypeSizeLimit(2)).toBe('accessibility2');
    expect(dynamicTypeSizeLimit(1.3)).toBe('xxLarge');
    expect(dynamicTypeSizeLimit(1.36)).toBe('xxxLarge');
    expect(dynamicTypeSizeLimit(1)).toBe('large');
    expect(dynamicTypeSizeLimit(3)).toBe('accessibility4');
  });

  it('dynamicTypeSizeLimit — 상한이 없거나 가장 큰 단계(AX5 53pt)까지 허용하면 제한하지 않는다', () => {
    expect(dynamicTypeSizeLimit(0)).toBeUndefined();
    expect(dynamicTypeSizeLimit(undefined)).toBeUndefined();
    expect(dynamicTypeSizeLimit(3.2)).toBeUndefined();
  });
});
