package kr.co.studio0610.zsui

import android.annotation.SuppressLint
import android.content.Context
import android.view.View
import android.view.ViewTreeObserver
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

@SuppressLint("ViewConstructor")
class ZSSheetBottomView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val location = IntArray(2)
  private val preDraw = ViewTreeObserver.OnPreDrawListener {
    keepVisible()
    true
  }

  private val ancestorLayout = View.OnLayoutChangeListener { _, _, _, _, _, _, _, _, _ -> keepVisible() }
  private val ancestors = mutableListOf<View>()

  init {
    clipChildren = false
    clipToPadding = false
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    viewTreeObserver.addOnPreDrawListener(preDraw)
    var ancestor = parent
    while (ancestor is View) {
      ancestor.addOnLayoutChangeListener(ancestorLayout)
      ancestors.add(ancestor)
      ancestor = ancestor.parent
    }
  }

  override fun onDetachedFromWindow() {
    viewTreeObserver.removeOnPreDrawListener(preDraw)
    ancestors.forEach { it.removeOnLayoutChangeListener(ancestorLayout) }
    ancestors.clear()
    super.onDetachedFromWindow()
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.getSize(heightMeasureSpec))
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) = Unit

  private fun keepVisible() {
    val container = parent as? View ?: return
    if (height == 0) return
    getLocationOnScreen(location)
    val naturalTop = location[1] - translationY
    val naturalBottom = naturalTop + height

    val root = rootView
    root.getLocationOnScreen(location)
    val insets = ViewCompat.getRootWindowInsets(this)?.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
    val visibleBottom = location[1] + root.height - (insets?.bottom ?: 0)

    container.getLocationOnScreen(location)
    val maxLift = (naturalTop - location[1]).coerceAtLeast(0f)
    val lift = (naturalBottom - visibleBottom).coerceIn(0f, maxLift)
    if (translationY != -lift) translationY = -lift
  }
}
