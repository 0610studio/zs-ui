import { useCallback, useContext, useEffect, useRef } from "react";
import { Platform, StyleSheet, View, type HostInstance, type LayoutChangeEvent, type ViewProps } from "react-native";
import { BottomStickyContext } from "../../context/BottomBarContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarOverlap } from "../../navigation/useTabBarInset";
import { useTheme } from "../../context/ThemeContext";
import useKeyboard from "../../model/useKeyboard";
import { Z_INDEX_VALUE } from "../../model/utils";
import { useWindowLayout } from "../../layout/LayoutContext";
import { resolveContentMaxWidth } from "../../layout/windowClass";
import type { ContentMaxWidth } from "../../layout/types";
import { resolveColor, type ColorName } from "../../theme/color";

const isLegacyAndroidKeyboardBehavior = (Platform.OS === 'android' && Platform.Version < 30);

const HIDDEN_BOTTOM_OFFSET = -300;

export interface ZSKeyboardStickyViewProps extends ViewProps {
  children: React.ReactNode;
  keyboardShowOffset?: number;
  keyboardHideOffset?: number;
  showOnlyKeyboardVisible?: boolean;
  backgroundColor?: ColorName | (string & {});
  maxContentWidth?: ContentMaxWidth;
}

function ZSKeyboardStickyView({
  keyboardShowOffset = 0,
  keyboardHideOffset = 0,
  children,
  showOnlyKeyboardVisible = false,
  backgroundColor,
  maxContentWidth = 'none',
  style,
  onLayout,
  ...props
}: ZSKeyboardStickyViewProps) {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const tabBarOverlap = useTabBarOverlap();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const { widthClass, readableMaxWidth } = useWindowLayout();
  const maxWidth = resolveContentMaxWidth(maxContentWidth, { widthClass, readableMaxWidth });
  const keyboardVisiblePadding = !isKeyboardVisible
    ? keyboardHideOffset
    : isLegacyAndroidKeyboardBehavior
      ? 0
      : Math.max(0, keyboardHeight - (Platform.OS === 'ios' ? bottom : 0) - tabBarOverlap) + keyboardShowOffset;

  const isVisible = showOnlyKeyboardVisible ? isKeyboardVisible : true;

  const reportSticky = useContext(BottomStickyContext);
  const ref = useRef<HostInstance>(null);
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);
      if (!reportSticky) return;
      if (!isVisible) reportSticky(null);
      else ref.current?.measureInWindow((_x, y) => reportSticky(y));
    },
    [onLayout, reportSticky, isVisible],
  );
  useEffect(() => {
    if (!isVisible) reportSticky?.(null);
  }, [isVisible, reportSticky]);
  useEffect(() => () => reportSticky?.(null), [reportSticky]);

  return (
    <View {...props} ref={ref} onLayout={handleLayout} style={[styles.container, { bottom: !isVisible ? HIDDEN_BOTTOM_OFFSET : 0 }, style]}>
      <View style={{ width: "100%", maxWidth, backgroundColor: resolveColor(colors, backgroundColor), paddingBottom: keyboardVisiblePadding }}>
        {children}
      </View>
    </View>
  );
}

export default ZSKeyboardStickyView;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX_VALUE.ABOVE_KEYBOARD,
  },
});
