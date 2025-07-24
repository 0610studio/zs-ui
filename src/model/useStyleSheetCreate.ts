import { useMemo } from "react";
import { Theme } from "../theme/types";
import { useTheme } from "./useThemeProvider";

export const useStyleSheetCreate = <T extends Record<string, any>>(
  createStyles: (palette: Theme) => T
): T => {
  const { palette } = useTheme();
  return useMemo(() => createStyles(palette), [palette]);
};