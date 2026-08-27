import { useCallback, useRef } from "react";

/** 중복 제출 방지 잠금 시간(ms) 기본값. 결제·제출처럼 재실행이 위험한 액션 기준. */
export const PREVENT_DOUBLE_PRESS_INTERVAL = 2000;

type PressHandler = (...args: any[]) => void;

/**
 * onPress 를 감싸 첫 호출만 통과시키고, 이후 `interval` 동안 연속 호출을 막는다.
 *
 * ZSPressable 의 기본 디바운스(300ms)는 손떨림 수준의 연타를 거르는 용도이고,
 * 이 훅은 결제·제출처럼 중복 실행 자체가 사고가 되는 액션을 위해 더 긴 잠금을 건다.
 * 반환 핸들러는 identity 가 고정되므로 memo 된 자식에 그대로 넘겨도 리렌더를 유발하지 않는다.
 *
 * @param onPress 감쌀 핸들러. 미전달 시 undefined 를 그대로 돌려줘 Pressable 의 눌림 처리를 막지 않는다.
 * @param interval 잠금 시간(ms). 0 이하면 잠그지 않는다.
 *
 * @example
 * ```tsx
 * const handleSubmit = usePreventDoublePress(submitOrder);
 * return <Pressable onPress={handleSubmit} />;
 * ```
 */
export function usePreventDoublePress<T extends PressHandler>(
  onPress?: T,
  interval: number = PREVENT_DOUBLE_PRESS_INTERVAL
): ((...args: Parameters<T>) => void) | undefined {
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;

  const intervalRef = useRef(interval);
  intervalRef.current = interval;

  const lastPressTime = useRef(0);

  const handlePress = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastPressTime.current < intervalRef.current) return;
    lastPressTime.current = now;
    onPressRef.current?.(...args);
  }, []);

  return onPress ? handlePress : undefined;
}

export default usePreventDoublePress;
