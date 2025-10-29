import React from "react";
import { Pressable, View, ViewProps } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AnimatedWrapper from "../atoms/AnimatedWrapper";
import type { ShadowLevel, ViewColorOptions } from "../../theme/types";

const DEFAULT_DURATION = { duration: 100 } as const;
const SCALE_VALUES = [1, 0.96] as const;

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
    'worklet';
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
          backgroundColor: pressedBackgroundColor,
          borderRadius: pressedBackgroundBorderRadius,
        }
      : {
          backgroundColor: 'transparent',
          borderRadius: pressedBackgroundBorderRadius,
        };
  };

  const containerStyle = fullWidth ? { width: '100%' as const } : undefined;

  return (
    <View style={containerStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
