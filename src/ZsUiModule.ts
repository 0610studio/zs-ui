import { requireNativeModule } from 'expo-modules-core';
import { NativeFoldingStateInfo } from './model/types';

interface ZsUiModuleInterface {
  getFoldingFeature(): Promise<NativeFoldingStateInfo>;
}

const ZsUiModule = requireNativeModule('ZsUi') as ZsUiModuleInterface;

export default ZsUiModule;
