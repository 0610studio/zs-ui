import { OverlayContextProps } from './types';

// Global overlay context reference
let globalOverlayRef: OverlayContextProps | null = null;

/**
 * Global overlay context를 설정합니다.
 * OverlayProvider에서 내부적으로 호출되며, 사용자가 직접 호출할 필요는 없습니다.
 */
export const setGlobalOverlayRef = (ref: OverlayContextProps | null) => {
  globalOverlayRef = ref;
};

/**
 * Global overlay context를 가져옵니다.
 * 주로 내부적으로 사용되며, 사용자는 아래의 개별 함수들을 사용하는 것을 권장합니다.
 */
export const getGlobalOverlayRef = (): OverlayContextProps | null => {
  return globalOverlayRef;
};

const getOverlayNotAvailableError = () => {
  throw new Error(
    'Overlay functions are not available. Please make sure OverlayProvider is properly set up in your app root.'
  );
};

const showAlert: OverlayContextProps['showAlert'] = (props) => {
  if (!globalOverlayRef) {
    getOverlayNotAvailableError();
    return;
  }
  globalOverlayRef.showAlert(props);
};

const showSnackBar: OverlayContextProps['showSnackBar'] = (props) => {
  if (!globalOverlayRef) {
    getOverlayNotAvailableError();
    return;
  }
  globalOverlayRef.showSnackBar(props);
};

const showBottomSheet: OverlayContextProps['showBottomSheet'] = (props) => {
  if (!globalOverlayRef) {
    getOverlayNotAvailableError();
    return;
  }
  globalOverlayRef.showBottomSheet(props);
};

const showPopOverMenu: OverlayContextProps['showPopOverMenu'] = (props) => {
  if (!globalOverlayRef) {
    getOverlayNotAvailableError();
    return;
  }
  globalOverlayRef.showPopOverMenu(props);
};

const showModality: OverlayContextProps['showModality'] = (props) => {
  if (!globalOverlayRef) {
    getOverlayNotAvailableError();
    return;
  }
  globalOverlayRef.showModality(props);
};

const showLoader: OverlayContextProps['showLoader'] = () => {
  if (!globalOverlayRef) {
    getOverlayNotAvailableError();
    return;
  }
  globalOverlayRef.showLoader();
};

const hideOverlay: OverlayContextProps['hideOverlay'] = (option) => {
  if (!globalOverlayRef) {
    getOverlayNotAvailableError();
    return;
  }
  globalOverlayRef.hideOverlay(option);
};

export const GlobalOverlay = {
  showAlert,
  showSnackBar,
  showBottomSheet,
  showPopOverMenu,
  showModality,
  showLoader,
  hideOverlay,
};
