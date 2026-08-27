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

const OPAQUE_BLACK: ColorChannels = { r: 0, g: 0, b: 0, a: 1 };

/**
 * `#RGB`/`#RGBA`/`#RRGGBB`/`#RRGGBBAA` hex 문자열에서 채널을 추출한다.
 * palette 의 semantic 색상(grey[100] 등)은 hex 로 정의돼 있어, 그 값을 그대로 그림자색으로 쓰려면 필요하다.
 */
function parseHexChannels(hex: string): ColorChannels | undefined {
  const body = hex.slice(1);
  const isShort = body.length === 3 || body.length === 4;
  const isLong = body.length === 6 || body.length === 8;
  if ((!isShort && !isLong) || !/^[0-9a-f]+$/i.test(body)) {
    return undefined;
  }

  const size = isShort ? 1 : 2;
  const channelAt = (index: number) => {
    const chunk = body.slice(index * size, index * size + size);
    return parseInt(isShort ? chunk + chunk : chunk, 16);
  };

  const hasAlpha = body.length === 4 || body.length === 8;
  return {
    r: channelAt(0),
    g: channelAt(1),
    b: channelAt(2),
    a: hasAlpha ? channelAt(3) / 255 : 1,
  };
}

/**
 * `rgb()`/`rgba()`/hex 색상 문자열에서 r·g·b·a 채널을 추출한다. 파싱 실패 시 불투명 검정으로 폴백.
 */
export function parseColorChannels(color: string): ColorChannels {
  if (color.startsWith('#')) {
    return parseHexChannels(color) ?? OPAQUE_BLACK;
  }

  const group = color.match(/rgba?\(([^)]+)\)/i)?.[1];
  if (!group) {
    return OPAQUE_BLACK;
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
 * iOS 그림자 표기(offset·opacity·radius)와 색상을 합쳐 cross-platform boxShadow 를 만든다.
 * 최종 불투명도는 색상 alpha × shadowOpacity 로 계산한다.
 *
 * boxShadow 한 표기로 iOS·Android 가 동일하게 렌더되므로, Android 에서 색상이 무시되는
 * `elevation` 이나 플랫폼별로 어긋나는 `shadow*` 조합 대신 이 헬퍼를 사용한다.
 *
 * @example
 * ```ts
 * const shadow = createShadow(
 *   { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
 *   palette.grey[100],
 * );
 * ```
 */
export function createShadow(shadow: ShadowStyle, shadowColor: string): BoxShadowValue[] {
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

/**
 * IOS_SHADOW 의 레벨별 오프셋·블러와 elevationShadow 색상을 합쳐 cross-platform boxShadow 를 만든다.
 */
export function createBoxShadow(level: ShadowLevel, shadowColor: string): BoxShadowValue[] {
  return createShadow(IOS_SHADOW[level], shadowColor);
}

export default function elevation(palette: Theme): ElevationStyles {
  return SHADOW_LEVELS.reduce((styles, level) => {
    styles[level] = { boxShadow: createBoxShadow(level, palette.elevationShadow[level] ?? '') };
    return styles;
  }, {} as ElevationStyles);
}
