import React from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { withOpacity } from '../../theme/color';
import { SPACE } from '../../theme/spacing';
import { OPACITY } from '../../theme/state';
import { useControllableState } from '../../model/useControllableState';
import ZSText from '../ZSText';
import { MARK_ON_FILL, PressHalo, ROW_PRESS_DELAY } from './markParts';

export interface ZSRadioOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const RADIO_ROW_HEIGHT = { ios: 44, android: 56 } as const;
export const RADIO_SIZE = 20;
const RING_WIDTH = 2;
const DOT_RADIUS = 4;
const LABEL_GAP = SPACE.md;

export interface ZSRadioGroupProps<T extends string | number = string> {
  options: ZSRadioOption<T>[];
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T, index: number) => void;
  disabled?: boolean;
  columns?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function RadioMark({ selected, disabled = false }: { selected: boolean; disabled?: boolean }) {
  const { colors } = useTheme();
  const muted = withOpacity(colors.text, OPACITY.disabled);
  const center = RADIO_SIZE / 2;
  return (
    <Svg width={RADIO_SIZE} height={RADIO_SIZE} viewBox={`0 0 ${RADIO_SIZE} ${RADIO_SIZE}`}>
      {selected ? (
        <>
          <Circle cx={center} cy={center} r={center} fill={disabled ? muted : colors.primary} />
          <Circle cx={center} cy={center} r={DOT_RADIUS} fill={disabled ? colors.background : MARK_ON_FILL} />
        </>
      ) : (
        <Circle cx={center} cy={center} r={center - RING_WIDTH / 2} stroke={disabled ? muted : colors.textSecondary} strokeWidth={RING_WIDTH} fill="none" />
      )}
    </Svg>
  );
}

function ZSRadioGroup<T extends string | number = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  columns = 1,
  accessibilityLabel,
  style,
  testID,
}: ZSRadioGroupProps<T>) {
  const { colors } = useTheme();
  const [current, setCurrent] = useControllableState<T | null>(value, defaultValue === undefined ? (options[0]?.value ?? null) : defaultValue);
  const perRow = Math.max(1, Math.floor(columns));
  const rowHeight = Platform.OS === 'android' ? RADIO_ROW_HEIGHT.android : RADIO_ROW_HEIGHT.ios;
  const disabledColor = withOpacity(colors.text, OPACITY.disabled);

  const select = (option: ZSRadioOption<T>, index: number) => {
    if (disabled || option.disabled) return;
    setCurrent(option.value);
    onValueChange?.(option.value, index);
  };

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.group, perRow > 1 ? styles.grid : null, style]}
      testID={testID}
    >
      {options.map((option, index) => {
        const enabled = !disabled && !option.disabled;
        const selected = option.value === current;
        return (
          <Pressable
            key={option.value}
            onPress={() => select(option, index)}
            disabled={!enabled}
            unstable_pressDelay={ROW_PRESS_DELAY}
            accessibilityRole="radio"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityHint={option.accessibilityHint}
            accessibilityState={{ checked: selected, disabled: !enabled }}
            testID={testID ? `${testID}-${option.value}` : undefined}
            style={[
              styles.row,
              { minHeight: rowHeight },
              perRow > 1
                ? { width: `${100 / perRow}%` }
                : index === 0
                  ? null
                  : { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
            ]}
          >
            {({ pressed }) => (
              <>
                <View style={styles.mark}>
                  {pressed ? <PressHalo markSize={RADIO_SIZE} color={withOpacity(selected ? colors.primary : colors.text, OPACITY.pressed)} /> : null}
                  <RadioMark selected={selected} disabled={!enabled} />
                </View>
                <ZSText variant="body1" emphasized={selected} color={enabled ? 'text' : disabledColor} style={styles.label}>
                  {option.label}
                </ZSText>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default React.memo(ZSRadioGroup) as typeof ZSRadioGroup;

const styles = StyleSheet.create({
  group: { alignSelf: 'stretch' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', gap: LABEL_GAP, paddingVertical: SPACE.sm + 2 },
  mark: { width: RADIO_SIZE, height: RADIO_SIZE },
  label: { flex: 1 },
});
