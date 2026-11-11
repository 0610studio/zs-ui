import type { StyleProp, ViewStyle } from 'react-native';
import type { ColorName } from '../../theme/color';
import type { ZSTextFieldVariant } from '../ZSTextField/geometry';

export interface ZSSelectOption<T extends string | number = string> {
  label: string;
  value: T;
}

export interface ZSSelectProps<T extends string | number = string> {
  label: string;
  options: ZSSelectOption<T>[];
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T, index: number) => void;
  placeholder?: string;
  variant?: ZSTextFieldVariant;
  menuColor?: ColorName | (string & {});
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
