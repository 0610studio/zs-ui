import { Platform } from 'react-native';
import { ReduceMotion, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

export type MotionKind = 'move' | 'fade';
export type MotionSpeed = 'fast' | 'normal' | 'slow';

interface AndroidSpring {
  dampingRatio: number;
  stiffness: number;
}

export const ANDROID_SPRING: Record<MotionKind, Record<MotionSpeed, AndroidSpring>> = {
  move: {
    fast: { dampingRatio: 0.6, stiffness: 800 },
    normal: { dampingRatio: 0.8, stiffness: 380 },
    slow: { dampingRatio: 0.8, stiffness: 200 },
  },
  fade: {
    fast: { dampingRatio: 1, stiffness: 3800 },
    normal: { dampingRatio: 1, stiffness: 1600 },
    slow: { dampingRatio: 1, stiffness: 800 },
  },
};

export const IOS_SPRING_DURATION: Record<MotionSpeed, number> = { fast: 350, normal: 500, slow: 700 };

const reduceMotion = ReduceMotion.System;

export function springConfig(kind: MotionKind, speed: MotionSpeed = 'normal'): WithSpringConfig {
  if (Platform.OS === 'android') {
    const { dampingRatio, stiffness } = ANDROID_SPRING[kind][speed];
    return { mass: 1, stiffness, damping: dampingRatio * 2 * Math.sqrt(stiffness), reduceMotion };
  }
  return { duration: kind === 'fade' ? IOS_SPRING_DURATION.fast : IOS_SPRING_DURATION[speed], dampingRatio: 1, reduceMotion };
}

export const DURATION: Record<MotionSpeed, number> = { fast: 150, normal: 200, slow: 300 };

export function timingConfig(speed: MotionSpeed = 'normal'): WithTimingConfig {
  return { duration: DURATION[speed], reduceMotion };
}
