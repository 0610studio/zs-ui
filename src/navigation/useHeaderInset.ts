import { useContext } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderHeightContext } from 'expo-router/react-navigation';

export function useHeaderInset(): number {
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  return Platform.OS === 'android' ? headerHeight : 0;
}

export function useHeaderOverlap(enabled = true): number {
  const headerHeight = useHeaderInset();
  const { top } = useSafeAreaInsets();
  const { y } = useSafeAreaFrame();
  // In split screen the status bar inset can be zero. An overlaid screen still starts
  // at the window top, while an opaque header has already moved its container down.
  const overlapsHeader = top > 0 || y < 1;
  return enabled && headerHeight > 0 && overlapsHeader ? headerHeight : 0;
}
