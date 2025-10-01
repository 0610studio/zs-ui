package kr.co.studio0610.zsui

import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

data class FoldingStateResult(
  val foldingFeature: Any?,
  val width: Double
)

class ZsUiModule : Module() {
  private var windowInfoTracker: WindowInfoTracker? = null

  override fun definition() = ModuleDefinition {
    Name("ZsUi")

    AsyncFunction("getFoldingFeature") {
      val result = getCurrentFoldingState()
      mapOf(
        "foldingFeature" to result.foldingFeature,
        "width" to result.width
      )
    }

    View(ZsUiView::class) {
      Prop("name") { view: ZsUiView, prop: String ->
        println(prop)
      }
    }
  }

  private fun getCurrentFoldingState(): FoldingStateResult {
    val activity = appContext.currentActivity ?: return FoldingStateResult(null, 0.0)
    
    try {
      if (windowInfoTracker == null) {
        windowInfoTracker = WindowInfoTracker.getOrCreate(activity)
      }

      val width = DimensionsHelper.getScreenWidthFromConfig(activity)

      // 현재 레이아웃 정보
      val layoutInfo = runBlocking {
        windowInfoTracker?.windowLayoutInfo(activity)?.first()
      }
      val foldingFeature = layoutInfo?.displayFeatures
        ?.filterIsInstance<FoldingFeature>()
        ?.firstOrNull()

      // foldingFeature를 JavaScript에서 사용할 수 있는 형태로 변환
      val foldingFeatureData = foldingFeature?.let { feature ->
        mapOf(
          "state" to when (feature.state) {
            FoldingFeature.State.FLAT -> "flat"
            FoldingFeature.State.HALF_OPENED -> "half_opened"
            else -> "unknown"
          },
          "orientation" to when (feature.orientation) {
            FoldingFeature.Orientation.HORIZONTAL -> "horizontal"
            FoldingFeature.Orientation.VERTICAL -> "vertical"
            else -> "unknown"
          },
          "isSeparating" to feature.isSeparating,
          "bounds" to mapOf(
            "left" to feature.bounds.left,
            "top" to feature.bounds.top,
            "right" to feature.bounds.right,
            "bottom" to feature.bounds.bottom
          )
        )
      }

      return FoldingStateResult(foldingFeatureData, width)
      
    } catch (e: Exception) {
      return FoldingStateResult(null, 0.0)
    }
  }
}
