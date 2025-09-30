import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import ZsUiModule from '../ZsUiModule';
import { FoldingStateInfo, GetFoldingStateResponse, UseFoldingStateReturn } from './types';

/**
 * Android 폴딩/언폴딩 상태를 감지하고 현재 화면 너비를 추적하는 Hook
 * iOS에서는 항상 'unfolding' 상태와 현재 화면 너비를 반환합니다.
 * 
 * width는 PT 단위로 반환되며, Dimensions.get('window').width와 동일한 단위입니다.
 * 
 * @returns {UseFoldingStateReturn} 폴딩 상태와 관련 정보를 포함하는 객체
 */
export function useFoldingState(): UseFoldingStateReturn {
  const [foldingStateInfo, setFoldingStateInfo] = useState<FoldingStateInfo>({
    foldingState: 'unfolding',
    width: Dimensions.get('window').width
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 네이티브 모듈에서 폴딩 상태 가져오기
      const nativeState: GetFoldingStateResponse = ZsUiModule.getFoldingState();

      setFoldingStateInfo({
        foldingState: nativeState.foldingState as 'folding' | 'unfolding',
        width: nativeState.width
      });

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let subscription: any;
    let subscription_dimensions: any;
    if (Platform.OS === 'android') {
      // 초기 로드  
      refresh();

      // 이벤트 리스너 등록
      subscription = ZsUiModule.addListener('onFoldingStateChange', (event: FoldingStateInfo) => {
        setFoldingStateInfo(event);
      });

      // Dimensions 변경 감지 (화면 회전 등)
      subscription_dimensions = Dimensions.addEventListener('change', ({ window }) => {
        refresh();
      });
    } else {
      setIsLoading(false);
    }

    // 정리 함수
    return () => {
      subscription?.remove();
      subscription_dimensions?.remove();
    };
  }, []);

  return {
    foldingState: foldingStateInfo.foldingState,
    width: foldingStateInfo.width,
    isLoading,
    error,
    refresh
  };
}

export default useFoldingState;
