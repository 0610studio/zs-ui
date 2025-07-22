import { useMemo } from "react";
import { Theme } from "../theme/types";
import { useTheme } from "./useThemeProvider";

export const useStyleSheetCreate = (createStyles: (palette: Theme) => any) => {
  const { palette } = useTheme();
  return useMemo(() => createStyles(palette), [palette]);
};