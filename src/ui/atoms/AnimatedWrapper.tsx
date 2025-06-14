import React, { useMemo, useCallback } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedStyle, withTiming, useSharedValue, runOnJS } from 'react-native-reanimated';
import { useTheme } from '../../model/useThemeProvider';
import { ShadowLevel } from '../types';
import { IOS_SHADOW } from '../../theme/elevation';
import { SubColorOptions, ViewColor, ViewColorOptions } from '../../theme/types';

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
  const opacity = useSharedValue(0);
  const [c01, c02] = color ? color.split('.') as [ViewColor, SubColorOptions] : [undefined, undefined];
  const backgroundColor  = c02 ? palette[c01][c02] : c01 ? palette.background[c01] : elevationLevel ? palette.background.base : undefined;

  // 그림자 및 기타 스타일을 플랫폼에 맞게 미리 계산
  const staticStyle = useMemo(() => {
    return { ...elevation[elevationLevel] };
  }, [elevation]);

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
    return <View style={[style, backgroundColor && { backgroundColor }, { ...elevation[elevationLevel] }]} {...props}>{children}</View>;
  }

  return (
    <Animated.View
      style={[style, backgroundColor && { backgroundColor }, staticStyle, animatedStyle]}
      {...animationProps}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export default React.memo(AnimatedWrapper);
