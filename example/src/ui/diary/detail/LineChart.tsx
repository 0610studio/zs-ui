import { useState } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { ZSText, useTheme, withOpacity } from '@0610studio/zs-ui';
import { GAP } from '../../kit/layout';
import { useWideLayout } from '../../kit/SplitColumns';
import { fixedValue, type Trend } from '../../../model/diary/detail';

/** 그래프 높이 — 넓은 창(폴더블 펼침)은 전체 폭 한 열이라 높이도 키운다 */
const HEIGHT = { compact: 140, wide: 220 } as const;
const TOP = 30;
const BOTTOM = 22;
const AXIS = 44;
const EDGE = 8;
const DOT = 3.5;
const DOT_CURRENT = 6;
const CALLOUT_WIDTH = 120;

const dayLabel = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
const fullDay = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;

function niceTicks(min: number, max: number): { ticks: number[]; decimals: number } {
  const span = max - min || Math.abs(max) * 0.1 || 1;
  const raw = span / 3;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * power).find((candidate) => candidate >= raw) ?? 10 * power;
  const low = Math.floor(min / step) * step;
  const high = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = low; value <= high + step / 2; value += step) ticks.push(Math.round(value * 1000) / 1000);
  const decimals = step < 1 ? Math.ceil(-Math.log10(step) - 1e-9) : 0;
  return { ticks: ticks.length < 2 ? [low, low + step] : ticks, decimals };
}

const diamond = (cx: number, cy: number, r: number) => `M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z`;

export default function LineChart({ trend, testID }: { trend: Trend; testID: string }) {
  const { colors } = useTheme();
  const height = HEIGHT[useWideLayout() ? 'wide' : 'compact'];
  const [width, setWidth] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const points = trend.series[0].points;
  const count = points.length;
  const values = trend.series.flatMap((serie) => serie.points.map((point) => point.value));
  const { ticks, decimals: tickDecimals } = niceTicks(Math.min(...values), Math.max(...values));
  const low = ticks[0];
  const high = ticks[ticks.length - 1];
  const plotRight = width - AXIS;
  const plotHeight = height - TOP - BOTTOM;
  const x = (index: number) => (count === 1 ? plotRight / 2 : EDGE + ((plotRight - EDGE * 2) * index) / (count - 1));
  const y = (value: number) => TOP + plotHeight - ((value - low) / (high - low)) * plotHeight;
  const mark = colors.primaryMark;
  const current = count - 1;

  const pick = (event: GestureResponderEvent) => {
    const touch = event.nativeEvent.locationX;
    let nearest = 0;
    points.forEach((_, index) => {
      if (Math.abs(x(index) - touch) < Math.abs(x(nearest) - touch)) nearest = index;
    });
    setPicked(nearest === current || nearest === picked ? null : nearest);
  };

  const calloutText =
    picked === null
      ? ''
      : `${fullDay(points[picked].at)} · ${trend.series.map((serie) => fixedValue(serie.points[picked].value, trend.decimals, trend.series.length > 1 ? undefined : trend.unitForAxis)).join(' / ')}${trend.series.length > 1 ? ` ${trend.unitForAxis}` : ''}`;
  const calloutLeft = picked === null ? 0 : Math.min(Math.max(x(picked) - CALLOUT_WIDTH / 2, 0), Math.max(plotRight - CALLOUT_WIDTH, 0));

  return (
    <Pressable onPress={pick} onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={[styles.root, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" testID={testID}>
      {width > 0 ? (
        <>
          <Svg width={width} height={height}>
            {ticks.map((tick) => (
              <Line key={tick} x1={0} x2={plotRight} y1={y(tick)} y2={y(tick)} stroke={colors.border} strokeWidth={1} />
            ))}
            {picked !== null ? <Rect x={x(picked) - 0.5} y={TOP - 4} width={1} height={plotHeight + 4} fill={withOpacity(colors.text, 0.3)} /> : null}
            {trend.series.map((serie) => (
              <Path
                key={serie.label}
                d={serie.points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)} ${y(point.value)}`).join(' ')}
                stroke={mark}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {trend.series.map((serie) =>
              serie.points.map((point, index) => {
                const big = index === current || index === picked;
                const r = big ? DOT_CURRENT : DOT;
                const cx = x(index);
                const cy = y(point.value);
                return serie.shape === 'diamond' ? (
                  <Path key={`${serie.label}-${index}`} d={diamond(cx, cy, r + 1)} fill={colors.surface2} stroke={mark} strokeWidth={2} strokeLinejoin="round" />
                ) : (
                  <Circle key={`${serie.label}-${index}`} cx={cx} cy={cy} r={r} fill={mark} stroke={colors.surface2} strokeWidth={2} />
                );
              }),
            )}
          </Svg>
          {ticks.map((tick) => (
            <ZSText key={tick} variant="caption" color="textSecondary" style={[styles.axis, { top: y(tick) - 8, left: plotRight + GAP.sm }]}>
              {tick.toFixed(tickDecimals)}
            </ZSText>
          ))}
          {trend.series.length > 1
            ? trend.series.map((serie) => (
                <ZSText key={serie.label} variant="caption" color="textSecondary" style={[styles.seriesName, { top: y(serie.points[current].value) - 26, right: AXIS + EDGE - 4 }]}>
                  {serie.label.replace(' 혈압', '')}
                </ZSText>
              ))
            : null}
          {points.map((point, index) => (
            <ZSText
              key={index}
              variant="caption"
              color={index === current ? 'text' : 'textSecondary'}
              emphasized={index === current}
              style={[styles.day, { left: x(index) - 24 }]}
            >
              {dayLabel(point.at)}
            </ZSText>
          ))}
          {picked !== null ? (
            <View pointerEvents="none" style={[styles.callout, { left: calloutLeft, backgroundColor: colors.text }]} testID={`${testID}-callout`}>
              <ZSText variant="caption" emphasized style={[styles.calloutText, { color: colors.background }]}>
                {calloutText}
              </ZSText>
            </View>
          ) : null}
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  axis: { position: 'absolute', width: AXIS - GAP.sm },
  seriesName: { position: 'absolute' },
  day: { position: 'absolute', bottom: 0, width: 48, textAlign: 'center' },
  callout: { position: 'absolute', top: 0, width: CALLOUT_WIDTH, borderRadius: 999, paddingVertical: GAP.xxs + 1, paddingHorizontal: GAP.sm },
  calloutText: { textAlign: 'center' },
});
