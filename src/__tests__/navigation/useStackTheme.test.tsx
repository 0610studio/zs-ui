import { fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useStackTheme } from '../../navigation/useStackTheme';
import { useHeaderButtonColors } from '../../navigation/headerButton';
import { withOpacity } from '../../theme/color';
import { DEFAULT_ACCESSIBILITY_LABELS } from '../../theme/accessibilityLabels';
import { queryAllByHostType } from '../utils/hostQueries';
import { isViewControllerBasedStatusBarIOS } from '../../native/statusBarAppearance';
import { contrastRatio } from '../utils/contrast';
import { setTestTheme } from '../utils/theme';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());
jest.mock('../../native/statusBarAppearance', () => ({ isViewControllerBasedStatusBarIOS: jest.fn(() => false) }));

const platform = Platform as { OS: string; Version?: string | number };
const viewControllerBased = jest.mocked(isViewControllerBasedStatusBarIOS);
const brandFonts = { 400: 'Pretendard-Regular', 500: 'Pretendard-Medium', 700: 'Pretendard-Bold' };

describe('useStackTheme', () => {
  const { colors } = setTestTheme({ fonts: brandFonts });

  afterEach(() => {
    platform.OS = 'ios';
    delete platform.Version;
    viewControllerBased.mockReturnValue(false);
    setTestTheme({ fonts: brandFonts });
  });

  it('iOS 는 제목 서체를 넣지 않는다(시스템 서체) — 버튼은 text, 뒤로가기는 minimal', async () => {
    const { result } = await renderHook(() => useStackTheme());
    expect(result.current).toEqual({
      headerTintColor: colors.text,
      headerBackButtonDisplayMode: 'minimal',
      headerTransparent: false,
    });
  });

  it('Android 는 상단 바 제목 굵기(subtitle1 600 — 없으면 가까운 굵은 쪽) 브랜드 서체를 제목·큰 제목에 쓴다', async () => {
    platform.OS = 'android';
    const { result } = await renderHook(() => useStackTheme());
    expect(result.current.headerTitleStyle).toEqual({ fontFamily: 'Pretendard-Bold' });
    expect(result.current.headerLargeTitleStyle).toEqual({ fontFamily: 'Pretendard-Bold' });
    setTestTheme({ fonts: { ...brandFonts, 600: 'Pretendard-SemiBold' } });
    const semibold = await renderHook(() => useStackTheme());
    expect(semibold.result.current.headerTitleStyle).toEqual({ fontFamily: 'Pretendard-SemiBold' });
  });

  it('Android 도 브랜드 글꼴이 없으면 제목 서체를 넣지 않는다', async () => {
    platform.OS = 'android';
    setTestTheme();
    const { result } = await renderHook(() => useStackTheme());
    expect(result.current).not.toHaveProperty('headerTitleStyle');
    expect(result.current).not.toHaveProperty('headerLargeTitleStyle');
    setTestTheme({ fonts: { 400: 'Pretendard-Regular', 500: 'Pretendard-Medium', 700: 'Pretendard-Bold' } });
  });

  it("tint: 'primary' 는 브랜드 색조 글자 — 밝은 시드(호박 primary 2:1)는 onPrimaryContainer, 다크 모드처럼 primary 가 4.5:1 이면 primary", async () => {
    const { result } = await renderHook(() => useStackTheme({ tint: 'primary' }));
    expect(result.current.headerTintColor).toBe(colors.onPrimaryContainer);
    expect(contrastRatio(result.current.headerTintColor, colors.background)).toBeGreaterThanOrEqual(4.5);
    const dark = setTestTheme({ mode: 'dark', fonts: brandFonts });
    const darkResult = await renderHook(() => useStackTheme({ tint: 'primary' }));
    expect(darkResult.result.current.headerTintColor).toBe(dark.colors.primary);
  });

  it('기본 tint 는 text — 헤더 버튼·뒤로가기는 얇은 글자라 primary 를 쓰지 않는다', async () => {
    const { result } = await renderHook(() => useStackTheme());
    expect(result.current.headerTintColor).toBe(colors.text);
    expect(result.current.headerTintColor).not.toBe(colors.primary);
  });

  it('색·배경은 넣지 않는다 — 내비게이션 테마가 맡는다', async () => {
    const { result } = await renderHook(() => useStackTheme());
    expect(result.current).not.toHaveProperty('headerStyle');
    expect(result.current).not.toHaveProperty('contentStyle');
  });

  describe('상단 바 버튼 바탕 — iOS 26 유리 바 버튼에 맞춘 Android 연한 둥근 면', () => {
    it('바탕색은 surface2 를 살짝 비친 면(92%) — Android Stack.Toolbar buttonContainerColor·글자 버튼 바탕', async () => {
      const { result } = await renderHook(() => useHeaderButtonColors());
      expect(result.current).toEqual({ container: withOpacity(colors.surface2, 0.92) });
    });

    it('iOS 는 시스템 뒤로 버튼(유리) — headerLeft 를 넣지 않는다', async () => {
      const { result } = await renderHook(() => useStackTheme());
      expect(result.current).not.toHaveProperty('headerLeft');
    });

    it('Android 는 뒤로 버튼을 연한 둥근 바탕(40)으로 그린다 — 갈 곳이 없으면 없고, 누르면 goBack, 이름은 navigateUp', async () => {
      platform.OS = 'android';
      const { mockGoBack } = require('expo-router') as { mockGoBack: jest.Mock };
      mockGoBack.mockClear();
      const { result } = await renderHook(() => useStackTheme());
      const headerLeft = result.current.headerLeft;
      expect(headerLeft).toEqual(expect.any(Function));
      expect(headerLeft?.({ canGoBack: false })).toBeNull();
      await render(<>{headerLeft?.({ canGoBack: true, tintColor: '#123456' })}</>);
      const button = screen.getByTestId('zs-header-back');
      expect(button.props.accessibilityLabel).toBe(DEFAULT_ACCESSIBILITY_LABELS.navigateUp);
      expect(button.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ backgroundColor: withOpacity(colors.surface2, 0.92) })]));
      expect(queryAllByHostType('View').find((node) => typeof node.props.d === 'string')?.props.fill).toBe('#123456');
      await fireEvent.press(button);
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('상태바 — iOS Info.plist UIViewControllerBasedStatusBarAppearance', () => {
    it('false 면 statusBarStyle 을 넣지 않는다 — 레드 박스가 나고, 상태바는 Appearance 동기화가 맡는다', async () => {
      const { result } = await renderHook(() => useStackTheme());
      expect(result.current).not.toHaveProperty('statusBarStyle');
    });

    it('true 면 테마 모드에 맞춘다 — 라이트는 어두운 글자, 다크는 밝은 글자', async () => {
      viewControllerBased.mockReturnValue(true);
      const light = await renderHook(() => useStackTheme());
      expect(light.result.current.statusBarStyle).toBe('dark');
      setTestTheme({ mode: 'dark', fonts: brandFonts });
      const dark = await renderHook(() => useStackTheme());
      expect(dark.result.current.statusBarStyle).toBe('light');
    });
  });

  describe('투명 헤더 — Apple 권고(바 배경을 칠하지 않음)', () => {
    it('iOS 26 이상은 투명 헤더 — 시스템 스크롤 가장자리 효과가 제목을 읽히게 한다', async () => {
      platform.Version = '26.0';
      const { result } = await renderHook(() => useStackTheme());
      expect(result.current.headerTransparent).toBe(true);
    });

    it('iOS 26 미만은 불투명 — Liquid Glass·스크롤 가장자리 효과가 없다', async () => {
      platform.Version = '18.6';
      const { result } = await renderHook(() => useStackTheme());
      expect(result.current.headerTransparent).toBe(false);
    });

    it('Android 는 투명 헤더 — 헤더 바탕은 ZSScreen·ZSHeaderBackground 가 그린다', async () => {
      platform.OS = 'android';
      const { result } = await renderHook(() => useStackTheme());
      expect(result.current.headerTransparent).toBe(true);
    });

    it('그 밖의 플랫폼은 불투명', async () => {
      platform.OS = 'web';
      const { result } = await renderHook(() => useStackTheme());
      expect(result.current.headerTransparent).toBe(false);
    });

    it('transparentHeader: false 면 어느 플랫폼에서도 불투명', async () => {
      platform.Version = '27.0';
      const ios = await renderHook(() => useStackTheme({ transparentHeader: false }));
      expect(ios.result.current.headerTransparent).toBe(false);
      platform.OS = 'android';
      const android = await renderHook(() => useStackTheme({ transparentHeader: false }));
      expect(android.result.current.headerTransparent).toBe(false);
    });
  });
});
