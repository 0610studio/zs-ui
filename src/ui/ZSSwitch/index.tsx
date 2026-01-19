import React, { useState } from "react";
import { type StyleProp, type ViewStyle, Pressable } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";

interface ZSSwitchProps {
  isActive: boolean;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
  width?: number;
  trackColorInactive?: string;
  trackColorActive?: string;
  thumbColor?: string;
}

function ZSSwitch({
  isActive = false,
  onToggle,
  style,
  width = 50,
  trackColorInactive,
  trackColorActive,
  thumbColor = '#ffffff',
}: ZSSwitchProps) {
  const [toggledWidth, setToggledWidth] = useState(0);
  const { palette } = useTheme();
  const height = width * 0.6;
  const padding = width * 0.04;
  const thumbSize = height - padding * 2;
  const toggleBorderRadius = height * 1.2;
  const thumbBorderRadius = thumbSize / 2;

  const inactiveColor = trackColorInactive ?? palette.grey[30];
  const activeColor = trackColorActive ?? palette.primary.main;

  const toggleProgress = useDerivedValue(() => {
    return withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const colorAnimation = useAnimatedStyle(() => {
    'worklet';
    const color = interpolateColor(
      toggleProgress.value,
      [0, 1],
      [inactiveColor, activeColor],
    );

    return { backgroundColor: color };
  }, [inactiveColor, activeColor]);

  const togglePositionAnimation = useAnimatedStyle(() => {
    'worklet';
    const positionStyle = interpolate(
      toggleProgress.value,
      [0, 1],
      [0, toggledWidth - thumbSize - padding * 2],
      'clamp',
    );

    return {
      transform: [{ translateX: positionStyle }],
    };
  }, [toggledWidth, thumbSize, padding]);

  const toggleStyle = {
    width,
    height,
    borderRadius: toggleBorderRadius,
    padding,
    justifyContent: "center" as const,
  };

  const thumbStyle = {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbBorderRadius,
    justifyContent: "center" as const,
  };

  return (
    <Pressable onPress={onToggle} style={style}>
      <Animated.View
        style={[colorAnimation, toggleStyle]}
        onLayout={e => setToggledWidth(e.nativeEvent.layout.width)}
        accessibilityState={{ selected: isActive }}
      >
        <Animated.View style={[togglePositionAnimation, thumbStyle, { backgroundColor: thumbColor }]} />
      </Animated.View>
    </Pressable>
  );
};

export default ZSSwitch;
