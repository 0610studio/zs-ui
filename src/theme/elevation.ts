import { Platform } from "react-native";
import { ShadowLevel, ShadowStyle } from "./types";
import { Theme } from "./types";

export const IOS_SHADOW: readonly ShadowStyle[] = [
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
] as const;

export interface ElevationProps {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

export type ElevationStyles = {
  [key in ShadowLevel]: ElevationProps;
};

export default function elevation(palette: Theme): ElevationStyles {

  return {
    0: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[0], shadowColor: palette.elevationShadow[0] }
      : { elevation: 0, shadowColor: palette.elevationShadow[0] },
    1: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[1], shadowColor: palette.elevationShadow[1] }
      : { elevation: 1, shadowColor: palette.elevationShadow[1] },
    2: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[2], shadowColor: palette.elevationShadow[2] }
      : { elevation: 2, shadowColor: palette.elevationShadow[2] },
    3: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[3], shadowColor: palette.elevationShadow[3] }
      : { elevation: 3, shadowColor: palette.elevationShadow[3] },
    4: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[4], shadowColor: palette.elevationShadow[4] }
      : { elevation: 4, shadowColor: palette.elevationShadow[4] },
    5: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[5], shadowColor: palette.elevationShadow[5] }
      : { elevation: 5, shadowColor: palette.elevationShadow[5] },
    6: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[6], shadowColor: palette.elevationShadow[6] }
      : { elevation: 6, shadowColor: palette.elevationShadow[6] },
    7: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[7], shadowColor: palette.elevationShadow[7] }
      : { elevation: 7, shadowColor: palette.elevationShadow[7] },
    8: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[8], shadowColor: palette.elevationShadow[8] }
      : { elevation: 8, shadowColor: palette.elevationShadow[8] },
    9: Platform.OS === 'ios'
      ? { ...IOS_SHADOW[9], shadowColor: palette.elevationShadow[9] }
      : { elevation: 9, shadowColor: palette.elevationShadow[9] },
  };
}
