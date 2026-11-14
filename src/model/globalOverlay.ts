import type { OverlayContextProps } from './types';

// Provider 를 겹쳐 두어도(모달 화면 안에 하나 더 등) 안쪽이 언마운트되면 바깥 Provider 로 돌아간다.
const registered: { current: OverlayContextProps }[] = [];

/** 마운트한 OverlayProvider 를 맨 위에 올리고, 돌려준 함수로 내린다. */
export const registerGlobalOverlay = (slot: { current: OverlayContextProps }) => {
  registered.push(slot);
  return () => {
    const index = registered.lastIndexOf(slot);
    if (index >= 0) registered.splice(index, 1);
  };
};

const requireRef = (): OverlayContextProps => {
  const slot = registered[registered.length - 1];
  if (!slot) {
    throw new Error('Overlay functions are not available. Please make sure OverlayProvider is properly set up in your app root.');
  }
  return slot.current;
};

export const GlobalOverlay: OverlayContextProps = {
  showAlert: (props) => requireRef().showAlert(props),
  showBottomSheet: (props) => requireRef().showBottomSheet(props),
  hideBottomSheet: () => requireRef().hideBottomSheet(),
  showSnackbar: (props) => requireRef().showSnackbar(props),
  showLoader: (props) => requireRef().showLoader(props),
  hideLoader: () => requireRef().hideLoader(),
};
