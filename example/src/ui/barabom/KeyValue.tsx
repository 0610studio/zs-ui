import { StyleSheet, View } from 'react-native';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import type { DiaryKeyValue } from '../../../mock-api/db';
import useLargeText from '../../hooks/useLargeText';
import { GAP, RULE } from '../kit/layout';

type Props = {
  data?: readonly DiaryKeyValue[];
};

export default function KeyValue({ data }: Props) {
  const { colors } = useTheme();
  const stacked = useLargeText();

  if (!data || data.length === 0) return null;

  return (
    <View>
      {data.map((item, idx) => (
        <View
          key={`${item.key}-${idx}`}
          style={[styles.row, stacked && styles.rowStacked, { borderTopColor: colors.border }]}
        >
          <ZSText variant="body2" color="textSecondary" style={stacked ? undefined : styles.keyText}>{item.key}</ZSText>
          {item.value ? <ZSText variant="body2" style={stacked ? undefined : styles.valueText}>{item.value}</ZSText> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: GAP.sm + GAP.xxs, borderTopWidth: RULE },
  rowStacked: { flexDirection: 'column', gap: GAP.xxs },
  keyText: { flex: 1, flexShrink: 1, minWidth: '35%', marginEnd: GAP.sm },
  valueText: { flexShrink: 1, minWidth: 0, textAlign: 'right' },
});
