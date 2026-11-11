import { StyleSheet, View } from 'react-native';

export const MARK_ON_FILL = '#ffffff';

export const ROW_PRESS_DELAY = 130;
export const PRESS_HALO = 40;

export function PressHalo({ markSize, color }: { markSize: number; color: string }) {
  const offset = (markSize - PRESS_HALO) / 2;
  return <View pointerEvents="none" style={[styles.halo, { top: offset, left: offset, backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  halo: { position: 'absolute', width: PRESS_HALO, height: PRESS_HALO, borderRadius: PRESS_HALO / 2 },
});
