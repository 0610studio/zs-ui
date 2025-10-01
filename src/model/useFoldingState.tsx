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
    if (Platform.OS === 'android') {
      const fetchFoldingState = async () => {
        try {
          const result = await ZsUiModule.getFoldingFeature() as NativeFoldingStateInfo;
          if (result.width) setFoldingStateInfo({
            foldingState: result.foldingFeature ? FoldingState.UNFOLDED : FoldingState.FOLDED,
            width: result.width
          });
        } catch (error) {
          console.error('getFoldingFeature 호출 실패:', error);
        }
      };

      fetchFoldingState();
    }
  }, []);

  return foldingStateInfo;
}

export default useFoldingState;
