import React from 'react';
import { PixelRatio, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { radiusStyle, type RadiusToken } from '../../theme/radius';
import { NOTCH_GAP, type ZSTextFieldVariant } from './geometry';

export interface BorderColors {
  rest: string;
  active: string;
  error: string;
}

interface FieldBorderProps {
  variant: ZSTextFieldVariant;
  radius: RadiusToken;
  colors: BorderColors;
  fill?: string;
  disabled: boolean;
  focus: SharedValue<number>;
  error: SharedValue<number>;
  float: SharedValue<number>;
  labelWidth: SharedValue<number>;
  labelScale: number;
  paddingHorizontal: number;
  isRTL: boolean;
}

const FRAME_WIDTH = 5000;
const NOTCH_FRAME_BLEED = 16;
const REST_WIDTH = 1;
const ACTIVE_WIDTH = 2;

function FieldBorder({ variant, radius, colors, fill, disabled, focus, error, float, labelWidth, labelScale, paddingHorizontal, isRTL }: FieldBorderProps) {
  const { rest, active, error: errorColor } = colors;
  const startActive = useAnimatedStyle(() => ({
    opacity: disabled ? 0 : Math.max(focus.value, error.value),
    borderColor: interpolateColor(error.value, [0, 1], [active, errorColor]) as string,
  }));
  const notchActive = useAnimatedStyle(() => ({
    opacity: disabled ? 0 : Math.max(focus.value, error.value),
    borderColor: interpolateColor(error.value, [0, 1], [active, errorColor]) as string,
  }));
  const lineActive = useAnimatedStyle(() => ({
    opacity: disabled ? 0 : Math.max(focus.value, error.value),
    backgroundColor: interpolateColor(error.value, [0, 1], [active, errorColor]) as string,
  }));

  const start = isRTL ? 'right' : 'left';
  const end = isRTL ? 'left' : 'right';
  const ratio = PixelRatio.get();
  const restWidth = Math.max(1, Math.round(REST_WIDTH * ratio)) / ratio;
  const activeWidth = Math.max(1, Math.round(ACTIVE_WIDTH * ratio)) / ratio;
  const notchStart = Math.round((paddingHorizontal - NOTCH_GAP) * ratio) / ratio;
  const notchWidthOf = (progress: number, width: number) => {
    'worklet';
    return Math.round(progress * (width * labelScale + NOTCH_GAP * 2) * ratio) / ratio;
  };
  // Reanimated 구독을 위해 공유 값은 각 스타일 클로저에서 직접 읽습니다.
  const notchStyle = useAnimatedStyle(() => ({ width: notchWidthOf(float.value, labelWidth.value) }));
  const endClipStyle = useAnimatedStyle(() => ({ [start]: notchStart + notchWidthOf(float.value, labelWidth.value) }) as ViewStyle);
  const endRestFrame = useAnimatedStyle(() => ({ [start]: -(notchStart + notchWidthOf(float.value, labelWidth.value)) }) as ViewStyle);
  const endActiveFrame = useAnimatedStyle(
    () =>
      ({
        [start]: -(notchStart + notchWidthOf(float.value, labelWidth.value)),
        opacity: disabled ? 0 : Math.max(focus.value, error.value),
        borderColor: interpolateColor(error.value, [0, 1], [active, errorColor]) as string,
      }) as ViewStyle,
  );

  if (variant === 'underline') {
    return (
      <>
        <View pointerEvents="none" style={[styles.underline, { height: restWidth, backgroundColor: rest }]} />
        <Animated.View pointerEvents="none" style={[styles.underline, { height: activeWidth }, lineActive]} />
      </>
    );
  }

  const shape = radiusStyle(radius);

  if (variant === 'inbox') {
    return (
      <>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, shape, { borderWidth: restWidth, borderColor: rest, backgroundColor: fill }]} />
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, shape, { borderWidth: activeWidth }, startActive]} />
      </>
    );
  }

  const restFrame = [styles.frame, shape, { borderWidth: restWidth, borderColor: rest }];
  const activeFrame = [styles.frame, shape, { borderWidth: activeWidth }];
  const notchRest = [styles.notchFrame, shape, { [start]: -notchStart, borderWidth: restWidth, borderColor: rest }];
  const notchActiveFrame = [styles.notchFrame, shape, { [start]: -notchStart, borderWidth: activeWidth }];
  const endRest = [styles.endFrame, shape, { [end]: 0, borderWidth: restWidth, borderColor: rest }];
  const endActive = [styles.endFrame, shape, { [end]: 0, borderWidth: activeWidth }];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.clip, { [start]: 0, width: notchStart }]}>
        <View style={[restFrame, { [start]: 0 }]} />
        <Animated.View style={[activeFrame, { [start]: 0 }, startActive]} />
      </View>
      <Animated.View style={[styles.clip, { [start]: notchStart }, notchStyle]}>
        <View style={notchRest} />
        <Animated.View style={[notchActiveFrame, notchActive]} />
      </Animated.View>
      <Animated.View style={[styles.clip, { [end]: 0 }, endClipStyle]}>
        <Animated.View style={[endRest, endRestFrame]} />
        <Animated.View style={[endActive, endActiveFrame]} />
      </Animated.View>
    </View>
  );
}

export default React.memo(FieldBorder);

const styles = StyleSheet.create({
  clip: { position: 'absolute', top: 0, bottom: 0, overflow: 'hidden' },
  frame: { position: 'absolute', top: 0, bottom: 0, width: FRAME_WIDTH },
  notchFrame: { position: 'absolute', top: -NOTCH_FRAME_BLEED, bottom: 0, width: FRAME_WIDTH },
  endFrame: { position: 'absolute', top: 0, bottom: 0 },
  underline: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
