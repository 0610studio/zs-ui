import React from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import { Switch } from '@expo/ui';
import { Row, Switch as ComposeSwitch, Text } from '@expo/ui/jetpack-compose';
import { defaultMinSize, fillMaxWidth, IntrinsicSize, padding as composePadding, semantics, testID as testIDModifier, toggleable, weight, width } from '@expo/ui/jetpack-compose/modifiers';
import { frame, labelsHidden, padding as swiftPadding, tint } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '../../context/ThemeContext';
import { NativeHost } from '../../native/NativeHost';
import { overridesLabel, swiftUIAccessibility, useUnnamedControlWarning } from '../../native/accessibility';
import { useComposeColors } from '../../native/composeColors';
import { useControllableState } from '../../model/useControllableState';

const ROW_HEIGHT = { ios: 44, android: 56 } as const;
const noop = () => {};

export interface ZSSwitchProps {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: string;
  contentInset?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function ZSSwitch({
  value,
  defaultValue = false,
  onValueChange,
  label,
  contentInset = 0,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ZSSwitchProps) {
  const { colors } = useTheme();
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  useUnnamedControlWarning('ZSSwitch', label, accessibilityLabel);
  return (
    <NativeHost matchContents={label ? { vertical: true } : true} style={[label ? { alignSelf: 'stretch' } : null, style]}>
      {Platform.OS === 'android' ? (
        <AndroidSwitch
          value={current}
          onValueChange={setCurrent}
          label={label}
          contentInset={contentInset}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel}
          testID={testID}
        />
      ) : (
        <Switch
          value={current}
          onValueChange={setCurrent}
          label={label}
          disabled={disabled}
          modifiers={[
            ...(label ? [frame({ minHeight: ROW_HEIGHT.ios }), ...(contentInset > 0 ? [swiftPadding({ leading: contentInset, trailing: contentInset })] : [])] : [labelsHidden()]),
            tint(colors.primary),
            ...swiftUIAccessibility(label, accessibilityLabel, accessibilityHint),
          ]}
          testID={testID}
        />
      )}
    </NativeHost>
  );
}

type NativeControlProps = Pick<ZSSwitchProps, 'label' | 'disabled' | 'accessibilityLabel' | 'testID'> & {
  contentInset: number;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function AndroidSwitch({ value, onValueChange, label, contentInset, disabled, accessibilityLabel, testID }: NativeControlProps) {
  const composeColors = useComposeColors();
  const rowToggle = label != null;
  const name = accessibilityLabel ?? label;
  const toggle = (
    <ComposeSwitch
      value={value}
      onCheckedChange={rowToggle ? undefined : disabled ? noop : onValueChange}
      enabled={!disabled}
      colors={composeColors.switch}
      modifiers={[...(!rowToggle && name ? [semantics({ contentDescription: name })] : []), ...(testID ? [testIDModifier(testID)] : [])]}
    />
  );
  if (!rowToggle) return toggle;
  return (
    <Row
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}
      modifiers={[
        fillMaxWidth(),
        width(IntrinsicSize.Max),
        defaultMinSize({ minHeight: ROW_HEIGHT.android }),
        toggleable(value, () => onValueChange(!value), { role: 'switch', enabled: !disabled }),
        // 누름 영역(리플) 안쪽에 여백을 둬서 행 끝에서 끝까지 리플이 퍼진다
        ...(contentInset > 0 ? [composePadding(contentInset, 0, contentInset, 0)] : []),
        ...(overridesLabel(accessibilityLabel, label) ? [semantics({ contentDescription: accessibilityLabel })] : []),
      ]}
    >
      <Text color={disabled ? composeColors.disabledText : composeColors.text} modifiers={[weight(1)]}>
        {label}
      </Text>
      {toggle}
    </Row>
  );
}

export default React.memo(ZSSwitch);
