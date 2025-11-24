import React, { useState } from "react";
import { type StyleProp, type ViewStyle, Pressable } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withTiming,
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

  const colorAnimation = useAnimatedStyle(() => {
    const color = interpolateColor(
      isActive ? 1 : 0,
      [0, 1],
      [trackColorInactive ?? palette.grey[30], trackColorActive ?? palette.primary.main],
    );

    return { backgroundColor: color };
  });

  const togglePositionAnimation = useAnimatedStyle(() => {
    const positionStyle = interpolate(
      isActive ? 1 : 0,
      [0, 1],
      [0, toggledWidth - thumbSize - padding * 2],
      'clamp',
    );

    return {
      transform: [{ translateX: withTiming(positionStyle, { duration: 200 }) }],
    };
  });

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
