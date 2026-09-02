import { useCallback, useRef, useState } from 'react';

/** value 가 undefined 면 내부 상태를, 주어지면 그 값을 쓴다. 콜백은 양쪽 모두 부른다 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = value !== undefined;

  // 콜백이 매 렌더 바뀌어도 setter 신원은 유지한다
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [isControlled ? (value as T) : internal, set];
}
