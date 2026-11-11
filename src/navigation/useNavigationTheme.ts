import { useMemo } from 'react';
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { fontFamilyFor } from '../theme/typeScale';

type FontStyle = Theme['fonts']['regular'];

export function useNavigationTheme(): Theme {
  const { colors, mode, fonts } = useTheme();

  return useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;
    const font = (weight: number, fallback: FontStyle): FontStyle => {
      const fontFamily = fontFamilyFor(fonts, weight);
      return fontFamily ? { fontFamily, fontWeight: fallback.fontWeight } : fallback;
    };
    return {
      dark: mode === 'dark',
      colors: {
        primary: colors.text,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        notification: colors.error,
      },
      fonts: {
        regular: font(400, base.fonts.regular),
        medium: font(500, base.fonts.medium),
        bold: font(700, base.fonts.bold),
        heavy: font(800, base.fonts.heavy),
      },
    };
  }, [mode, colors, fonts]);
}
