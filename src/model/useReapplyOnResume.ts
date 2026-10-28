import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * 앱이 background → active 로 돌아왔을 때 `enabled` 이면 `reapply` 를 한 번 부른다.
 *
 * reanimated 4.5 는 끝난 애니메이션 값을 1~2초 사이에 React 로 넘기고(`PropsRegistryGarbageCollector`, 500ms 간격 JS 타이머),
 * 2초가 지난 값은 넘기기 전에 지운다. 애니메이션이 끝나고 1초 안에 백그라운드로 가면 타이머가 멈춰 있다가
 * 복귀 직후 그 값을 넘기지 못한 채 지우고, 다음 React 커밋에서 뷰가 마운트 때 스타일(닫힌 값)로 돌아간다.
 * 오버레이는 복귀 때 열림 값을 다시 넣어 레지스트리에 새 값을 남긴다.
 */
export function useReapplyOnResume(enabled: boolean, reapply: () => void) {
  const reapplyRef = useRef(reapply);
  reapplyRef.current = reapply;

  useEffect(() => {
    if (!enabled) return;
    let prevState: AppStateStatus = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (prevState === 'background' && nextState === 'active') {
        reapplyRef.current();
      }
      prevState = nextState;
    });
    return () => subscription.remove();
  }, [enabled]);
}

/** 값이 같아도 매퍼가 다시 돌도록 강제로 넣는다. `target` 을 생략하면 지금 값을 다시 넣는다. */
export function forceSharedValue(sharedValue: SharedValue<number>, target?: number) {
  sharedValue.modify((current) => {
    'worklet';
    return target === undefined ? current : target;
  }, true);
}
