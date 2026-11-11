import { useCallback, useRef } from "react";

/** 누름 쓰로틀 기본 간격 — 처음 누름은 바로 실행하고 이 시간 안의 연타는 버린다(ZSPressable·ZSMenu·ZSSelect 트리거) */
export const PRESS_THROTTLE_INTERVAL = 300;

/** preventDoublePress 를 켰을 때의 간격 — 결제·제출처럼 두 번 실행되면 안 되는 동작 */
export const PREVENT_DOUBLE_PRESS_INTERVAL = 2000;

type PressHandler = (...args: any[]) => void;

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

