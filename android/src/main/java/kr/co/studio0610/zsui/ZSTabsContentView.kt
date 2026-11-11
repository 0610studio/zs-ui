package kr.co.studio0610.zsui

import android.annotation.SuppressLint
import android.content.Context
import android.view.WindowInsets
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

@SuppressLint("ViewConstructor")
class ZSTabsContentView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val insetsDispatcher = PositionedInsetsDispatcher(this)

  override fun dispatchApplyWindowInsets(insets: WindowInsets): WindowInsets =
    super.dispatchApplyWindowInsets(insetsDispatcher.adjust(insets))

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.getSize(heightMeasureSpec))
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    if (changed) insetsDispatcher.onLayout()
  }
}
