import React, { useMemo, useCallback } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedStyle, withTiming, useSharedValue, runOnJS } from 'react-native-reanimated';
import { useTheme } from '../../model/useThemeProvider';
import { ShadowLevel, ShadowStyle } from '../types';

const DEFAULT_DURATION = 200 as const;
const SHADOW_DURATION = 50 as const;
const IOS_SHADOW: readonly ShadowStyle[] = [
  { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
  { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 1.00 },
  { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 1.41 },
  { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 2.22 },
  { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 2.62 },
  { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 3.84 },
  { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 4.65 },
  { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 4.65 },
  { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 4.65 },
  { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 5.46 },
  { shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 6.27 },
] as const;

interface AnimatedWrapperProps extends ViewProps {
  isAnimation: boolean;
  elevationLevel?: ShadowLevel;
  duration?: number;
}

function AnimatedWrapper({
  isAnimation = true,
  elevationLevel = 0,
  duration = DEFAULT_DURATION,
  style,
  children,
  ...props
}: AnimatedWrapperProps) {
  const { palette } = useTheme();
  const opacity = useSharedValue(0);

  // 그림자 및 기타 스타일을 플랫폼에 맞게 미리 계산
  const staticStyle = useMemo(() => {
    if (Platform.OS === 'ios') {
      const { shadowOpacity, ...rest } = IOS_SHADOW[elevationLevel];
      return { shadowColor: palette.elevationShadow[elevationLevel], ...rest };
    }
    return { shadowColor: palette.elevationShadow[elevationLevel] };
  }, [elevationLevel, palette]);

  // 애니메이션 스타일 정의 (iOS 그림자 및 Android elevation 처리)
  const animatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'ios') {
      return { shadowOpacity: opacity.value * IOS_SHADOW[elevationLevel].shadowOpacity };
    }
    return { elevation: opacity.value * elevationLevel };
  }, [elevationLevel]);

  // 컴포넌트가 등장할 때 애니메이션 핸들링
  const onEntering = useCallback(() => {
    opacity.value = withTiming(1, { duration: SHADOW_DURATION });
  }, [opacity]);

  // 애니메이션 속성 메모이제이션
  const animationProps = useMemo(() => ({
    entering: FadeInDown.duration(duration).withCallback((finished) => {
      'worklet';
      if (finished) {
        runOnJS(onEntering)();
      }
    }),
    exiting: FadeOut.duration(50),
  }), [duration, onEntering]);

  // 애니메이션이 비활성화된 경우 기본 View로 렌더링
  if (!isAnimation) {
    return <View style={[style, staticStyle]} {...props}>{children}</View>;
  }

  // 애니메이션이 적용된 View로 렌더링
  return (
    <Animated.View
      style={[style, staticStyle, animatedStyle]}
      {...animationProps}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export default React.memo(AnimatedWrapper);
