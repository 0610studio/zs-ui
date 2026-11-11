import { GlobalOverlay, setGlobalOverlayRef } from '../../model/globalOverlay';
import type { OverlayContextProps } from '../../model/types';

describe('GlobalOverlay', () => {
  afterEach(() => setGlobalOverlayRef(null));

  it('OverlayProvider 가 없으면 무엇을 부르든 설정 안내 에러를 던진다', () => {
    const calls = [
      () => GlobalOverlay.showAlert({ title: 't', confirm: { label: '확인' } }),
      () => GlobalOverlay.showBottomSheet({ component: null }),
      () => GlobalOverlay.hideBottomSheet(),
      () => GlobalOverlay.showSnackbar({ message: 'm' }),
      () => GlobalOverlay.showLoader(),
      () => GlobalOverlay.hideLoader(),
    ];
    calls.forEach((call) => expect(call).toThrow('Please make sure OverlayProvider is properly set up'));
  });

  it('ref 가 있으면 같은 인자로 위임한다', () => {
    const ref: OverlayContextProps = {
      showAlert: jest.fn(),
      showBottomSheet: jest.fn(),
      hideBottomSheet: jest.fn(),
      showSnackbar: jest.fn(() => true),
      showLoader: jest.fn(),
      hideLoader: jest.fn(),
    };
    setGlobalOverlayRef(ref);

    const alert = { title: 't', confirm: { label: '확인' } };
    const sheet = { component: null, options: { dismissible: false } };
    GlobalOverlay.showAlert(alert);
    GlobalOverlay.showBottomSheet(sheet);
    GlobalOverlay.hideBottomSheet();
    const queued = GlobalOverlay.showSnackbar({ message: 'm' });
    GlobalOverlay.showLoader({ accessibilityLabel: '결제 중' });
    GlobalOverlay.hideLoader();

    expect(ref.showAlert).toHaveBeenCalledWith(alert);
    expect(ref.showBottomSheet).toHaveBeenCalledWith(sheet);
    expect(ref.hideBottomSheet).toHaveBeenCalledTimes(1);
    expect(ref.showSnackbar).toHaveBeenCalledWith({ message: 'm' });
    expect(queued).toBe(true);
    expect(ref.showLoader).toHaveBeenCalledWith({ accessibilityLabel: '결제 중' });
    expect(ref.hideLoader).toHaveBeenCalledTimes(1);
  });

  it('showSnackbar 가 돌려준 값을 그대로 돌려준다', () => {
    setGlobalOverlayRef({ showSnackbar: jest.fn(() => false) } as unknown as OverlayContextProps);
    expect(GlobalOverlay.showSnackbar({ message: 'm' })).toBe(false);
  });

  it('ref 를 비우면 다시 에러다', () => {
    setGlobalOverlayRef({ showLoader: jest.fn() } as unknown as OverlayContextProps);
    setGlobalOverlayRef(null);
    expect(() => GlobalOverlay.showLoader()).toThrow();
  });
});
