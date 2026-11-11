import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ZSBox, ZSText, radiusStyle, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../../kit/layout';
import { fixedValue, type Trend } from '../../../model/diary/detail';
import LineChart from './LineChart';

function LegendMark({ shape, color, surface }: { shape: 'circle' | 'diamond'; color: string; surface: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      {shape === 'circle' ? <Circle cx={6} cy={6} r={4} fill={color} /> : <Path d="M6 1.5 L10.5 6 L6 10.5 L1.5 6 Z" fill={surface} stroke={color} strokeWidth={1.8} />}
    </Svg>
  );
}

const fullDay = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;

export default function TrendCard({ trend, testID, children }: { trend: Trend; testID: string;   children?: ReactNode }) {
  const { colors } = useTheme();
  const points = trend.series[0].points;
  const sentence = trend.sentence.map((part) => part.text).join('');
  const history = points.map((point, index) => `${fullDay(point.at)} ${trend.series.map((serie) => fixedValue(serie.points[index].value, trend.decimals, trend.unitForAxis)).join(' / ')}`).join(', ');
  const label = `${trend.title} ${trend.value} ${trend.unit}. ${sentence}${points.length > 1 ? ` 최근 ${points.length}개 기록: ${history}` : ''}`;
  return (
    <ZSBox backgroundColor="surface2" style={[styles.card, radiusStyle('xl')]} accessible accessibilityLabel={label} testID={testID}>
      <View style={styles.titleRow}>
        <ZSText variant="body2" emphasized color="textSecondary">
          {trend.title}
        </ZSText>
        {points.length > 1 ? (
          <ZSText variant="caption" color="textSecondary">
            {`최근 ${points.length}회`}
          </ZSText>
        ) : null}
      </View>
      <View style={styles.valueRow}>
        <ZSText variant="h2" emphasized testID={`${testID}-value`}>
          {trend.value}
        </ZSText>
        <ZSText variant="body1" color="textSecondary">
          {trend.unit}
        </ZSText>
        {trend.delta ? (
          <ZSBox backgroundColor="surface3" style={[styles.delta, radiusStyle('full')]} testID={`${testID}-delta`}>
            <ZSText variant="caption" emphasized color="textSecondary">
              {`${trend.delta.direction === 'up' ? '▲' : '▼'} ${trend.delta.amount}`}
            </ZSText>
          </ZSBox>
        ) : null}
      </View>
      {trend.series.length > 1 ? (
        <View style={styles.legend}>
          {trend.series.map((serie) => (
            <View key={serie.label} style={styles.legendItem}>
              <LegendMark shape={serie.shape} color={colors.primaryMark} surface={colors.surface2} />
              <ZSText variant="caption" color="textSecondary">
                {serie.label}
              </ZSText>
            </View>
          ))}
        </View>
      ) : null}
      <ZSText variant="body2" testID={`${testID}-note`}>
        {trend.sentence.map((part, index) =>
          part.strong ? (
            <ZSText key={index} variant="body2" emphasized>
              {part.text}
            </ZSText>
          ) : (
            part.text
          ),
        )}
      </ZSText>
      {points.length > 1 ? <LineChart trend={trend} testID={`${testID}-chart`} /> : null}
      {children}
    </ZSBox>
  );
}

const styles = StyleSheet.create({
  card: { padding: GAP.lg, gap: GAP.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: GAP.xs },
  delta: { alignSelf: 'center', marginStart: GAP.xs, paddingHorizontal: GAP.sm, paddingVertical: GAP.xxs },
  legend: { flexDirection: 'row', gap: GAP.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: GAP.xs },
});
