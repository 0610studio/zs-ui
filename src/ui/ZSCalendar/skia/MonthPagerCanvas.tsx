import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Group, Paint, Picture, Skia } from 'react-native-skia';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { GestureDetector, type ComposedGesture, type PanGesture } from 'react-native-gesture-handler';
import type {
  CalendarLocaleStrings,
  CalendarMode,
  CalendarTheme,
  DateString,
  EventIndex,
  FirstDayOfWeek,
  GridLayoutMetrics,
} from '../core';
import WeekdayHeader from '../ui/WeekdayHeader';
import A11yOverlay from '../ui/A11yOverlay';
import type { Pane } from './usePaneCache';
import { SELECTED_CARD_SHADOW_BLEED } from './drawGrid';

function PaneGroup({
  pane,
  gridWidth,
  rowHeight,
  progress,
  fadeRows,
}: {
  pane: Pane;
  gridWidth: number;
  rowHeight: number;
  progress: SharedValue<number>;
  fadeRows: boolean;
}) {
  const { page, anchorRow } = pane;
  const rowCount = pane.matrix.length;

  const transform = useDerivedValue(() => [
    { translateX: page * gridWidth },
    { translateY: -anchorRow * rowHeight * (1 - progress.value) },
  ]);
  const restOpacity = useDerivedValue(() => progress.value);

  const clips = useMemo(() => {
    if (!fadeRows || rowCount <= 1) return null;
    const below = rowCount - anchorRow - 1;
    return {
      anchor: Skia.XYWHRect(0, anchorRow * rowHeight, gridWidth, rowHeight),
      above: anchorRow > 0 ? Skia.XYWHRect(0, 0, gridWidth, anchorRow * rowHeight) : null,
      below: below > 0 ? Skia.XYWHRect(0, (anchorRow + 1) * rowHeight, gridWidth, below * rowHeight) : null,
    };
  }, [fadeRows, rowCount, anchorRow, gridWidth, rowHeight]);

  return (
    <Group transform={transform}>
      {clips ? (
        <>
          <Group clip={clips.anchor}>
            <Picture picture={pane.picture} />
          </Group>
          {clips.above && (
            <Group clip={clips.above} layer={<Paint opacity={restOpacity} />}>
              <Picture picture={pane.picture} />
            </Group>
          )}
          {clips.below && (
            <Group clip={clips.below} layer={<Paint opacity={restOpacity} />}>
              <Picture picture={pane.picture} />
            </Group>
          )}
        </>
      ) : (
        <Picture picture={pane.picture} />
      )}
    </Group>
  );
}

function PaneOverlay({
  pane,
  gridWidth,
  rowHeight,
  canvasRowsHeight,
  translateX,
  progress,
  metrics,
  selectedDate,
  index,
  onSelect,
  formatLabel,
}: {
  pane: Pane;
  gridWidth: number;
  rowHeight: number;
  canvasRowsHeight: number;
  translateX: SharedValue<number>;
  progress: SharedValue<number>;
  metrics: GridLayoutMetrics;
  selectedDate: DateString | null;
  index: EventIndex;
  onSelect: (date: DateString) => void;
  formatLabel: CalendarLocaleStrings['cellLabel'];
}) {
  const { page, anchorRow } = pane;
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + page * gridWidth },
      { translateY: -anchorRow * rowHeight * (1 - progress.value) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[{ position: 'absolute', left: 0, top: 0, width: gridWidth, height: canvasRowsHeight }, style]}
    >
      <A11yOverlay
        matrix={pane.matrix}
        metrics={metrics}
        selectedDate={selectedDate}
        index={index}
        onSelect={onSelect}
        formatLabel={formatLabel}
      />
    </Animated.View>
  );
}

export interface MonthPagerCanvasProps {
  panes: readonly Pane[];
  unit: CalendarMode;
  fadeRows: boolean;
  metrics: GridLayoutMetrics;
  canvasRowsHeight: number;
  rowsHeightByPage: DerivedValue<Record<number, number>>;
  translateX: SharedValue<number>;
  progress: SharedValue<number>;
  gesture: ComposedGesture | PanGesture;
  theme: CalendarTheme;
  weekdayLabels: readonly string[];
  firstDayOfWeek: FirstDayOfWeek;
  selectedDate: DateString | null;
  index: EventIndex;
  onSelect: (date: DateString) => void;
  formatLabel: CalendarLocaleStrings['cellLabel'];
}

export default function MonthPagerCanvas({
  panes,
  unit,
  fadeRows,
  metrics,
  canvasRowsHeight,
  rowsHeightByPage,
  translateX,
  progress,
  gesture,
  theme,
  weekdayLabels,
  firstDayOfWeek,
  selectedDate,
  index,
  onSelect,
  formatLabel,
}: MonthPagerCanvasProps) {
  const { gridWidth, rowHeight } = metrics;
  const currentPane = panes[Math.floor(panes.length / 2)];
  const canvasTransform = useDerivedValue(() => [{ translateX: translateX.value }]);

  const containerStyle = useAnimatedStyle(() => {
    const collapsed = rowHeight;
    if (gridWidth <= 0) return { height: collapsed + SELECTED_CARD_SHADOW_BLEED };

    const position = -translateX.value / gridWidth;
    const lower = Math.floor(position);
    const ratio = position - lower;
    const table = rowsHeightByPage.value;
    const low = table[lower] ?? canvasRowsHeight;
    const high = table[lower + 1] ?? canvasRowsHeight;
    const expanded = low * (1 - ratio) + high * ratio;

    return { height: collapsed + (expanded - collapsed) * progress.value + SELECTED_CARD_SHADOW_BLEED };
  });

  const paneNodes = useMemo(
    () =>
      panes.map((pane) => (
        <PaneGroup
          key={`${unit}|${pane.page}`}
          pane={pane}
          gridWidth={gridWidth}
          rowHeight={rowHeight}
          progress={progress}
          fadeRows={fadeRows}
        />
      )),
    [panes, unit, fadeRows, gridWidth, rowHeight, progress],
  );

  return (
    <View style={{ width: gridWidth, marginLeft: metrics.offsetX }}>
      <WeekdayHeader labels={weekdayLabels} metrics={metrics} theme={theme} firstDayOfWeek={firstDayOfWeek} />

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.viewport, containerStyle, { width: gridWidth }]}>
          <Canvas style={{ width: gridWidth, height: canvasRowsHeight }}>
            <Group transform={canvasTransform}>{paneNodes}</Group>
          </Canvas>

          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {currentPane && (
              <PaneOverlay
                key={`${unit}|${currentPane.page}`}
                pane={currentPane}
                gridWidth={gridWidth}
                rowHeight={rowHeight}
                canvasRowsHeight={canvasRowsHeight}
                translateX={translateX}
                progress={progress}
                metrics={metrics}
                selectedDate={selectedDate}
                index={index}
                onSelect={onSelect}
                formatLabel={formatLabel}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: 'hidden' },
});
