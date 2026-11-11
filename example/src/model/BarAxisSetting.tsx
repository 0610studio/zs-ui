import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BarAxis } from '@0610studio/zs-ui';

const STORAGE_KEY = 'zs-ui-example:barAxis';

interface BarAxisSettingValue {
  barAxis: BarAxis;
  setBarAxis: (next: BarAxis) => void;
}

const BarAxisSettingContext = createContext<BarAxisSettingValue | null>(null);

export function BarAxisSettingProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<BarAxis | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setSaved(value === 'horizontal' ? 'horizontal' : 'vertical'))
      .catch((error) => {
        console.error('[example] 바 배치 설정을 읽지 못했습니다', error);
        setSaved('vertical');
      });
  }, []);

  const setBarAxis = useCallback((next: BarAxis) => {
    setSaved(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((error) => console.error('[example] 바 배치 설정을 저장하지 못했습니다', error));
  }, []);

  const value = useMemo(
    () => (saved ? { barAxis: saved, setBarAxis } : null),
    [saved, setBarAxis],
  );
  if (!value) return null;
  return <BarAxisSettingContext.Provider value={value}>{children}</BarAxisSettingContext.Provider>;
}

export function useBarAxisSetting(): BarAxisSettingValue {
  const value = useContext(BarAxisSettingContext);
  if (!value) throw new Error('useBarAxisSetting must be used within a BarAxisSettingProvider');
  return value;
}
