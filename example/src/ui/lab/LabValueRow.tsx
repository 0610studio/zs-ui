import { StyleSheet, View } from 'react-native';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import useLargeText, { fitSingleWord } from '../../hooks/useLargeText';

export default function LabValueRow({ label, value, testID, isLast }: {
  label: string;
  value: string;
  testID: string;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  const stacked = useLargeText();
  return (
    <View style={[styles.row, stacked && styles.stacked, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <ZSText variant="subtitle2" color="textSecondary" style={stacked ? null : styles.label} {...(stacked ? fitSingleWord(label) : null)}>
        {label}
      </ZSText>
      <ZSText variant="caption" emphasized testID={testID} style={stacked ? null : styles.value}>{value}</ZSText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  stacked: { flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  label: { flex: 1, minWidth: '40%' },
  value: { flexShrink: 1, maxWidth: '60%', textAlign: 'right' },
});
