import { useCallback, useMemo, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
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
  /** 페이지 확정 시 호출 — 이웃 pane 을 새로 기록하는 계기 */
  onPageChange: (page: number) => void;
  /** 폭 대비 이 비율을 넘겨 끌면 넘어간다 */
  threshold?: number;
  /** 이 속도(px/s)를 넘으면 거리와 무관하게 넘긴다 */
  velocityThreshold?: number;
  enabled?: boolean;
}

export interface HorizontalPager {
  /** 화면 x = page × pageWidth + translateX */
  translateX: SharedValue<number>;
  page: SharedValue<number>;
  gesture: ReturnType<typeof Gesture.Pan>;
  /** 헤더 화살표 등 제스처 밖에서 옮길 때 — 같은 스프링을 탄다 */
  goToPage: (page: number) => void;
  stepPage: (delta: number) => void;
}

const SPRING: WithSpringConfig = { damping: 22, stiffness: 220, mass: 0.9, overshootClamping: true };

/**
 * pane 을 절대 페이지 좌표에 두고 캔버스를 통째로 민다. 스냅 후 translateX 를 0 으로
 * 되돌리면 그 프레임과 새 pane 커밋 프레임이 어긋나 한 프레임 뒤로 튄다.
 *
 * page 변화를 반응으로 관찰해 JS 로 넘기는 이유: 제스처 객체가 매 렌더 재생성되지 않아
 * 스와이프 도중 JS 작업이 끼어들지 않는다.
 */
export function useHorizontalPager({
  pageWidth,
  onPageChange,
  threshold = 0.28,
  velocityThreshold = 500,
  enabled = true,
}: HorizontalPagerOptions): HorizontalPager {
  const translateX = useSharedValue(0);
  const page = useSharedValue(0);
  const startX = useSharedValue(0);

  // 렌더 중 shared value 쓰기는 Reanimated 가 경고한다 — 파생값으로 전달
  const width = useDerivedValue(() => pageWidth, [pageWidth]);
  const config = useDerivedValue(() => ({ threshold, velocityThreshold }), [threshold, velocityThreshold]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled && pageWidth > 0)
        // 세로 스크롤·탭과 충돌하지 않도록 가로로 확실히 움직였을 때만 활성화
        .activeOffsetX([-12, 12])
        .failOffsetY([-16, 16])
        .onStart(() => {
          startX.value = translateX.value;
        })
        .onUpdate((event) => {
          translateX.value = startX.value + event.translationX;
        })
        .onEnd((event) => {
          const w = width.value;
          if (w <= 0) return;

          const dragged = translateX.value + page.value * w;
          const flung = Math.abs(event.velocityX) > config.value.velocityThreshold;
          const passed = Math.abs(dragged) > w * config.value.threshold;

          // 아무리 빨리 튕겨도 한 번에 한 장만 — 여러 장이 스치면 어디로 갔는지 알 수 없다
          const next = flung || passed ? page.value + (dragged < 0 ? 1 : -1) : page.value;

          page.value = next;
          translateX.value = withSpring(-next * w, { ...SPRING, velocity: event.velocityX });
        }),
    [enabled, pageWidth, config, page, startX, translateX, width],
  );

  // 제스처 경로와 프로그래매틱 경로가 같은 통지를 두 번 보내지 않도록
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
    [notify],
  );

  // 레이아웃 전(pageWidth 0)에도 번호는 맞춰둔다 — 어긋난 채 폭이 들어오면 이후 이동이 밀린다
  const goToPage = useCallback(
    (target: number) => {
      page.value = target;
      translateX.value = pageWidth > 0 ? withSpring(-target * pageWidth, SPRING) : 0;
      // 반응을 기다리면 헤더 제목이 한 프레임 늦게 바뀐다
      notify(target);
    },
    [page, translateX, pageWidth, notify],
  );

  const stepPage = useCallback((delta: number) => goToPage(page.value + delta), [goToPage, page]);

  return { translateX, page, gesture, goToPage, stepPage };
}
