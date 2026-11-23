export type WindowSizeClassName = 'compact' | 'medium' | 'expanded';

export type IOSSizeClass = 'compact' | 'regular';

export interface AndroidWindowSizeClass {
  minWidthDp: number;
  minHeightDp: number;
}

export type WindowPlatformInfo =
  | { os: 'ios'; horizontalSizeClass: IOSSizeClass | null; verticalSizeClass: IOSSizeClass | null }
  | { os: 'android'; windowSizeClass: AndroidWindowSizeClass | null };

export interface WindowLayout {
  width: number;
  height: number;
  widthClass: WindowSizeClassName;
  heightClass: WindowSizeClassName;
  orientation: 'portrait' | 'landscape';
  measured: boolean;
  readableMaxWidth: number;
  /**
   * 큰 화면 창(태블릿·펼친 폴더블·iPad·펼친 iPhone Duo) — 화면 확대(밀도)·글자 크기와 상관없이 정해집니다.
   * 바형 폰은 늘 false. ZSPaneLayout 이 두 칸으로 나눌지 이 값으로 정합니다.
   */
  largeScreen: boolean;
  platform: WindowPlatformInfo;
}

export interface WindowObservation {
  width: number;
  height: number;
  horizontalSizeClass?: IOSSizeClass;
  verticalSizeClass?: IOSSizeClass;
  readableWidth?: number;
  widthClass?: WindowSizeClassName;
  heightClass?: WindowSizeClassName;
  minWidthDp?: number;
  minHeightDp?: number;
  /** Android — 기기 고유 밀도(DisplayMetrics.DENSITY_DEVICE_STABLE)로 잰 창 폭·높이(dp). 화면 크기(확대) 설정과 무관 */
  stableWidth?: number;
  stableHeight?: number;
  displayFeatures?: DisplayFeatureObservation[];
}

export type DisplayFeatureState = 'flat' | 'halfOpened' | 'unknown';

export interface DisplayFeatureObservation {
  type: 'fold' | 'occlusion';
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'vertical' | 'horizontal';
  state: DisplayFeatureState;
  active: boolean;
}

export interface DisplayFeature {
  type: 'fold' | 'occlusion';
  /** LayoutProvider 루트 기준 좌표(pt·dp). */
  rect: { x: number; y: number; width: number; height: number };
  orientation: 'vertical' | 'horizontal';
  active: boolean;
  state: DisplayFeatureState;
}

export interface DisplayFeatures {
  fold: DisplayFeature | null;
  occlusions: DisplayFeature[];
}

export type DevicePostureName = 'closed' | 'book' | 'tabletop' | 'flat' | 'unknown';

export interface DevicePosture {
  posture: DevicePostureName;
  /** 각도(도). 0은 닫힘, 180은 펼침이며 센서가 없으면 null입니다. */
  hingeAngle: number | null;
}

export type ReadableMaxWidth = 'system' | number;

export type BarAxis = 'vertical' | 'horizontal';

export type ContentMaxWidth = 'readable' | number | 'none';

export type PaneRole = 'primary' | 'secondary' | 'single';

export interface PaneLayout {
  role: PaneRole;
  width: number;
  widthClass: WindowSizeClassName;
  height: number;
  heightClass: WindowSizeClassName;
}
