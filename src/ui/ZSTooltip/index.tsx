import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, type HostInstance, type ViewProps, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ZSText from "../ZSText";
import { useTheme } from "../../context/ThemeContext";
import { useControllableState } from "../../model/useControllableState";
import { enterTransition, exitTransition } from "../../overlay/transitions";
import { Veil, useVeilMaterial } from "../../overlay/veil";
import { resolveColor, type ColorName } from "../../theme/color";
import { radiusStyle } from "../../theme/radius";
import { SPACE } from "../../theme/spacing";
import type { TextVariant } from "../../theme/typeScale";
import { SvgX } from "../../assets/SvgX";
import ZSPressable from "../ZSPressable";

const FLOATING_START_DELAY = 220;
const FLOATING_ANIMATION_DURATION = 1100;
const FLOATING_OFFSET = 2;

export const TOOLTIP_TAIL_WIDTH = 18;
export const TOOLTIP_TAIL_HEIGHT = 8;
const TAIL_PATH = "M0 0h18l-6.6 6.6a3.4 3.4 0 0 1-4.8 0z";
const TAIL_OVERLAP = StyleSheet.hairlineWidth;
export const TOOLTIP_MIN_HEIGHT = 40;
export const TOOLTIP_CLOSE_SIZE = 32;
const CLOSE_ICON = 16;
export const TOOLTIP_TOP_CLEARANCE = SPACE.md;

const ENTERING = {
  top: enterTransition({ translateY: SPACE.sm, speed: 'fast' }),
  bottom: enterTransition({ translateY: -SPACE.sm, speed: 'fast' }),
} as const;
const EXITING = {
  top: exitTransition({ translateY: SPACE.xs }),
  bottom: exitTransition({ translateY: -SPACE.xs }),
} as const;

export type ZSTooltipPlacement = 'top' | 'bottom';
export type ZSTooltipArrowAlign = 'start' | 'center' | 'end';

export interface ZSTooltipProps extends ViewProps {
  message?: string;
  visible?: boolean;
  defaultVisible?: boolean;
  onClose?: () => void;
  placement?: ZSTooltipPlacement;
  showClose?: boolean;
  floating?: boolean;
  backgroundColor?: ColorName | (string & {});
  textColor?: ColorName | (string & {});
  textVariant?: TextVariant;
  arrowAlign?: ZSTooltipArrowAlign;
  arrowOffset?: number;
  closeAccessibilityLabel?: string;
}

function mirroredBelow(style: ViewStyle): ViewStyle | null {
  if (style.position !== 'absolute' || style.bottom === undefined || style.top !== undefined) return null;
  const { bottom, marginBottom, marginTop, ...rest } = style;
  return { ...rest, top: bottom, ...(marginBottom !== undefined ? { marginTop: marginBottom } : null), ...(marginTop !== undefined ? { marginBottom: marginTop } : null) };
}

