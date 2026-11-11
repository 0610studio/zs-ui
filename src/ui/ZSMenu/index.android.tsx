import React, { cloneElement, isValidElement, useState } from 'react';
import { Pressable, View } from 'react-native';
import { DropdownMenu, DropdownMenuItem, Icon, RNHostView, Text } from '@expo/ui/jetpack-compose';
import { useTheme } from '../../context/ThemeContext';
import { PRESS_THROTTLE_INTERVAL, usePreventDoublePress } from '../../model/usePreventDoublePress';
import { NativeHost } from '../../native/NativeHost';
import { useComposeColors } from '../../native/composeColors';
import ZSButton from '../ZSButton';
import ZSPressable from '../ZSPressable';
import type { ZSMenuProps } from './types';

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
              <DropdownMenuItem
                key={item.key}
                enabled={!item.disabled}
                elementColors={item.destructive ? { ...composeColors.menuItem, textColor: colors.error, leadingIconColor: colors.error } : composeColors.menuItem}
                onClick={() => {
                  setExpanded(false);
                  onSelect(item.key);
                }}
              >
                <DropdownMenuItem.Text>
                  <Text>{item.label}</Text>
                </DropdownMenuItem.Text>
                {item.icon?.android ? (
                  <DropdownMenuItem.LeadingIcon>
                    <Icon source={item.icon.android} size={24} />
                  </DropdownMenuItem.LeadingIcon>
                ) : null}
                {item.checked ? (
                  <DropdownMenuItem.TrailingIcon>
                    <Text color={item.disabled ? composeColors.disabledText : colors.text}>✓</Text>
                  </DropdownMenuItem.TrailingIcon>
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenu.Items>
        </DropdownMenu>
      </NativeHost>
    </View>
  );
}

export default React.memo(ZSMenu);
