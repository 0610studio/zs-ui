import React, { useEffect } from "react";
import { warnWebUnsupported } from "../../model/webUnsupported";
// type-only import — 웹 번들에 skia 가 딸려오지 않게 한다
import type { SkiaShimmerProps } from "./SkiaShimmer";

/** CanvasKit 미로딩 환경에서 Skia Canvas 가 크래시하므로 웹은 shimmer 를 생략한다. */
function SkiaShimmer(_props: SkiaShimmerProps) {
  useEffect(() => {
    warnWebUnsupported("ZSSkeleton · ZSSkeletonBox");
  }, []);

  return null;
}

export default React.memo(SkiaShimmer);
