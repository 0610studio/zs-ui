import React from 'react';
import MenuView, { type MenuAction } from '@expo/ui/community/menu';
import { useTheme } from '../../context/ThemeContext';
import type { ZSMenuProps } from './types';

export type { ZSMenuItem, ZSMenuProps } from './types';

function ZSMenu({ items, onSelect, children, title, openOnLongPress = false, style, testID }: ZSMenuProps) {
  const { mode, colors } = useTheme();
  const actions: MenuAction[] = items.map((item) => ({
    id: item.key,
    title: item.label,
    image: item.icon?.sf as MenuAction['image'],
    imageColor: item.destructive ? colors.error : undefined,
    state: item.checked === undefined ? undefined : item.checked ? 'on' : 'off',
    attributes: { destructive: item.destructive, disabled: item.disabled },
  }));

  return (
    <MenuView
      actions={actions}
      title={title}
      colorScheme={mode}
      shouldOpenOnLongPress={openOnLongPress}
      onPressAction={({ nativeEvent }) => onSelect(nativeEvent.event)}
      style={style}
      testID={testID}
    >
      {children}
    </MenuView>
  );
}

export default React.memo(ZSMenu);
