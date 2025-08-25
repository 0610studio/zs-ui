import React, { useMemo, useRef } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedStyle, withTiming, useSharedValue, useDerivedValue } from 'react-native-reanimated';
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
  const animationFinished = useSharedValue(false);
  
  const staticConfigRef = useRef({
    isIOS: IS_IOS,
    maxShadowOpacity: IS_IOS ? IOS_SHADOW[elevationLevel].shadowOpacity : 0,
    maxElevation: IS_IOS ? 0 : elevationLevel,
  });
  
  if (staticConfigRef.current.maxShadowOpacity !== (IS_IOS ? IOS_SHADOW[elevationLevel].shadowOpacity : 0) ||
      staticConfigRef.current.maxElevation !== (IS_IOS ? 0 : elevationLevel)) {
    staticConfigRef.current = {
      isIOS: IS_IOS,
      maxShadowOpacity: IS_IOS ? IOS_SHADOW[elevationLevel].shadowOpacity : 0,
      maxElevation: IS_IOS ? 0 : elevationLevel,
    };
  }
  
  const backgroundColor = useMemo(() => {
    if (!color) {
      return elevationLevel ? palette.background.base : undefined;
    }
    
    const [c01, c02] = color.split('.') as [ViewColor, SubColorOptions];
    if (c02) return palette[c01][c02];
    if (c01) return palette.background[c01];
    if (elevationLevel) return palette.background.base;
    return undefined;
  }, [color, palette, elevationLevel]);

  const staticStyle = elevation[elevationLevel];

  const shadowProgress = useDerivedValue(() => {
    'worklet';
    if (animationFinished.value) {
      return withTiming(1, { duration: SHADOW_DURATION });
    }
    return 0;
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const config = staticConfigRef.current;
    const shadowValue = shadowProgress.value;
    
    if (config.isIOS) {
      return { shadowOpacity: shadowValue * config.maxShadowOpacity };
    }
    return { elevation: shadowValue * config.maxElevation };
  }, []);

  const animationProps = useMemo(() => ({
    entering: FadeInDown.duration(duration).withCallback((finished) => {
      'worklet';
      if (finished) {
        animationFinished.value = true;
      }
    }),
    exiting: FadeOut.duration(50),
  }), [duration, animationFinished]);

  const baseStyle = useMemo(() => [
    style,
    backgroundColor && { backgroundColor },
    staticStyle
  ], [style, backgroundColor, staticStyle]);

  const animatedStyleArray = useMemo(() => [
    ...baseStyle,
    animatedStyle
  ], [baseStyle, animatedStyle]);

  if (!isAnimation) {
    return <View style={baseStyle} {...props}>{children}</View>;
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
  if (prevProps.children !== nextProps.children) return false;
  if (prevProps.style !== nextProps.style) return false;
  if (prevProps.isAnimation !== nextProps.isAnimation) return false;
  if (prevProps.elevationLevel !== nextProps.elevationLevel) return false;
  if (prevProps.duration !== nextProps.duration) return false;
  if (prevProps.color !== nextProps.color) return false;
  
  return true;
};

export default React.memo(AnimatedWrapper, arePropsEqual);
