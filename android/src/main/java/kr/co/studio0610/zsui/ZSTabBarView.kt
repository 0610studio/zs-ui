@file:OptIn(ExperimentalMaterial3ExpressiveApi::class)

package kr.co.studio0610.zsui

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.Configuration
import android.graphics.Typeface
import android.graphics.drawable.BitmapDrawable
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import androidx.compose.foundation.background
import androidx.compose.foundation.indication
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialExpressiveTheme
import androidx.compose.material3.NavigationItemIconPosition
import androidx.compose.material3.ShortNavigationBarDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.ShortNavigationBarItem
import androidx.compose.material3.ShortNavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.WideNavigationRail
import androidx.compose.material3.WideNavigationRailDefaults
import androidx.compose.material3.WideNavigationRailItem
import androidx.compose.material3.WideNavigationRailItemDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.Density
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.common.assets.ReactFontManager
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import androidx.compose.ui.text.font.Typeface as ComposeTypeface

@SuppressLint("ViewConstructor")
class ZSTabBarView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  override val shouldUseAndroidLayout = true

  private val onTabPress by EventDispatcher<Map<String, String>>()

  var mode: String = MODE_BAR
  var items: List<ZSTabBarItem> = emptyList()
  var selectedKey: String? = null
  var colors: ZSTabBarColors? = null
  var fontFamily: String? = null
  var hideOnKeyboard: Boolean = false
  var iconPosition: String? = null
  var dark: Boolean = false
  var maxFontScale: Float? = null

  var floating: Boolean = false
  var containerWidth: Float? = null

  private var snapshot by mutableStateOf(TabBarState())
  private var imeVisible by mutableStateOf(false)
  private val icons = mutableStateMapOf<String, ImageBitmap>()
  private val requestedIcons = mutableMapOf<String, String?>()
  private var reportedSize = -1
  private var reportedWidth = -1
  private var reportedDensity = 0f

  // Yoga에는 알약의 실측 크기가 고정값으로 보고된다. 창만 줄면 알약 자체의
  // measure spec은 그대로일 수 있으므로, 창의 layout이 끝난 뒤 다시 잰다.
  private var observedRoot: View? = null
  private val rootLayoutListener = View.OnLayoutChangeListener { _, l, t, r, b, oldL, oldT, oldR, oldB ->
    if (r - l != oldR - oldL || b - t != oldB - oldT) requestLayout()
  }

  private val insetsDispatcher = PositionedInsetsDispatcher(this)

  private val composeView =
    ComposeView(context).apply {
      setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindowOrReleasedFromPool)
      setContent { TabBar() }
    }

  init {
    addView(composeView, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
  }

  private data class TabBarState(
    val mode: String = MODE_BAR,
    val items: List<ZSTabBarItem> = emptyList(),
    val selectedKey: String? = null,
    val colors: ZSTabBarColors? = null,
    val typeface: Typeface? = null,
    val iconStart: Boolean = false,
    val hideOnKeyboard: Boolean = false,
    val dark: Boolean = false,
    val fontScaleCap: Float = MAX_FONT_SCALE,
    val floating: Boolean = false,
  )

  private val isHiddenForKeyboard: Boolean
    get() = snapshot.hideOnKeyboard && imeVisible && snapshot.mode != MODE_RAIL

  fun applyProps() {
    if (items.size > MAX_ITEMS) {
      android.util.Log.e(TAG, "ZSTabNavigator supports up to $MAX_ITEMS tabs, got ${items.size}")
    }
    val typeface = fontFamily?.takeIf { it.isNotEmpty() }?.let { ReactFontManager.getInstance().getTypeface(it, Typeface.NORMAL, context.assets) }
    val modeChanged = snapshot.mode != mode || snapshot.floating != floating
    snapshot =
      TabBarState(
        mode = mode,
        items = items.take(MAX_ITEMS),
        selectedKey = selectedKey,
        colors = colors,
        typeface = typeface,
        iconStart = iconPosition == "start",
        hideOnKeyboard = hideOnKeyboard,
        dark = dark,
        fontScaleCap = maxFontScale?.takeIf { it >= 1f }?.let { minOf(it, MAX_FONT_SCALE) } ?: MAX_FONT_SCALE,
        floating = floating,
      )
    syncIcons()
    if (modeChanged) {
      reportedSize = -1
      reportedWidth = -1
    }
    requestLayout()
  }

  private fun syncIcons() {
    val visible = items.take(MAX_ITEMS)
    val keys = visible.mapTo(HashSet()) { it.key }
    requestedIcons.keys.retainAll(keys)
    icons.keys.retainAll(keys)
    visible.forEach { item ->
      val source = item.icon
      if (requestedIcons.containsKey(item.key) && requestedIcons[item.key] == source) return@forEach
      requestedIcons[item.key] = source
      if (source == null) {
        icons.remove(item.key)
        return@forEach
      }
      loadIcon(context, source) { drawable ->

        if (requestedIcons[item.key] != source) return@loadIcon
        val bitmap = (drawable as? BitmapDrawable)?.bitmap
        if (bitmap != null) icons[item.key] = bitmap.asImageBitmap() else icons.remove(item.key)
      }
    }
  }

  @Composable
  private fun TabBar() {
    val state = snapshot
    val palette = state.colors
    val scheme = remember(state.dark) { if (state.dark) darkColorScheme() else lightColorScheme() }
    val labelFamily = remember(state.typeface) { state.typeface?.let { FontFamily(ComposeTypeface(it)) } }

    MaterialExpressiveTheme(colorScheme = scheme) {
      if (isHiddenForKeyboard) return@MaterialExpressiveTheme

      fun color(value: Int?, fallback: Color) = value?.let { Color(it) } ?: fallback
      val selectedIcon = color(palette?.selected, scheme.onSecondaryContainer)
      val selectedLabel = color(palette?.selectedLabel ?: palette?.selected, scheme.secondary)
      val indicator = color(palette?.indicator, scheme.secondaryContainer)
      val unselectedIcon = color(palette?.unselectedIcon, scheme.onSurfaceVariant)
      val unselectedLabel = color(palette?.unselectedLabel, scheme.onSurfaceVariant)

      val label: (ZSTabBarItem) -> @Composable () -> Unit = { item ->
        { CappedFontScale(state.fontScaleCap) { Text(item.title, fontFamily = labelFamily, maxLines = 1) } }
      }
      val icon: @Composable (ZSTabBarItem) -> Unit = { item -> TabIcon(item, palette, state.fontScaleCap) }

      if (state.mode == MODE_RAIL) {
        WideNavigationRail(
          modifier = Modifier.semantics { testTagsAsResourceId = true },

          colors = WideNavigationRailDefaults.colors(containerColor = Color.Transparent),
          windowInsets = WideNavigationRailDefaults.windowInsets,
        ) {
          state.items.forEach { item ->
            WideNavigationRailItem(
              modifier = itemModifier(item),
              selected = item.key == state.selectedKey,
              onClick = { emitTabPress(item.key) },
              icon = { icon(item) },
              label = label(item),
              railExpanded = false,
              colors =
                WideNavigationRailItemDefaults.colors(
                  selectedIconColor = selectedIcon,
                  selectedTextColorTopIconPosition = selectedLabel,
                  selectedTextColorStartIconPosition = selectedLabel,
                  selectedIndicatorColor = indicator,
                  unselectedIconColor = unselectedIcon,
                  unselectedTextColor = unselectedLabel,
                ),
            )
          }
        }
      } else {
        val itemColors =
          ShortNavigationBarItemDefaults.colors(
            selectedIconColor = selectedIcon,
            selectedTextColorTopIconPosition = selectedLabel,
            selectedTextColorStartIconPosition = selectedLabel,
            selectedIndicatorColor = indicator,
            unselectedIconColor = unselectedIcon,
            unselectedTextColor = unselectedLabel,
          )
        val barItem: @Composable (ZSTabBarItem, Modifier) -> Unit = { item, modifier ->
          ShortNavigationBarItem(
            modifier = itemModifier(item).then(modifier),
            selected = item.key == state.selectedKey,
            onClick = { emitTabPress(item.key) },
            icon = { icon(item) },
            label = label(item),
            iconPosition = if (state.iconStart) NavigationItemIconPosition.Start else NavigationItemIconPosition.Top,
            colors = itemColors,
          )
        }
        val containerColor = color(palette?.background, ShortNavigationBarDefaults.containerColor)

        if (state.floating) {
          Box(Modifier.padding(FLOATING_SHADOW_SPACE)) {
            Surface(
              modifier = Modifier.semantics { testTagsAsResourceId = true },
              shape = CircleShape,
              color = containerColor,
            ) {
              Row(

                modifier =
                  Modifier.height(FLOATING_HEIGHT)
                    .widthIn(min = FLOATING_ITEM_WIDTH * state.items.size + FLOATING_SELECTION_INSET * 2)
                    .width(IntrinsicSize.Max)
                    .padding(horizontal = FLOATING_SELECTION_INSET)
                    .selectableGroup(),
                verticalAlignment = Alignment.CenterVertically,
              ) {
                state.items.forEach { item ->
                  key(item.key) {
                    val interactionSource = remember { MutableInteractionSource() }
                    val selected = item.key == state.selectedKey
                    Box(Modifier.weight(1f).fillMaxHeight(), contentAlignment = Alignment.Center) {
                      Box(
                        Modifier.matchParentSize()
                          .padding(vertical = FLOATING_SELECTION_INSET)
                          .clip(CircleShape)
                          .background(if (selected) indicator else Color.Transparent)
                          .indication(interactionSource, ripple())
                      )

                      Column(
                        modifier =
                          itemModifier(item).fillMaxWidth()
                            .fillMaxHeight()
                            .selectable(
                              selected = selected,
                              onClick = { emitTabPress(item.key) },
                              role = Role.Tab,
                              interactionSource = interactionSource,
                              indication = null,
                            )
                            .padding(horizontal = FLOATING_ITEM_PADDING),
                        verticalArrangement = Arrangement.spacedBy(FLOATING_ICON_LABEL_GAP, Alignment.CenterVertically),
                        horizontalAlignment = Alignment.CenterHorizontally,
                      ) {
                        CompositionLocalProvider(LocalContentColor provides if (selected) selectedIcon else unselectedIcon) { icon(item) }
                        CappedFontScale(state.fontScaleCap) {
                          Text(
                            item.title,
                            color = if (selected) selectedLabel else unselectedLabel,
                            fontFamily = labelFamily,
                            fontSize = FLOATING_LABEL_SIZE,
                            lineHeight = FLOATING_LABEL_LINE_HEIGHT,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                          )
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          Surface(
            modifier = Modifier.semantics { testTagsAsResourceId = true },
            color = containerColor,
          ) {
            Row(
              modifier =
                Modifier.fillMaxWidth()
                  .windowInsetsPadding(ShortNavigationBarDefaults.windowInsets)
                  .defaultMinSize(minHeight = 64.dp)
                  .selectableGroup(),
              horizontalArrangement = if (state.iconStart) Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally) else Arrangement.Start,
              verticalAlignment = Alignment.CenterVertically,
            ) {
              state.items.forEach { item -> barItem(item, if (state.iconStart) Modifier else Modifier.weight(1f)) }
            }
          }
        }
      }
    }
  }

  @Composable
  private fun CappedFontScale(cap: Float, content: @Composable () -> Unit) {
    val density = LocalDensity.current
    if (density.fontScale <= cap) {
      content()
    } else {
      CompositionLocalProvider(LocalDensity provides Density(density.density, cap), content = content)
    }
  }

  @Composable
  private fun TabIcon(item: ZSTabBarItem, palette: ZSTabBarColors?, fontScaleCap: Float) {
    val bitmap = icons[item.key]
    val badge = item.badge
    BadgedBox(
      badge = {
        if (badge != null) {
          val badgeContent: (@Composable RowScope.() -> Unit)? =
            if (badge.isEmpty()) {
              null
            } else {
              { CappedFontScale(fontScaleCap) { Text(badge) } }
            }
          Badge(
            containerColor = palette?.badgeBackground?.let { Color(it) } ?: androidx.compose.material3.BadgeDefaults.containerColor,
            contentColor = palette?.badgeText?.let { Color(it) } ?: Color.White,
            content = badgeContent,
          )
        }
      },
    ) {
      if (bitmap != null) {
        Icon(bitmap = bitmap, contentDescription = null, modifier = Modifier.size(24.dp))
      } else {
        Box(Modifier.size(24.dp))
      }
    }
  }

  private fun itemTestTag(item: ZSTabBarItem) = "zs-tab-item-${item.name.ifEmpty { item.key }}"

  private fun itemModifier(item: ZSTabBarItem): Modifier =
    Modifier.testTag(itemTestTag(item)).then(
      item.accessibilityLabel?.let { label -> Modifier.semantics { contentDescription = label } } ?: Modifier
    )

  private fun emitTabPress(key: String) {
    onTabPress(mapOf("key" to key))
  }

  override fun dispatchApplyWindowInsets(insets: WindowInsets): WindowInsets {
    val ime = WindowInsetsCompat.toWindowInsetsCompat(insets, this).isVisible(WindowInsetsCompat.Type.ime())
    if (ime != imeVisible) {
      imeVisible = ime
      requestLayout()
    }
    return super.dispatchApplyWindowInsets(insetsDispatcher.adjust(insets))
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    observedRoot = rootView.also { it.addOnLayoutChangeListener(rootLayoutListener) }
    reportedSize = -1
    reportedWidth = -1
    requestLayout()
  }

  override fun onDetachedFromWindow() {
    observedRoot?.removeOnLayoutChangeListener(rootLayoutListener)
    observedRoot = null
    super.onDetachedFromWindow()
  }

  override fun onConfigurationChanged(newConfig: Configuration?) {
    super.onConfigurationChanged(newConfig)
    // 화면 확대·글자 크기가 바뀌어도 같은 px 크기를 새 dp 값으로 보고해야 한다.
    reportedSize = -1
    reportedWidth = -1
    requestLayout()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    if (!isAttachedToWindow) return
    composeView.layout(0, 0, r - l, b - t)
    if (changed) insetsDispatcher.onLayout()
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val width = MeasureSpec.getSize(widthMeasureSpec)
    val height = MeasureSpec.getSize(heightMeasureSpec)
    setMeasuredDimension(width, height)

    if (!isAttachedToWindow) return

    if (isHiddenForKeyboard) {
      composeView.measure(exactly(0), exactly(0))
      if (snapshot.floating) reportFloatingSize(0, 0) else reportSize(0)
      return
    }
    if (snapshot.floating && snapshot.mode != MODE_RAIL) {
      val rootWidth = rootView.width.takeIf { it > 0 } ?: resources.displayMetrics.widthPixels
      val rootHeight = rootView.height.takeIf { it > 0 } ?: resources.displayMetrics.heightPixels
      val density = resources.displayMetrics.density
      // React Native가 잰 내비게이터 폭을 사용한다. 창보다 좁은 컨테이너나,
      // 창의 layout보다 먼저 도착한 props도 root 폭으로 한 번 더 제한한다.
      val containerWidthPx = containerWidth?.takeIf { it.isFinite() && it > 0f }?.let { (it * density).toInt() } ?: rootWidth
      val availableWidth = minOf(rootWidth, containerWidthPx)
      val margin = (FLOATING_SCREEN_MARGIN.value * density).toInt()
      composeView.measure(atMost((availableWidth - 2 * margin).coerceAtLeast(0)), atMost(rootHeight))
      val naturalWidth = composeView.measuredWidth
      val naturalHeight = composeView.measuredHeight
      if (width > 0 && height > 0) composeView.measure(exactly(width), exactly(height))
      reportFloatingSize(naturalWidth, naturalHeight)
      return
    }
    val rail = snapshot.mode == MODE_RAIL
    val natural =
      if (rail) {
        if (height <= 0) return
        composeView.measure(atMost(rootView.width.takeIf { it > 0 } ?: resources.displayMetrics.widthPixels), exactly(height))
        composeView.measuredWidth
      } else {
        if (width <= 0) return
        composeView.measure(exactly(width), atMost(rootView.height.takeIf { it > 0 } ?: resources.displayMetrics.heightPixels))
        composeView.measuredHeight
      }

    composeView.measure(exactly(width), exactly(height))
    reportSize(natural)
  }

  private fun reportFloatingSize(widthPx: Int, heightPx: Int) {
    val density = resources.displayMetrics.density
    if (widthPx == reportedWidth && heightPx == reportedSize && density == reportedDensity) return
    reportedWidth = widthPx
    reportedSize = heightPx
    reportedDensity = density
    shadowNodeProxy.setStyleSize(widthPx / density.toDouble(), heightPx / density.toDouble())
  }

  private fun reportSize(px: Int) {
    val density = resources.displayMetrics.density
    if (px == reportedSize && density == reportedDensity) return
    reportedSize = px
    reportedDensity = density
    val dp = px / density.toDouble()
    if (snapshot.mode == MODE_RAIL) shadowNodeProxy.setStyleSize(dp, null) else shadowNodeProxy.setStyleSize(null, dp)
  }

  private companion object {
    const val TAG = "ZSTabBarView"
    const val MODE_BAR = "bar"
    const val MODE_RAIL = "rail"

    const val MAX_ITEMS = 5
    const val MAX_FONT_SCALE = 1.3f

    // ZSTabNavigator.android.tsx의 그림자 여백과 맞춥니다.
    val FLOATING_SHADOW_SPACE = 4.dp

    val FLOATING_SCREEN_MARGIN = 17.dp

    val FLOATING_HEIGHT = 62.dp

    val FLOATING_ITEM_WIDTH = 100.dp
    val FLOATING_ITEM_PADDING = 8.dp
    val FLOATING_ICON_LABEL_GAP = 2.dp

    val FLOATING_LABEL_SIZE = 10.sp
    val FLOATING_LABEL_LINE_HEIGHT = 12.sp

    val FLOATING_SELECTION_INSET = 4.dp

    fun exactly(size: Int) = MeasureSpec.makeMeasureSpec(size, MeasureSpec.EXACTLY)

    fun atMost(size: Int) = MeasureSpec.makeMeasureSpec(size, MeasureSpec.AT_MOST)
  }
}
