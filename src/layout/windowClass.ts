import type { ContentMaxWidth, ReadableMaxWidth, WindowLayout, WindowObservation, WindowSizeClassName } from './types';

export const WIDTH_BREAKPOINTS = { medium: 600, expanded: 840 } as const;
export const HEIGHT_BREAKPOINTS = { medium: 480, expanded: 900 } as const;
export const MATERIAL_READABLE_MAX_WIDTH = 640;

/** Android 큰 화면 — 창의 짧은 변이 이 dp 이상(Android sw600dp 기준, Jetpack WindowSizeClass medium 하한) */
export const LARGE_SCREEN_MIN_DP = 600;
/** 이 비율(긴 변/짧은 변) 이상이면 바형 폰 모양 — 19.5:9 ≈ 2.17. 태블릿 16:10 = 1.6, 16:9 = 1.78 */
export const PHONE_MIN_ASPECT = 1.9;
/** 접힘선이 있고 이 비율 이하면 책처럼 펼친 폴더블(Fold 약 1.1, Pixel Fold 1.2). 위아래로 여는 Flip(약 2.3)은 아님 */
export const BOOK_FOLDABLE_MAX_ASPECT = 1.6;

const aspectOf = (width: number, height: number) => Math.max(width, height) / Math.max(1, Math.min(width, height));

/**
 * 큰 화면 창인지. 밀도(화면 확대)·글자 크기와 상관없이 기기 모양으로 정한다.
 * - iOS: 가로 크기 등급 regular(iPad 전체 화면·펼친 iPhone Duo). iPhone 세로는 compact.
 * - Android: 기기 고유 밀도로 잰 창의 짧은 변 ≥ 600dp(네이티브가 stableWidth/Height 를 줄 때).
 *   주지 않는 이전 네이티브에서는 ① 현재 짧은 변 ≥ 600dp 이고 폰 비율이 아님(태블릿) ② 접힘선이 있고 책 비율(펼친 폴더블).
 */
export function resolveLargeScreen(observation: WindowObservation, os: 'ios' | 'android'): boolean {
  const { width, height } = observation;
  if (os === 'ios') {
    return observation.horizontalSizeClass ? observation.horizontalSizeClass === 'regular' : classify(width, WIDTH_BREAKPOINTS) !== 'compact';
  }
  if (observation.stableWidth && observation.stableHeight) {
    return Math.min(observation.stableWidth, observation.stableHeight) >= LARGE_SCREEN_MIN_DP;
  }
  const aspect = aspectOf(width, height);
  const tablet = Math.min(width, height) >= LARGE_SCREEN_MIN_DP && aspect < PHONE_MIN_ASPECT;
  const bookFoldable = (observation.displayFeatures ?? []).some((feature) => feature.type === 'fold') && aspect <= BOOK_FOLDABLE_MAX_ASPECT;
  return tablet || bookFoldable;
}

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
    largeScreen: resolveLargeScreen(observation, os),
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
    a.largeScreen === b.largeScreen &&
    JSON.stringify(a.platform) === JSON.stringify(b.platform)
  );
}