function ZSTooltip({
  message,
  children,
  visible,
  defaultVisible = true,
  onClose,
  placement = 'top',
  showClose = true,
  floating = false,
  backgroundColor,
  textColor,
  textVariant = 'caption',
  arrowAlign = 'start',
  arrowOffset = 16,
  closeAccessibilityLabel,
  style,
  ...props
}: ZSTooltipProps) {
  const { colors, shadows, accessibilityLabels } = useTheme();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [isVisible, setVisible] = useControllableState(visible, defaultVisible);
  const [flipped, setFlipped] = useState(false);
  const bubbleRef = useRef<HostInstance>(null);
  const floatingTranslateY = useSharedValue(0);

  const solid = backgroundColor !== undefined;
  const veil = useVeilMaterial('inv');
  const bubbleColor = resolveColor(colors, backgroundColor) ?? colors.backgroundInverse;
  const contentColor = resolveColor(colors, textColor) ?? colors.textInverse;
  const tailColor = solid ? bubbleColor : veil.fill;

  if (!isVisible && flipped) setFlipped(false);

  useEffect(() => {
    if (!floating || !isVisible || reduceMotion) return;

    floatingTranslateY.value = 0;
    floatingTranslateY.value = withDelay(
      FLOATING_START_DELAY,
      withRepeat(
        withTiming(-FLOATING_OFFSET, {
          duration: FLOATING_ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );

    return () => {
      cancelAnimation(floatingTranslateY);
    };
  }, [floating, isVisible, reduceMotion, floatingTranslateY]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingTranslateY.value }],
  }));

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const flat = StyleSheet.flatten(style) ?? {};
  const below = placement === 'top' ? mirroredBelow(flat) : null;
  const shownPlacement: ZSTooltipPlacement = flipped && below ? 'bottom' : placement;
  const isTop = shownPlacement === 'top';

  const measurePlacement = () => {
    if (!below || flipped) return;
    bubbleRef.current?.measureInWindow?.((_x: number, y: number) => {
      if (y < insets.top + TOOLTIP_TOP_CLEARANCE) setFlipped(true);
    });
  };

  const tailPosition: ViewStyle =
    arrowAlign === 'center'
      ? styles.tailCenter
      : arrowAlign === 'end'
        ? { right: arrowOffset }
        : { left: arrowOffset };
  const tailStyle = [styles.tail, tailPosition, isTop ? styles.tailBelow : styles.tailAbove];
  const bubbleArea = isTop ? styles.bubbleAreaTop : styles.bubbleAreaBottom;

  return (
    <Animated.View
      entering={ENTERING[shownPlacement]}
      exiting={EXITING[shownPlacement]}
      pointerEvents='box-none'
      style={[styles.container, flipped && below ? below : style]}
      {...props}
    >
      <Animated.View style={[isTop ? styles.spaceBelow : styles.spaceAbove, floatingStyle]}>
        {solid ? (
          <View pointerEvents='none' style={[bubbleArea, radiusStyle('md'), { backgroundColor: bubbleColor }, shadows.md]} />
        ) : (
          <Veil kind='inv' radius='md' pointerEvents='none' style={bubbleArea} />
        )}
        <View pointerEvents='none' style={tailStyle} testID='zs-tooltip-arrow'>
          <Svg width={TOOLTIP_TAIL_WIDTH} height={TOOLTIP_TAIL_HEIGHT} viewBox={`0 0 ${TOOLTIP_TAIL_WIDTH} ${TOOLTIP_TAIL_HEIGHT}`}>
            <Path d={TAIL_PATH} fill={tailColor} />
          </Svg>
        </View>
        <View ref={bubbleRef} onLayout={measurePlacement} style={[styles.bubble, showClose ? styles.bubbleWithClose : null]}>
          <View style={styles.contentRow}>
            {children ?? (
              <ZSText variant={textVariant} emphasized style={[styles.message, { color: contentColor }]}>
                {message}
              </ZSText>
            )}
            {showClose && (
              <ZSPressable
                accessibilityLabel={closeAccessibilityLabel ?? accessibilityLabels.closeTooltip}
                onPress={handleClose}
                radius='full'
                pressedColor={contentColor}
                style={styles.closeButton}
                testID='zs-tooltip-close'
              >
                <SvgX size={CLOSE_ICON} color={contentColor} />
              </ZSPressable>
            )}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default React.memo(ZSTooltip);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  bubble: {
    maxWidth: '100%',
    minHeight: TOOLTIP_MIN_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  bubbleWithClose: {
    paddingEnd: SPACE.xs,
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE.xs,
  },
  message: {
    flexShrink: 1,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 'auto',
    width: TOOLTIP_CLOSE_SIZE,
    height: TOOLTIP_CLOSE_SIZE,
  },
  spaceBelow: {
    paddingBottom: TOOLTIP_TAIL_HEIGHT,
  },
  spaceAbove: {
    paddingTop: TOOLTIP_TAIL_HEIGHT,
  },
  bubbleAreaTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: TOOLTIP_TAIL_HEIGHT,
  },
  bubbleAreaBottom: {
    position: 'absolute',
    top: TOOLTIP_TAIL_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tail: {
    position: 'absolute',
    width: TOOLTIP_TAIL_WIDTH,
    height: TOOLTIP_TAIL_HEIGHT,
  },
  tailCenter: {
    left: '50%',
    marginLeft: -TOOLTIP_TAIL_WIDTH / 2,
  },
  tailBelow: {
    bottom: TAIL_OVERLAP,
  },
  tailAbove: {
    top: TAIL_OVERLAP,
    transform: [{ rotate: '180deg' }],
  },
});
