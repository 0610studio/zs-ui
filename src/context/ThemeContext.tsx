import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Appearance, Platform, StatusBar, useColorScheme } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationBar } from 'expo-navigation-bar';
import { createThemeColors, DEFAULT_COLORS, type ColorMode, type ThemeColors, type ThemeColorOptions } from '../theme/color';
import { createTypography, type ThemeFontAssets, type ThemeFonts, type TypographyStyles } from '../theme/typeScale';
import { createShadows, type ShadowStyles } from '../theme/shadow';
import { DEFAULT_ACCESSIBILITY_LABELS, type AccessibilityLabels } from '../theme/accessibilityLabels';
import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER } from '../theme/fontScale';
import { useNavigationBarOverDark } from '../navigation/navigationBarStore';

export type ColorSchemePreference = 'system' | 'light' | 'dark';
export type ContrastPreference = 'system' | 'standard' | 'high';

export interface ThemeProviderProps {
  children: React.ReactNode;
  colors?: ThemeColorOptions;
  fonts?: ThemeFonts;
  fontAssets?: ThemeFontAssets;
  darkMode?: boolean;
  contrast?: ContrastPreference;
  dynamicColor?: boolean;
  syncNativeAppearance?: boolean;
  accessibilityLabels?: Partial<AccessibilityLabels>;
  /** 글자 확대 상한. 0은 무제한입니다. */
  maxFontSizeMultiplier?: number;
}

export interface ThemeContextValue {
  colors: ThemeColors;
  typography: TypographyStyles;
  shadows: ShadowStyles;
  mode: ColorMode;
  contrastLevel: number;
  seedColor: string;
  fonts?: ThemeFonts;
  fontAssets?: ThemeFontAssets;
  colorSchemePreference: ColorSchemePreference;
  setColorSchemePreference: (preference: ColorSchemePreference) => void;
  toggleTheme: () => void;
  accessibilityLabels: AccessibilityLabels;
  maxFontSizeMultiplier: number;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = '@zs-ui/color-scheme';

interface ZsUiNativeModule {
  getDynamicSeedColor?: () => string | null;
  getContrast?: () => number | null;
  addListener?: (event: 'onContrastChange', listener: (event: { contrast: number }) => void) => { remove: () => void };
  /** Android 12+ 앱 전용 야간 모드를 시스템에 저장한다. 다음 실행의 시작 창(스플래시)이 이 모드로 그려진다 */
  setApplicationNightMode?: (preference: ColorSchemePreference) => boolean;
}

const nativeModule = (): ZsUiNativeModule | null => requireOptionalNativeModule<ZsUiNativeModule>('ZsUi');

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function useSystemContrast(enabled: boolean): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    let changed = false;
    const subscriptions: { remove: () => void }[] = [];
    const readFailed = (error: unknown) => {
      if (mounted) console.warn('[zs-ui] 시스템 대비를 읽지 못했습니다', error);
    };

    if (Platform.OS === 'ios') {
      AccessibilityInfo.isDarkerSystemColorsEnabled()
        .then((on) => { if (mounted && !changed) setLevel(on ? 1 : 0); })
        .catch(readFailed);
      subscriptions.push(AccessibilityInfo.addEventListener('darkerSystemColorsChanged', (on) => {
        changed = true;
        if (mounted) setLevel(on ? 1 : 0);
      }));
    } else if (Platform.OS === 'android') {
      const module = nativeModule();
      let userContrast = module?.getContrast?.() ?? null;
      let highText = false;
      const apply = () => mounted && setLevel(highText ? 1 : Math.max(0, userContrast ?? 0));
      AccessibilityInfo.isHighTextContrastEnabled()
        .then((on) => {
          if (!mounted || changed) return;
          highText = on;
          apply();
        })
        .catch(readFailed);
      subscriptions.push(AccessibilityInfo.addEventListener('highTextContrastChanged', (on) => { changed = true; highText = on; apply(); }));
      const listener = module?.addListener?.('onContrastChange', ({ contrast }) => { userContrast = contrast; apply(); });
      if (listener) subscriptions.push(listener);
      apply();
    }

    return () => {
      mounted = false;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [enabled]);

  return enabled ? level : 0;
}

