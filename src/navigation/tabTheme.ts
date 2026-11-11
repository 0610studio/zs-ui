import { Platform } from 'react-native';
import { Contrast, Hct, argbFromHex, hexFromArgb } from '@material/material-color-utilities';
import type { ThemeColors } from '../theme/color';
import { fontFamilyFor, type ThemeFonts } from '../theme/typeScale';

const IOS_BADGE_TEXT = '#ffffff';
const IOS_BADGE_CONTRAST = 4.5;
const IOS_BADGE_TONE = 40;
const MAX_CHROMA = 200;

export function iosBadgeBackground(error: string): string {
  const hct = Hct.fromInt(argbFromHex(error));
  if (Contrast.ratioOfTones(100, hct.tone) >= IOS_BADGE_CONTRAST) return error;
  return hexFromArgb(Hct.from(hct.hue, MAX_CHROMA, IOS_BADGE_TONE).toInt());
}

export function resolveTabTheme(colors: ThemeColors, fonts: ThemeFonts | undefined, unselected: { icon?: string; label?: string } = {}) {
  const android = Platform.OS === 'android';
  return {
    colors: {
      background: android ? colors.surface3 : undefined,
      selected: colors.primaryMark,
      selectedLabel: colors.primaryMark,
      unselectedIcon: unselected.icon ?? (android ? colors.text : undefined),
      unselectedLabel: unselected.label ?? (android ? colors.text : undefined),
      indicator: colors.surface4,
      ripple: colors.text + '1a',
      badgeBackground: android ? colors.error : iosBadgeBackground(colors.error),
      badgeText: android ? colors.onError : IOS_BADGE_TEXT,
    },
    fontFamily: android ? fontFamilyFor(fonts, 500) : undefined,
  };
}
