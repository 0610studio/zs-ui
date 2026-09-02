import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { warnWebUnsupported } from "../../model/webUnsupported";
// type-only import — 웹 번들에 skia 가 딸려오지 않게 한다
import type { ZSBorderBeamProps } from "./ZSBorderBeam";

/** CanvasKit 미로딩 환경에서 Skia Canvas 가 크래시하므로 웹은 콘텐츠만 렌더한다. */
function ZSBorderBeam({
  children,
  colors,
  colorFrom,
  colorTo,
  beamLength,
  trackColor,
  glow,
  duration,
  delay,
  reverse,
  active,
  borderWidth,
  borderRadius = 14,
  style,
  ...props
}: ZSBorderBeamProps) {
  useEffect(() => {
    warnWebUnsupported("ZSBorderBeam");
  }, []);

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={[styles.content, { borderRadius }]}>{children}</View>
    </View>
  );
}

export default React.memo(ZSBorderBeam);

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    position: "relative",
  },
  content: {
    position: "relative",
    overflow: "hidden",
  },
});
