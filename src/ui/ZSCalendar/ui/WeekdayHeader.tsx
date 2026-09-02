import React from 'react';
import { StyleSheet, View } from 'react-native';
import ZSText from '../../ZSText';
import type { CalendarTheme, FirstDayOfWeek, GridLayoutMetrics } from '../core';

export interface WeekdayHeaderProps {
  /** 이미 firstDayOfWeek 기준으로 회전된 라벨 */
  labels: ReadonlyArray<string>;
  metrics: GridLayoutMetrics;
  theme: CalendarTheme;
  firstDayOfWeek: FirstDayOfWeek;
}

/**
 * Canvas 가 아니라 RN Text 다. drawText 는 폰트 폴백을 하지 않아 한글 라벨이 깨지고,
 * 이 줄은 페이저가 밀 때 고정되어야 하므로 pane 밖에 있는 편이 맞다.
 */
export default function WeekdayHeader({ labels, metrics, theme, firstDayOfWeek }: WeekdayHeaderProps) {
  return (
    <View
      style={[styles.row, { width: metrics.gridWidth, height: metrics.weekdayHeaderHeight }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {labels.map((label, column) => {
        const weekday = (firstDayOfWeek + column) % 7;
        const color = weekday === 0 ? theme.sundayText : weekday === 6 ? theme.saturdayText : theme.weekdayText;
        return (
          <View key={`${label}-${column}`} style={[styles.cell, { width: metrics.cellWidth }]}>
            <ZSText typo="caption.1" style={{ color }}>{label}</ZSText>
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
