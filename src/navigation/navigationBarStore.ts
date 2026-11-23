import { useSyncExternalStore } from 'react';

// 지금 보이는 화면 중 하단 내비게이션 바 아래에 어두운 면을 깐 화면 수(useNavigationBarOnDark)
let darkHolders = 0;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const isOverDark = () => darkHolders > 0;

/** 하단 내비게이션 바 아래가 어두운 면이라고 알린다. 돌려준 함수로 푼다 */
export function holdNavigationBarOverDark(): () => void {
  darkHolders += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    darkHolders -= 1;
    emit();
  };
}

/** 지금 보이는 화면이 하단 내비게이션 바 아래에 어두운 면(카메라·사진)을 깔았는지 */
export function useNavigationBarOverDark(): boolean {
  return useSyncExternalStore(subscribe, isOverDark, isOverDark);
}
