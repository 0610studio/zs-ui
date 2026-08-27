import React, { useEffect } from "react";
import { warnWebUnsupported } from "../../model/webUnsupported";
// type-only import — 컴파일 시 제거되므로 웹 번들에 네이티브 구현(skia)이 딸려오지 않는다
import type { SkiaShimmerProps } from "./SkiaShimmer";

/**
 * 웹 미지원: CanvasKit 미로딩 환경에서 Skia Canvas가 크래시하므로 shimmer를 생략한다.
 * 플랫폼 확장자(.web) 분리로 웹 번들에서 @shopify/react-native-skia import 자체를 제거한다.
 */
function SkiaShimmer(_props: SkiaShimmerProps) {
  useEffect(() => {
    warnWebUnsupported("ZSSkeleton · ZSSkeletonBox");
  }, []);

  return null;
}

export default React.memo(SkiaShimmer);
