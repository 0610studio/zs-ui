import { StyleSheet, View } from 'react-native';
import { ZSText, useTheme, withOpacity } from '@0610studio/zs-ui';
import { GAP, TABULAR } from '../../kit/layout';

export interface MeasureRow {
  name: string;
  unit: string;
  values: (number | null)[];
}

type Props = {
  rows: MeasureRow[];
  labels: string[];
  testID: string;
};

const NAME = 64;
const DOT_MIN = 8;
const DOT_MAX = 18;

export default function MeasureDots({ rows, labels, testID }: Props) {
  const { colors } = useTheme();
  const last = labels.length - 1;
  const label = rows.map((row) => `${row.name} ${row.values.map((value, index) => `${labels[index]} ${value === null ? '기록 없음' : `${value} ${row.unit}`}`).join(', ')}`).join('. ');

  return (
    <View style={styles.root} accessible accessibilityLabel={label} testID={testID}>
      {rows.map((row) => {
        const max = Math.max(...row.values.map((value) => value ?? 0));
        return (
          <View key={row.name} style={styles.row}>
            <View style={styles.name}>
              <ZSText variant="body2" emphasized>
                {row.name}
              </ZSText>
              <ZSText variant="caption" color="textSecondary">
                {row.unit}
              </ZSText>
            </View>
            {row.values.map((value, index) => {
              const ratio = value === null || max <= 0 ? 0 : value / max;
              const size = DOT_MIN + (DOT_MAX - DOT_MIN) * ratio;
              return (
                <View key={index} style={styles.cell}>
                  <View style={styles.dotBox}>
                    {value === null ? null : <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: index === last ? colors.primaryMark : withOpacity(colors.primaryMark, 0.45) }} />}
                  </View>
                  <ZSText variant="caption" color={value === null ? 'textSecondary' : 'text'} emphasized={index === last && value !== null} style={TABULAR}>
                    {value === null ? '–' : String(value)}
                  </ZSText>
                </View>
              );
            })}
          </View>
        );
      })}
      <View style={styles.row}>
        <View style={styles.name} />
        {labels.map((text, index) => (
          <ZSText key={text} variant="caption" color={index === last ? 'text' : 'textSecondary'} emphasized={index === last} numberOfLines={1} style={styles.label}>
            {text}
          </ZSText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { width: NAME, gap: GAP.xxs },
  cell: { flex: 1, alignItems: 'center', gap: GAP.xs },
  dotBox: { height: DOT_MAX, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, textAlign: 'center' },
});
