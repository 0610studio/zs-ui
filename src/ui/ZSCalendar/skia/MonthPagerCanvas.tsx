import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Group, Paint, Picture, Skia } from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { GestureDetector, type ComposedGesture, type GestureType } from 'react-native-gesture-handler';
import type {
  CalendarTheme,
  DateString,
  EventIndex,
  FirstDayOfWeek,
  GridLayoutMetrics,
} from '../core';
import WeekdayHeader from '../ui/WeekdayHeader';
import A11yOverlay from '../ui/A11yOverlay';
import type { CalendarPagerUnit, Pane } from './usePaneCache';
import { SELECTED_CARD_SHADOW_BLEED } from './drawGrid';

/**
 * 접힐 때 anchor 주가 y=0 에 오도록 pane 을 끌어올리고 나머지는 뷰포트 밖으로 밀어 자른다.
 *
 * 전환 중에는 anchor 가 아닌 행을 progress 에 비례해 흐리게 한다. Group opacity 는 기록된
 * SkPicture 에 먹지 않아 saveLayer 가 필요한데, 그 비용은 전환 중(fadeRows)·비선택 행 영역에만
 * 지불하고 정지 상태에서는 픽처를 그대로 그린다.
 */
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
  // 워클릿이 pane 을 통째로 캡처하면 그 안의 SkPicture 까지 직렬화하려다 죽는다
  const { page, anchorRow, rowCount } = pane;

  const transform = useDerivedValue(() => [
    { translateX: page * gridWidth },
    { translateY: -anchorRow * rowHeight * (1 - progress.value) },
  ]);
  const restOpacity = useDerivedValue(() => progress.value);

  // 비선택 행은 anchor 위·아래 두 사각형이다. Path 로 합치면 addRect 가 폐기 경고를 내고, 클립 두 번이 더 싸다
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

/**
 * Skia pane 과 같은 변환을 받아야 접힌 상태에서도 좌표가 어긋나지 않는다.
 * 현재 pane 에만 얹는다 — 이웃 pane 은 스와이프가 끝나 현재가 되기 전까지 누를 수도
 * 읽을 수도 없으므로, 셀 42개짜리 Pressable 트리를 세 벌 들고 있을 이유가 없다.
 *
 * 페이지 오프셋과 페이저 이동을 한 transform 으로 합친다(정지 시 ≈ 0). 바깥 뷰를 -page×폭 만큼
 * 밀고 안에서 되돌리면 Android 접근성이 바깥 뷰를 화면 밖으로 보고 셀 노드를 통째로 버린다.
 */
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
  formatLabel?: (date: DateString, eventCount: number, selected: boolean) => string;
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
  panes: ReadonlyArray<Pane>;
  /** 단위가 바뀌면 pane 노드를 새로 만든다 — 파생 변환값이 한 프레임 늦게 따라오는 빈 프레임을 막는다 */
  unit: CalendarPagerUnit;
  /** 전환 중 비선택 행 페이드 */
  fadeRows: boolean;
  metrics: GridLayoutMetrics;
  /** 가장 긴 달(6주)이 잘리지 않도록 고정한다 */
  canvasRowsHeight: number;
  /** 절대 페이지 번호로 조회하는 주 행 픽셀 높이 */
  rowsHeightByPage: DerivedValue<Record<number, number>>;
  translateX: SharedValue<number>;
  /** 0 = 주간, 1 = 월간 */
  progress: SharedValue<number>;
  gesture: ComposedGesture | GestureType;
  theme: CalendarTheme;
  weekdayLabels: ReadonlyArray<string>;
  firstDayOfWeek: FirstDayOfWeek;
  selectedDate: DateString | null;
  index: EventIndex;
  onSelect: (date: DateString) => void;
  /** 날짜 셀 접근성 라벨 — 로케일 문자열 */
  formatLabel?: (date: DateString, eventCount: number, selected: boolean) => string;
}

/**
 * 3-pane 무한 페이저 + 주↔월 전환.
 * 양옆 pane 을 비워두지 않고 전부 그리므로 스와이프가 끝나는 순간 도착 페이지가 완성되어 있다.
 */
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
  // metrics 를 워클릿에서 통째로 캡처하지 않도록 필요한 숫자만 꺼낸다
  const { gridWidth, rowHeight } = metrics;
  // panes 는 항상 [이전, 현재, 다음] 순서다
  const currentPane = panes[Math.floor(panes.length / 2)];
  const canvasTransform = useDerivedValue(() => [{ translateX: translateX.value }]);

  // 절대 페이지 좌표에서 보간하므로 JS 상태(page)가 한두 프레임 늦어도 높이가 튀지 않는다
  const containerStyle = useAnimatedStyle(() => {
    // 요일 헤더는 이 뷰포트 밖(위)에 있으므로 높이 계산에 넣지 않는다
    const collapsed = rowHeight;
    if (gridWidth <= 0) return { height: collapsed + SELECTED_CARD_SHADOW_BLEED };

    const position = -translateX.value / gridWidth;
    const lower = Math.floor(position);
    const ratio = position - lower;
    const table = rowsHeightByPage.value;
    const low = table[lower] ?? canvasRowsHeight;
    const high = table[lower + 1] ?? canvasRowsHeight;
    const expanded = low * (1 - ratio) + high * ratio;

    // 마지막 행 카드의 그림자가 뷰포트 밖으로 잘리지 않도록 번짐만큼 더 연다
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
  // 짧은 달로 넘어가는 동안 긴 달의 마지막 주가 잘려 나가야 높이 애니메이션이 자연스럽다
  viewport: { overflow: 'hidden' },
});
