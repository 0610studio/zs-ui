package kr.co.studio0610.zsui

import android.app.UiModeManager
import android.content.Context
import android.os.Build
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executor

class ZsUiModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is not available")

  private var contrastListener: UiModeManager.ContrastChangeListener? = null

  override fun definition() = ModuleDefinition {
    Name("ZsUi")

    Events("onContrastChange")

    Function("getDynamicSeedColor") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return@Function null
      val argb = ContextCompat.getColor(context, android.R.color.system_accent1_500)
      String.format("#%06x", argb and 0xFFFFFF)
    }

    Function("getContrast") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return@Function null
      uiModeManager()?.contrast
    }

    // Persists the app's own night mode (Android 12+) so the system draws the next starting window
    // (splash) in the app's chosen mode instead of the device mode. "system" follows the device again.
    Function("setApplicationNightMode") { preference: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return@Function false
      val manager = uiModeManager() ?: return@Function false
      manager.setApplicationNightMode(
        when (preference) {
          "dark" -> UiModeManager.MODE_NIGHT_YES
          "light" -> UiModeManager.MODE_NIGHT_NO
          else -> UiModeManager.MODE_NIGHT_AUTO
        },
      )
      true
    }

    OnStartObserving {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return@OnStartObserving
      val manager = uiModeManager() ?: return@OnStartObserving
      val listener = UiModeManager.ContrastChangeListener { contrast -> sendEvent("onContrastChange", mapOf("contrast" to contrast)) }
      manager.addContrastChangeListener(Executor { it.run() }, listener)
      contrastListener = listener
    }

    OnStopObserving {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return@OnStopObserving
      contrastListener?.let { uiModeManager()?.removeContrastChangeListener(it) }
      contrastListener = null
    }

    View(ZSWindowObserverView::class) {
      Events("onWindowLayoutChange")
    }

    View(ZSTabBarView::class) {
      Events("onTabPress")

      Prop("mode") { view: ZSTabBarView, mode: String -> view.mode = mode }
      Prop("items") { view: ZSTabBarView, items: List<ZSTabBarItem> -> view.items = items }
      Prop("selectedKey") { view: ZSTabBarView, key: String? -> view.selectedKey = key }
      Prop("colors") { view: ZSTabBarView, colors: ZSTabBarColors? -> view.colors = colors }
      Prop("fontFamily") { view: ZSTabBarView, family: String? -> view.fontFamily = family }
      Prop("hideOnKeyboard") { view: ZSTabBarView, value: Boolean? -> view.hideOnKeyboard = value ?: false }
      Prop("iconPosition") { view: ZSTabBarView, value: String? -> view.iconPosition = value }
      Prop("dark") { view: ZSTabBarView, value: Boolean? -> view.dark = value ?: false }
      Prop("maxFontScale") { view: ZSTabBarView, value: Double? -> view.maxFontScale = value?.toFloat() }
      Prop("floating") { view: ZSTabBarView, value: Boolean? -> view.floating = value ?: false }
      Prop("containerWidth") { view: ZSTabBarView, value: Double? -> view.containerWidth = value?.toFloat() }

      OnViewDidUpdateProps { view: ZSTabBarView -> view.applyProps() }
    }

    View(ZSTabsContentView::class) {}

    View(ZSSheetBottomView::class) {}

    View(ZSSheetContentView::class) {}
  }

  private fun uiModeManager(): UiModeManager? = context.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
}
