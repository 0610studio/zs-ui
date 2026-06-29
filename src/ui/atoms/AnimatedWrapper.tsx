import React, { useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedStyle, withTiming, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { ShadowLevel, ViewColorOptions } from '../../theme/types';
import { resolveViewColor } from '../../theme/resolveColor';
import { IOS_SHADOW, parseColorChannels } from '../../theme/elevation';

const DEFAULT_DURATION = 200 as const;
const SHADOW_DURATION = 50 as const;

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

  const shadowConfig = useMemo(() => {
    const shadow = IOS_SHADOW[elevationLevel];
    const { r, g, b, a } = parseColorChannels(palette.elevationShadow[elevationLevel] ?? '');
    return {
      offsetX: shadow.shadowOffset.width,
      offsetY: shadow.shadowOffset.height,
      blurRadius: shadow.shadowRadius,
      maxAlpha: a * shadow.shadowOpacity,
      r,
      g,
      b,
    };
  }, [elevationLevel, palette]);

  const backgroundColor = useMemo(() => {
    if (!color) {
      return elevationLevel ? palette.background.base : undefined;
    }
    return resolveViewColor(palette, color);
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
    const alpha = shadowConfig.maxAlpha * shadowProgress.value;

    return {
      boxShadow: [
        {
          offsetX: shadowConfig.offsetX,
          offsetY: shadowConfig.offsetY,
          blurRadius: shadowConfig.blurRadius,
          spreadDistance: 0,
          color: `rgba(${shadowConfig.r}, ${shadowConfig.g}, ${shadowConfig.b}, ${alpha})`,
        },
      ],
    };
  }, [shadowConfig]);

  const animationProps = useMemo(() => ({
    entering: FadeInDown.duration(duration).withCallback((finished) => {
      'worklet';
      if (finished) {
        animationFinished.value = true;
      }
    }),
    exiting: FadeOut.duration(50),
  }), [duration]);

  const bgStyle = useMemo(
    () => (backgroundColor ? { backgroundColor } : undefined),
    [backgroundColor]
  );

  const baseStyle = useMemo(
    () => [style, bgStyle, staticStyle],
    [style, bgStyle, staticStyle]
  );

  const animatedStyleArray = useMemo(
    () => [style, bgStyle, staticStyle, animatedStyle],
    [style, bgStyle, staticStyle, animatedStyle]
  );

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
