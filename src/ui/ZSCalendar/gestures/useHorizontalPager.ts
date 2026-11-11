import { useCallback, useRef } from 'react';
import { usePanGesture, type PanGesture } from 'react-native-gesture-handler';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type SharedValue,
  type WithSpringConfig,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export interface HorizontalPagerOptions {
  pageWidth: number;
  onPageChange: (page: number) => void;
}

export interface HorizontalPager {
  translateX: SharedValue<number>;
  gesture: PanGesture;
  goToPage: (page: number) => void;
  stepPage: (delta: number) => void;
}

const SPRING: WithSpringConfig = { damping: 22, stiffness: 220, mass: 0.9, overshootClamping: true };
const SWIPE_THRESHOLD = 0.28;
const FLING_VELOCITY = 500;

export function useHorizontalPager({ pageWidth, onPageChange }: HorizontalPagerOptions): HorizontalPager {
  const translateX = useSharedValue(0);
  const page = useSharedValue(0);
  const startX = useSharedValue(0);

  const width = useDerivedValue(() => pageWidth);

  const gesture = usePanGesture({
    enabled: pageWidth > 0,
    activeOffsetX: [-12, 12],
    failOffsetY: [-16, 16],
    onActivate: () => {
      'worklet';
      startX.value = translateX.value;
    },
    onUpdate: (event) => {
      'worklet';
      translateX.value = startX.value + event.translationX;
    },
    onDeactivate: (event) => {
      'worklet';
      const w = width.value;
      if (w <= 0) return;

      // 마지막 onUpdate 가 손 뗀 위치까지 못 따라온 경우가 있어 끝 이벤트의 이동량으로 판정한다
      const dragged = startX.value + event.translationX + page.value * w;
      const flung = Math.abs(event.velocityX) > FLING_VELOCITY;
      const passed = Math.abs(dragged) > w * SWIPE_THRESHOLD;

      const next = flung || passed ? page.value + (dragged < 0 ? 1 : -1) : page.value;

      page.value = next;
      translateX.value = withSpring(-next * w, { ...SPRING, velocity: event.velocityX });
    },
  });

  const notifiedRef = useRef(0);
  const notify = useCallback(
    (next: number) => {
      if (notifiedRef.current === next) return;
      notifiedRef.current = next;
      onPageChange(next);
    },
    [onPageChange],
  );

  useAnimatedReaction(
    () => page.value,
    (current, previous) => {
      if (previous !== null && current !== previous) scheduleOnRN(notify, current);
    },
  );

  const goToPage = useCallback(
    (target: number) => {
      page.value = target;
      translateX.value = pageWidth > 0 ? withSpring(-target * pageWidth, SPRING) : 0;
      notify(target);
    },
    [page, translateX, pageWidth, notify],
  );

  const stepPage = useCallback((delta: number) => goToPage(page.value + delta), [goToPage, page]);

  return { translateX, gesture, goToPage, stepPage };
}
