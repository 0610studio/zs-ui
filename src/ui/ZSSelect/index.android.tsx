import { useEffect, useState } from 'react';
import { Pressable, type LayoutChangeEvent } from 'react-native';
import { DropdownMenu, DropdownMenuItem, RNHostView, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, width as widthModifier } from '@expo/ui/jetpack-compose/modifiers';
import { useTheme } from '../../context/ThemeContext';
import { PRESS_THROTTLE_INTERVAL, usePreventDoublePress } from '../../model/usePreventDoublePress';
import { NativeHost } from '../../native/NativeHost';
import { useComposeColors } from '../../native/composeColors';
import { resolveColor } from '../../theme/color';
import { RADIUS } from '../../theme/radius';
import { fontFamilyFor } from '../../theme/typeScale';
import { SelectField } from './SelectField';
import type { ZSSelectProps } from './types';
import { useSelection } from './useSelection';

export type { ZSSelectOption, ZSSelectProps } from './types';

/** 메뉴 모서리 — 입력 칸(ZSTextField)과 같은 lg */
const MENU_CORNER = RADIUS.lg;

/**
 * Android — ZSTextField 모양 칸을 누르면 칸 폭의 Compose 메뉴가 아래로 열린다.
 * 메뉴는 칸과 같은 모서리, 앱 글꼴, 고른 항목에 체크. 배경은 menuColor(기본 surface3).
 */
function ZSSelect<T extends string | number = string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  variant = 'outlined',
  menuColor,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ZSSelectProps<T>) {
  const { colors, fonts, typography } = useTheme();
  const composeColors = useComposeColors();
  const [selectedIndex, select] = useSelection({ options, value, defaultValue, onValueChange, disabled });
  const [expanded, setExpanded] = useState(false);
  const [fieldWidth, setFieldWidth] = useState(0);
  const open = expanded && !disabled;
  // 연타로 메뉴 열기가 겹치지 않게 ZSPressable 과 같은 300ms 쓰로틀
  const openMenu = usePreventDoublePress(() => setExpanded(true), PRESS_THROTTLE_INTERVAL);
  const selectedLabel = options[selectedIndex]?.label;
  const isPlaceholder = selectedLabel === undefined && placeholder !== undefined;
  const shownText = selectedLabel ?? placeholder ?? '';
  const itemStyle = { fontFamily: fontFamilyFor(fonts, 400), fontSize: typography.body1.fontSize };

  useEffect(() => {
    if (disabled) setExpanded(false);
  }, [disabled]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setFieldWidth((prev) => (prev === next ? prev : next));
  };

  return (
    <NativeHost matchContents={{ vertical: true }} style={[{ alignSelf: 'stretch' }, style]}>
      <DropdownMenu
        expanded={open}
        onDismissRequest={() => setExpanded(false)}
        color={resolveColor(colors, menuColor) ?? composeColors.menuContainer}
        cornerRadius={MENU_CORNER}
        modifiers={[fillMaxWidth()]}
      >
        <DropdownMenu.Trigger>
          <RNHostView matchContents={{ vertical: true }} modifiers={[fillMaxWidth()]}>
            <Pressable
              onPress={openMenu}
              onLayout={handleLayout}
              disabled={disabled}
              android_disableSound
              accessibilityRole="combobox"
              accessibilityLabel={accessibilityLabel ?? label}
              accessibilityValue={shownText ? { text: shownText } : undefined}
              accessibilityHint={accessibilityHint}
              accessibilityState={{ disabled, expanded: open }}
              testID={testID}
            >
              <SelectField label={label} text={shownText} isPlaceholder={isPlaceholder} open={open} disabled={disabled} variant={variant} />
            </Pressable>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {options.map((option, index) => (
            <DropdownMenuItem
              key={`${index}-${option.value}`}
              elementColors={composeColors.menuItem}
              // 메뉴 폭을 칸 폭에 맞춘다(M3 exposed dropdown 과 같음)
              modifiers={fieldWidth > 0 ? [widthModifier(fieldWidth)] : undefined}
              onClick={() => {
                select(index);
                setExpanded(false);
              }}
            >
              <DropdownMenuItem.Text>
                <Text style={itemStyle}>{option.label}</Text>
              </DropdownMenuItem.Text>
              {index === selectedIndex ? (
                <DropdownMenuItem.TrailingIcon>
                  <Text style={itemStyle} color={colors.text}>
                    ✓
                  </Text>
                </DropdownMenuItem.TrailingIcon>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
    </NativeHost>
  );
}

export default ZSSelect;
