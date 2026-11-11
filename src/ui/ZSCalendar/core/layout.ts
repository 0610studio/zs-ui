import type { CalendarEventDisplay } from './types';

export interface GridLayoutInput {
  containerWidth: number;
  rowCount: number;
  maxContentWidth?: number | false;
  eventDisplay?: CalendarEventDisplay;
  availableRowsHeight?: number;
  fillRowCount?: number;
  fontScale?: number;
}

export interface GridLayoutMetrics {
  gridWidth: number;
  offsetX: number;
  cellWidth: number;
  rowHeight: number;
  weekdayHeaderHeight: number;
  rowsHeight: number;
  dayFontSize: number;
  dotRadius: number;
  dotGap: number;
  dotsPerRow: number;
  maxDots: number;
  selectionRadius: number;
  dayCenterOffsetY: number;
  dotCenterOffsetY: number;
  eventDisplay: CalendarEventDisplay;
  labelFontSize: number;
  chipHeight: number;
  chipGap: number;
  chipInsetX: number;
  chipTop: number;
  chipsPerCell: number;
}

export const DEFAULT_MAX_CONTENT_WIDTH = 520;
const MIN_ROW_HEIGHT = 52;
const SELECTION_DIAMETER = 40;
const SELECTION_CLEARANCE = 1.5;
const MAX_ROW_HEIGHT = 76;
export const DEFAULT_WEEKDAY_HEADER_HEIGHT = 28;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const LABEL_CHIP_GAP = 2;
const LABEL_CHIP_INSET_X = 2;
const LABEL_CELL_BOTTOM_PADDING = 4;
const LABEL_MAX_ROW_HEIGHT = 180;

function scaleForCellWidth(cellWidth: number) {
  if (cellWidth < 40) return { dayFontSize: 11, dotRadius: 1.5, dotGap: 2 };
  if (cellWidth < 48) return { dayFontSize: 13, dotRadius: 2, dotGap: 2 };
  if (cellWidth < 60) return { dayFontSize: 15, dotRadius: 2, dotGap: 2.5 };
  return { dayFontSize: 17, dotRadius: 2.5, dotGap: 3 };
}

const MIN_TEXT_SCALE = 0.85;
const MAX_DAY_TEXT_SCALE = 1.5;
const MAX_LABEL_TEXT_SCALE = 1.3;

function labelFontSizeForCellWidth(cellWidth: number): number {
  if (cellWidth < 48) return 10;
  if (cellWidth < 60) return 11;
  return 12;
}

export const MAX_DOT_ROWS = 2;

export function dotRegionWidth(cellWidth: number, selectionRadius: number): number {
  return Math.min(cellWidth - 6, selectionRadius * 2 + 10);
}

