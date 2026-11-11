import { createContext, useContext } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TabBarInsetContext = createContext(0);

export function useTabBarInset(): number {
  const inset = useContext(TabBarInsetContext);
  return Platform.OS === 'android' ? inset : 0;
}

export function useTabBarOverlap(enabled = true): number {
  const inset = useTabBarInset();
  const { bottom } = useSafeAreaInsets();
  return enabled && inset > 0 && bottom > 0 ? inset : 0;
}
