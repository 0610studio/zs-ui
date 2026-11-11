import React from 'react';
import { badgeText, collectScreens, resolveNavigationMode, ZSTabNavigatorScreen } from '../../navigation/ZSTabNavigatorScreen';

describe('ZSTabNavigatorScreen helpers', () => {
  it('ZSTabNavigator.Screen 은 단독으로 아무것도 그리지 않는다', () => {
    expect(ZSTabNavigatorScreen({ name: 'a', options: { title: 'A' } })).toBeNull();
  });

  it('자식 중 ZSTabNavigator.Screen 선언만 고른다', () => {
    const screens = collectScreens([
      <ZSTabNavigatorScreen key="a" name="a" options={{ title: 'A' }} />,
      <React.Fragment key="x" />,
      null,
      <ZSTabNavigatorScreen key="b" name="b" options={{ title: 'B', badge: 1, role: 'search' }} />,
    ]);
    expect(screens).toEqual([
      { name: 'a', options: { title: 'A' } },
      { name: 'b', options: { title: 'B', badge: 1, role: 'search' } },
    ]);
  });

  it('options(accessibilityLabel·disabled)와 listeners 를 그대로 모은다', () => {
    const tabPress = jest.fn();
    const screens = collectScreens([
      <ZSTabNavigatorScreen key="a" name="a" options={{ title: 'A', accessibilityLabel: 'A 탭', disabled: true }} listeners={{ tabPress }} />,
    ]);
    expect(screens).toEqual([{ name: 'a', options: { title: 'A', accessibilityLabel: 'A 탭', disabled: true }, listeners: { tabPress } }]);
  });

  it('badge: true 는 빈 문자열(점), 숫자·문자는 문자열, false·미지정은 없음', () => {
    expect(badgeText(true)).toBe('');
    expect(badgeText(3)).toBe('3');
    expect(badgeText('new')).toBe('new');
    expect(badgeText(false)).toBeUndefined();
    expect(badgeText(undefined)).toBeUndefined();
  });

  describe("resolveNavigationMode — 'auto' 는 NavigationSuiteScaffold 기본 규칙", () => {
    it('폭이 compact 면 하단 바, medium 이상이면 레일', () => {
      expect(resolveNavigationMode(undefined, 'compact')).toBe('bar');
      expect(resolveNavigationMode('auto', 'medium')).toBe('rail');
      expect(resolveNavigationMode('auto', 'expanded', 'expanded')).toBe('rail');
    });

    it('폭이 넓어도 높이가 compact 면(폰 가로) 하단 바', () => {
      expect(resolveNavigationMode('auto', 'expanded', 'compact')).toBe('bar');
      expect(resolveNavigationMode('auto', 'medium', 'compact', 'flat')).toBe('bar');
    });

    it('테이블탑 자세면 아래 반쪽 조작 영역에 하단 바', () => {
      expect(resolveNavigationMode('auto', 'expanded', 'medium', 'tabletop')).toBe('bar');
      expect(resolveNavigationMode('auto', 'expanded', 'medium', 'book')).toBe('rail');
    });

    it('높이·자세를 모르면 폭만 본다', () => {
      expect(resolveNavigationMode('auto', 'medium', undefined, undefined)).toBe('rail');
    });
  });

  it('bar·rail 을 지정하면 창 크기·자세와 상관없이 그 모드', () => {
    expect(resolveNavigationMode('bar', 'expanded')).toBe('bar');
    expect(resolveNavigationMode('rail', 'compact', 'compact', 'tabletop')).toBe('rail');
  });

  describe("resolveNavigationMode — barAxis 'horizontal'", () => {
    it('모든 폭에서 하단 바 (폴더블 펼침 medium·태블릿 expanded 도 바)', () => {
      expect(resolveNavigationMode('auto', 'compact', 'medium', 'unknown', 'horizontal')).toBe('bar');
      expect(resolveNavigationMode('auto', 'medium', 'medium', 'flat', 'horizontal')).toBe('bar');
      expect(resolveNavigationMode('auto', 'medium', 'expanded', 'book', 'horizontal')).toBe('bar');
      expect(resolveNavigationMode('auto', 'expanded', 'medium', 'unknown', 'horizontal')).toBe('bar');
      expect(resolveNavigationMode('auto', 'expanded', 'expanded', 'flat', 'horizontal')).toBe('bar');
    });

    it("'vertical' 은 기본 규칙과 같고, navigationMode 지정이 barAxis 보다 앞선다", () => {
      expect(resolveNavigationMode('auto', 'medium', 'medium', 'flat', 'vertical')).toBe('rail');
      expect(resolveNavigationMode('rail', 'compact', 'medium', 'unknown', 'horizontal')).toBe('rail');
      expect(resolveNavigationMode('bar', 'expanded', 'expanded', 'unknown', 'vertical')).toBe('bar');
    });
  });
});
