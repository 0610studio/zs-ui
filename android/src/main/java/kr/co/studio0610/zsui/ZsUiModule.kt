package kr.co.studio0610.zsui

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ZsUiModule : Module() {
  private var lastScreenWidth: Int = 0
  private var lastRotation: Int = -1
  private var handler: Handler = Handler(Looper.getMainLooper())
  private var configurationChangeRunnable: Runnable? = null

  override fun definition() = ModuleDefinition {
    Name("ZsUi")

    Events("onFoldingStateChange")

    OnCreate {
      val context = appContext.reactContext ?: return@OnCreate
      monitorFoldingStateChanges(context)
    }

    Function("getFoldingState") {
      val context = appContext.reactContext ?: return@Function mapOf(
        "foldingState" to "unfolding",
        "width" to 0
      )
      
      val width = DimensionsHelper.getScreenWidthFromConfig(context)
      val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
      val display = windowManager.defaultDisplay
      val pixelSize = android.graphics.Point()
      display.getSize(pixelSize)
      
      val foldingState = determineFoldingState(context, pixelSize.x)
      
      mapOf(
        "foldingState" to foldingState,
        "width" to width
      )
    }

    OnDestroy {
      handler.removeCallbacksAndMessages(null)
      configurationChangeRunnable = null
    }

    View(ZsUiView::class) {
      Prop("name") { view: ZsUiView, prop: String ->
        println(prop)
      }
    }
  }

  private fun monitorFoldingStateChanges(context: Context) {
    val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    val display = windowManager.defaultDisplay
    val size = android.graphics.Point()
    display.getSize(size)
    
    lastScreenWidth = size.x
    lastRotation = context.resources.configuration.orientation
  }

  private fun determineFoldingState(context: Context, width: Int): String {
    val configuration = context.resources.configuration
    val currentRotation = configuration.orientation
    val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    val display = windowManager.defaultDisplay
    val metrics = android.util.DisplayMetrics()
    display.getMetrics(metrics)
    
    val isFoldingStateChanged = 
      (width != lastScreenWidth) || (currentRotation != lastRotation)
    
    var foldingState = "unfolding"
    
    if (isFoldingStateChanged) {
      if (width < lastScreenWidth) {
        foldingState = "folding"
      } else if (width > lastScreenWidth) {
        foldingState = "unfolding"
      }
      
      lastScreenWidth = width
      lastRotation = currentRotation
      
      handler.removeCallbacksAndMessages(null)
      
      configurationChangeRunnable = Runnable {
        val context = appContext.reactContext
        if (context != null) {
          val eventWidth = DimensionsHelper.getScreenWidthFromConfig(context)

          sendEvent("onFoldingStateChange", mapOf(
            "foldingState" to foldingState,
            "width" to eventWidth
          ))
        }
      }
      
      handler.postDelayed(configurationChangeRunnable!!, 300)
    }
    
    return foldingState
  }
}
