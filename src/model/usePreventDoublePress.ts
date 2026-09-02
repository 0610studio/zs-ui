import { useCallback, useRef } from "react";

/** 중복 제출 방지 잠금 시간(ms). 결제·제출처럼 재실행이 위험한 액션 기준. */
export const PREVENT_DOUBLE_PRESS_INTERVAL = 2000;

type PressHandler = (...args: any[]) => void;

/**
 * 첫 호출만 통과시키고 `interval` 동안 연속 호출을 막는다. ZSPressable 의 기본 디바운스(300ms)가
 * 손떨림용이라면, 이쪽은 중복 실행 자체가 사고인 액션용이다. 반환 핸들러의 identity 는 고정된다.
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
