import type { ContentMaxWidth, ReadableMaxWidth, WindowLayout, WindowObservation, WindowSizeClassName } from './types';

export const WIDTH_BREAKPOINTS = { medium: 600, expanded: 840 } as const;
export const HEIGHT_BREAKPOINTS = { medium: 480, expanded: 900 } as const;
export const MATERIAL_READABLE_MAX_WIDTH = 640;

export function resolveReadableMaxWidth(config: ReadableMaxWidth, observation: WindowObservation): number {
  if (typeof config === 'number') return config;
  return observation.readableWidth && observation.readableWidth > 0 ? observation.readableWidth : MATERIAL_READABLE_MAX_WIDTH;
}

export function resolveContentMaxWidth(
  config: ContentMaxWidth,
  layout: Pick<WindowLayout, 'widthClass' | 'readableMaxWidth'>,
): number | undefined {
  if (config === 'none' || layout.widthClass === 'compact') return undefined;
  return config === 'readable' ? layout.readableMaxWidth : config;
}

function classify(value: number, breakpoints: { medium: number; expanded: number }): WindowSizeClassName {
  if (value < breakpoints.medium) return 'compact';
  if (value < breakpoints.expanded) return 'medium';
  return 'expanded';
}

export function classifyWidth(width: number): WindowSizeClassName {
  return classify(width, WIDTH_BREAKPOINTS);
}

export function classifyHeight(height: number): WindowSizeClassName {
  return classify(height, HEIGHT_BREAKPOINTS);
}

const SIZE_CLASS_ORDER: Record<WindowSizeClassName, number> = { compact: 0, medium: 1, expanded: 2 };

export function narrowerClass(a: WindowSizeClassName, b: WindowSizeClassName): WindowSizeClassName {
  return SIZE_CLASS_ORDER[a] <= SIZE_CLASS_ORDER[b] ? a : b;
}

function classifyIOS(value: number, sizeClass: 'compact' | 'regular', breakpoints: { medium: number; expanded: number }): WindowSizeClassName {
  if (sizeClass === 'compact') return 'compact';
  return value < breakpoints.expanded ? 'medium' : 'expanded';
}

export function resolveWindowLayout(
  observation: WindowObservation,
  os: 'ios' | 'android',
  measured: boolean,
  readable: ReadableMaxWidth = 'system',
): WindowLayout {
  const { width, height, horizontalSizeClass, verticalSizeClass } = observation;
  const base: Omit<WindowLayout, 'widthClass' | 'heightClass' | 'platform'> = {
    width,
    height,
    orientation: width > height ? 'landscape' : 'portrait',
    measured,
    readableMaxWidth: resolveReadableMaxWidth(readable, observation),
  };

  if (os === 'ios' && horizontalSizeClass && verticalSizeClass) {
    return {
      ...base,
      widthClass: classifyIOS(width, horizontalSizeClass, WIDTH_BREAKPOINTS),
      heightClass: classifyIOS(height, verticalSizeClass, HEIGHT_BREAKPOINTS),
      platform: { os: 'ios', horizontalSizeClass, verticalSizeClass },
    };
  }

  if (os === 'android' && observation.widthClass && observation.heightClass) {
    return {
      ...base,
      widthClass: observation.widthClass,
      heightClass: observation.heightClass,
      platform: {
        os: 'android',
        windowSizeClass: { minWidthDp: observation.minWidthDp ?? 0, minHeightDp: observation.minHeightDp ?? 0 },
      },
    };
  }

  return {
    ...base,
    widthClass: classify(width, WIDTH_BREAKPOINTS),
    heightClass: classify(height, HEIGHT_BREAKPOINTS),
    platform: os === 'ios' ? { os: 'ios', horizontalSizeClass: null, verticalSizeClass: null } : { os: 'android', windowSizeClass: null },
  };
}

export function isSameWindowLayout(a: WindowLayout, b: WindowLayout): boolean {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.widthClass === b.widthClass &&
    a.heightClass === b.heightClass &&
    a.measured === b.measured &&
    a.readableMaxWidth === b.readableMaxWidth &&
    JSON.stringify(a.platform) === JSON.stringify(b.platform)
  );
}
