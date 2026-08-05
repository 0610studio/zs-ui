import { useSyncExternalStore } from 'react';
import { Dimensions, Platform } from 'react-native';
import ZsUiModule from '../ZsUiModule';
import { FoldingState, FoldingStateInfo, NativeFoldingStateInfo } from './types';

// 모듈 레벨 단일 스토어 — 훅 인스턴스마다 Dimensions 리스너와
// 네이티브 getFoldingFeature 호출이 중복되지 않도록 구독자 전체가 상태를 공유한다.
let foldingStateInfo: FoldingStateInfo = {
  foldingState: FoldingState.FOLDED,
  width: Dimensions.get('window').width,
};

const listeners = new Set<() => void>();
let dimensionsSubscription: { remove: () => void } | null = null;

function setFoldingStateInfo(next: FoldingStateInfo) {
  if (
    next.foldingState === foldingStateInfo.foldingState &&
    next.width === foldingStateInfo.width
  ) {
    return;
  }
  foldingStateInfo = next;
  listeners.forEach((listener) => listener());
}

async function updateFoldingState(fallbackWidth = Dimensions.get('window').width) {
  // 폴딩 감지는 Android 전용이지만 width 는 전 플랫폼에서 추적한다.
  if (Platform.OS !== 'android') {
    setFoldingStateInfo({ foldingState: FoldingState.FOLDED, width: fallbackWidth });
    return;
  }

  try {
    const result = await ZsUiModule.getFoldingFeature() as NativeFoldingStateInfo | null;
    setFoldingStateInfo({
      foldingState: result?.foldingFeature ? FoldingState.UNFOLDED : FoldingState.FOLDED,
      width: result?.width || fallbackWidth,
    });
  } catch (error) {
    console.error('getFoldingFeature 호출 실패:', error);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1) {
    dimensionsSubscription = Dimensions.addEventListener('change', ({ window }) => {
      updateFoldingState(window.width);
    });
    updateFoldingState();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      dimensionsSubscription?.remove();
      dimensionsSubscription = null;
    }
  };
}

const getSnapshot = () => foldingStateInfo;

export function useFoldingState(): FoldingStateInfo {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useFoldingState;
