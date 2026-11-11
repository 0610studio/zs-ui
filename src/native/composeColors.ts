import { useMemo } from 'react';
import type { MaterialColors } from '@expo/ui/jetpack-compose';
import { useTheme } from '../context/ThemeContext';
import { withOpacity, type ColorMode, type ColorName, type ThemeColors } from '../theme/color';
import { OPACITY } from '../theme/state';

const TRANSPARENT = '#00000000';
const DARK_SCRIM_OPACITY = 0.52;

export function createComposeColors(colors: ThemeColors, mode: ColorMode = 'light') {
  const disabledContent = withOpacity(colors.text, OPACITY.disabled);
  const disabledContainer = withOpacity(colors.text, OPACITY.disabledBackground);
  const uncheckedTrack = colors.surface4;
  return {
    text: colors.text,
    disabledText: disabledContent,
    switch: {
      checkedThumbColor: colors.onPrimary,
      checkedTrackColor: colors.primary,
      checkedBorderColor: TRANSPARENT,
      checkedIconColor: colors.primary,
      uncheckedThumbColor: colors.textSecondary,
      uncheckedTrackColor: uncheckedTrack,
      uncheckedBorderColor: colors.textSecondary,
      uncheckedIconColor: uncheckedTrack,
      disabledCheckedThumbColor: colors.background,
      disabledCheckedTrackColor: disabledContainer,
      disabledCheckedBorderColor: TRANSPARENT,
      disabledCheckedIconColor: disabledContent,
      disabledUncheckedThumbColor: disabledContent,
      disabledUncheckedTrackColor: withOpacity(uncheckedTrack, OPACITY.disabledBackground),
      disabledUncheckedBorderColor: disabledContainer,
      disabledUncheckedIconColor: withOpacity(uncheckedTrack, OPACITY.disabled),
    },
    checkbox: {
      checkedColor: colors.primary,
      uncheckedColor: colors.textSecondary,
      checkmarkColor: colors.onPrimary,
      disabledCheckedColor: disabledContent,
      disabledUncheckedColor: disabledContent,
      disabledIndeterminateColor: disabledContent,
    },
    radioButton: {
      selectedColor: colors.text,
      unselectedColor: colors.textSecondary,
      disabledSelectedColor: disabledContent,
      disabledUnselectedColor: disabledContent,
    },
    menuContainer: colors.surface3,
    menuItem: {
      textColor: colors.text,
      leadingIconColor: colors.textSecondary,
      trailingIconColor: colors.textSecondary,
      disabledTextColor: disabledContent,
      disabledLeadingIconColor: disabledContent,
      disabledTrailingIconColor: disabledContent,
    },
    bottomSheet: {
      contentColor: colors.text,
      scrimColor: withOpacity(colors.backdrop, mode === 'dark' ? DARK_SCRIM_OPACITY : OPACITY.backdrop),
    },
    loadingIndicator: {
      color: colors.textSecondary,
      containerColor: colors.surface4,
    },
  } as const;
}

export type ComposeColors = ReturnType<typeof createComposeColors>;

export function useComposeColors(): ComposeColors {
  const { colors, mode } = useTheme();
  return useMemo(() => createComposeColors(colors, mode), [colors, mode]);
}

const MATERIAL_ROLES = {
  primary: 'primary',
  onPrimary: 'onPrimary',
  primaryContainer: 'primaryContainer',
  onPrimaryContainer: 'onPrimaryContainer',
  inversePrimary: 'primaryInverse',
  secondary: 'secondary',
  onSecondary: 'onSecondary',
  secondaryContainer: 'secondaryContainer',
  onSecondaryContainer: 'onSecondaryContainer',
  tertiary: 'tertiary',
  onTertiary: 'onTertiary',
  tertiaryContainer: 'tertiaryContainer',
  onTertiaryContainer: 'onTertiaryContainer',
  error: 'error',
  onError: 'onError',
  errorContainer: 'errorContainer',
  onErrorContainer: 'onErrorContainer',
  background: 'background',
  onBackground: 'text',
  surface: 'background',
  onSurface: 'text',
  surfaceVariant: 'surface5',
  onSurfaceVariant: 'textSecondary',
  inverseSurface: 'backgroundInverse',
  inverseOnSurface: 'textInverse',
  outline: 'borderStrong',
  outlineVariant: 'border',
  scrim: 'backdrop',
  surfaceContainerLowest: 'surface1',
  surfaceContainerLow: 'surface2',
  surfaceContainer: 'surface3',
  surfaceContainerHigh: 'surface4',
  surfaceContainerHighest: 'surface5',
} as const satisfies Partial<Record<keyof MaterialColors, ColorName>>;

function isRoleColor(color: string): color is MaterialColors['primary'] {
  return /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color);
}

export function createMaterialColorScheme(colors: ThemeColors, mode: ColorMode): Partial<MaterialColors> {
  const scheme: Partial<MaterialColors> = { surfaceTint: TRANSPARENT };
  for (const role of Object.keys(MATERIAL_ROLES) as (keyof typeof MATERIAL_ROLES)[]) {
    const color = colors[MATERIAL_ROLES[role]];
    if (isRoleColor(color)) scheme[role] = color;
  }
  const [bright, dim] = mode === 'dark' ? [colors.surface5, colors.background] : [colors.background, colors.surface5];
  if (isRoleColor(bright)) scheme.surfaceBright = bright;
  if (isRoleColor(dim)) scheme.surfaceDim = dim;
  return scheme;
}
