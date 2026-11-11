import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { withOpacity, type ThemeColors } from '../theme/color';

export const headerButtonContainerColor = (colors: ThemeColors): string => withOpacity(colors.surface2, 0.92);

export interface HeaderButtonColors {
  container: string;
}

export function useHeaderButtonColors(): HeaderButtonColors {
  const { colors } = useTheme();
  return useMemo(() => ({ container: headerButtonContainerColor(colors) }), [colors]);
}
