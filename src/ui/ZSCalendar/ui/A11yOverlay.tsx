import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DateString, EventIndex, GridLayoutMetrics } from '../core';
import { countEventsOn } from '../core';
import CellTouchTarget from './CellTouchTarget';

export interface A11yOverlayProps {
  matrix: ReadonlyArray<ReadonlyArray<DateString>>;
  metrics: GridLayoutMetrics;
  selectedDate: DateString | null;
  index: EventIndex;
  onSelect: (date: DateString) => void;
  formatLabel?: (date: DateString, eventCount: number, selected: boolean) => string;
}

/** 한 pane 분량의 접근성·터치 레이어 */
function A11yOverlay({ matrix, metrics, selectedDate, index, onSelect, formatLabel }: A11yOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {matrix.map((week, row) =>
        week.map((date, column) => (
          <CellTouchTarget
            key={date}
            date={date}
            row={row}
            column={column}
            metrics={metrics}
            selected={date === selectedDate}
            eventCount={countEventsOn(index, date)}
            onSelect={onSelect}
            formatLabel={formatLabel}
          />
        )),
      )}
    </View>
  );
}

export default memo(A11yOverlay);
