import { Platform } from 'react-native';
import { Hct, argbFromHex } from '@material/material-color-utilities';
import { iosBadgeBackground, resolveTabTheme } from '../../navigation/tabTheme';
import { createThemeColors, DEFAULT_COLORS, type ColorMode } from '../../theme/color';
import { contrastRatio } from '../utils/contrast';

const platform = Platform as { OS: string };
const rolesOf = (mode: ColorMode, contrastLevel = 0) => createThemeColors(DEFAULT_COLORS, { mode, contrastLevel });
const hue = (hex: string) => Hct.fromInt(argbFromHex(hex)).hue;
const FONTS = { 400: 'R', 500: 'M', 700: 'B' };

describe('resolveTabTheme', () => {
  afterEach(() => {
    platform.OS = 'ios';
  });

  describe('iOS — 선택 색만 넘기고 바 재질·비선택 색·서체는 시스템(Liquid Glass)', () => {
    it.each(['light', 'dark'] as const)('%s: 선택은 주색 표시색(primaryMark), 배경·비선택·서체는 비운다', (mode) => {
      const colors = rolesOf(mode);
      const theme = resolveTabTheme(colors, FONTS);
      expect(theme.colors).toMatchObject({
        background: undefined,
        selected: colors.primaryMark,
        selectedLabel: colors.primaryMark,
        unselectedIcon: undefined,
        unselectedLabel: undefined,
      });
      expect(theme.fontFamily).toBeUndefined();
    });
  });

  describe('Android — M3 내비게이션 바 역할, 선택은 주 색', () => {
    beforeEach(() => {
      platform.OS = 'android';
    });

    it.each(['light', 'dark'] as const)('%s: surface3 바, 선택 아이콘·라벨 primaryMark, 한 단계 짙은 surface4 선택 바탕, 비활성은 본문 색(text)', (mode) => {
      const colors = rolesOf(mode);
      expect(resolveTabTheme(colors, undefined).colors).toEqual({
        background: colors.surface3,
        selected: colors.primaryMark,
        selectedLabel: colors.primaryMark,
        unselectedIcon: colors.text,
        unselectedLabel: colors.text,
        indicator: colors.surface4,
        ripple: `${colors.text}1a`,
        badgeBackground: colors.error,
        badgeText: colors.onError,
      });
    });

    it('비선택 아이콘·라벨 색을 덮어쓸 수 있다 — 하나만 주면 다른 하나는 기본(text)', () => {
      const colors = rolesOf('light');
      expect(resolveTabTheme(colors, undefined, { icon: '#111111' }).colors).toMatchObject({ unselectedIcon: '#111111', unselectedLabel: colors.text });
      expect(resolveTabTheme(colors, undefined, { label: '#222222' }).colors).toMatchObject({ unselectedIcon: colors.text, unselectedLabel: '#222222' });
    });

    it('라벨 서체는 M3 label 굵기(500)에 가장 가까운 브랜드 글꼴, 없으면 시스템', () => {
      const colors = rolesOf('light');
      expect(resolveTabTheme(colors, FONTS).fontFamily).toBe('M');
      expect(resolveTabTheme(colors, { 400: 'R', 600: 'SB' }).fontFamily).toBe('SB');
      expect(resolveTabTheme(colors, undefined).fontFamily).toBeUndefined();
    });
  });

  describe('뱃지 — iOS 는 숫자가 시스템 흰색 고정이라 바탕만 맞춘다', () => {
    it('iOS 라이트는 error 바탕 그대로, 숫자는 흰색', () => {
      const colors = rolesOf('light');
      expect(resolveTabTheme(colors, undefined).colors).toMatchObject({ badgeBackground: colors.error, badgeText: '#ffffff', indicator: colors.surface4 });
    });

    it.each([0, 0.5, 1])('iOS 다크(대비 %s)는 밝은 error 대신 같은 색조의 진한 빨강 — 흰 숫자와 4.5:1 이상', (contrastLevel) => {
      const colors = rolesOf('dark', contrastLevel);
      expect(contrastRatio('#ffffff', colors.error)).toBeLessThan(4.5);
      const { badgeBackground, badgeText } = resolveTabTheme(colors, undefined).colors;
      expect(badgeText).toBe('#ffffff');
      expect(contrastRatio(badgeText, badgeBackground)).toBeGreaterThanOrEqual(4.5);
      expect(Math.abs(hue(badgeBackground) - hue(colors.error))).toBeLessThan(3);
    });

    it('iOS 다크 바탕은 라이트 error 와 같은 색조의 빨강이고, 라이트 error 보다 밝지 않다', () => {
      const dark = resolveTabTheme(rolesOf('dark'), undefined).colors.badgeBackground;
      const light = rolesOf('light').error;
      expect(Math.abs(hue(dark) - hue(light))).toBeLessThan(3);
      expect(Hct.fromInt(argbFromHex(dark)).tone).toBeLessThanOrEqual(Hct.fromInt(argbFromHex(light)).tone + 1);
    });

    it('iosBadgeBackground — 흰색과 4.5:1 이 되는 진한 색은 그대로 둔다', () => {
      expect(iosBadgeBackground('#ba1241')).toBe('#ba1241');
      expect(iosBadgeBackground('#5f001c')).toBe('#5f001c');
      expect(contrastRatio('#ffffff', iosBadgeBackground('#ffb4ab'))).toBeGreaterThanOrEqual(4.5);
    });

    it.each(['light', 'dark'] as const)('Android %s 는 error·onError 그대로 — 숫자 색을 받는다', (mode) => {
      platform.OS = 'android';
      const colors = rolesOf(mode);
      const { badgeBackground, badgeText } = resolveTabTheme(colors, undefined).colors;
      expect({ badgeBackground, badgeText }).toEqual({ badgeBackground: colors.error, badgeText: colors.onError });
      expect(contrastRatio(badgeText, badgeBackground)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
