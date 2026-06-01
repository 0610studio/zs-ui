import React, { useMemo } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedStyle, withTiming, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { ColorPalette, ShadowLevel, ThemeBackground, ViewColorOptions } from '../../theme/types';
import { IOS_SHADOW } from '../../theme/elevation';

const DEFAULT_DURATION = 200 as const;
const SHADOW_DURATION = 50 as const;
const IS_IOS = Platform.OS === 'ios';
type SemanticPaletteKey = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'information' | 'grey';
type PaletteShade = keyof ColorPalette;

function isColorMap(value: unknown): value is Record<string, string> {
  return typeof value === 'object' && value !== null;
}

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
  
  const staticConfig = useMemo(() => ({
    isIOS: IS_IOS,
    maxShadowOpacity: IS_IOS ? IOS_SHADOW[elevationLevel].shadowOpacity : 0,
    maxElevation: IS_IOS ? 0 : elevationLevel,
  }), [elevationLevel]);
  
  const backgroundColor = useMemo(() => {
    if (!color) {
      return elevationLevel ? palette.background.base : undefined;
    }
    
    const [c01, c02] = color.split('.') as [string, string | undefined];
    if (c02) {
      if (c01 === 'background') return palette.background[c02 as keyof ThemeBackground];
      if (c01 === 'text') return palette.text[c02 as keyof typeof palette.text];

      const semanticPalette = palette[c01 as SemanticPaletteKey];
      return isColorMap(semanticPalette) ? semanticPalette[c02 as PaletteShade] : undefined;
    }
    if (c01) return palette.background[c01 as keyof ThemeBackground] ?? palette[c01 as SemanticPaletteKey]?.main;
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
    const shadowValue = shadowProgress.value;
    
    if (staticConfig.isIOS) {
      return { shadowOpacity: shadowValue * staticConfig.maxShadowOpacity };
    }
    return { elevation: shadowValue * staticConfig.maxElevation };
  }, [staticConfig]);

  const animationProps = useMemo(() => ({
    entering: FadeInDown.duration(duration).withCallback((finished) => {
      'worklet';
      if (finished) {
        animationFinished.value = true;
      }
    }),
    exiting: FadeOut.duration(50),
  }), [duration]);

  const baseStyle = [
    style,
    backgroundColor && { backgroundColor },
    staticStyle
  ];

  const animatedStyleArray = [
    ...baseStyle,
    animatedStyle
  ];

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

export default React.memo(AnimatedWrapper);
