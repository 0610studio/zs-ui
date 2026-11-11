export const ICON_GRID = 24;
export const ICON_STROKE_WIDTH = 1.8;
export const ICON_VIEW_BOX = `0 0 ${ICON_GRID} ${ICON_GRID}`;

export const ICON_MIN_RENDERED_STROKE = 1.5;

export function iconStrokeWidth(size: number): number {
  if (!(size > 0)) return ICON_STROKE_WIDTH;
  return Math.max(ICON_STROKE_WIDTH, (ICON_MIN_RENDERED_STROKE * ICON_GRID) / size);
}
