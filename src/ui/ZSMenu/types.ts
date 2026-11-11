import type React from 'react';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

export interface ZSMenuItem {
  key: string;
  label: string;
  icon?: { sf?: string; android?: ImageSourcePropType };
  destructive?: boolean;
  disabled?: boolean;
  checked?: boolean;
}

export interface ZSMenuProps {
  items: ZSMenuItem[];
  onSelect: (key: string) => void;
  children: React.ReactNode;
  title?: string;
  openOnLongPress?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
