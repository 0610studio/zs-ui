import { StyleSheet, View } from 'react-native';
import ZSText from '../../ZSText';
import { useTheme } from '../../../context/ThemeContext';
import { minFontSizeMultiplier } from '../../../theme/fontScale';
import { weekdayHeaderColor, type CalendarTheme, type FirstDayOfWeek, type GridLayoutMetrics } from '../core';

export interface WeekdayHeaderProps {
  labels: readonly string[];
  metrics: GridLayoutMetrics;
  theme: CalendarTheme;
  firstDayOfWeek: FirstDayOfWeek;
}

export default function WeekdayHeader({ labels, metrics, theme, firstDayOfWeek }: WeekdayHeaderProps) {
  const { maxFontSizeMultiplier } = useTheme();
  const labelMaxMultiplier = minFontSizeMultiplier(1.4, maxFontSizeMultiplier);
  return (
    <View
      style={[styles.row, { width: metrics.gridWidth, height: metrics.weekdayHeaderHeight }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {labels.map((label, column) => {
        const color = weekdayHeaderColor((firstDayOfWeek + column) % 7, theme);
        return (
          <View key={`${label}-${column}`} style={[styles.cell, { width: metrics.cellWidth }]}>
            <ZSText variant="label" color={color} maxFontSizeMultiplier={labelMaxMultiplier}>{label}</ZSText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { alignItems: 'center', justifyContent: 'center' },
});
