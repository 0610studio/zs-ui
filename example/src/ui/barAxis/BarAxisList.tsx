import { StyleSheet, View } from 'react-native';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import ScreenScrollView from '../kit/ScreenScrollView';

const ROWS = Array.from({ length: 30 }, (_, index) => index + 1);

export default function BarAxisList() {
  const { colors } = useTheme();

  return (
    <ScreenScrollView style={{ backgroundColor: colors.surface1 }} contentContainerStyle={styles.content}>
      {ROWS.map((row) => (
        <View key={row} style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <ZSText variant="subtitle2" testID={row === ROWS.length ? 'bar-axis-list-last' : undefined}>{`행 ${row}`}</ZSText>
        </View>
      ))}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 8,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
