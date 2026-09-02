/**
 * 유일한 입력은 컨테이너 onLayout 폭이다. Dimensions 로 앱 시작 시 고정하면
 * 폴드 펼침·회전·split view 에서 전부 틀어진다.
 */

export interface GridLayoutInput {
  containerWidth: number;
  /** 월간 4~6, 주간 1 */
  rowCount: number;
  /** 태블릿용 상한. false 면 제한 없음 */
  maxContentWidth?: number | false;
  minRowHeight?: number;
  maxRowHeight?: number;
  weekdayHeaderHeight?: number;
}

export interface GridLayoutMetrics {
  /** maxContentWidth 로 잘린 폭 */
  gridWidth: number;
  /** 잘린 그리드를 가운데 두기 위한 좌측 여백 */
  offsetX: number;
  cellWidth: number;
  rowHeight: number;
  weekdayHeaderHeight: number;
  /** 주 행만의 높이 — Skia Canvas 가 차지하는 높이 */
  rowsHeight: number;
  totalHeight: number;
  /** 셀 폭에 따라 단계 조정된 값들 */
  dayFontSize: number;
  dotRadius: number;
  dotGap: number;
  maxDots: number;
  selectionRadius: number;
  /** 둘 다 셀 상단 기준 세로 위치 */
  dayCenterOffsetY: number;
  dotCenterOffsetY: number;
}

export const DEFAULT_MAX_CONTENT_WIDTH = 520;
const DEFAULT_MIN_ROW_HEIGHT = 44;
const DEFAULT_MAX_ROW_HEIGHT = 76;
const DEFAULT_WEEKDAY_HEADER_HEIGHT = 28;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/** 연속 보간 대신 단계를 쓴다 — 중간 폭에서 반픽셀 떨림이 생기지 않는다 */
function scaleForCellWidth(cellWidth: number) {
  if (cellWidth < 40) return { dayFontSize: 11, dotRadius: 1.5, dotGap: 2, maxDots: 2 };
  if (cellWidth < 48) return { dayFontSize: 13, dotRadius: 2, dotGap: 2.5, maxDots: 3 };
  if (cellWidth < 60) return { dayFontSize: 15, dotRadius: 2, dotGap: 3, maxDots: 3 };
  return { dayFontSize: 17, dotRadius: 2.5, dotGap: 4, maxDots: 4 };
}

export function computeGridLayout({
  containerWidth,
  rowCount,
  maxContentWidth = DEFAULT_MAX_CONTENT_WIDTH,
  minRowHeight = DEFAULT_MIN_ROW_HEIGHT,
  maxRowHeight = DEFAULT_MAX_ROW_HEIGHT,
  weekdayHeaderHeight = DEFAULT_WEEKDAY_HEADER_HEIGHT,
}: GridLayoutInput): GridLayoutMetrics {
  const safeWidth = Math.max(containerWidth, 0);
  const gridWidth = maxContentWidth === false ? safeWidth : Math.min(safeWidth, maxContentWidth);
  const cellWidth = gridWidth / 7;

  // 정사각 셀은 달력이 지나치게 헐렁하다 — 폰에서 행이 43~45 가 되는 비율. 상한이 없으면 6주 달이 화면을 넘긴다
  const rowHeight = clamp(cellWidth * 0.8, minRowHeight, maxRowHeight);
  const scale = scaleForCellWidth(cellWidth);
  const safeRowCount = Math.max(rowCount, 0);

  return {
    gridWidth,
    offsetX: (safeWidth - gridWidth) / 2,
    cellWidth,
    rowHeight,
    weekdayHeaderHeight,
    rowsHeight: rowHeight * safeRowCount,
    totalHeight: weekdayHeaderHeight + rowHeight * safeRowCount,
    // 셀 높이가 최소(44)일 때도 (dot중심 - 숫자중심) > (원 반지름 + dot 반지름) 인 비율 —
    // 겹치면 dot 이 선택 원 안에 묻힌다.
    dayCenterOffsetY: rowHeight * 0.38,
    dotCenterOffsetY: rowHeight * 0.8,
    selectionRadius: Math.min(cellWidth - 8, rowHeight * 0.72) / 2,
    ...scale,
  };
}

/** 아래 좌표는 전부 "주 행 영역 좌상단(0,0)" 기준 — 요일 헤더는 Canvas 밖 RN 뷰가 그린다 */
export function cellCenter(metrics: GridLayoutMetrics, row: number, column: number): { x: number; y: number } {
  return {
    x: metrics.cellWidth * (column + 0.5),
    y: metrics.rowHeight * (row + 0.5),
  };
}

/** 날짜 숫자와 선택 원의 중심 */
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

/** Skia 드로잉과 접근성 오버레이가 같은 사각형을 쓴다 */
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
