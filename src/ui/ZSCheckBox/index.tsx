import React, { useCallback } from 'react';
import { Pressable, StyleSheet, ViewProps } from 'react-native';
import ViewAtom from '../atoms/ViewAtom';
import ZSText, { ZSTextProps } from '../ZSText';
import { useTheme } from '../../context/ThemeContext';
import { DISABLED_OPACITY, RADIUS } from '../../theme/tokens';
import { SvgCheck } from '../../assets/SvgCheck';

// size 기본값(18) 기준 곡률·보더 비율 유지용
const BASE_SIZE = 18;
const BASE_BORDER_WIDTH = 1.6;

export interface ZSCheckBoxProps extends ViewProps {
  value: boolean;
  onChange: (value: boolean) => void;
  size?: number;
  activeColor?: string;
  label?: string;
  labelStyle?: ZSTextProps;
  labelComponent?: React.ReactNode;
  moreComponent?: React.ReactNode;
  disabled?: boolean;
}

function ZSCheckBox({
  value,
  onChange,
  size = 18,
  activeColor,
  label,
  labelStyle,
  labelComponent,
  moreComponent,
  disabled = false,
  style,
  ...props
}: ZSCheckBoxProps) {
  const { palette } = useTheme();
  const checkedColor = activeColor ?? palette.primary.main;

  const handlePress = useCallback(() => {
    if (!disabled) {
      onChange(!value);
    }
  }, [disabled, onChange, value]);

  return (
    <ViewAtom style={[styles.container, disabled && styles.disabled, style]} {...props}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={styles.checkContainer}
        accessibilityRole='checkbox'
        accessibilityState={{ checked: value, disabled }}
      >
        <ViewAtom
          style={[
            styles.box,
            {
              width: size,
              height: size,
              borderRadius: RADIUS.xs * (size / BASE_SIZE),
              borderWidth: BASE_BORDER_WIDTH * (size / BASE_SIZE),
              backgroundColor: value ? checkedColor : 'transparent',
              borderColor: value ? checkedColor : palette.grey[30],
            },
          ]}
        >
          {value && (
            <ViewAtom style={styles.checkmark}>
              <SvgCheck size={size - 4} strokeWidth="3.5" />
            </ViewAtom>
          )}
        </ViewAtom>
        {labelComponent ?? (label !== undefined && <ZSText {...labelStyle}>{label}</ZSText>)}
      </Pressable>
      {moreComponent}
    </ViewAtom>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  checkContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 2,
    gap: 12,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(ZSCheckBox);
