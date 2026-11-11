import { StyleSheet, View } from 'react-native';
import { ZSText, useTheme, withOpacity } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';
import { TEST_LEVEL_LABEL, testRange, type MedicalTest, type TestLevel } from '../../model/diary/medical';

const BAR = 8;
const MARKER = 18;
const TICK = 64;
const SEGMENT_GAP = 2;

export default function CheckupCard({ test }: { test: MedicalTest }) {
  const { colors, mode } = useTheme();
  const tint = mode === 'dark' ? { side: 0.7, middle: 0.8 } : { side: 0.45, middle: 0.55 };
  const { level, showBar, percent } = testRange(test);
  const strong: Record<TestLevel, string> = { low: colors.info, normal: colors.success, high: colors.error };
  const text: Record<TestLevel, string> = { low: colors.onInfoContainer, normal: colors.onSuccessContainer, high: colors.onErrorContainer };
  const label = `[${test.name}] ${test.value} ${test.unit}`;
  return (
    <View style={styles.root} accessible accessibilityLabel={showBar ? `${label} ${TEST_LEVEL_LABEL[level]}, 정상 범위 ${test.min || 0}~${test.max || 0}` : label}>
      <ZSText variant="subtitle1">
        {label}
        {showBar ? (
          <ZSText variant="subtitle1" emphasized color={text[level]}>
            {` (${TEST_LEVEL_LABEL[level]})`}
          </ZSText>
        ) : null}
      </ZSText>
      {showBar ? (
        <View style={styles.barWrap}>
          <View style={styles.bar}>
            <View style={[styles.segment, styles.left, { backgroundColor: withOpacity(colors.info, tint.side) }]} />
            <View style={[styles.segment, { backgroundColor: withOpacity(colors.success, tint.middle) }]} />
            <View style={[styles.segment, styles.right, { backgroundColor: withOpacity(colors.error, tint.side) }]} />
            <View style={[styles.marker, { left: `${percent}%`, borderColor: strong[level], backgroundColor: colors.background }]} />
          </View>
          <View style={styles.ticks}>
            <ZSText variant="caption" color="textSecondary" style={[styles.tickText, { left: '33.333%' }]}>
              {test.min || '0'}
            </ZSText>
            <ZSText variant="caption" color="textSecondary" style={[styles.tickText, { left: '66.666%' }]}>
              {test.max || '0'}
            </ZSText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.md },
  barWrap: { gap: GAP.xs + 2 },
  bar: { height: MARKER, flexDirection: 'row', alignItems: 'center', gap: SEGMENT_GAP },
  segment: { flex: 1, height: BAR },
  left: { borderTopLeftRadius: BAR / 2, borderBottomLeftRadius: BAR / 2 },
  right: { borderTopRightRadius: BAR / 2, borderBottomRightRadius: BAR / 2 },
  marker: { position: 'absolute', width: MARKER, height: MARKER, marginLeft: -MARKER / 2, borderRadius: MARKER / 2, borderWidth: 3 },
  ticks: { height: 18 },
  tickText: { position: 'absolute', width: TICK, marginLeft: -TICK / 2, textAlign: 'center' },
});
