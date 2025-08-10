import React, { useMemo, useCallback, useRef } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedStyle, withTiming, useSharedValue, runOnJS } from 'react-native-reanimated';
import { useTheme } from '../../model/useThemeProvider';
import { ShadowLevel } from '../types';
import { IOS_SHADOW } from '../../theme/elevation';
import { SubColorOptions, ViewColor, ViewColorOptions } from '../../theme/types';

const DEFAULT_DURATION = 200 as const;
const SHADOW_DURATION = 50 as const;
const IS_IOS = Platform.OS === 'ios';

interface AnimatedWrapperProps extends ViewProps {
  isAnimation: boolean;
  elevationLevel?: ShadowLevel;
  duration?: number;
  color?: ViewColorOptions;
}

function AnimatedWrapper({
  isAnimation = true,
  elevationLevel = 0,
  duration = DEFAULT_DURATION,
  style,
  children,
  color,
  ...props
}: AnimatedWrapperProps) {
  const { elevation, palette } = useTheme();
  const opacity = useRef(useSharedValue(0)).current;
  
  const colorConfig = useMemo(() => {
    if (!color) return { c01: undefined, c02: undefined };
    const [c01, c02] = color.split('.') as [ViewColor, SubColorOptions];
    return { c01, c02 };
  }, [color]);
  
  const backgroundColor = useMemo(() => {
    const { c01, c02 } = colorConfig;
    if (c02) return palette[c01][c02];
    if (c01) return palette.background[c01];
    if (elevationLevel) return palette.background.base;
    return undefined;
  }, [colorConfig, palette, elevationLevel]);

  const staticStyle = useMemo(() => {
    return { ...elevation[elevationLevel] };
  }, [elevation, elevationLevel]);

  const animationConfig = useMemo(() => {
    if (IS_IOS) {
      return {
        type: 'ios' as const,
        maxShadowOpacity: IOS_SHADOW[elevationLevel].shadowOpacity,
      };
    }
    return {
      type: 'android' as const,
      maxElevation: elevationLevel,
    };
  }, [elevationLevel]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animationConfig.type === 'ios') {
      return { shadowOpacity: opacity.value * animationConfig.maxShadowOpacity };
    }
    return { elevation: opacity.value * animationConfig.maxElevation };
  }, [animationConfig]);

  const onEntering = useCallback(() => {
    opacity.value = withTiming(1, { duration: SHADOW_DURATION });
  }, [opacity]);

  const animationProps = useMemo(() => ({
    entering: FadeInDown.duration(duration).withCallback((finished) => {
      'worklet';
      if (finished) {
        runOnJS(onEntering)();
      }
    }),
    exiting: FadeOut.duration(50),
  }), [duration, onEntering]);

  const nonAnimatedStyle = useMemo(() => [
    style,
    backgroundColor && { backgroundColor },
    { ...elevation[elevationLevel] }
  ], [style, backgroundColor, elevation, elevationLevel]);

  const animatedStyleArray = useMemo(() => [
    style,
    backgroundColor && { backgroundColor },
    staticStyle,
    animatedStyle
  ], [style, backgroundColor, staticStyle, animatedStyle]);

  if (!isAnimation) {
    return <View style={nonAnimatedStyle} {...props}>{children}</View>;
  }

  return (
    <Animated.View
      style={animatedStyleArray}
      {...animationProps}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

const arePropsEqual = (
  prevProps: AnimatedWrapperProps, 
  nextProps: AnimatedWrapperProps
): boolean => {
  return (
    prevProps.isAnimation === nextProps.isAnimation &&
    prevProps.elevationLevel === nextProps.elevationLevel &&
    prevProps.duration === nextProps.duration &&
    prevProps.color === nextProps.color &&
    prevProps.style === nextProps.style &&
    prevProps.children === nextProps.children
  );
};

export default React.memo(AnimatedWrapper, arePropsEqual);
