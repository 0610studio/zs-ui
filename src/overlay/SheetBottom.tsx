import { type ComponentType } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { requireNativeView } from 'expo';

let NativeSheetBottom: ComponentType<ViewProps> | undefined;

export function SheetBottom(props: ViewProps) {
  if (Platform.OS !== 'android') return <View {...props} />;
  NativeSheetBottom ??= requireNativeView<ViewProps>('ZsUi', 'ZSSheetBottomView');
  return <NativeSheetBottom {...props} />;
}
