import * as Expo from 'expo';
import { Platform } from 'react-native';
import { getStatusBarFrameIOS, isViewControllerBasedStatusBarIOS } from '../../native/statusBarAppearance';

const platform = Platform as { OS: string };

describe('isViewControllerBasedStatusBarIOS', () => {
  const nativeModule = (module: unknown) => jest.spyOn(Expo, 'requireOptionalNativeModule').mockReturnValue(module as never);

  afterEach(() => {
    platform.OS = 'ios';
    jest.restoreAllMocks();
  });

  it('iOS 는 네이티브가 알려 준 Info.plist 값을 쓴다', () => {
    nativeModule({ viewControllerBasedStatusBarAppearance: true });
    expect(isViewControllerBasedStatusBarIOS()).toBe(true);
    nativeModule({ viewControllerBasedStatusBarAppearance: false });
    expect(isViewControllerBasedStatusBarIOS()).toBe(false);
  });

  it('네이티브 모듈이 없으면 false — 레드 박스가 나는 statusBarStyle 을 넣지 않는다', () => {
    nativeModule(null);
    expect(isViewControllerBasedStatusBarIOS()).toBe(false);
  });

  it('Android 는 항상 false', () => {
    platform.OS = 'android';
    nativeModule({ viewControllerBasedStatusBarAppearance: true });
    expect(isViewControllerBasedStatusBarIOS()).toBe(false);
  });
});

describe('getStatusBarFrameIOS', () => {
  const nativeModule = (module: unknown) => jest.spyOn(Expo, 'requireOptionalNativeModule').mockReturnValue(module as never);

  afterEach(() => {
    platform.OS = 'ios';
    jest.restoreAllMocks();
  });

  it('iOS 는 네이티브가 읽은 상태바 프레임을 돌려준다', async () => {
    nativeModule({ getStatusBarFrame: async () => ({ x: 0, y: 0, width: 402, height: 54 }) });
    await expect(getStatusBarFrameIOS()).resolves.toEqual({ x: 0, y: 0, width: 402, height: 54 });
  });

  it('네이티브 모듈이나 함수가 없는 빌드는 null', async () => {
    nativeModule(null);
    await expect(getStatusBarFrameIOS()).resolves.toBeNull();
    nativeModule({ viewControllerBasedStatusBarAppearance: true });
    await expect(getStatusBarFrameIOS()).resolves.toBeNull();
  });

  it('Android 는 네이티브를 부르지 않고 null', async () => {
    platform.OS = 'android';
    const getStatusBarFrame = jest.fn();
    nativeModule({ getStatusBarFrame });
    await expect(getStatusBarFrameIOS()).resolves.toBeNull();
    expect(getStatusBarFrame).not.toHaveBeenCalled();
  });
});
