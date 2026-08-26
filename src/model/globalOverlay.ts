import { OverlayContextProps } from './types';

let globalOverlayRef: OverlayContextProps | null = null;

export const setGlobalOverlayRef = (ref: OverlayContextProps | null) => {
  globalOverlayRef = ref;
};

export const getGlobalOverlayRef = (): OverlayContextProps | null => {
  return globalOverlayRef;
};

const requireRef = (): OverlayContextProps => {
  if (!globalOverlayRef) {
    throw new Error(
      'Overlay functions are not available. Please make sure OverlayProvider is properly set up in your app root.'
    );
  }
  return globalOverlayRef;
};

/** React 밖(이벤트 핸들러, API 에러 처리 등)에서도 호출 가능한 명령형 오버레이 API. */
export const GlobalOverlay: Pick<
  OverlayContextProps,
  'showAlert' | 'showSnackBar' | 'showBottomSheet' | 'showPopOverMenu' | 'showModality' | 'showLoader' | 'hideOverlay'
> = {
  showAlert: (props) => requireRef().showAlert(props),
  showSnackBar: (props) => requireRef().showSnackBar(props),
  showBottomSheet: (props) => requireRef().showBottomSheet(props),
  showPopOverMenu: (props) => requireRef().showPopOverMenu(props),
  showModality: (props) => requireRef().showModality(props),
  showLoader: () => requireRef().showLoader(),
  hideOverlay: (option) => requireRef().hideOverlay(option),
};
