import React from 'react';
import type { ThemeContextValue } from '../../context/ThemeContext';
import { createThemeColors, DEFAULT_COLORS, type ColorMode } from '../../theme/color';
import { createShadows } from '../../theme/shadow';
import { createTypography, type ThemeFonts, type ThemeFontAssets } from '../../theme/typeScale';
import { DEFAULT_ACCESSIBILITY_LABELS, type AccessibilityLabels } from '../../theme/accessibilityLabels';
import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER } from '../../theme/fontScale';

export interface TestThemeOptions {
  mode?: ColorMode;
  platform?: 'ios' | 'android';
  contrastLevel?: number;
  fonts?: ThemeFonts;
  fontAssets?: ThemeFontAssets;
  accessibilityLabels?: Partial<AccessibilityLabels>;
  maxFontSizeMultiplier?: number;
}

export function createTestTheme({
  mode = 'light',
  platform = 'ios',
  contrastLevel = 0,
  fonts,
  fontAssets,
  accessibilityLabels,
  maxFontSizeMultiplier = DEFAULT_MAX_FONT_SIZE_MULTIPLIER,
}: TestThemeOptions = {}): ThemeContextValue {
  const colors = createThemeColors(DEFAULT_COLORS, { mode, contrastLevel });
  return {
    colors,
    typography: createTypography(fonts, platform),
    shadows: createShadows(colors),
    mode,
    contrastLevel,
    seedColor: DEFAULT_COLORS.primary,
    fonts,
    fontAssets,
    colorSchemePreference: 'system',
    setColorSchemePreference: jest.fn(),
    toggleTheme: jest.fn(),
    accessibilityLabels: { ...DEFAULT_ACCESSIBILITY_LABELS, ...accessibilityLabels },
    maxFontSizeMultiplier,
  };
}

let current = createTestTheme();

export function setTestTheme(options: TestThemeOptions = {}): ThemeContextValue {
  current = createTestTheme(options);
  return current;
}

export function getTestTheme(): ThemeContextValue {
  return current;
}

export function mockThemeModule() {
  return {
    useTheme: () => current,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
}
