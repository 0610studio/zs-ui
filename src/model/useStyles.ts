import { useMemo } from 'react';
import { useTheme, type ThemeContextValue } from '../context/ThemeContext';

export const useStyles = <T extends Record<string, unknown>>(createStyles: (theme: ThemeContextValue) => T): T => {
  const theme = useTheme();
  return useMemo(() => createStyles(theme), [theme]);
};
