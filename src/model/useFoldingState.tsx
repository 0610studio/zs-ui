import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import ZsUiModule from '../ZsUiModule';
import { FoldingState, FoldingStateInfo, NativeFoldingStateInfo } from './types';

export function useFoldingState(): FoldingStateInfo {
  const [foldingStateInfo, setFoldingStateInfo] = useState<FoldingStateInfo>({
    foldingState: FoldingState.FOLDED,
    width: Dimensions.get('window').width
  });

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let isMounted = true;

    const updateFoldingState = async (fallbackWidth = Dimensions.get('window').width) => {
      try {
        const result = await ZsUiModule.getFoldingFeature() as NativeFoldingStateInfo | null;
        if (!isMounted) return;

        setFoldingStateInfo({
          foldingState: result?.foldingFeature ? FoldingState.UNFOLDED : FoldingState.FOLDED,
          width: result?.width || fallbackWidth,
        });
      } catch (error) {
        console.error('getFoldingFeature 호출 실패:', error);
      }
    };

    updateFoldingState();

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      updateFoldingState(window.width);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return foldingStateInfo;
}

export default useFoldingState;
