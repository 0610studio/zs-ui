import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface SheetWidthSettingValue {
  /** OverlayProvider bottomSheetMaxWidth. undefined면 플랫폼 기본 폭 */
  sheetMaxWidth: number | undefined;
  setSheetMaxWidth: (next: number | undefined) => void;
}

const SheetWidthSettingContext = createContext<SheetWidthSettingValue | null>(null);

/** 랩에서 시트 최대 폭을 바꿔 보려고 루트 OverlayProvider 값을 들고 있다 */
export function SheetWidthSettingProvider({ children }: { children: ReactNode }) {
  const [sheetMaxWidth, setSheetMaxWidth] = useState<number | undefined>(undefined);
  const value = useMemo(() => ({ sheetMaxWidth, setSheetMaxWidth }), [sheetMaxWidth]);
  return <SheetWidthSettingContext.Provider value={value}>{children}</SheetWidthSettingContext.Provider>;
}

export function useSheetWidthSetting(): SheetWidthSettingValue {
  const value = useContext(SheetWidthSettingContext);
  if (!value) throw new Error('useSheetWidthSetting must be used within a SheetWidthSettingProvider');
  return value;
}
