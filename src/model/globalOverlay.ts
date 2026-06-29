import { OverlayContextProps } from './types';

let globalOverlayRef: OverlayContextProps | null = null;

export const setGlobalOverlayRef = (ref: OverlayContextProps | null) => {
  globalOverlayRef = ref;
};

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
