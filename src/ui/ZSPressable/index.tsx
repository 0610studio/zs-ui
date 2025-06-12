import React, { useCallback } from "react";
import { Pressable, View, ViewProps } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import AnimatedWrapper from "../atoms/AnimatedWrapper";
import type { ShadowLevel } from "../types";
import { ViewColorOptions } from "../../theme/types";

const DEFAULT_DURATION = { duration: 100 };

interface ZSPressableProps extends ViewProps {
  onPress?: (value?: any) => void;
  onLongPress?: (value?: any) => void;
  pressedBackgroundColor?: string;
  pressedBackgroundBorderRadius?: number;
  isAnimation?: boolean;
  elevationLevel?: ShadowLevel;
  fullWidth?: boolean;
  color?: ViewColorOptions;
}

function ZSPressable({
  onPress,
  onLongPress,
  isAnimation = true,
  pressedBackgroundColor = 'rgba(180, 180, 180, 0.1)',
  pressedBackgroundBorderRadius = 16,
  elevationLevel,
  fullWidth = false,
  color,
  ...props
}: ZSPressableProps) {
  const isButtonPress = useSharedValue(0);

  const boxAnimation = useAnimatedStyle(() => {
    const scale = interpolate(
      isButtonPress.value,
      [0, 1],
      [1, 0.96],
      'clamp'
    );
    return {
      transform: [{ scale: withTiming(scale, DEFAULT_DURATION) }],
    };
  }, []);

  const handlePressStyle = useCallback(
    (pressed: boolean) => {
      runOnJS(() => {
        isButtonPress.value = pressed ? 1 : 0;
      })();
      return {
        backgroundColor: pressed ? pressedBackgroundColor : 'transparent',
        borderRadius: pressedBackgroundBorderRadius,
      };
    },
    [pressedBackgroundColor, pressedBackgroundBorderRadius, fullWidth]
  );

  return (
    <View style={{ width: fullWidth ? '100%' as const : undefined }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
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

export default ZSPressable;
