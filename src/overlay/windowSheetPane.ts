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
