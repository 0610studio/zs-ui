import React, { useCallback, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Platform, Pressable, StyleSheet, type GestureResponderEvent, type Insets, type LayoutChangeEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type AnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { PRESS_THROTTLE_INTERVAL, PREVENT_DOUBLE_PRESS_INTERVAL, usePreventDoublePress } from '../../model/usePreventDoublePress';
import { resolveColor, withOpacity, type ColorName } from '../../theme/color';
import { springConfig } from '../../theme/motion';
import { radiusStyle, type RadiusToken } from '../../theme/radius';
import { MIN_TOUCH_TARGET, OPACITY } from '../../theme/state';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ZSPressableProps extends Omit<PressableProps, 'style' | 'onPress' | 'onLongPress' | 'children'> {
  onPress?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: ColorName | (string & {});
  radius?: RadiusToken;
  pressedColor?: ColorName | (string & {});
  loading?: boolean;
  preventDoublePress?: boolean;
  disabled?: boolean;
}

export interface ZSPressableBaseProps extends Omit<ZSPressableProps, 'style'> {
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
  /** style 에 Reanimated 애니메이션 스타일을 넘길 때만 켠다 — 겉을 Animated 컴포넌트로 감싸는 비용이 커서 기본은 끈다 */
  animated?: boolean;
}

interface PressHighlightHandle {
  pressIn: () => void;
  pressOut: () => void;
}

/** iOS 누름 덮개 — Android 는 ripple 을 쓰므로 이 shared value·애니메이션 스타일을 만들지 않는다 */
function PressHighlight({ color, ref }: { color: string; ref: Ref<PressHighlightHandle> }) {
  const highlight = useSharedValue(0);
  const highlightStyle = useAnimatedStyle(() => ({ opacity: highlight.value }));
  useImperativeHandle(
    ref,
    () => ({
      pressIn: () => {
        highlight.value = 1;
      },
      pressOut: () => {
        highlight.value = withSpring(0, springConfig('fade', 'fast'));
      },
    }),
    [highlight],
  );
  return <Animated.View pointerEvents="none" style={[styles.highlight, { backgroundColor: color }, highlightStyle]} />;
}

function ZSPressable({
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  children,
  style,
  backgroundColor,
  radius = 'none',
  pressedColor,
  loading = false,
  preventDoublePress = false,
  disabled = false,
  hitSlop,
  onLayout,
  accessibilityRole = 'button',
  accessibilityState,
  animated = false,
  ...props
}: ZSPressableBaseProps) {
  const { colors } = useTheme();
  const [autoHitSlop, setAutoHitSlop] = useState<Insets | undefined>(undefined);
  const inactive = loading || disabled;
  const stateColor = withOpacity(resolveColor(colors, pressedColor) ?? colors.text, OPACITY.pressed);

  const highlight = useRef<PressHighlightHandle>(null);

  const dispatchPress = useCallback(
    (kind: 'press' | 'longPress') => {
      if (inactive) return;
      if (kind === 'press') onPress?.();
      else onLongPress?.();
    },
    [inactive, onPress, onLongPress],
  );
  const guardedPress = usePreventDoublePress(dispatchPress, preventDoublePress ? PREVENT_DOUBLE_PRESS_INTERVAL : PRESS_THROTTLE_INTERVAL);

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      highlight.current?.pressIn();
      onPressIn?.(event);
    },
    [onPressIn],
  );
  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      highlight.current?.pressOut();
      onPressOut?.(event);
    },
    [onPressOut],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    const min = Platform.OS === 'android' ? MIN_TOUCH_TARGET.android : MIN_TOUCH_TARGET.ios;
    const { width, height } = event.nativeEvent.layout;
    const horizontal = Math.max(0, Math.ceil((min - width) / 2));
    const vertical = Math.max(0, Math.ceil((min - height) / 2));
    setAutoHitSlop(horizontal || vertical ? { left: horizontal, right: horizontal, top: vertical, bottom: vertical } : undefined);
  };

  const resolvedBackground = resolveColor(colors, backgroundColor);

  // 애니메이션 스타일을 받지 않으면 일반 Pressable 로 그린다 — 생김새는 같고 마운트 비용이 절반쯤이다
  const Root = (animated ? AnimatedPressable : Pressable) as typeof AnimatedPressable;

  return (
    <Root
      {...props}
      onPress={onPress ? () => guardedPress?.('press') : undefined}
      onLongPress={onLongPress ? () => guardedPress?.('longPress') : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={inactive}
      hitSlop={hitSlop ?? autoHitSlop}
      onLayout={handleLayout}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: inactive, busy: loading, ...accessibilityState }}
      android_ripple={inactive ? undefined : { color: stateColor, foreground: true }}
      style={[radiusStyle(radius), { overflow: 'hidden' }, resolvedBackground ? { backgroundColor: resolvedBackground } : null, inactive ? { opacity: OPACITY.disabledView } : null, style]}
    >
      {children}
      {Platform.OS !== 'android' ? <PressHighlight ref={highlight} color={stateColor} /> : null}
    </Root>
  );
}

const MemoZSPressable = React.memo(ZSPressable);

export const AnimatedZSPressable = MemoZSPressable;

const PublicZSPressable: React.MemoExoticComponent<(props: ZSPressableProps) => React.JSX.Element> = MemoZSPressable;

export default PublicZSPressable;

const styles = StyleSheet.create({
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
