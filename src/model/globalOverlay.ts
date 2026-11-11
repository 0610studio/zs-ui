import type { OverlayContextProps } from './types';

let globalOverlayRef: OverlayContextProps | null = null;

export const setGlobalOverlayRef = (ref: OverlayContextProps | null) => {
  globalOverlayRef = ref;
};

const requireRef = (): OverlayContextProps => {
  if (!globalOverlayRef) {
    throw new Error('Overlay functions are not available. Please make sure OverlayProvider is properly set up in your app root.');
  }
  return globalOverlayRef;
};

export const GlobalOverlay: OverlayContextProps = {
  showAlert: (props) => requireRef().showAlert(props),
  showBottomSheet: (props) => requireRef().showBottomSheet(props),
  hideBottomSheet: () => requireRef().hideBottomSheet(),
  showSnackbar: (props) => requireRef().showSnackbar(props),
  showLoader: (props) => requireRef().showLoader(props),
  hideLoader: () => requireRef().hideLoader(),
};
