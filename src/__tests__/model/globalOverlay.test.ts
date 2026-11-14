import { GlobalOverlay, registerGlobalOverlay } from '../../model/globalOverlay';
import type { OverlayContextProps } from '../../model/types';

const slotOf = (current: OverlayContextProps) => ({ current });

describe('GlobalOverlay', () => {
  let unregister: (() => void)[] = [];
  const register = (ref: OverlayContextProps) => {
    const remove = registerGlobalOverlay(slotOf(ref));
    unregister.push(remove);
    return remove;
  };

  afterEach(() => {
    unregister.forEach((remove) => remove());
    unregister = [];
  });

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

  it('등록한 Provider 로 같은 인자를 넘긴다', () => {
    const ref: OverlayContextProps = {
      showAlert: jest.fn(),
      showBottomSheet: jest.fn(),
      hideBottomSheet: jest.fn(),
      showSnackbar: jest.fn(() => true),
      showLoader: jest.fn(),
      hideLoader: jest.fn(),
    };
    register(ref);

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
    register({ showSnackbar: jest.fn(() => false) } as unknown as OverlayContextProps);
    expect(GlobalOverlay.showSnackbar({ message: 'm' })).toBe(false);
  });

  it('등록을 거두면 다시 에러다', () => {
    const remove = register({ showLoader: jest.fn() } as unknown as OverlayContextProps);
    remove();
    expect(() => GlobalOverlay.showLoader()).toThrow();
  });

  it('겹쳐 둔 Provider 는 나중에 마운트한 쪽으로 보내고, 그쪽이 빠지면 바깥 Provider 로 돌아간다', () => {
    const outer = { showLoader: jest.fn() } as unknown as OverlayContextProps;
    const inner = { showLoader: jest.fn() } as unknown as OverlayContextProps;
    register(outer);
    const removeInner = register(inner);
    GlobalOverlay.showLoader();
    expect(inner.showLoader).toHaveBeenCalledTimes(1);
    removeInner();
    GlobalOverlay.showLoader();
    expect(outer.showLoader).toHaveBeenCalledTimes(1);
  });

  it('바깥 Provider 가 먼저 빠져도 안쪽 Provider 는 남는다', () => {
    const outer = { showLoader: jest.fn() } as unknown as OverlayContextProps;
    const inner = { showLoader: jest.fn() } as unknown as OverlayContextProps;
    const removeOuter = register(outer);
    register(inner);
    removeOuter();
    GlobalOverlay.showLoader();
    expect(inner.showLoader).toHaveBeenCalledTimes(1);
    expect(outer.showLoader).not.toHaveBeenCalled();
  });
});