export function computeGridLayout({
  containerWidth,
  rowCount,
  maxContentWidth = DEFAULT_MAX_CONTENT_WIDTH,
  eventDisplay = 'dot',
  availableRowsHeight,
  fillRowCount = rowCount,
  fontScale = 1,
}: GridLayoutInput): GridLayoutMetrics {
  const safeWidth = Math.max(containerWidth, 0);
  const gridWidth = maxContentWidth === false ? safeWidth : Math.min(safeWidth, maxContentWidth);
  const cellWidth = gridWidth / 7;

  const scale = scaleForCellWidth(cellWidth);
  const safeRowCount = Math.max(rowCount, 0);
  const isLabel = eventDisplay === 'label';

  const baseDayFontSize = isLabel ? Math.max(scale.dayFontSize - 2, 11) : scale.dayFontSize;
  const maxDayFontSize = Math.max(baseDayFontSize, Math.floor((cellWidth - 8) / 1.3));
  const dayFontSize = Math.min(Math.round(baseDayFontSize * clamp(fontScale, MIN_TEXT_SCALE, MAX_DAY_TEXT_SCALE)), maxDayFontSize);
  const labelFontSize = Math.round(labelFontSizeForCellWidth(cellWidth) * clamp(fontScale, MIN_TEXT_SCALE, MAX_LABEL_TEXT_SCALE));
  const chipHeight = labelFontSize + 6;
  const chipTop = dayFontSize + 22;
  const minLabelRowHeight = chipTop + chipHeight * 2 + LABEL_CHIP_GAP + LABEL_CELL_BOTTOM_PADDING;
  const labelRowHeight = availableRowsHeight !== undefined && fillRowCount > 0
    ? clamp(Math.floor(availableRowsHeight / fillRowCount), minLabelRowHeight, Math.max(LABEL_MAX_ROW_HEIGHT, minLabelRowHeight))
    : minLabelRowHeight;

  const dotRowHeight = Math.max(cellWidth * 0.8, dayFontSize * 2.6);
  const rowHeight = isLabel ? labelRowHeight : clamp(dotRowHeight, MIN_ROW_HEIGHT, Math.max(MAX_ROW_HEIGHT, dayFontSize * 2.6));
  const selectionRadius = isLabel
    ? Math.max(Math.min(cellWidth - 8, chipTop - 8), 0) / 2
    : Math.min(cellWidth - 8, Math.max(SELECTION_DIAMETER, dayFontSize * 1.6)) / 2;
  const dayCenterOffsetY = isLabel ? chipTop / 2 : Math.max(rowHeight * 0.38, selectionRadius + SELECTION_CLEARANCE);
  const dotCenterOffsetY = Math.max(rowHeight * 0.8, dayCenterOffsetY + selectionRadius + scale.dotRadius + SELECTION_CLEARANCE);
  const chipsPerCell = Math.max(
    1,
    Math.floor((rowHeight - chipTop - LABEL_CELL_BOTTOM_PADDING + LABEL_CHIP_GAP) / (chipHeight + LABEL_CHIP_GAP)),
  );
  const dotsPerRow = Math.max(
    1,
    Math.floor((dotRegionWidth(cellWidth, selectionRadius) + scale.dotGap) / (scale.dotRadius * 2 + scale.dotGap)),
  );

  return {
    gridWidth,
    offsetX: (safeWidth - gridWidth) / 2,
    cellWidth,
    rowHeight,
    weekdayHeaderHeight: DEFAULT_WEEKDAY_HEADER_HEIGHT,
    rowsHeight: rowHeight * safeRowCount,
    dayCenterOffsetY,
    dotCenterOffsetY,
    selectionRadius,
    ...scale,
    dayFontSize,
    dotsPerRow,
    maxDots: dotsPerRow * MAX_DOT_ROWS,
    eventDisplay,
    labelFontSize,
    chipHeight,
    chipGap: LABEL_CHIP_GAP,
    chipInsetX: LABEL_CHIP_INSET_X,
    chipTop,
    chipsPerCell,
  };
}

export function dayCenter(metrics: GridLayoutMetrics, row: number, column: number): { x: number; y: number } {
  return {
    x: metrics.cellWidth * (column + 0.5),
    y: metrics.rowHeight * row + metrics.dayCenterOffsetY,
  };
}

export function dotCenter(metrics: GridLayoutMetrics, row: number, column: number): { x: number; y: number } {
  return {
    x: metrics.cellWidth * (column + 0.5),
    y: metrics.rowHeight * row + metrics.dotCenterOffsetY,
  };
}

export function cellRect(
  metrics: GridLayoutMetrics,
  row: number,
  column: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: metrics.cellWidth * column,
    y: metrics.rowHeight * row,
    width: metrics.cellWidth,
    height: metrics.rowHeight,
  };
}

export function chipRect(
  metrics: GridLayoutMetrics,
  row: number,
  column: number,
  line: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: metrics.cellWidth * column + metrics.chipInsetX,
    y: metrics.rowHeight * row + metrics.chipTop + line * (metrics.chipHeight + metrics.chipGap),
    width: Math.max(metrics.cellWidth - metrics.chipInsetX * 2, 0),
    height: metrics.chipHeight,
  };
}
