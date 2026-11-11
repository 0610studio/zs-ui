import { useState } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { ZSText, useTheme, withOpacity } from '@0610studio/zs-ui';
import { GAP, TABULAR } from '../../kit/layout';

export type BarTone = 'strong' | 'soft' | 'outline';

export interface BarItem {
  label: string;
  value: number | null;
  tone?: BarTone;
  mark?: string;
  dot?: boolean;
}

type Props = {
  bars: BarItem[];
  color: string;
  format: (value: number) => string;
  showValues?: boolean;
  line?: { label: string; values: (number | null)[]; format: (value: number) => string };
  barLabel?: string;
  maxLabels?: number;
  height?: number;
  testID: string;
};

const TOP = 22;
const LABEL_ROW = 22;
const DOT_ROW = 12;
const AXIS = 44;
const BAR_RATIO = 0.45;
const BAR_MAX = 28;
const BAR_RADIUS = 6;
const CALLOUT_WIDTH = 240;
const SWATCH = 10;

function niceStep(raw: number): number {
  const safe = raw > 0 ? raw : 1;
  const power = 10 ** Math.floor(Math.log10(safe));
  return [1, 2, 2.5, 5, 10].map((m) => m * power).find((candidate) => candidate >= safe) ?? 10 * power;
}

function zeroTicks(max: number): { step: number; count: number } {
  const step = niceStep(max / 3);
  return { step, count: Math.max(1, Math.ceil((max || 1) / step)) };
}

const axisText = (value: number) => {
  if (value >= 10000) return `${Math.round((value / 10000) * 10) / 10}만`;
  return Number.isInteger(value) ? value.toLocaleString('ko-KR') : String(Math.round(value * 10) / 10);
};

const barPath = (x: number, y: number, width: number, height: number) => {
  const r = Math.min(BAR_RADIUS, width / 2, height);
  return `M${x} ${y + height} L${x} ${y + r} Q${x} ${y} ${x + r} ${y} L${x + width - r} ${y} Q${x + width} ${y} ${x + width} ${y + r} L${x + width} ${y + height} Z`;
};

