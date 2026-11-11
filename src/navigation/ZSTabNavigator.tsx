import React, { type ComponentType } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import { requireNativeView } from 'expo';
import { NativeTabs } from 'expo-router/native-tabs';
import { useTheme } from '../context/ThemeContext';
import { resolveColor } from '../theme/color';
import type { ZSTabNavigatorProps } from './ZSTabNavigator.types';
import { badgeText, collectScreens, ZSTabNavigatorScreen } from './ZSTabNavigatorScreen';
import { resolveTabTheme } from './tabTheme';

type TriggerIconProps = React.ComponentProps<typeof NativeTabs.Trigger.Icon>;

let NativeSidebarObserver: ComponentType<ViewProps> | undefined;

function SidebarObserver() {
  NativeSidebarObserver ??= requireNativeView<ViewProps>('ZsUi', 'ZSTabSidebarObserverView');
  return <NativeSidebarObserver pointerEvents="none" style={styles.observer} />;
}

function ZSTabNavigator({ children, ios, unselectedIconColor, unselectedLabelColor }: ZSTabNavigatorProps) {
  const { colors: roles, fonts } = useTheme();
  const { colors, fontFamily } = resolveTabTheme(roles, fonts, {
    icon: resolveColor(roles, unselectedIconColor),
    label: resolveColor(roles, unselectedLabelColor),
  });
  const screens = collectScreens(children);

  return (
    <>
      <NativeTabs
        tintColor={colors.selected}
        iconColor={{ default: colors.unselectedIcon, selected: colors.selected }}
        labelStyle={{
          default: { fontFamily, color: colors.unselectedLabel },
          selected: { fontFamily, color: colors.selected },
        }}
        badgeBackgroundColor={colors.badgeBackground}
        badgeTextColor={colors.badgeText}
        backgroundColor={colors.background}
        indicatorColor={colors.indicator}
        minimizeBehavior={ios?.minimizeBehavior}
        disableTransparentOnScrollEdge={ios?.disableTransparentOnScrollEdge}
        preferredPlacement={ios?.sidebar}
      >
        {screens.map(({ name, options, listeners }) => {
          const badge = badgeText(options.badge);
          return (
            <NativeTabs.Trigger
              key={name}
              name={name}
              hidden={options.hidden}
              role={options.role}
              prominent={ios?.prominent === name}
              disabled={options.disabled}
              accessibilityLabel={options.accessibilityLabel}
              listeners={listeners}
            >
              {options.icon ? (
                <NativeTabs.Trigger.Icon {...(options.icon.src ? { renderingMode: 'template' as const } : null)} {...(options.icon as TriggerIconProps)} />
              ) : null}
              <NativeTabs.Trigger.Label>{options.title}</NativeTabs.Trigger.Label>
              {badge !== undefined ? <NativeTabs.Trigger.Badge>{badge}</NativeTabs.Trigger.Badge> : null}
            </NativeTabs.Trigger>
          );
        })}
        {ios?.bottomAccessory ? <NativeTabs.BottomAccessory>{ios.bottomAccessory}</NativeTabs.BottomAccessory> : null}
      </NativeTabs>
      {ios?.sidebar ? <SidebarObserver /> : null}
    </>
  );
}

ZSTabNavigator.Screen = ZSTabNavigatorScreen;

export default ZSTabNavigator;

const styles = StyleSheet.create({
  observer: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
