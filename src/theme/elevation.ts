import type { BoxShadowValue } from "react-native";
import { ShadowLevel, ShadowStyle } from "./types";
import { Theme } from "./types";

export const IOS_SHADOW = [
  { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
  { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.0 },
  { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2.22 },
  { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2.62 },
  { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84 },
  { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4.65 },
  { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4.65 },
  { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 4.65 },
  { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 5.8 },
  { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 6.5 },
] as const satisfies readonly ShadowStyle[];

export interface ElevationProps {
  boxShadow?: BoxShadowValue[];
}

export type ElevationStyles = {
  [key in ShadowLevel]: ElevationProps;
};

const SHADOW_LEVELS: readonly ShadowLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export interface ColorChannels {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** `rgb()`/`rgba()` 색상 문자열에서 r·g·b·a 채널을 추출한다. 파싱 실패 시 불투명 검정으로 폴백. */
export function parseColorChannels(color: string): ColorChannels {
  const group = color.match(/rgba?\(([^)]+)\)/i)?.[1];
  if (!group) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  const [r, g, b, a] = group.split(',').map((part) => parseFloat(part.trim()));
  return {
    r: r ?? 0,
    g: g ?? 0,
    b: b ?? 0,
    a: a === undefined || Number.isNaN(a) ? 1 : a,
  };
}

/**
 * IOS_SHADOW 의 레벨별 오프셋·블러와 elevationShadow 색상을 합쳐 cross-platform boxShadow 를 만든다.
 * 기존 iOS 그림자와 동일하게 최종 불투명도는 색상 alpha × shadowOpacity 로 계산한다.
 */
export function createBoxShadow(level: ShadowLevel, shadowColor: string): BoxShadowValue[] {
  const shadow = IOS_SHADOW[level];
  const { r, g, b, a } = parseColorChannels(shadowColor);
  const alpha = a * shadow.shadowOpacity;

  if (alpha <= 0) {
    return [];
  }

  return [
    {
      offsetX: shadow.shadowOffset.width,
      offsetY: shadow.shadowOffset.height,
      blurRadius: shadow.shadowRadius,
      spreadDistance: 0,
      color: `rgba(${r}, ${g}, ${b}, ${alpha})`,
    },
  ];
}

export default function elevation(palette: Theme): ElevationStyles {
  return SHADOW_LEVELS.reduce((styles, level) => {
    styles[level] = { boxShadow: createBoxShadow(level, palette.elevationShadow[level] ?? '') };
    return styles;
  }, {} as ElevationStyles);
}
