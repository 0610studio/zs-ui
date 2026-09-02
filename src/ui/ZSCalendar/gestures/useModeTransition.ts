import { useCallback, useMemo, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
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

export interface ModeTransitionOptions {
  /** 펼칠 때 늘어나는 픽셀 — (rowCount - 1) × rowHeight */
  expandDistance: number;
  onModeChange: (mode: CalendarMode) => void;
  initialMode?: CalendarMode;
  /** false 면 팬·스크롤 어느 쪽으로도 전환하지 않는다 */
  enabled?: boolean;
  /** false 면 리스트 스크롤은 전환을 구동하지 않는다 — 팬 제스처는 그대로 */
  scrollEnabled?: boolean;
}

export interface ModeTransition {
  /** 0 = 주간, 1 = 월간. 전환의 단일 진실 */
  progress: SharedValue<number>;
  gesture: ReturnType<typeof Gesture.Pan>;
  /** 소비자 리스트에 펼쳐 넣으면 스크롤이 같은 progress 를 구동한다 */
  bindScroll: {
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle: number;
  };
  setMode: (mode: CalendarMode) => void;
}

const SPRING: WithSpringConfig = { damping: 20, stiffness: 190, mass: 0.9, overshootClamping: true };

/** 바운스·소수점 오차를 감안한 "맨 위" 판정 여유 */
const TOP_EPSILON = 1;

/**
 * 임계값 스냅이 아니라 progress 하나를 제스처가 직접 끈다.
 * 손을 떼는 순간의 위치와 속도로 가까운 쪽에 스프링 스냅해, 어느 지점에서 놓아도 이어진다.
 */
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
  const distance = useDerivedValue(() => Math.max(expandDistance, 1), [expandDistance]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled && expandDistance > 0)
        .activeOffsetY([-12, 12])
        .failOffsetX([-16, 16])
        .onStart(() => {
          startProgress.value = progress.value;
        })
        .onUpdate((event) => {
          const next = startProgress.value + event.translationY / distance.value;
          progress.value = Math.min(Math.max(next, 0), 1);
        })
        .onEnd((event) => {
          // 속도가 뚜렷하면 방향을 따르고, 아니면 가까운 쪽으로
          const velocityProgress = event.velocityY / distance.value;
          const target = Math.abs(velocityProgress) > 1.2
            ? (velocityProgress > 0 ? 1 : 0)
            : (progress.value > 0.5 ? 1 : 0);
          progress.value = withSpring(target, { ...SPRING, velocity: velocityProgress });
        }),
    [enabled, expandDistance, distance, progress, startProgress],
  );

  // 양 끝에 닿았을 때만 알린다 — 중간 값에서 바꾸면 소비자 상태가 전환 도중에 흔들린다
  useAnimatedReaction(
    () => (progress.value >= 0.999 ? 'month' : progress.value <= 0.001 ? 'week' : null),
    (current, previous) => {
      if (current && current !== previous) scheduleOnRN(onModeChange, current as CalendarMode);
    },
    [onModeChange],
  );

  // 팬으로 접어둔 달력이 리스트를 스치기만 해도 펼쳐지는 것을 막는다
  const leftTopRef = useRef(false);

  /**
   * 리스트가 접힘 거리만큼 실제로 스크롤할 수 있을 때만 전환을 구동한다.
   *
   * 여유가 그보다 짧으면 두 가지가 어긋난다. 짧은 목록을 당기거나 바운스만 해도 달력이 접히고,
   * 접혀서 뷰포트가 커지는 순간 내용이 뷰포트 안에 들어와 오프셋이 0 으로 되돌아가면서
   * 다시 펼쳐지는 왕복이 생긴다. 뷰포트는 접힌 만큼 이미 커져 있으므로 남은 접힘분과 비교한다.
   * 크기 정보가 없는 이벤트(테스트 더블 등)는 스크롤 가능한 것으로 본다.
   */
  const canDrive = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentSize, layoutMeasurement } = event.nativeEvent;
      if (!contentSize || !layoutMeasurement) return true;
      const slack = contentSize.height - layoutMeasurement.height;
      return slack >= Math.max(expandDistance, 1) * progress.value - TOP_EPSILON;
    },
    [expandDistance, progress],
  );

  /**
   * 스크롤 중에는 접히기만 한다. 되돌아오는 중에 달력이 자라면 리스트 뷰포트가 줄면서
   * 오프셋이 다시 흔들려, 손가락 아래에서 두 요소가 서로 밀어내는 것처럼 보인다.
   */
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrollDrives) return;
      const offset = event.nativeEvent.contentOffset.y;
      if (offset > TOP_EPSILON) leftTopRef.current = true;
      if (!canDrive(event)) return;

      const distance = Math.max(expandDistance, 1);
      const next = 1 - Math.min(Math.max(offset, 0), distance) / distance;
      if (next < progress.value) progress.value = next;
    },
    [scrollDrives, expandDistance, progress, canDrive],
  );

  /** 스크롤이 멈춘 시점에만 확정한다 — 반쯤 접힌 채로 남지 않게 */
  const settleFromScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrollDrives) return;
      const offset = event.nativeEvent.contentOffset.y;

      if (offset <= TOP_EPSILON) {
        // 맨 위에 그냥 머물러 있던 경우까지 건드리면 안 된다
        if (!leftTopRef.current) return;
        leftTopRef.current = false;
        if (progress.value !== 1) progress.value = withSpring(1, SPRING);
        return;
      }

      // 스크롤이 접기 시작한 적이 없으면(짧은 목록의 당김·바운스) 그대로 둔다
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
