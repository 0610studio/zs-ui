export interface ZSTopBarRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZSTopBarInsets {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export type ZSTopBarPlacement = 'besideStatusBar' | 'belowStatusBar';

export interface ZSTopBarRegion {
  placement: ZSTopBarPlacement;
  measured: boolean;
  height: number;
  contentInsets: ZSTopBarInsets;
  /** ZSTopBar 기준 좌표(pt·dp). */
  systemBar: ZSTopBarRect | null;
  systemMargins: { left: number; right: number } | null;
}

export interface TopBarMeasurement {
  width: number;
  height: number;
  safeAreaTop: number;
  bar?: ZSTopBarRect;
  margins?: { left: number; right: number };
}

export interface TopBarRegionOptions {
  safeArea: boolean;
  height: number;
  insets: { top: number; left: number; right: number };
  measured: boolean;
}

const NO_INSETS: ZSTopBarInsets = { top: 0, left: 0, right: 0, bottom: 0 };

export function findStatusBarSlot(measurement: TopBarMeasurement | null): ZSTopBarRect | null {
  const bar = measurement?.bar;
  if (!measurement || !bar || bar.width <= 0 || bar.height <= 0) return null;
  const insideTopInset = bar.y >= 0 && bar.y + bar.height <= measurement.safeAreaTop;
  return insideTopInset && bar.width < measurement.width ? bar : null;
}

export function resolveTopBarRegion(measurement: TopBarMeasurement | null, options: TopBarRegionOptions): ZSTopBarRegion {
  const { safeArea, height, insets, measured } = options;
  const bar = findStatusBarSlot(measurement);
  if (measurement && bar) {
    const left = Math.max(bar.x, measurement.margins?.left ?? bar.x);
    return {
      placement: 'besideStatusBar',
      measured: true,
      height: measurement.safeAreaTop,
      contentInsets: safeArea
        ? { top: bar.y, left, right: measurement.width - (bar.x + bar.width), bottom: measurement.safeAreaTop - (bar.y + bar.height) }
        : NO_INSETS,
      systemBar: bar,
      systemMargins: measurement.margins ?? null,
    };
  }
  return {
    placement: 'belowStatusBar',
    measured,
    height: insets.top + height,
    contentInsets: safeArea ? { top: insets.top, left: insets.left, right: insets.right, bottom: 0 } : NO_INSETS,
    systemBar: null,
    systemMargins: null,
  };
}

const sameInsets = (a: ZSTopBarInsets, b: ZSTopBarInsets) =>
  a.top === b.top && a.left === b.left && a.right === b.right && a.bottom === b.bottom;

const sameRect = (a: ZSTopBarRect | null, b: ZSTopBarRect | null) =>
  a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

export function isSameTopBarRegion(a: ZSTopBarRegion, b: ZSTopBarRegion): boolean {
  return (
    a.placement === b.placement &&
    a.measured === b.measured &&
    a.height === b.height &&
    sameInsets(a.contentInsets, b.contentInsets) &&
    sameRect(a.systemBar, b.systemBar) &&
    a.systemMargins?.left === b.systemMargins?.left &&
    a.systemMargins?.right === b.systemMargins?.right
  );
}
