import React from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useUnnamedControlWarning } from '../../native/accessibility';
import { useControllableState } from '../../model/useControllableState';
import { withOpacity } from '../../theme/color';
import { SPACE } from '../../theme/spacing';
import { MIN_TOUCH_TARGET, OPACITY } from '../../theme/state';
import ZSText from '../ZSText';
import { MARK_ON_FILL, PressHalo, ROW_PRESS_DELAY } from '../ZSRadioGroup/markParts';

const ROW_HEIGHT = { ios: 44, android: 56 } as const;
export const CHECKBOX_SIZE = 20;
const BORDER_WIDTH = 2;
const CORNER = 4;
const CHECK_PATH = 'M5.5 10.3L8.7 13.5L14.6 7';
const CHECK_WIDTH = 2.2;

export interface ZSCheckboxProps {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CheckboxMark({ checked, disabled = false }: { checked: boolean; disabled?: boolean }) {
  const { colors } = useTheme();
  const muted = withOpacity(colors.text, OPACITY.disabled);
  const inset = BORDER_WIDTH / 2;
  return (
    <Svg width={CHECKBOX_SIZE} height={CHECKBOX_SIZE} viewBox={`0 0 ${CHECKBOX_SIZE} ${CHECKBOX_SIZE}`}>
      {checked ? (
        <>
          <Rect x={0} y={0} width={CHECKBOX_SIZE} height={CHECKBOX_SIZE} rx={CORNER} fill={disabled ? muted : colors.primary} />
          <Path d={CHECK_PATH} stroke={disabled ? colors.background : MARK_ON_FILL} strokeWidth={CHECK_WIDTH} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <Rect
          x={inset}
          y={inset}
          width={CHECKBOX_SIZE - BORDER_WIDTH}
          height={CHECKBOX_SIZE - BORDER_WIDTH}
          rx={CORNER - inset}
          stroke={disabled ? muted : colors.textSecondary}
          strokeWidth={BORDER_WIDTH}
          fill="none"
        />
      )}
    </Svg>
  );
}

function ZSCheckbox({
  value,
  defaultValue = false,
  onValueChange,
  label,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ZSCheckboxProps) {
  const { colors } = useTheme();
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  useUnnamedControlWarning('ZSCheckbox', label, accessibilityLabel);
  const android = Platform.OS === 'android';
  const touch = android ? MIN_TOUCH_TARGET.android : MIN_TOUCH_TARGET.ios;

  return (
    <Pressable
      onPress={() => {
        if (!disabled) setCurrent(!current);
      }}
      disabled={disabled}
      unstable_pressDelay={ROW_PRESS_DELAY}
      hitSlop={label ? undefined : (touch - CHECKBOX_SIZE) / 2}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: current, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={[label ? [styles.row, { minHeight: android ? ROW_HEIGHT.android : ROW_HEIGHT.ios }] : styles.alone, style]}
    >
      {({ pressed }) => (
        <>
          <View style={styles.mark}>
            {pressed ? <PressHalo markSize={CHECKBOX_SIZE} color={withOpacity(current ? colors.primary : colors.text, OPACITY.pressed)} /> : null}
            <CheckboxMark checked={current} disabled={disabled} />
          </View>
          {label ? (
            <ZSText variant="body1" color={disabled ? withOpacity(colors.text, OPACITY.disabled) : 'text'} style={styles.label}>
              {label}
            </ZSText>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

export default React.memo(ZSCheckbox);

const styles = StyleSheet.create({
  row: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: SPACE.md, paddingVertical: SPACE.sm + 2 },
  alone: { alignSelf: 'flex-start' },
  mark: { width: CHECKBOX_SIZE, height: CHECKBOX_SIZE },
  label: { flex: 1 },
});
