import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import type { DateString, GridLayoutMetrics } from '../core';
import { CALENDAR_LOCALES, cellRect } from '../core';

export interface CellTouchTargetProps {
  date: DateString;
  row: number;
  column: number;
  metrics: GridLayoutMetrics;
  selected: boolean;
  eventCount: number;
  onSelect: (date: DateString) => void;
  formatLabel?: (date: DateString, eventCount: number, selected: boolean) => string;
}

/** locale 을 안 넘긴 단독 사용을 위한 기본값 — 한국어 */
export const defaultFormatLabel = CALENDAR_LOCALES.ko.cellLabel;

/**
 * Canvas 는 스크린리더가 읽지 못하므로 날짜마다 투명 터치 타깃을 겹쳐 둔다.
 * 최소 44pt 는 hitSlop 으로 보장한다 — 셀을 키우면 그리드 밀도가 무너진다.
 *
 * props 를 전부 원시값·안정 참조로 받아 memo 가 걸리게 한다 — 날짜 하나를 고를 때
 * 42개가 아니라 바뀐 두 셀만 다시 그려진다.
 */
function CellTouchTarget({
  date,
  row,
  column,
  metrics,
  selected,
  eventCount,
  onSelect,
  formatLabel = defaultFormatLabel,
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
