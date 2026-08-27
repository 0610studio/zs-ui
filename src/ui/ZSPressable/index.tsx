import React, { useCallback } from "react";
import { Pressable, View, ViewProps } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AnimatedWrapper from "../atoms/AnimatedWrapper";
import { useTheme } from "../../context/ThemeContext";
import { PREVENT_DOUBLE_PRESS_INTERVAL, usePreventDoublePress } from "../../model/usePreventDoublePress";
import { transparency } from "../../theme/palette";
import { DISABLED_OPACITY, DURATION, RADIUS } from "../../theme/tokens";
import type { ShadowLevel, ViewColorOptions } from "../../theme/types";

const DEFAULT_DURATION = { duration: DURATION.press } as const;
const SCALE_VALUES = [1, 0.96] as const;
const DEBOUNCE_TIME = 300;

interface ZSPressableProps extends ViewProps {
  onPress?: (value?: any) => void;
  onLongPress?: (value?: any) => void;
  pressedBackgroundColor?: string;
  pressedBackgroundBorderRadius?: number;
  isAnimation?: boolean;
  elevationLevel?: ShadowLevel;
  fullWidth?: boolean;
  color?: ViewColorOptions;
  isLoading?: boolean;
  /** true면 기본 디바운스(300ms) 대신 2초 잠금을 걸어 결제·제출의 중복 실행을 막는다 */
  preventDoublePress?: boolean;
  disabled?: boolean;
}

function ZSPressable({
  onPress,
  onLongPress,
  isAnimation = true,
  pressedBackgroundColor,
  pressedBackgroundBorderRadius = RADIUS.xl,
  elevationLevel,
  fullWidth = false,
  color,
  isLoading = false,
  preventDoublePress = false,
  disabled = false,
  ...props
}: ZSPressableProps) {
  const { palette } = useTheme();
  const isButtonPress = useSharedValue(0);
  const pressedBgColor = pressedBackgroundColor ?? palette.grey[50] + transparency['10%'];

  const debounceTime = preventDoublePress ? PREVENT_DOUBLE_PRESS_INTERVAL : DEBOUNCE_TIME;

  const dispatchPress = useCallback((kind: 'press' | 'longPress') => {
    if (isLoading || disabled) return;
    if (kind === 'press') onPress?.();
    else onLongPress?.();
  }, [isLoading, disabled, onPress, onLongPress]);

  // press·longPress 가 하나의 잠금을 공유하도록 훅을 한 번만 쓰고 종류만 라우팅한다
  const guardedPress = usePreventDoublePress(dispatchPress, debounceTime);

  const handlePress = () => guardedPress?.('press');
  const handleLongPress = () => guardedPress?.('longPress');

  const boxAnimation = useAnimatedStyle(() => {
    const scale = interpolate(
      isButtonPress.value,
      [0, 1],
      SCALE_VALUES,
      'clamp'
    );
    return {
      transform: [{ scale }],
    };
  }, []);

  const handlePressIn = () => {
    isButtonPress.value = withTiming(1, DEFAULT_DURATION);
  };

  const handlePressOut = () => {
    isButtonPress.value = withTiming(0, DEFAULT_DURATION);
  };

  const handlePressStyle = (pressed: boolean) => {
    return pressed
      ? {
        backgroundColor: pressedBgColor,
        borderRadius: pressedBackgroundBorderRadius,
      }
      : {
        backgroundColor: 'transparent',
        borderRadius: pressedBackgroundBorderRadius,
      };
  };

  return (
    <View style={[fullWidth ? { width: '100%' as const } : undefined, { opacity: (isLoading || disabled) ? DISABLED_OPACITY : 1 }]}>
      <Pressable
        {...props}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading || disabled}
        style={({ pressed }) => handlePressStyle(pressed)}
      >
        <Animated.View style={boxAnimation}>
          <AnimatedWrapper
            color={color}
            isAnimation={isAnimation}
            elevationLevel={elevationLevel}
            style={props.style}
          >
            {props.children}
          </AnimatedWrapper>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default React.memo(ZSPressable);
