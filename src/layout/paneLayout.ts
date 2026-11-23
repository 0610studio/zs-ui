import type { WindowSizeClassName } from './types';

export const PANE_MIN_WIDTH = 300;
/** 큰 화면 창(largeScreen)에서 pane 하나의 최소 폭 — 화면 확대로 dp 가 줄어도 나누되, 이보다 좁으면 1단 */
export const LARGE_SCREEN_PANE_MIN_WIDTH = 240;

export const MATERIAL_PANE_SPACER = 24;

/** 비율 분할에서 pane 하나가 확보할 폭 — 큰 화면 창은 300, 화면 확대로 모자라면 240까지 줄인다 */
export function paneMinWidth(largeScreen: boolean | undefined, available: number): number {
  return largeScreen ? Math.max(LARGE_SCREEN_PANE_MIN_WIDTH, Math.min(PANE_MIN_WIDTH, Math.floor(available / 2))) : PANE_MIN_WIDTH;
}

/**
 * 비율 분할(분할 규칙 3·4)로 두 칸이 되는지. `available`은 좌우 safe area·구분선·spacing 을 뺀 폭이다.
 * largeScreen 을 모르는(옛 네이티브) 값이면 폭 등급으로 대신한다.
 */
export function canSplitByFraction({ widthClass, largeScreen, available }: { widthClass: WindowSizeClassName; largeScreen?: boolean; available: number }): boolean {
  if (largeScreen === undefined ? widthClass === 'compact' : !largeScreen) return false;
  return available >= paneMinWidth(largeScreen, available) * 2;
}

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
  /**
   * 큰 화면 창(WindowLayout.largeScreen). 주면 폭 등급 대신 이 값으로 나눌지 정하고, pane 최소 폭은 300 까지 확보하되
   * 모자라면 LARGE_SCREEN_PANE_MIN_WIDTH 까지 줄인다. false 면 1단(접힘선 경계 분할은 그대로).
   */
  largeScreen?: boolean;
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
  largeScreen,
}: PaneArrangementInput): PaneArrangement {
  if (fold && tabletop) {
    const stacked = resolveTabletop(height, fold);
    if (stacked) return stacked;
  }
  if (fold) {
    const foldSplit = resolveFoldSplit(width, fold, rtl);
    if (foldSplit) return foldSplit;
  }

  const available = width - insets.start - insets.end - dividerWidth - spacing;
  if (!canSplitByFraction({ widthClass, largeScreen, available })) return { mode: 'single' };
  const minPane = paneMinWidth(largeScreen, available);

  const fraction = Math.min(Math.max(primaryFraction, 0), 1);
  const primaryContent = Math.round(Math.min(Math.max(available * fraction, minPane), available - minPane));
  return {
    mode: 'split',
    basis: 'fraction',
    primaryWidth: primaryContent + insets.start,
    secondaryWidth: available - primaryContent + insets.end,
    gap: spacing,
  };
}
