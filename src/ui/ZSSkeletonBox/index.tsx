import React from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle, type ViewProps } from "react-native";
import ZSView from "../ZSView";
import { ViewColorOptions } from "../../theme/types";
import { useTheme } from "../../context/ThemeContext";
import SkiaShimmer from "../ZSSkeleton/SkiaShimmer";

export interface ZSSkeletonBoxProps extends ViewProps {
  height: number;
  style?: StyleProp<ViewStyle>;
  /** shimmer 하이라이트 색상 (기본: palette.background.layer1) */
  overlayColor?: string;
  /** shimmer 밴드 중심의 최대 불투명도 0~1 (기본 0.7) */
  overlayOpacity?: number;
  /** shimmer 한 사이클(ms) */
  duration?: number;
  /** 박스 배경 색상 토큰 */
  color?: ViewColorOptions;
}

function ZSSkeletonBox({
  height,
  style,
  overlayColor,
  overlayOpacity = 0.7,
  duration = 1100,
  color = "neutral",
  ...props
}: ZSSkeletonBoxProps) {
  const { palette } = useTheme();
  const highlightColor = overlayColor || palette.background.layer1;

  return (
    <View style={[styles.fullWidth, style, { height, overflow: "hidden" }]} {...props}>
      <ZSView style={StyleSheet.absoluteFill} color={color} />
      <SkiaShimmer color={highlightColor} opacity={overlayOpacity} duration={duration} />
    </View>
  );
}

export default React.memo(ZSSkeletonBox);

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
});
