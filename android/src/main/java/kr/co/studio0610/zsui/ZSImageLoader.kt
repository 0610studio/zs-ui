package kr.co.studio0610.zsui

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.graphics.drawable.toBitmap
import androidx.core.graphics.drawable.toDrawable
import androidx.core.net.toUri
import com.facebook.common.executors.CallerThreadExecutor
import com.facebook.common.references.CloseableReference
import com.facebook.datasource.BaseDataSubscriber
import com.facebook.datasource.DataSource
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.image.CloseableImage
import com.facebook.imagepipeline.image.CloseableStaticBitmap
import com.facebook.imagepipeline.image.CloseableXml
import com.facebook.imagepipeline.request.ImageRequestBuilder
import java.util.Locale

private const val TAG = "ZSImageLoader"

internal fun loadIcon(
  context: Context,
  source: String,
  onComplete: (Drawable?) -> Unit,
) {
  val main = Handler(Looper.getMainLooper())
  val uri = resolveUri(context, source)
  if (uri == null) {
    if (source.isNotEmpty()) Log.w(TAG, "Tab icon resource not found: $source. Check its name and tools:keep rules.")
    main.post { onComplete(null) }
    return
  }

  val request = ImageRequestBuilder.newBuilderWithSource(uri).build()
  Fresco.getImagePipeline().fetchDecodedImage(request, context).subscribe(
    object : BaseDataSubscriber<CloseableReference<CloseableImage>>() {
      override fun onNewResultImpl(dataSource: DataSource<CloseableReference<CloseableImage>?>) {
        if (!dataSource.isFinished) return

        val drawable = try {
          dataSource.result?.use { reference ->
            val image = reference.get()
            val bitmap = when (image) {
              // Fresco 참조가 닫힌 뒤에도 쓰도록 복사합니다.
              is CloseableStaticBitmap -> image.underlyingBitmap?.copy(Bitmap.Config.ARGB_8888, false)
              is CloseableXml -> image.buildDrawable()?.let {
                val fallback = (24 * context.resources.displayMetrics.density).toInt().coerceAtLeast(1)
                it.toBitmap(
                  it.intrinsicWidth.takeIf { size -> size > 0 } ?: fallback,
                  it.intrinsicHeight.takeIf { size -> size > 0 } ?: fallback,
                  Bitmap.Config.ARGB_8888,
                )
              }
              else -> null
            }
            bitmap?.toDrawable(context.resources)
          }
        } catch (error: Exception) {
          Log.w(TAG, "Failed to decode tab icon: $source", error)
          null
        }
        main.post { onComplete(drawable) }
      }

      override fun onFailureImpl(dataSource: DataSource<CloseableReference<CloseableImage>?>) {
        Log.w(TAG, "Failed to load tab icon: $source", dataSource.failureCause)
        main.post { onComplete(null) }
      }

      override fun onCancellation(dataSource: DataSource<CloseableReference<CloseableImage>?>) {
        main.post { onComplete(null) }
      }
    },
    CallerThreadExecutor.getInstance(),
  )
}

@SuppressLint("DiscouragedApi")
private fun resolveUri(context: Context, source: String): Uri? {
  if (source.isEmpty()) return null
  val parsed = runCatching { source.toUri() }.getOrNull()
  if (parsed?.scheme != null) return parsed

  val name = source.lowercase(Locale.ROOT).replace("-", "_")
  for (type in arrayOf("drawable", "raw", "mipmap")) {
    val id = context.resources.getIdentifier(name, type, context.packageName)
    if (id != 0) return "res:/$id".toUri()
  }
  return null
}
