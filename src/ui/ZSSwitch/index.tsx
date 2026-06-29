import React from "react";
import { type StyleProp, type ViewStyle, Pressable, type ViewProps } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";

const SWITCH_TRANSITION_DURATION = 200;
const SWITCH_TRANSITION = {
  transitionDuration: SWITCH_TRANSITION_DURATION,
  transitionTimingFunction: 'ease-in-out',
} as const;

interface ZSSwitchProps extends ViewProps {
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
  ...props
}: ZSSwitchProps) {
  const { palette } = useTheme();
  const height = width * 0.6;
  const padding = width * 0.04;
  const thumbSize = height - padding * 2;
  const toggleBorderRadius = height * 1.2;
  const thumbBorderRadius = thumbSize / 2;

  const inactiveColor = trackColorInactive ?? palette.grey[30];
  const activeColor = trackColorActive ?? palette.primary.main;
  const thumbTranslateX = isActive ? width - thumbSize - padding * 2 : 0;

  const toggleStyle = {
    width,
    height,
    borderRadius: toggleBorderRadius,
    padding,
    justifyContent: "center" as const,
    backgroundColor: isActive ? activeColor : inactiveColor,
    transitionProperty: 'backgroundColor' as const,
    ...SWITCH_TRANSITION,
  };

  const thumbStyle = {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbBorderRadius,
    justifyContent: "center" as const,
    backgroundColor: thumbColor,
    transform: [{ translateX: thumbTranslateX }],
    transitionProperty: 'transform' as const,
    ...SWITCH_TRANSITION,
  };

  return (
    <Pressable onPress={onToggle} style={style} {...props}>
      <Animated.View style={toggleStyle}>
        <Animated.View style={thumbStyle} />
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(ZSSwitch);
