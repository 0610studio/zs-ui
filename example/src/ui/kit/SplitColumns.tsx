import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useWindowLayout } from '@0610studio/zs-ui';
import { GAP, PAGE_INSET } from './layout';

export function useWideLayout(): boolean {
  return useWindowLayout().widthClass !== 'compact';
}

export function usePageInset(): number {
  return useWideLayout() ? GAP['2xl'] : PAGE_INSET;
}

export const COLUMN_GAP = GAP['2xl'];

type Props = {
  start: ReactNode;
  end: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

export default function SplitColumns({ start, end, gap = GAP['2xl'], style }: Props) {
  const wide = useWideLayout();
  if (!wide) {
    return (
      <>
        {start}
        {end}
      </>
    );
  }
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.column, { gap }]}>{start}</View>
      <View style={[styles.column, { gap }]}>{end}</View>
    </View>
  );
}

export function DockColumn({ children, side = 'end' }: { children: ReactNode; side?: 'start' | 'end' }) {
  const wide = useWideLayout();
  if (!wide) return <>{children}</>;
  return (
    <View style={styles.row}>
      {side === 'end' ? <View style={styles.column} /> : null}
      <View style={styles.column}>{children}</View>
      {side === 'start' ? <View style={styles.column} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: COLUMN_GAP },
  column: { flex: 1, minWidth: 0 },
});
