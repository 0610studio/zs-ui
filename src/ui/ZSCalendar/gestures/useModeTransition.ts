import { useCallback, useRef } from 'react';
import { usePanGesture, type PanGesture } from 'react-native-gesture-handler';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type SharedValue,
  type WithSpringConfig,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { CalendarMode } from '../core';
import type { CalendarScrollBinding } from '../context';

export interface ModeTransitionOptions {
  expandDistance: number;
  onModeChange: (mode: CalendarMode) => void;
  initialMode?: CalendarMode;
  enabled?: boolean;
  scrollEnabled?: boolean;
}

export interface ModeTransition {
  progress: SharedValue<number>;
  gesture: PanGesture;
  bindScroll: CalendarScrollBinding;
  setMode: (mode: CalendarMode) => void;
}

const SPRING: WithSpringConfig = { damping: 20, stiffness: 190, mass: 0.9, overshootClamping: true };

const TOP_EPSILON = 1;

export function useModeTransition({
  expandDistance,
  onModeChange,
  initialMode = 'month',
  enabled = true,
  scrollEnabled = true,
}: ModeTransitionOptions): ModeTransition {
  const scrollDrives = enabled && scrollEnabled;
  const progress = useSharedValue(initialMode === 'month' ? 1 : 0);
  const startProgress = useSharedValue(0);
  const distance = Math.max(expandDistance, 1);
  const distanceValue = useDerivedValue(() => distance);

  const gesture = usePanGesture({
    enabled: enabled && expandDistance > 0,
    activeOffsetY: [-12, 12],
    failOffsetX: [-16, 16],
    onActivate: () => {
      'worklet';
      startProgress.value = progress.value;
    },
    onUpdate: (event) => {
      'worklet';
      const next = startProgress.value + event.translationY / distanceValue.value;
      progress.value = Math.min(Math.max(next, 0), 1);
    },
    onDeactivate: (event) => {
      'worklet';
      const velocityProgress = event.velocityY / distanceValue.value;
      // 마지막 onUpdate 가 손 뗀 위치까지 못 따라온 경우가 있어 끝 이벤트의 이동량으로 판정한다
      const released = startProgress.value + event.translationY / distanceValue.value;
      const target = Math.abs(velocityProgress) > 1.2
        ? (velocityProgress > 0 ? 1 : 0)
        : (released > 0.5 ? 1 : 0);
      progress.value = withSpring(target, { ...SPRING, velocity: velocityProgress });
    },
  });

  useAnimatedReaction(
    () => (progress.value >= 0.999 ? 'month' : progress.value <= 0.001 ? 'week' : null),
    (current, previous) => {
      if (current && current !== previous) scheduleOnRN(onModeChange, current as CalendarMode);
    },
  );

  const leftTopRef = useRef(false);

  const canDrive = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentSize, layoutMeasurement } = event.nativeEvent;
      if (!contentSize || !layoutMeasurement) return true;
      const slack = contentSize.height - layoutMeasurement.height;
      return slack >= distance * progress.value - TOP_EPSILON;
    },
    [distance, progress],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrollDrives) return;
      const offset = event.nativeEvent.contentOffset.y;
      if (offset > TOP_EPSILON) leftTopRef.current = true;
      if (!canDrive(event)) return;

      const next = 1 - Math.min(Math.max(offset, 0), distance) / distance;
      if (next < progress.value) progress.value = next;
    },
    [scrollDrives, distance, progress, canDrive],
  );

  const settleFromScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrollDrives) return;
      const offset = event.nativeEvent.contentOffset.y;

      if (offset <= TOP_EPSILON) {
        if (!leftTopRef.current) return;
        leftTopRef.current = false;
        if (progress.value !== 1) progress.value = withSpring(1, SPRING);
        return;
      }

      if (progress.value >= 0.999) return;
      if (progress.value !== 0) progress.value = withSpring(0, SPRING);
    },
    [scrollDrives, progress],
  );

  const setMode = useCallback(
    (mode: CalendarMode) => {
      progress.value = withSpring(mode === 'month' ? 1 : 0, SPRING);
    },
    [progress],
  );

  return {
    progress,
    gesture,
    bindScroll: {
      onScroll,
      onScrollEndDrag: settleFromScroll,
      onMomentumScrollEnd: settleFromScroll,
      scrollEventThrottle: 16,
    },
    setMode,
  };
}
