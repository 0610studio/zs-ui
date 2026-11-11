import {
  withSpring,
  withTiming,
  type EntryExitAnimationFunction,
  type LayoutAnimationFunction,
  type WithSpringConfig,
} from 'react-native-reanimated';
import { springConfig, timingConfig, type MotionSpeed } from '../theme/motion';

export interface EnterTransitionOptions {
  translateY?: number;
  speed?: MotionSpeed;
}

export function enterTransition({ translateY = 0, speed = 'normal' }: EnterTransitionOptions = {}): EntryExitAnimationFunction {
  const move = springConfig('move', speed);
  const fade = springConfig('fade', speed);
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY }] },
      animations: { opacity: withSpring(1, fade), transform: [{ translateY: withSpring(0, move) }] },
    };
  };
}

export interface ExitTransitionOptions {
  translateY?: number;
  speed?: MotionSpeed;
}

export function exitTransition({ translateY = 0, speed = 'fast' }: ExitTransitionOptions = {}): EntryExitAnimationFunction {
  const timing = timingConfig(speed);
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
      animations: { opacity: withTiming(0, timing), transform: [{ translateY: withTiming(translateY, timing) }] },
    };
  };
}

export function layoutTransition(config: WithSpringConfig = springConfig('move')): LayoutAnimationFunction {
  return (values) => {
    'worklet';
    return {
      initialValues: { originX: values.currentOriginX, originY: values.currentOriginY, width: values.targetWidth, height: values.targetHeight },
      animations: { originX: withSpring(values.targetOriginX, config), originY: withSpring(values.targetOriginY, config) },
    };
  };
}
