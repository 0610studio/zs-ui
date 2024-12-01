import { Platform } from "react-native";
import { ShadowLevel, ShadowStyle } from "../ui/types";
import { useTheme } from "../model";

const MAX_ELEVATION_LEVEL = 9;

export const IOS_SHADOW: readonly ShadowStyle[] = [
  { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
  { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.00 },
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

export default function elevation(elevationLevel: ShadowLevel): ElevationProps {
  const { palette } = useTheme();

  const safeElevationLevel = Math.min(
    Math.max(elevationLevel, 0),
    MAX_ELEVATION_LEVEL
  );

  if (Platform.OS === 'ios') {
    const { ...rest } = IOS_SHADOW[safeElevationLevel];
    return {
      shadowColor: palette.elevationShadow[safeElevationLevel],
      ...rest
    };
  }
  return {
    shadowColor: palette.elevationShadow[safeElevationLevel],
    elevation: safeElevationLevel
  };
}