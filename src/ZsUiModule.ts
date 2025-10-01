import { requireNativeModule } from 'expo-modules-core';
import { NativeFoldingStateInfo } from './model/types';

interface ZsUiModuleInterface {
  getFoldingFeature(): Promise<NativeFoldingStateInfo>;
}

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
const ZsUiModule = requireNativeModule('ZsUi') as ZsUiModuleInterface;

export default ZsUiModule;
