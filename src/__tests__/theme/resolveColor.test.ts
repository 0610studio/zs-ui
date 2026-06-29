import palette from '../../theme/palette';
import { resolveTextColor, resolveViewColor } from '../../theme/resolveColor';

const theme = palette({ mode: 'light' });

describe('resolveTextColor()', () => {
  it('단일 토큰("base")은 palette.text 에서 해석한다', () => {
    expect(resolveTextColor(theme, 'base')).toBe(theme.text.base);
  });

  it('"text.*" 토큰은 palette.text 에서 해석한다', () => {
    expect(resolveTextColor(theme, 'text.primary')).toBe(theme.text.primary);
  });

  it('"background.*" 토큰은 palette.background 에서 해석한다', () => {
    expect(resolveTextColor(theme, 'background.base')).toBe(theme.background.base);
  });

  it('"semantic.shade" 토큰은 해당 팔레트에서 해석한다', () => {
    expect(resolveTextColor(theme, 'danger.50')).toBe(theme.danger[50]);
  });

  it('컬러맵이 아닌 키는 undefined 를 반환한다', () => {
    expect(resolveTextColor(theme, 'mode.light')).toBeUndefined();
  });
});

describe('resolveViewColor()', () => {
  it('"background.*" 토큰은 palette.background 에서 해석한다', () => {
    expect(resolveViewColor(theme, 'background.base')).toBe(theme.background.base);
  });

  it('"text.*" 토큰은 palette.text 에서 해석한다', () => {
    expect(resolveViewColor(theme, 'text.primary')).toBe(theme.text.primary);
  });

  it('"semantic.shade" 토큰은 해당 팔레트에서 해석한다', () => {
    expect(resolveViewColor(theme, 'primary.10')).toBe(theme.primary[10]);
  });

  it('컬러맵이 아닌 키(shade 포함)는 undefined 를 반환한다', () => {
    expect(resolveViewColor(theme, 'mode.light')).toBeUndefined();
  });

  it('background 에 존재하는 단일 키는 background 값을 반환한다', () => {
    expect(resolveViewColor(theme, 'neutral')).toBe(theme.background.neutral);
  });

  it('background 에 없는 단일 키는 semantic.main 으로 폴백한다', () => {
    expect(resolveViewColor(theme, 'grey')).toBe(theme.grey.main);
  });

  it('빈 문자열은 undefined 를 반환한다', () => {
    expect(resolveViewColor(theme, '')).toBeUndefined();
  });
});
