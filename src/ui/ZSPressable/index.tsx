import React, { useCallback, useMemo, useRef } from "react";
import { Pressable, View, ViewProps } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AnimatedWrapper from "../atoms/AnimatedWrapper";
import type { ShadowLevel } from "../types";
import { ViewColorOptions } from "../../theme/types";

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
  const isButtonPress = useRef(useSharedValue(0)).current;

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
  
  const handlePressIn = useCallback(() => {
    isButtonPress.value = withTiming(1, DEFAULT_DURATION);
  }, [isButtonPress]);
  
  const handlePressOut = useCallback(() => {
    isButtonPress.value = withTiming(0, DEFAULT_DURATION);
  }, [isButtonPress]);

  const pressedStyle = useMemo(() => ({
    backgroundColor: pressedBackgroundColor,
    borderRadius: pressedBackgroundBorderRadius,
  }), [pressedBackgroundColor, pressedBackgroundBorderRadius]);
  
  const unpressedStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    borderRadius: pressedBackgroundBorderRadius,
  }), [pressedBackgroundBorderRadius]);
  
  const handlePressStyle = useCallback(
    (pressed: boolean) => {
      return pressed ? pressedStyle : unpressedStyle;
    },
    [pressedStyle, unpressedStyle]
  );

  const containerStyle = useMemo(() => ({
    width: fullWidth ? '100%' as const : undefined
  }), [fullWidth]);

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

const arePropsEqual = (
  prevProps: ZSPressableProps, 
  nextProps: ZSPressableProps
): boolean => {
  return (
    prevProps.onPress === nextProps.onPress &&
    prevProps.onLongPress === nextProps.onLongPress &&
    prevProps.isAnimation === nextProps.isAnimation &&
    prevProps.pressedBackgroundColor === nextProps.pressedBackgroundColor &&
    prevProps.pressedBackgroundBorderRadius === nextProps.pressedBackgroundBorderRadius &&
    prevProps.elevationLevel === nextProps.elevationLevel &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.color === nextProps.color &&
    prevProps.style === nextProps.style &&
    prevProps.children === nextProps.children
  );
};

export default React.memo(ZSPressable, arePropsEqual);
