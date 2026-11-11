import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

export interface StatusBarFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ZsUiStatusBarModule {
  viewControllerBasedStatusBarAppearance?: boolean;
  getStatusBarFrame?: () => Promise<StatusBarFrame | null>;
}

export function isViewControllerBasedStatusBarIOS(): boolean {
  if (Platform.OS !== 'ios') return false;
  return requireOptionalNativeModule<ZsUiStatusBarModule>('ZsUi')?.viewControllerBasedStatusBarAppearance === true;
}

/** iOS 상태바 프레임(창 좌표). Android·네이티브 모듈이 없는 빌드는 null */
export async function getStatusBarFrameIOS(): Promise<StatusBarFrame | null> {
  if (Platform.OS !== 'ios') return null;
  const getFrame = requireOptionalNativeModule<ZsUiStatusBarModule>('ZsUi')?.getStatusBarFrame;
  return getFrame ? getFrame() : null;
}
