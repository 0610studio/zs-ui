import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react-native';
import { AccessibilityInfo, AppState, Appearance, Platform, StatusBar, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Expo from 'expo';
import { NavigationBar } from 'expo-navigation-bar';
import { ThemeProvider, useTheme, type ThemeContextValue } from '../../context/ThemeContext';
import { createThemeColors, DEFAULT_COLORS } from '../../theme/color';
import { DEFAULT_ACCESSIBILITY_LABELS } from '../../theme/accessibilityLabels';
import { nth } from '../utils/hostQueries';

const STORAGE_KEY = '@zs-ui/color-scheme';
const platform = Platform as { OS: string };
const a11y = AccessibilityInfo as typeof AccessibilityInfo & {
  isDarkerSystemColorsEnabled: jest.Mock;
  isHighTextContrastEnabled: jest.Mock;
  mockEmit: (event: string, enabled: boolean) => void;
};
const appState = AppState as typeof AppState & { mockChange: (state: string) => void };

let theme: ThemeContextValue;
function Capture() {
  theme = useTheme();
  return <Text>{theme.mode}</Text>;
}

type ProviderProps = Partial<React.ComponentProps<typeof ThemeProvider>>;

async function renderProvider(props: ProviderProps = {}) {
  const view = await render(
    <ThemeProvider {...props}>
      <Capture />
    </ThemeProvider>,
  );
  await act(async () => {});
  return view;
}

const rerenderProvider = (props: ProviderProps = {}) =>
  screen.rerender(
    <ThemeProvider {...props}>
      <Capture />
    </ThemeProvider>,
  );

function mockNativeModule(module: Record<string, unknown> | null) {
  return jest.spyOn(Expo, 'requireOptionalNativeModule').mockReturnValue(module as never);
}

describe('ThemeProvider', () => {
  let setColorScheme: jest.SpyInstance;

  beforeEach(async () => {
    setColorScheme = jest.spyOn(Appearance, 'setColorScheme');
    await AsyncStorage.clear();
    jest.mocked(AsyncStorage.setItem).mockClear();
  });

  afterEach(() => {
    platform.OS = 'ios';
    jest.restoreAllMocks();
  });

  it('Provider 밖에서 useTheme 을 쓰면 에러다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useTheme())).rejects.toThrow('useTheme must be used within a ThemeProvider');
  });

  describe('기본 값', () => {
    it('시스템 모드(라이트)를 따르고 기본 시드로 테마 색·글꼴·그림자를 만든다', async () => {
      await renderProvider();
      expect(theme.mode).toBe('light');
      expect(theme.colorSchemePreference).toBe('system');
      expect(theme.contrastLevel).toBe(0);
      expect(theme.seedColor).toBe(DEFAULT_COLORS.primary);
      expect(theme.colors).toEqual(createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 }));
      expect(theme.typography.body1).toMatchObject({ fontSize: 17, lineHeight: 24, fontWeight: '400' });
      expect(theme.shadows.none).toEqual({});
      expect(theme.shadows.md.boxShadow).toBeTruthy();
    });

    it('시스템이 다크면 다크 색을 쓴다', async () => {
      jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
      await renderProvider();
      expect(theme.mode).toBe('dark');
      expect(theme.colors).toEqual(createThemeColors(DEFAULT_COLORS, { mode: 'dark', contrastLevel: 0 }));
    });

    it('fonts·fontAssets 를 그대로 노출하고 글자 스타일에 쓴다', async () => {
      const fonts = { 400: 'Pretendard-Regular', 700: 'Pretendard-Bold' };
      const fontAssets = { 400: 1, 700: 2 };
      await renderProvider({ fonts, fontAssets });
      expect(theme.fonts).toBe(fonts);
      expect(theme.fontAssets).toBe(fontAssets);
      expect(theme.typography.body1.fontFamily).toBe('Pretendard-Regular');
      expect(theme.typography.emphasized.h2.fontFamily).toBe('Pretendard-Bold');
    });

    it('스크린 리더 기본 문구는 영어이고, accessibilityLabels 로 넘긴 키만 덮는다', async () => {
      await renderProvider();
      expect(theme.accessibilityLabels).toEqual(DEFAULT_ACCESSIBILITY_LABELS);
      await rerenderProvider({ accessibilityLabels: { clearText: '지우기', loading: '불러오는 중' } });
      expect(theme.accessibilityLabels).toEqual({ ...DEFAULT_ACCESSIBILITY_LABELS, clearText: '지우기', loading: '불러오는 중' });
      const before = theme.accessibilityLabels;
      await rerenderProvider({ accessibilityLabels: { clearText: '지우기', loading: '불러오는 중' } });
      expect(theme.accessibilityLabels).toBe(before);
    });

    it('글자 확대 상한은 기본 2배(Android 최대 200%)이고 maxFontSizeMultiplier 로 바꾼다 — 0 이면 제한 없음', async () => {
      await renderProvider();
      expect(theme.maxFontSizeMultiplier).toBe(2);
      await rerenderProvider({ maxFontSizeMultiplier: 1.5 });
      expect(theme.maxFontSizeMultiplier).toBe(1.5);
      await rerenderProvider({ maxFontSizeMultiplier: 0 });
      expect(theme.maxFontSizeMultiplier).toBe(0);
    });
  });

  describe('브랜드 시드', () => {
    it('colors.primary 시드로 테마 색을 만든다(secondary 는 그 시드에서 파생, 상태 색은 기본 시드)', async () => {
      await renderProvider({ colors: { primary: '#3366ff' } });
      expect(theme.seedColor).toBe('#3366ff');
      expect(theme.colors.primaryContainer).toBe('#3366ff');
      const expected = createThemeColors({ ...DEFAULT_COLORS, primary: '#3366ff' }, { mode: 'light', contrastLevel: 0 });
      expect(theme.colors.secondary).toBe(expected.secondary);
      expect(theme.colors.secondary).not.toBe(createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 }).secondary);
      expect(theme.colors.neutral).toBe(createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 }).neutral);
      expect(theme.colors.success).toBe(createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 }).success);
    });

    it('인라인으로 매번 새로 만든 같은 시드는 colors 참조를 유지하고, 값이 바뀌면 다시 만든다', async () => {
      await renderProvider({ colors: { primary: '#3366ff' } });
      const before = theme.colors;
      await rerenderProvider({ colors: { primary: '#3366ff' } });
      expect(theme.colors).toBe(before);
      await rerenderProvider({ colors: { primary: '#ff3366' } });
      expect(theme.colors).not.toBe(before);
      expect(theme.colors).toEqual(createThemeColors({ ...DEFAULT_COLORS, primary: '#ff3366' }, { mode: 'light', contrastLevel: 0 }));
    });

    it('Android 도 iOS 와 같은 무채색 표면이다 — 시드 색조가 배경을 물들이지 않는다', async () => {
      platform.OS = 'android';
      await renderProvider();
      expect(theme.colors.surface1).toBe('#ffffff');
      expect(theme.colors.surface3).toBe(createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 }).surface3);
    });
  });

  describe('색 모드 선택', () => {
    it.each(['effect', 'layout'] as const)('자식 %s에서 고른 초기 테마도 저장값이 덮지 않는다', async (phase) => {
      await AsyncStorage.setItem(STORAGE_KEY, 'dark');
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk'));
      const useMountEffect = phase === 'layout' ? React.useLayoutEffect : React.useEffect;
      function ChooseAtMount() {
        const { setColorSchemePreference } = useTheme();
        useMountEffect(() => setColorSchemePreference('light'), [setColorSchemePreference]);
        return <Capture />;
      }
      await render(<ThemeProvider><ChooseAtMount /></ThemeProvider>);
      await act(async () => {});
      expect(theme.colorSchemePreference).toBe('light');
    });

    it.each(['light', 'system'] as const)('저장값 조회가 늦어도 사용자가 고른 %s를 덮지 않는다', async (preference) => {
      let resolve!: (stored: string | null) => void;
      jest.mocked(AsyncStorage.getItem).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
      await renderProvider();
      await act(() => theme.setColorSchemePreference(preference));
      await act(async () => resolve('dark'));
      expect(theme.colorSchemePreference).toBe(preference);
    });

    it('저장된 선택을 읽어 적용하고 네이티브 UI 도 맞춘다', async () => {
      await AsyncStorage.setItem(STORAGE_KEY, 'dark');
      await renderProvider();
      expect(screen.getByText('dark')).toBeTruthy();
      expect(theme.colorSchemePreference).toBe('dark');
      expect(setColorScheme).toHaveBeenLastCalledWith('dark');
    });

    it('알 수 없는 저장 값은 무시한다', async () => {
      await AsyncStorage.setItem(STORAGE_KEY, 'sepia');
      await renderProvider();
      expect(theme.colorSchemePreference).toBe('system');
    });

    it('저장소를 읽지 못하면 시스템 따름으로 두고 에러를 남긴다', async () => {
      const error = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('disk'));
      await renderProvider();
      expect(theme.colorSchemePreference).toBe('system');
      expect(error).toHaveBeenCalledWith('[zs-ui] 테마 설정을 읽지 못했습니다', expect.any(Error));
    });

    it('시스템 따름이면 네이티브 override 를 푼다(auto)', async () => {
      await renderProvider();
      expect(setColorScheme).toHaveBeenLastCalledWith('auto');
    });

    it('setColorSchemePreference 로 바꾸고 저장한다', async () => {
      await renderProvider();
      await act(() => theme.setColorSchemePreference('dark'));
      expect(theme.mode).toBe('dark');
      expect(setColorScheme).toHaveBeenLastCalledWith('dark');
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(STORAGE_KEY, 'dark');
      await act(() => theme.setColorSchemePreference('system'));
      expect(theme.mode).toBe('light');
      expect(setColorScheme).toHaveBeenLastCalledWith('auto');
    });

    it('저장에 실패하면 에러를 남기고 선택은 유지한다', async () => {
      const error = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk'));
      await renderProvider();
      await act(async () => theme.setColorSchemePreference('dark'));
      expect(theme.mode).toBe('dark');
      expect(error).toHaveBeenCalledWith('[zs-ui] 테마 설정을 저장하지 못했습니다', expect.any(Error));
    });

    it('toggleTheme 은 지금 보이는 모드의 반대로 수동 전환한다', async () => {
      jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
      await renderProvider();
      await act(() => theme.toggleTheme());
      expect(theme.colorSchemePreference).toBe('light');
      expect(theme.mode).toBe('light');
      await act(() => theme.toggleTheme());
      expect(theme.colorSchemePreference).toBe('dark');
    });

    it('darkMode=false 면 항상 라이트이고 바꿀 수 없다(네이티브도 라이트)', async () => {
      await AsyncStorage.setItem(STORAGE_KEY, 'dark');
      jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
      jest.mocked(AsyncStorage.setItem).mockClear();
      await renderProvider({ darkMode: false });
      expect(theme.mode).toBe('light');
      expect(theme.colorSchemePreference).toBe('light');
      expect(setColorScheme).toHaveBeenLastCalledWith('light');
      await act(() => theme.toggleTheme());
      expect(theme.mode).toBe('light');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('darkMode 를 다시 켜면 저장값이 없을 때 시스템을 따른다', async () => {
      jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
      await renderProvider({ darkMode: false });
      expect(theme.mode).toBe('light');
      await rerenderProvider({ darkMode: true });
      await act(async () => {});
      expect(theme.colorSchemePreference).toBe('system');
      expect(theme.mode).toBe('dark');
      expect(setColorScheme).toHaveBeenLastCalledWith('auto');
    });

    it('darkMode 를 다시 켜면 저장된 선택을 다시 읽는다', async () => {
      await AsyncStorage.setItem(STORAGE_KEY, 'dark');
      await renderProvider({ darkMode: false });
      expect(theme.mode).toBe('light');
      await rerenderProvider({ darkMode: true });
      await act(async () => {});
      expect(theme.colorSchemePreference).toBe('dark');
      expect(theme.mode).toBe('dark');
    });

    it('darkMode 를 끄면 선택이 라이트로 돌아간다', async () => {
      await renderProvider();
      await act(() => theme.setColorSchemePreference('dark'));
      await rerenderProvider({ darkMode: false });
      await act(async () => {});
      expect(theme.colorSchemePreference).toBe('light');
    });
  });

  describe('네이티브 Appearance 동기화', () => {
    it.each([true, false])('언마운트할 때 직접 적용한 override만 해제한다 (sync=%s)', async (syncNativeAppearance) => {
      const view = await renderProvider({ syncNativeAppearance });
      await act(() => theme.setColorSchemePreference('dark'));
      setColorScheme.mockClear();
      await view.unmount();
      if (syncNativeAppearance) expect(setColorScheme).toHaveBeenLastCalledWith('auto');
      else expect(setColorScheme).not.toHaveBeenCalled();
    });

    it('syncNativeAppearance=false 면 건드리지 않는다', async () => {
      await renderProvider({ syncNativeAppearance: false });
      await act(() => theme.setColorSchemePreference('dark'));
      expect(setColorScheme).not.toHaveBeenCalled();
    });

    it('켜져 있다가 끄면 override 를 한 번 풀고 그 뒤로는 건드리지 않는다', async () => {
      await renderProvider();
      await act(() => theme.setColorSchemePreference('dark'));
      setColorScheme.mockClear();
      await rerenderProvider({ syncNativeAppearance: false });
      expect(setColorScheme).toHaveBeenCalledTimes(1);
      expect(setColorScheme).toHaveBeenLastCalledWith('auto');
      await rerenderProvider({ syncNativeAppearance: false, darkMode: false });
      expect(setColorScheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Android 시스템 바', () => {
    it('상태바·내비게이션 바 아이콘을 모드에 맞춘다', async () => {
      platform.OS = 'android';
      const setBarStyle = jest.spyOn(StatusBar, 'setBarStyle');
      jest.mocked(NavigationBar.setStyle).mockClear();
      await renderProvider();
      expect(setBarStyle).toHaveBeenLastCalledWith('dark-content');
      expect(NavigationBar.setStyle).toHaveBeenLastCalledWith('light');
      await act(() => theme.toggleTheme());
      expect(setBarStyle).toHaveBeenLastCalledWith('light-content');
      expect(NavigationBar.setStyle).toHaveBeenLastCalledWith('dark');
    });

    it('iOS 는 시스템 바를 직접 칠하지 않는다', async () => {
      const setBarStyle = jest.spyOn(StatusBar, 'setBarStyle');
      jest.mocked(NavigationBar.setStyle).mockClear();
      await renderProvider();
      expect(setBarStyle).not.toHaveBeenCalled();
      expect(NavigationBar.setStyle).not.toHaveBeenCalled();
    });
  });

  describe('대비', () => {
    it("contrast='high' 면 대비 1 의 색을 만들고 'standard' 는 0 이다", async () => {
      await renderProvider({ contrast: 'high' });
      expect(theme.contrastLevel).toBe(1);
      const high = theme.colors;
      expect(high).toEqual(createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 1 }));
      await rerenderProvider({ contrast: 'standard' });
      expect(theme.contrastLevel).toBe(0);
      expect(theme.colors.textSecondary).not.toBe(high.textSecondary);
    });

    it.each(['ios', 'android'] as const)('%s 대비 변경 이벤트 뒤 도착한 초기 조회는 무시한다', async (os) => {
      platform.OS = os;
      const read = os === 'ios' ? a11y.isDarkerSystemColorsEnabled : a11y.isHighTextContrastEnabled;
      const event = os === 'ios' ? 'darkerSystemColorsChanged' : 'highTextContrastChanged';
      let resolve!: (on: boolean) => void;
      read.mockReturnValueOnce(new Promise<boolean>((done) => { resolve = done; }));
      await renderProvider();
      await act(() => a11y.mockEmit(event, true));
      expect(theme.contrastLevel).toBe(1);
      await act(async () => resolve(false));
      expect(theme.contrastLevel).toBe(1);
    });

    it.each(['ios', 'android'] as const)('%s 대비 조회가 실패해도 마지막 설정을 유지한다', async (os) => {
      platform.OS = os;
      const read = os === 'ios' ? a11y.isDarkerSystemColorsEnabled : a11y.isHighTextContrastEnabled;
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      read.mockRejectedValueOnce(new Error('unavailable'));
      await renderProvider();
      expect(theme.contrastLevel).toBe(0);
      expect(warn).toHaveBeenCalledWith('[zs-ui] 시스템 대비를 읽지 못했습니다', expect.any(Error));
    });

    it('명시한 대비면 시스템 설정을 읽지 않는다', async () => {
      a11y.isDarkerSystemColorsEnabled.mockClear();
      await renderProvider({ contrast: 'standard' });
      expect(a11y.isDarkerSystemColorsEnabled).not.toHaveBeenCalled();
    });

    it("iOS 'system' 은 '대비 증가'를 읽고 바뀌면 따른다", async () => {
      a11y.isDarkerSystemColorsEnabled.mockResolvedValueOnce(true);
      await renderProvider();
      expect(theme.contrastLevel).toBe(1);
      await act(() => a11y.mockEmit('darkerSystemColorsChanged', false));
      expect(theme.contrastLevel).toBe(0);
      await act(() => a11y.mockEmit('darkerSystemColorsChanged', true));
      expect(theme.contrastLevel).toBe(1);
    });

    it('언마운트하면 대비 구독을 끊고, 늦게 온 조회 결과는 버린다', async () => {
      let resolve: (on: boolean) => void = () => {};
      a11y.isDarkerSystemColorsEnabled.mockReturnValueOnce(new Promise<boolean>((r) => (resolve = r)));
      await renderProvider();
      const before = theme;
      await act(() => screen.unmount());
      await act(async () => resolve(true));
      a11y.mockEmit('darkerSystemColorsChanged', true);
      expect(theme).toBe(before);
    });

    it("Android 'system' 은 사용자 대비(14+)를 쓰고 바뀌면 따른다", async () => {
      platform.OS = 'android';
      const listeners: ((event: { contrast: number }) => void)[] = [];
      const remove = jest.fn();
      mockNativeModule({
        getContrast: () => 0.5,
        addListener: (_event: string, listener: (event: { contrast: number }) => void) => {
          listeners.push(listener);
          return { remove };
        },
      });
      await renderProvider();
      expect(theme.contrastLevel).toBe(0.5);
      await act(() => nth(listeners, 0)({ contrast: 1 }));
      expect(theme.contrastLevel).toBe(1);
      await act(() => nth(listeners, 0)({ contrast: -0.5 }));
      expect(theme.contrastLevel).toBe(0);
      await act(() => screen.unmount());
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('Android 고대비 텍스트가 켜지면 사용자 대비와 무관하게 높음이다', async () => {
      platform.OS = 'android';
      mockNativeModule({ getContrast: () => 0 });
      a11y.isHighTextContrastEnabled.mockResolvedValueOnce(true);
      await renderProvider();
      expect(theme.contrastLevel).toBe(1);
      await act(() => a11y.mockEmit('highTextContrastChanged', false));
      expect(theme.contrastLevel).toBe(0);
    });

    it('Android 네이티브 모듈이 없으면 고대비 텍스트만 본다', async () => {
      platform.OS = 'android';
      await renderProvider();
      expect(theme.contrastLevel).toBe(0);
      await act(() => a11y.mockEmit('highTextContrastChanged', true));
      expect(theme.contrastLevel).toBe(1);
    });
  });

  describe('동적 색(Material You)', () => {
    it('기본은 끔 — 배경화면 색을 읽지 않는다', async () => {
      platform.OS = 'android';
      const getDynamicSeedColor = jest.fn(() => '#00aa00');
      mockNativeModule({ getDynamicSeedColor });
      await renderProvider();
      expect(getDynamicSeedColor).not.toHaveBeenCalled();
      expect(theme.seedColor).toBe(DEFAULT_COLORS.primary);
    });

    it('Android 에서 켜면 배경화면 색을 primary 시드로 쓰고, 앱이 다시 활성화되면 다시 읽는다', async () => {
      platform.OS = 'android';
      let wallpaper = '#00aa00';
      mockNativeModule({ getDynamicSeedColor: () => wallpaper });
      await renderProvider({ dynamicColor: true, colors: { primary: '#ff0000' } });
      expect(theme.seedColor).toBe('#00aa00');
      expect(theme.colors).toEqual(createThemeColors({ ...DEFAULT_COLORS, primary: '#00aa00' }, { mode: 'light', contrastLevel: 0 }));

      wallpaper = '#0000cc';
      await act(() => appState.mockChange('background'));
      expect(theme.seedColor).toBe('#00aa00');
      await act(() => appState.mockChange('active'));
      expect(theme.seedColor).toBe('#0000cc');
    });

    it('배경화면 색을 못 읽으면 브랜드 시드를 쓴다', async () => {
      platform.OS = 'android';
      mockNativeModule({ getDynamicSeedColor: () => null });
      await renderProvider({ dynamicColor: true, colors: { primary: '#ff0000' } });
      expect(theme.seedColor).toBe('#ff0000');
    });

    it('끄면 브랜드 시드로 돌아간다', async () => {
      platform.OS = 'android';
      mockNativeModule({ getDynamicSeedColor: () => '#00aa00' });
      await renderProvider({ dynamicColor: true });
      await rerenderProvider({ dynamicColor: false });
      expect(theme.seedColor).toBe(DEFAULT_COLORS.primary);
    });

    it('iOS 는 켜도 브랜드 시드다', async () => {
      const getDynamicSeedColor = jest.fn(() => '#00aa00');
      mockNativeModule({ getDynamicSeedColor });
      await renderProvider({ dynamicColor: true });
      expect(theme.seedColor).toBe(DEFAULT_COLORS.primary);
      expect(getDynamicSeedColor).not.toHaveBeenCalled();
    });
  });
});
