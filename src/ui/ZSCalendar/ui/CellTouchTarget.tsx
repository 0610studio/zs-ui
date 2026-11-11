import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import type { CalendarLocaleStrings, DateString, GridLayoutMetrics } from '../core';
import { cellRect } from '../core';

export interface CellTouchTargetProps {
  date: DateString;
  row: number;
  column: number;
  metrics: GridLayoutMetrics;
  selected: boolean;
  eventCount: number;
  onSelect: (date: DateString) => void;
  formatLabel: CalendarLocaleStrings['cellLabel'];
}

function CellTouchTarget({
  date,
  row,
  column,
  metrics,
  selected,
  eventCount,
  onSelect,
  formatLabel,
}: CellTouchTargetProps) {
  const rect = cellRect(metrics, row, column);
  const slotWidth = Math.max((44 - metrics.cellWidth) / 2, 0);
  const slotHeight = Math.max((44 - metrics.rowHeight) / 2, 0);
  const handlePress = useCallback(() => onSelect(date), [date, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: slotHeight, bottom: slotHeight, left: slotWidth, right: slotWidth }}
      style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={formatLabel(date, eventCount, selected)}
      testID={`calendar-cell-${date}`}
    />
  );
}

export default memo(CellTouchTarget);
