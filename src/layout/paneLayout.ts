import type { WindowSizeClassName } from './types';

export const PANE_MIN_WIDTH = 300;

export const MATERIAL_PANE_SPACER = 24;

export type PaneArrangement =
  | { mode: 'single' }
  | { mode: 'split'; basis: 'fraction' | 'fold'; primaryWidth: number; secondaryWidth: number; gap: number }
  | { mode: 'stacked'; primaryHeight: number; secondaryHeight: number; gap: number };

export interface LocalFold {
  orientation: 'vertical' | 'horizontal';
  start: number;
  size: number;
  active: boolean;
}

export interface PaneArrangementInput {
  widthClass: WindowSizeClassName;
  width: number;
  primaryFraction: number;
  dividerWidth: number;
  spacing?: number;
  fold?: LocalFold | null;
  rtl?: boolean;
  height?: number;
  tabletop?: boolean;
  insets?: { start: number; end: number };
}

function resolveFoldSplit(width: number, fold: LocalFold, rtl: boolean): PaneArrangement | null {
  if (fold.orientation !== 'vertical' || !fold.active) return null;
  const before = fold.start;
  const after = width - fold.start - fold.size;
  if (before <= 0 || after <= 0) return null;
  const [primaryWidth, secondaryWidth] = rtl ? [after, before] : [before, after];
  return { mode: 'split', basis: 'fold', primaryWidth, secondaryWidth, gap: fold.size };
}

function resolveTabletop(height: number | undefined, fold: LocalFold): PaneArrangement | null {
  if (height === undefined || fold.orientation !== 'horizontal' || !fold.active) return null;
  const above = fold.start;
  const below = height - fold.start - fold.size;
  if (above <= 0 || below <= 0) return null;
  return { mode: 'stacked', primaryHeight: above, secondaryHeight: below, gap: fold.size };
}

export function resolvePaneArrangement({
  widthClass,
  width,
  primaryFraction,
  dividerWidth,
  spacing = 0,
  fold,
  rtl = false,
  height,
  tabletop = false,
  insets = { start: 0, end: 0 },
}: PaneArrangementInput): PaneArrangement {
  if (fold && tabletop) {
    const stacked = resolveTabletop(height, fold);
    if (stacked) return stacked;
  }
  if (fold) {
    const foldSplit = resolveFoldSplit(width, fold, rtl);
    if (foldSplit) return foldSplit;
  }

  if (widthClass === 'compact') return { mode: 'single' };

  const available = width - insets.start - insets.end - dividerWidth - spacing;
  if (available < PANE_MIN_WIDTH * 2) return { mode: 'single' };

  const fraction = Math.min(Math.max(primaryFraction, 0), 1);
  const primaryContent = Math.round(Math.min(Math.max(available * fraction, PANE_MIN_WIDTH), available - PANE_MIN_WIDTH));
  return {
    mode: 'split',
    basis: 'fraction',
    primaryWidth: primaryContent + insets.start,
    secondaryWidth: available - primaryContent + insets.end,
    gap: spacing,
  };
}
