import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ZsUiViewProps } from './ZsUi.types';

const NativeView: React.ComponentType<ZsUiViewProps> =
  requireNativeViewManager('ZsUi');

export default function ZsUiView(props: ZsUiViewProps) {
  return <NativeView {...props} />;
}
