import type { ComponentType } from 'react';
import { requireNativeView } from 'expo';
import { StyleSheet, View, type NativeSyntheticEvent, type ViewProps } from 'react-native';
import { SelectField } from './SelectField';
import type { ZSSelectProps } from './types';
import { useSelection } from './useSelection';

export type { ZSSelectOption, ZSSelectProps } from './types';

type NativeSelectMenuProps = ViewProps & {
  options: string[];
  selectedIndex: number;
  placeholder?: string;
  enabled: boolean;
  menuAccessibility: { label: string; value?: string; hint?: string };
  onSelectOption: (event: NativeSyntheticEvent<{ index: number }>) => void;
};

let NativeSelectMenu: ComponentType<NativeSelectMenuProps> | undefined;

/**
 * iOS — ZSTextField 모양 칸은 RN 으로 제자리에 두고, 그 위를 덮는 투명 UIButton 이 UIKit 메뉴(UIMenu)를 연다. 고른 항목에 체크.
 * SwiftUI Menu 는 iOS 26 에서 열고 닫힐 때 라벨을 유리 면으로 바꿔 접어 넣어 칸이 굴절돼 보여 UIKit 메뉴로 그린다.
 * 시스템 메뉴는 HIG 대로 시스템이 그리므로 menuColor 는 쓰지 않는다.
 */
function ZSSelect<T extends string | number = string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  variant = 'outlined',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ZSSelectProps<T>) {
  NativeSelectMenu ??= requireNativeView<NativeSelectMenuProps>('ZsUi', 'ZSSelectMenuView');
  const [selectedIndex, select] = useSelection({ options, value, defaultValue, onValueChange, disabled });
  const selectedLabel = options[selectedIndex]?.label;
  const isPlaceholder = selectedLabel === undefined && placeholder !== undefined;
  const shownText = selectedLabel ?? placeholder ?? '';

  return (
    <View style={[{ alignSelf: 'stretch' }, style]}>
      <SelectField label={label} text={shownText} isPlaceholder={isPlaceholder} open={false} disabled={disabled} variant={variant} />
      <NativeSelectMenu
        style={styles.overlay}
        options={options.map((option) => option.label)}
        selectedIndex={selectedIndex}
        placeholder={placeholder}
        enabled={!disabled}
        menuAccessibility={{ label: accessibilityLabel ?? label, value: shownText || undefined, hint: accessibilityHint }}
        onSelectOption={({ nativeEvent }) => select(nativeEvent.index)}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});

export default ZSSelect;
