import React from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle, type ViewProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import SkiaShimmer from "./SkiaShimmer";

export interface ZSSkeletonProps extends ViewProps {
  isFetching?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  /** 기본: palette.background.base */
  overlayColor?: string;
  /** 밴드 중심 최대 불투명도 0~1 (기본 0.6) */
  overlayOpacity?: number;
  /** 한 사이클(ms) */
  duration?: number;
}

function ZSSkeleton({
  isFetching,
  style,
  children,
  overlayColor,
  overlayOpacity = 0.6,
  duration = 1100,
  ...props
}: ZSSkeletonProps) {
  const { palette } = useTheme();
  const highlightColor = overlayColor || palette.background.base;

  if (!isFetching) return <>{children}</>;

  return (
    <View style={[style, styles.host]} {...props}>
      <View style={styles.content}>{children}</View>
      <SkiaShimmer color={highlightColor} opacity={overlayOpacity} duration={duration} />
    </View>
  );
}

export default React.memo(ZSSkeleton);

const styles = StyleSheet.create({
  host: {
    overflow: "hidden",
  },
  content: {
    width: "100%",
    opacity: 0.5,
  },
});
