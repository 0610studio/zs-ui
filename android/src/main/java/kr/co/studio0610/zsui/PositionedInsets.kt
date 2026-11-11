package kr.co.studio0610.zsui

import android.graphics.Rect
import android.view.View
import android.view.WindowInsets
import androidx.core.view.WindowInsetsCompat

internal fun View.distanceFromWindowEdges(): Rect {
  var x = left
  var y = top
  var parent = parent
  val root = rootView
  while (parent is View && parent !== root) {
    x += parent.left - parent.scrollX
    y += parent.top - parent.scrollY
    parent = parent.parent
  }
  // 접힘 직후에는 위치가 창을 벗어날 수 있으며 inset은 음수를 받지 않습니다.
  return Rect(
    x.coerceAtLeast(0),
    y.coerceAtLeast(0),
    (root.width - x - width).coerceAtLeast(0),
    (root.height - y - height).coerceAtLeast(0),
  )
}

internal fun WindowInsets.relativeTo(view: View): WindowInsets {
  val edges = view.distanceFromWindowEdges()
  if (edges.left == 0 && edges.top == 0 && edges.right == 0 && edges.bottom == 0) return this
  return WindowInsetsCompat.toWindowInsetsCompat(this, view)
    .inset(edges.left, edges.top, edges.right, edges.bottom)
    .toWindowInsets() ?: this
}

internal class PositionedInsetsDispatcher(private val view: View) {
  private var dispatchedEdges: Rect? = null

  fun adjust(insets: WindowInsets): WindowInsets {
    dispatchedEdges = view.distanceFromWindowEdges()
    return insets.relativeTo(view)
  }

  fun onLayout() {
    val previous = dispatchedEdges ?: return
    if (previous != view.distanceFromWindowEdges()) view.requestApplyInsets()
  }
}
