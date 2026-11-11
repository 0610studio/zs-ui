import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP, TABULAR } from '../../kit/layout';

export interface DonutSlice {
  label: string;
  count: number;
  color: string;
}

type Props = {
  slices: DonutSlice[];
  title?: string;
  size?: number;
  testID: string;
};

const RING = 0.18;
const GAP_DEG = 2;

const polar = (c: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) };
};

const ringPath = (c: number, outer: number, inner: number, start: number, end: number) => {
  const large = end - start > 180 ? 1 : 0;
  const a = polar(c, outer, start);
  const b = polar(c, outer, end);
  const d = polar(c, inner, end);
  const e = polar(c, inner, start);
  return `M${a.x} ${a.y} A${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y} L${d.x} ${d.y} A${inner} ${inner} 0 ${large} 0 ${e.x} ${e.y} Z`;
};

export default function DonutChart({ slices, title, size = 132, testID }: Props) {
  const { colors } = useTheme();
  const sorted = [...slices].filter((slice) => slice.count > 0).sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, slice) => sum + slice.count, 0);
  const c = size / 2;
  const outer = c - 1;
  const inner = outer * (1 - RING * 2);
  const gap = sorted.length > 1 ? GAP_DEG : 0;
  let angle = 0;
  const arcs = sorted.map((slice) => {
    const sweep = (slice.count / total) * 360;
    const start = angle + gap / 2;
    const end = angle + sweep - gap / 2;
    angle += sweep;
    return { slice, start, end };
  });
  const percent = (count: number) => `${Math.round((count / total) * 100)}%`;
  const label = `${title ? `${title}, ` : ''}모두 ${total}회. ${sorted.map((slice) => `${slice.label} ${slice.count}회 ${percent(slice.count)}`).join(', ')}`;

  return (
    <View style={styles.root} accessible accessibilityLabel={label} testID={testID}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {arcs.length === 1 ? (
            <Circle cx={c} cy={c} r={(outer + inner) / 2} stroke={arcs[0].slice.color} strokeWidth={outer - inner} fill="none" />
          ) : (
            arcs.map(({ slice, start, end }) => <Path key={slice.label} d={ringPath(c, outer, inner, start, end)} fill={slice.color} />)
          )}
          <Circle cx={c} cy={c} r={outer} stroke={colors.border} strokeWidth={1} fill="none" />
          <Circle cx={c} cy={c} r={inner} stroke={colors.border} strokeWidth={1} fill="none" />
        </Svg>
        <View style={styles.center} pointerEvents="none">
          {title ? (
            <ZSText variant="caption" color="textSecondary">
              {title}
            </ZSText>
          ) : null}
          <ZSText variant="subtitle1" emphasized style={TABULAR}>
            {`${total}회`}
          </ZSText>
        </View>
      </View>
      <View style={styles.legend}>
        {sorted.map((slice) => (
          <View key={slice.label} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: slice.color, borderColor: colors.border }]} />
            <ZSText variant="body2" style={styles.legendLabel} numberOfLines={2}>
              {slice.label}
            </ZSText>
            <ZSText variant="caption" color="textSecondary" style={TABULAR}>
              {`${slice.count}회 · ${percent(slice.count)}`}
            </ZSText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: GAP.lg },
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  legend: { flex: 1, gap: GAP.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: GAP.sm },
  swatch: { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
  legendLabel: { flex: 1 },
});
