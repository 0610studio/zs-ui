import type { DisplayFeature } from '../layout/types';

/** Keep a window sheet inside the larger pane when a vertical fold occludes pixels. Ties use the left pane. */
export function resolveWindowSheetPane(width: number, fold: DisplayFeature | null): { left: number; width: number } | null {
  if (!fold?.active || fold.orientation !== 'vertical' || !Number.isFinite(width) || width <= 0
    || !Number.isFinite(fold.rect.x) || !Number.isFinite(fold.rect.width) || fold.rect.width <= 0) return null;

  const start = Math.max(0, Math.min(width, fold.rect.x));
  const end = Math.max(0, Math.min(width, fold.rect.x + fold.rect.width));
  if (end <= start) return null;

  const before = start;
  const after = width - end;
  if (before <= 0 && after <= 0) return null;
  return before >= after ? { left: 0, width: before } : { left: end, width: after };
}

/**
 * Horizontal frame of a window sheet: the larger pane beside an occluding fold, narrowed to `maxWidth`
 * and centered in it. Null keeps the full window width.
 */
export function resolveWindowSheetFrame(width: number, fold: DisplayFeature | null, maxWidth?: number): { left: number; width: number } | null {
  const pane = resolveWindowSheetPane(width, fold);
  const region = pane ?? (Number.isFinite(width) && width > 0 ? { left: 0, width } : null);
  if (!region || maxWidth === undefined || !Number.isFinite(maxWidth) || maxWidth <= 0 || maxWidth >= region.width) return pane;
  return { left: region.left + (region.width - maxWidth) / 2, width: maxWidth };
}
