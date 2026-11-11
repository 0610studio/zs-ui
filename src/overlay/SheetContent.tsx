import { type ComponentType } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { requireNativeView } from 'expo';

let NativeSheetContent: ComponentType<ViewProps> | undefined;

export function SheetContent(props: ViewProps) {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return <View {...props} />;
  NativeSheetContent ??= requireNativeView<ViewProps>('ZsUi', 'ZSSheetContentView');
  return <NativeSheetContent {...props} />;
}