function useDynamicSeed(enabled: boolean): string | null {
  const read = () => (enabled && Platform.OS === 'android' ? nativeModule()?.getDynamicSeedColor?.() ?? null : null);
  const [seed, setSeed] = useState<string | null>(read);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') {
      setSeed(null);
      return;
    }
    setSeed(read());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setSeed(read());
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return seed;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  colors: seeds,
  fonts,
  fontAssets,
  darkMode = true,
  contrast = 'system',
  dynamicColor = false,
  syncNativeAppearance = true,
  accessibilityLabels: labelOverrides,
  maxFontSizeMultiplier = DEFAULT_MAX_FONT_SIZE_MULTIPLIER,
}) => {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ColorSchemePreference>(darkMode ? 'system' : 'light');
  // 저장된 선택을 읽었거나 직접 골랐는지. 읽기 전 기본값('system')은 실제 선택이 아니다
  const [preferenceKnown, setPreferenceKnown] = useState(false);
  const preferenceRevision = useRef(0);
  const restoreRevision = preferenceRevision.current;

  useEffect(() => {
    const revision = restoreRevision;
    if (!darkMode) {
      setPreference('light');
      return;
    }
    if (revision !== preferenceRevision.current) return;
    setPreference('system');
    setPreferenceKnown(false);
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (revision === preferenceRevision.current && (stored === 'light' || stored === 'dark' || stored === 'system')) setPreference(stored);
        setPreferenceKnown(true);
      })
      .catch((error) => console.error('[zs-ui] 테마 설정을 읽지 못했습니다', error));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- darkMode 변경 때만 복원한다.
  }, [darkMode]);

  const mode: ColorMode = !darkMode ? 'light' : preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const systemContrast = useSystemContrast(contrast === 'system');
  const contrastLevel = contrast === 'high' ? 1 : contrast === 'standard' ? 0 : systemContrast;
  const dynamicSeed = useDynamicSeed(dynamicColor);

  const seedKey = JSON.stringify(seeds ?? null);
  const seedColor = dynamicSeed ?? seeds?.primary ?? DEFAULT_COLORS.primary;
  const colors = useMemo(
    () =>
      createThemeColors(
        { ...DEFAULT_COLORS, ...seeds, ...(dynamicSeed ? { primary: dynamicSeed } : null) },
        { mode, contrastLevel },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seedKey, dynamicSeed, mode, contrastLevel],
  );
  const typography = useMemo(() => createTypography(fonts), [fonts]);
  const shadows = useMemo(() => createShadows(colors), [colors]);
  const labelKey = JSON.stringify(labelOverrides ?? null);
  const accessibilityLabels = useMemo<AccessibilityLabels>(
    () => ({ ...DEFAULT_ACCESSIBILITY_LABELS, ...labelOverrides }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [labelKey],
  );

  // 보이는 화면이 내비게이션 바 아래에 어두운 면을 깔면(useNavigationBarOnDark) 모드와 상관없이 흰 버튼
  const navigationBarOverDark = useNavigationBarOverDark();
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // expo-navigation-bar style names the button color, like StatusBar: 'dark' = dark buttons on a light bar.
    NavigationBar.setStyle(mode === 'dark' || navigationBarOverDark ? 'light' : 'dark');
  }, [mode, navigationBarOverDark]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    StatusBar.setBarStyle(mode === 'dark' ? 'light-content' : 'dark-content');
  }, [mode]);

  const appliedAppearanceRef = useRef(false);
  useEffect(() => {
    if (!syncNativeAppearance) {
      if (appliedAppearanceRef.current) {
        Appearance.setColorScheme('auto');
        appliedAppearanceRef.current = false;
      }
      return;
    }
    Appearance.setColorScheme(!darkMode ? 'light' : preference === 'system' ? 'auto' : preference);
    appliedAppearanceRef.current = true;
  }, [syncNativeAppearance, darkMode, preference]);

  useEffect(() => () => {
    if (appliedAppearanceRef.current) Appearance.setColorScheme('auto');
    appliedAppearanceRef.current = false;
  }, []);

  // Android 12+ 는 앱 전용 야간 모드를 시스템에 저장해 다음 실행의 시작 창(스플래시)도 앱 모드로 그린다.
  // Appearance 는 실행 중에만 유지돼, 시스템이 라이트인데 앱을 다크로 둔 사람은 켤 때마다 흰 스플래시를 봤다.
  // 저장된 선택을 읽기 전 기본값으로 쓰면 다크로 저장된 앱이 켤 때마다 밝아졌다 돌아오므로 선택을 안 뒤에만 쓴다.
  // 저장값이라 언마운트로 풀지 않는다. 동기화를 끄면 기기 모드를 따르게 되돌린다(예전 실행이 남긴 값까지).
  const nightModeKnown = !darkMode || preferenceKnown;
  useEffect(() => {
    if (Platform.OS !== 'android' || syncNativeAppearance) return;
    nativeModule()?.setApplicationNightMode?.('system');
  }, [syncNativeAppearance]);
  useEffect(() => {
    if (Platform.OS !== 'android' || !syncNativeAppearance || !nightModeKnown) return;
    nativeModule()?.setApplicationNightMode?.(!darkMode ? 'light' : preference);
  }, [syncNativeAppearance, nightModeKnown, darkMode, preference]);

  const setColorSchemePreference = useCallback(
    (next: ColorSchemePreference) => {
      if (!darkMode) return;
      preferenceRevision.current += 1;
      setPreference(next);
      setPreferenceKnown(true);
      AsyncStorage.setItem(STORAGE_KEY, next).catch((error) => console.error('[zs-ui] 테마 설정을 저장하지 못했습니다', error));
    },
    [darkMode],
  );

  const toggleTheme = useCallback(() => setColorSchemePreference(mode === 'dark' ? 'light' : 'dark'), [mode, setColorSchemePreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      typography,
      shadows,
      mode,
      contrastLevel,
      seedColor,
      fonts,
      fontAssets,
      colorSchemePreference: preference,
      setColorSchemePreference,
      toggleTheme,
      accessibilityLabels,
      maxFontSizeMultiplier,
    }),
    [colors, typography, shadows, mode, contrastLevel, seedColor, fonts, fontAssets, preference, setColorSchemePreference, toggleTheme, accessibilityLabels, maxFontSizeMultiplier],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