export default function BarChart({ bars, color, format, showValues = false, line, barLabel, maxLabels = bars.length, height = 168, testID }: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const hasDots = bars.some((bar) => bar.dot);
  const bottom = LABEL_ROW + (hasDots ? DOT_ROW : 0);
  const left = line ? AXIS : 0;
  const plotRight = width - AXIS;
  const plotWidth = Math.max(0, plotRight - left);
  const plotHeight = height - TOP - bottom;
  const barMax = Math.max(0, ...bars.map((bar) => bar.value ?? 0));
  const { step, count } = zeroTicks(barMax);
  const top = step * count;
  const lineMax = line ? Math.max(0, ...line.values.map((value) => value ?? 0)) : 0;
  const lineStep = line ? niceStep(lineMax / count) : 1;
  const lineTop = lineStep * count;
  const slot = bars.length > 0 ? plotWidth / bars.length : 0;
  const barWidth = Math.min(BAR_MAX, slot * BAR_RATIO);
  const cx = (index: number) => left + slot * index + slot / 2;
  const y = (value: number) => TOP + plotHeight - (value / top) * plotHeight;
  const lineY = (value: number) => TOP + plotHeight - (value / lineTop) * plotHeight;
  const labelEvery = Math.ceil(bars.length / maxLabels);
  const showLabel = (index: number) => (bars.length - 1 - index) % labelEvery === 0;
  const current = bars.length - 1;
  const ticks = Array.from({ length: count + 1 }, (_, index) => index);

  const pick = (event: GestureResponderEvent) => {
    if (!line || slot === 0) return;
    const index = Math.min(bars.length - 1, Math.max(0, Math.floor((event.nativeEvent.locationX - left) / slot)));
    setPicked(index === picked ? null : index);
  };

  const describe = (index: number) => {
    const bar = bars[index];
    const parts = [bar.mark, bar.value === null ? '기록 없음' : `${barLabel ? `${barLabel} ` : ''}${format(bar.value)}`];
    const lineValue = line?.values[index];
    if (line && lineValue !== null && lineValue !== undefined) parts.push(`${line.label} ${line.format(lineValue)}`);
    return `${bar.label} ${parts.filter(Boolean).join(', ')}`;
  };
  const label = bars.map((_, index) => describe(index)).join('. ');
  const calloutLeft = picked === null ? 0 : Math.min(Math.max(cx(picked) - CALLOUT_WIDTH / 2, 0), Math.max(width - CALLOUT_WIDTH, 0));
  const linePoints = line ? line.values.map((value, index) => (value === null ? null : { x: cx(index), y: lineY(value) })) : [];
  const linePath = linePoints.reduce((path, point, index) => (point ? `${path}${index > 0 && linePoints[index - 1] ? 'L' : 'M'}${point.x} ${point.y} ` : path), '');

  return (
    <View style={styles.root}>
      {line ? (
        <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: color }]} />
            <ZSText variant="caption" color="textSecondary">
              {barLabel}
            </ZSText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.lineSwatch, { backgroundColor: colors.text }]} />
            <ZSText variant="caption" color="textSecondary">
              {line.label}
            </ZSText>
          </View>
        </View>
      ) : null}
      <Pressable
        onPress={pick}
        disabled={!line}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{ height }}
        accessible
        accessibilityLabel={label}
        testID={testID}
      >
        {width > 0 ? (
          <>
            <Svg width={width} height={height}>
              {ticks.map((tick) => (
                <Line key={tick} x1={left} x2={plotRight} y1={y(tick * step)} y2={y(tick * step)} stroke={colors.border} strokeWidth={1} />
              ))}
              {picked !== null ? <Rect x={cx(picked) - slot / 2 + 2} y={TOP - 6} width={slot - 4} height={plotHeight + 6} rx={8} fill={withOpacity(colors.text, 0.06)} /> : null}
              {bars.map((bar, index) => {
                if (bar.value === null || bar.value <= 0) return null;
                const barTop = y(bar.value);
                const d = barPath(cx(index) - barWidth / 2, barTop, barWidth, TOP + plotHeight - barTop);
                const tone = bar.tone ?? 'strong';
                return tone === 'outline' ? (
                  <Path key={index} d={d} fill={withOpacity(color, 0.12)} stroke={color} strokeWidth={1.5} strokeDasharray="3 2" />
                ) : (
                  <Path key={index} d={d} fill={tone === 'soft' ? withOpacity(color, 0.35) : color} />
                );
              })}
              {line ? <Path d={linePath} stroke={colors.text} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
              {linePoints.map((point, index) => (point ? <Circle key={index} cx={point.x} cy={point.y} r={index === picked ? 5 : 3.5} fill={colors.text} stroke={colors.surface2} strokeWidth={2} /> : null))}
              {bars.map((bar, index) => (bar.dot ? <Circle key={`dot-${index}`} cx={cx(index)} cy={TOP + plotHeight + LABEL_ROW + DOT_ROW / 2 - 2} r={3.5} fill={colors.primaryMark} /> : null))}
            </Svg>
            {ticks.map((tick) => (
              <ZSText key={`bar-${tick}`} variant="caption" color="textSecondary" style={[styles.axis, TABULAR, { top: y(tick * step) - 8 }, line ? { left: 0, width: AXIS - GAP.sm, textAlign: 'right' } : { left: plotRight + GAP.sm }]}>
                {axisText(tick * step)}
              </ZSText>
            ))}
            {line
              ? ticks.map((tick) => (
                  <ZSText key={`line-${tick}`} variant="caption" color="textSecondary" style={[styles.axis, TABULAR, { top: lineY(tick * lineStep) - 8, left: plotRight + GAP.sm }]}>
                    {axisText(tick * lineStep)}
                  </ZSText>
                ))
              : null}
            {bars.map((bar, index) => {
              const text = bar.mark ?? (showValues && bar.value !== null && bar.value > 0 ? format(bar.value) : null);
              if (!text) return null;
              return (
                <ZSText
                  key={`value-${index}`}
                  variant="caption"
                  emphasized={!!bar.mark}
                  color="textSecondary"
                  numberOfLines={1}
                  style={[styles.value, TABULAR, { left: cx(index) - slot / 2, width: slot, top: y(bar.value ?? 0) - 18 }]}
                >
                  {text}
                </ZSText>
              );
            })}
            {bars.map((bar, index) =>
              showLabel(index) ? (
                <ZSText
                  key={`label-${index}`}
                  variant="caption"
                  color={index === current ? 'text' : 'textSecondary'}
                  emphasized={index === current}
                  numberOfLines={1}
                  style={[styles.day, { left: cx(index) - slot, width: slot * 2, top: TOP + plotHeight + 4 }]}
                >
                  {bar.label}
                </ZSText>
              ) : null,
            )}
            {picked !== null ? (
              <View pointerEvents="none" style={[styles.callout, { left: calloutLeft, backgroundColor: colors.text }]} testID={`${testID}-callout`}>
                <ZSText variant="caption" emphasized style={[styles.calloutText, { color: colors.background }]}>
                  {describe(picked)}
                </ZSText>
              </View>
            ) : null}
          </>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: GAP.sm },
  legend: { flexDirection: 'row', gap: GAP.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: GAP.xs },
  swatch: { width: SWATCH, height: SWATCH, borderRadius: 2 },
  lineSwatch: { width: 14, height: 2, borderRadius: 1 },
  axis: { position: 'absolute', width: AXIS - GAP.sm },
  value: { position: 'absolute', textAlign: 'center' },
  day: { position: 'absolute', textAlign: 'center' },
  callout: { position: 'absolute', top: -GAP.xs, width: CALLOUT_WIDTH, borderRadius: 12, paddingVertical: GAP.xs, paddingHorizontal: GAP.sm },
  calloutText: { textAlign: 'center' },
});
