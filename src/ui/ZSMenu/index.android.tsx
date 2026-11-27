import React, { cloneElement, isValidElement, useState } from 'react';
import { Pressable, View } from 'react-native';
import { DropdownMenu, DropdownMenuItem, Icon, RNHostView, SelectableDropdownMenuItem, Text } from '@expo/ui/jetpack-compose';
import { useTheme } from '../../context/ThemeContext';
import { PRESS_THROTTLE_INTERVAL, usePreventDoublePress } from '../../model/usePreventDoublePress';
import { NativeHost } from '../../native/NativeHost';
import { useComposeColors, type ComposeColors } from '../../native/composeColors';
import { MENU_CHECK_ICON, MENU_CHECK_ICON_SIZE } from '../../native/menuIcons';
import ZSButton from '../ZSButton';
import ZSPressable from '../ZSPressable';
import type { ZSMenuItem, ZSMenuProps } from './types';

export type { ZSMenuItem, ZSMenuProps } from './types';

type TriggerProps = { onPress?: () => void; onLongPress?: () => void };

const PRESSABLE_TRIGGER_TYPES: ReadonlySet<unknown> = new Set([ZSButton, ZSPressable]);

function isPressableTrigger(node: React.ReactNode): node is React.ReactElement<TriggerProps> {
  if (!isValidElement<TriggerProps>(node)) return false;
  return PRESSABLE_TRIGGER_TYPES.has(node.type) || Boolean(node.props.onPress || node.props.onLongPress);
}

function ZSMenu({ items, onSelect, children, openOnLongPress = false, style, testID }: ZSMenuProps) {
  const { colors } = useTheme();
  const composeColors = useComposeColors();
  const [expanded, setExpanded] = useState(false);
  // 트리거 자신의 누름과 메뉴 열기를 함께 300ms 쓰로틀한다(ZSPressable 과 같은 간격) — 트리거가 무엇이든 연타로 겹쳐 열리지 않는다
  const open = usePreventDoublePress((triggerHandler?: () => void) => {
    triggerHandler?.();
    setExpanded(true);
  }, PRESS_THROTTLE_INTERVAL)!;
  const handlerName = openOnLongPress ? 'onLongPress' : 'onPress';

  const trigger = isPressableTrigger(children) ? (
    cloneElement(children, {
      [handlerName]: () => open(children.props[handlerName]),
    })
  ) : (
    <Pressable
      onPress={openOnLongPress ? undefined : () => open()}
      onLongPress={openOnLongPress ? () => open() : undefined}
      android_disableSound
      focusable={false}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      {children}
    </Pressable>
  );

  return (
    <View style={style} testID={testID}>
      <NativeHost matchContents>
        <DropdownMenu
          expanded={expanded}
          onDismissRequest={() => setExpanded(false)}
          color={composeColors.menuContainer}
          properties={{ clippingEnabled: false }}
        >
          <DropdownMenu.Trigger>
            <RNHostView matchContents>{trigger}</RNHostView>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            {items.map((item) => (
              <MenuItem
                key={item.key}
                item={item}
                composeColors={composeColors}
                errorColor={colors.error}
                onErrorColor={colors.onError}
                onClick={() => {
                  setExpanded(false);
                  onSelect(item.key);
                }}
              />
            ))}
          </DropdownMenu.Items>
        </DropdownMenu>
      </NativeHost>
    </View>
  );
}

interface MenuItemProps {
  item: ZSMenuItem;
  composeColors: ComposeColors;
  errorColor: string;
  onErrorColor: string;
  onClick: () => void;
}

/**
 * `checked` 가 있는 항목은 고르는 항목 — M3 Expressive 선택 항목으로 그려 고른 항목에 강조 면과 앞 체크(아이콘 자리)를 두고,
 * 선택 상태를 TalkBack 에 전달한다(Expo UI `MenuView` 의 `state` 와 같은 방식). 나머지는 일반 항목이다.
 * 고른 파괴 항목은 primary 대신 error 면에 onError 글자·체크다.
 */
function MenuItem({ item, composeColors, errorColor, onErrorColor, onClick }: MenuItemProps) {
  const icon = item.icon?.android ? <Icon source={item.icon.android} size={24} /> : null;
  const label = <Text>{item.label}</Text>;
  if (item.checked !== undefined) {
    const colors = item.destructive
      ? {
          ...composeColors.selectableMenuItem,
          textColor: errorColor,
          leadingIconColor: errorColor,
          selectedContainerColor: errorColor,
          selectedTextColor: onErrorColor,
          selectedLeadingIconColor: onErrorColor,
        }
      : composeColors.selectableMenuItem;
    return (
      <SelectableDropdownMenuItem selected={item.checked} enabled={!item.disabled} colors={colors} onClick={onClick}>
        <SelectableDropdownMenuItem.Text>{label}</SelectableDropdownMenuItem.Text>
        {icon ? <SelectableDropdownMenuItem.LeadingIcon>{icon}</SelectableDropdownMenuItem.LeadingIcon> : null}
        <SelectableDropdownMenuItem.SelectedLeadingIcon>
          <Icon source={MENU_CHECK_ICON} size={MENU_CHECK_ICON_SIZE} />
        </SelectableDropdownMenuItem.SelectedLeadingIcon>
      </SelectableDropdownMenuItem>
    );
  }
  return (
    <DropdownMenuItem
      enabled={!item.disabled}
      elementColors={item.destructive ? { ...composeColors.menuItem, textColor: errorColor, leadingIconColor: errorColor } : composeColors.menuItem}
      onClick={onClick}
    >
      <DropdownMenuItem.Text>{label}</DropdownMenuItem.Text>
      {icon ? <DropdownMenuItem.LeadingIcon>{icon}</DropdownMenuItem.LeadingIcon> : null}
    </DropdownMenuItem>
  );
}

export default React.memo(ZSMenu);
