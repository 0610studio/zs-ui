import { useContext } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderHeightContext } from 'expo-router/react-navigation';

export function useHeaderInset(): number {
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  return Platform.OS === 'android' ? headerHeight : 0;
}

export function useHeaderOverlap(enabled = true): number {
  const headerHeight = useHeaderInset();
  const { top } = useSafeAreaInsets();
  return enabled && headerHeight > 0 && top > 0 ? headerHeight : 0;
}
