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
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (mounted && revision === preferenceRevision.current && (stored === 'light' || stored === 'dark' || stored === 'system')) setPreference(stored);
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

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // expo-navigation-bar style names the button color, like StatusBar: 'dark' = dark buttons on a light bar.
    NavigationBar.setStyle(mode === 'dark' ? 'light' : 'dark');
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

  const setColorSchemePreference = useCallback(
    (next: ColorSchemePreference) => {
      if (!darkMode) return;
      preferenceRevision.current += 1;
      setPreference(next);
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
