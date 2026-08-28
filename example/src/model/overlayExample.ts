export type OverlayExampleSection = 'all' | 'alert' | 'snackbar' | 'bottomSheet' | 'modality' | 'loader';

export const OVERLAY_EXAMPLE_TITLES: Record<OverlayExampleSection, string> = {
  all: 'Overlay',
  alert: 'Alert',
  snackbar: 'Snackbar',
  bottomSheet: 'BottomSheet',
  modality: 'Modality',
  loader: 'Loader',
};

export const OVERLAY_EXAMPLE_CODE: Record<OverlayExampleSection, string> = {
  all: `const { showAlert, showSnackBar,
  showBottomSheet, showModality,
  showLoader, hideOverlay } = useOverlay();`,
  alert: `const { showAlert } = useOverlay();

showAlert({
  title: '알림',
  informative: '이 작업을 계속하시겠습니까?',
  actions: {
    primary: { label: '확인' },
    secondary: { label: '취소' },
  },
});`,
  snackbar: `const { showSnackBar } = useOverlay();

showSnackBar({
  message: '저장되었습니다.',
  type: 'success',
});`,
  bottomSheet: `const { showBottomSheet } = useOverlay();

showBottomSheet({
  component: <BottomSheetContent />,
  options: { height: 'auto' },
});`,
  modality: `const { showModality } = useOverlay();

showModality({
  component: <ModalContent />,
});`,
  loader: `const { showLoader, hideOverlay } = useOverlay();

showLoader();
setTimeout(() => hideOverlay('loader'), 2000);`,
};
