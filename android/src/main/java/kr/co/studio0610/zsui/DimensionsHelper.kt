package kr.co.studio0610.zsui

import android.content.Context
import android.content.res.Configuration
import android.view.WindowManager

object DimensionsHelper {
  
  /**
   * React Native Dimensions와 동일한 방법으로 화면 너비 가져오기
   * React Native는 실제로 UIManagerModule.java에서 이런 방식으로 구현합니다.
   */
  fun getExactWindowWidth(context: Context): Double {
    val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    val display = windowManager.defaultDisplay
    val outMetrics = android.util.DisplayMetrics()
    
    // React Native가 사용하는 방식: 실제 렌더링 픽셀과 밀도 사용
    display.getRealMetrics(outMetrics) // getRealMetrics instead of getMetrics
    
    // React Native는 실제 표시되는 PT 사용
    return outMetrics.widthPixels.toDouble() / outMetrics.density
  }
  
  /**
   * React Native와 동일한 설정 정보에서 너비 가져오기
   */
  fun getScreenWidthFromConfig(context: Context): Double {
    val configuration = context.resources.configuration
    return configuration.screenWidthDp.toDouble()
  }
}
