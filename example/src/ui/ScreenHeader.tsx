import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { RADIUS, useHeaderButtonColors, useTheme } from '@0610studio/zs-ui';
import HeaderTextButton from './HeaderTextButton';

const ANDROID_ICONS = {
  light: require('../../assets/icons/light_mode.png'),
  dark: require('../../assets/icons/dark_mode.png'),
  more: require('../../assets/icons/more_vert.png'),
  warning: require('../../assets/icons/warning.png'),
};

export type HeaderMenuItem = { key: string; title: string; onPress: () => void; destructive?: boolean;   icon?: ComponentProps<typeof Stack.Toolbar.MenuAction>['icon'] };

export type ScreenHeaderProps = {
  title: string;
  background?: string;
  hideTitle?: boolean;
  action?: { title: string; onPress: () => void; disabled?: boolean };
  menu?: { accessibilityLabel: string; items: HeaderMenuItem[] };
  notice?: { accessibilityLabel: string; onPress: () => void };
};

export default function ScreenHeader({ title, background, hideTitle = false, action, menu, notice }: ScreenHeaderProps) {
  const { colors, mode, toggleTheme } = useTheme();
  const android = Platform.OS === 'android';
  const headerButton = useHeaderButtonColors();
  const nextModeLabel = mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <>
      <Stack.Screen
        options={{
          title,
          ...(background ? { contentStyle: { backgroundColor: background } } : null),
          ...(hideTitle ? { headerTitle: '' } : null),
        }}
      />
      <Stack.Toolbar
        placement="right"
        buttonContainerColor={android ? headerButton.container : undefined}
        backgroundColor={android ? colors.surface3 : undefined}
        tintColor={android ? colors.text : undefined}
      >
        {action && Platform.OS === 'ios' ? (
          <Stack.Toolbar.Button onPress={action.onPress} disabled={action.disabled} accessibilityLabel={action.title}>
            {action.title}
          </Stack.Toolbar.Button>
        ) : null}
        {action && Platform.OS !== 'ios' ? (
          <Stack.Toolbar.View>
            <HeaderTextButton title={action.title} onPress={action.onPress} disabled={action.disabled} />
          </Stack.Toolbar.View>
        ) : null}
        {menu ? (
          <Stack.Toolbar.Menu
            icon={Platform.OS === 'ios' ? 'ellipsis' : ANDROID_ICONS.more}
            iconRenderingMode="template"
            accessibilityLabel={menu.accessibilityLabel}
            cornerRadius={android ? RADIUS.lg : undefined}
          >
            {menu.items.map((item) => (
              <Stack.Toolbar.MenuAction key={item.key} icon={Platform.OS === 'ios' ? item.icon : undefined} destructive={item.destructive} onPress={item.onPress}>
                {item.title}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        ) : null}
        {notice ? (
          <Stack.Toolbar.Button
            icon={Platform.OS === 'ios' ? 'exclamationmark.triangle' : ANDROID_ICONS.warning}
            iconRenderingMode="template"
            accessibilityLabel={notice.accessibilityLabel}
            onPress={notice.onPress}
          >
            {notice.accessibilityLabel}
          </Stack.Toolbar.Button>
        ) : null}
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? (mode === 'dark' ? 'moon.fill' : 'sun.max.fill') : ANDROID_ICONS[mode]}
          iconRenderingMode="template"
          accessibilityLabel={nextModeLabel}
          onPress={toggleTheme}
        >
          테마
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
}
