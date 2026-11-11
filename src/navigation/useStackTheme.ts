import { createElement, useMemo, type ReactNode } from 'react';
import { Platform, type ColorValue, type TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { isViewControllerBasedStatusBarIOS } from '../native/statusBarAppearance';
import { contrastRatio, type ThemeColors } from '../theme/color';
import { fontFamilyFor, TYPE_SCALE } from '../theme/typeScale';
import { HeaderBackButton } from './HeaderBackButton';

export interface StackThemeOptions {
  tint?: 'text' | 'primary';
  transparentHeader?: boolean;
}

export interface StackTheme {
  headerTintColor: string;
  headerTitleStyle?: Pick<TextStyle, 'fontFamily'>;
  headerLargeTitleStyle?: Pick<TextStyle, 'fontFamily'>;
  headerBackButtonDisplayMode: 'minimal';
  headerTransparent: boolean;
  headerLeft?: (props: { canGoBack?: boolean; tintColor?: ColorValue }) => ReactNode;
  statusBarStyle?: 'light' | 'dark';
}

const TEXT_CONTRAST = 4.5;

function brandTextColor(colors: ThemeColors): string {
  return contrastRatio(colors.primary, colors.background) >= TEXT_CONTRAST ? colors.primary : colors.onPrimaryContainer;
}

function androidHeaderLeft({ canGoBack, tintColor }: { canGoBack?: boolean; tintColor?: ColorValue }): ReactNode {
  return canGoBack ? createElement(HeaderBackButton, { tintColor }) : null;
}

function supportsTransparentHeader(): boolean {
  if (Platform.OS === 'android') return true;
  if (Platform.OS === 'ios') return parseInt(String(Platform.Version), 10) >= 26;
  return false;
}

export function useStackTheme({ tint = 'text', transparentHeader = true }: StackThemeOptions = {}): StackTheme {
  const { colors, fonts, mode } = useTheme();

  return useMemo(() => {
    const titleFont = Platform.OS === 'android' ? fontFamilyFor(fonts, TYPE_SCALE.android.subtitle1.weight) : undefined;
    return {
      headerTintColor: tint === 'primary' ? brandTextColor(colors) : colors.text,
      ...(titleFont ? { headerTitleStyle: { fontFamily: titleFont }, headerLargeTitleStyle: { fontFamily: titleFont } } : null),
      headerBackButtonDisplayMode: 'minimal',
      headerTransparent: transparentHeader && supportsTransparentHeader(),
      ...(Platform.OS === 'android' ? { headerLeft: androidHeaderLeft } : null),
      ...(isViewControllerBasedStatusBarIOS() ? { statusBarStyle: mode === 'dark' ? 'light' : 'dark' } : null),
    };
  }, [colors, tint, transparentHeader, fonts, mode]);
}
