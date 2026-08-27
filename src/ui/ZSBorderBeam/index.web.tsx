import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { warnWebUnsupported } from "../../model/webUnsupported";
// type-only import — 컴파일 시 제거되므로 웹 번들에 네이티브 구현(skia)이 딸려오지 않는다
import type { ZSBorderBeamProps } from "./ZSBorderBeam";

/**
 * 웹 미지원: CanvasKit 미로딩 환경에서 Skia Canvas가 크래시하므로 광선 효과 없이 콘텐츠만 렌더링한다.
 * 플랫폼 확장자(.web) 분리로 웹 번들에서 @shopify/react-native-skia import 자체를 제거한다.
 * 광선 관련 props는 웹에서 의미가 없으므로 구조 분해로 걸러 View에 전달하지 않는다.
 */
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
