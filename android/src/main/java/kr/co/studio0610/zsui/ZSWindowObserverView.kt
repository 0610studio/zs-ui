package kr.co.studio0610.zsui

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.Configuration
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.coroutineScope
import androidx.lifecycle.findViewTreeLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import androidx.window.core.layout.WindowSizeClass
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowMetricsCalculator
import androidx.window.layout.adapter.computeWindowSizeClass
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

@SuppressLint("ViewConstructor")
class ZSWindowObserverView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onWindowLayoutChange by EventDispatcher()

  private var collectJob: Job? = null
  private var foldingFeatures: List<FoldingFeature> = emptyList()
  private var lastPayload: Map<String, Any?>? = null

  init {
    clipChildren = false
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    emitIfChanged()
    val activity = appContext.currentActivity ?: return
    val owner = findViewTreeLifecycleOwner() ?: return
    collectJob = owner.lifecycle.coroutineScope.launch {
      owner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        WindowInfoTracker.getOrCreate(activity).windowLayoutInfo(activity).collect { info ->
          foldingFeatures = info.displayFeatures.filterIsInstance<FoldingFeature>()
          emitIfChanged()
        }
      }
    }
  }

  override fun onDetachedFromWindow() {
    collectJob?.cancel()
    collectJob = null
    super.onDetachedFromWindow()
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    emitIfChanged()
  }

  override fun onConfigurationChanged(newConfig: Configuration?) {
    super.onConfigurationChanged(newConfig)
    emitIfChanged()
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.getSize(heightMeasureSpec))
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) = Unit

  private fun emitIfChanged() {
    val activity = appContext.currentActivity ?: return
    val metrics = WindowMetricsCalculator.getOrCreate().computeCurrentWindowMetrics(activity)
    val sizeClass = WindowSizeClass.BREAKPOINTS_V1.computeWindowSizeClass(metrics)

    val payload = mapOf(
      "width" to metrics.widthDp.toDouble(),
      "height" to metrics.heightDp.toDouble(),
      "widthClass" to widthClassName(sizeClass),
      "heightClass" to heightClassName(sizeClass),
      "minWidthDp" to sizeClass.minWidthDp,
      "minHeightDp" to sizeClass.minHeightDp,
      "displayFeatures" to foldingFeatures.map { foldPayload(it, metrics.density) },
    )
    if (payload == lastPayload) return
    lastPayload = payload
    onWindowLayoutChange(payload)
  }

  private fun foldPayload(feature: FoldingFeature, density: Float): Map<String, Any> {
    val origin = IntArray(2).also { getLocationInWindow(it) }
    val bounds = feature.bounds
    return mapOf(
      "type" to "fold",
      "x" to (bounds.left - origin[0]) / density.toDouble(),
      "y" to (bounds.top - origin[1]) / density.toDouble(),
      "width" to bounds.width() / density.toDouble(),
      "height" to bounds.height() / density.toDouble(),
      "orientation" to if (feature.orientation == FoldingFeature.Orientation.HORIZONTAL) "horizontal" else "vertical",
      "state" to if (feature.state == FoldingFeature.State.HALF_OPENED) "halfOpened" else "flat",
      "active" to feature.isSeparating,
    )
  }

  private companion object {
    fun widthClassName(sizeClass: WindowSizeClass) =
      when {
        sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND) -> "expanded"
        sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND) -> "medium"
        else -> "compact"
      }

    fun heightClassName(sizeClass: WindowSizeClass) =
      when {
        sizeClass.isHeightAtLeastBreakpoint(WindowSizeClass.HEIGHT_DP_EXPANDED_LOWER_BOUND) -> "expanded"
        sizeClass.isHeightAtLeastBreakpoint(WindowSizeClass.HEIGHT_DP_MEDIUM_LOWER_BOUND) -> "medium"
        else -> "compact"
      }
  }
}
