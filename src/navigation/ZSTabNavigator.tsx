import React, { type ComponentType } from 'react';
import { Platform, StyleSheet, type ViewProps } from 'react-native';
import { requireNativeView } from 'expo';
import { NativeTabs } from 'expo-router/native-tabs';
import { useTheme } from '../context/ThemeContext';
import { resolveColor } from '../theme/color';
import type { ZSTabNavigatorProps } from './ZSTabNavigator.types';
import { badgeText, collectScreens, ZSTabNavigatorScreen } from './ZSTabNavigatorScreen';
import { resolveTabTheme } from './tabTheme';

type TriggerIconProps = React.ComponentProps<typeof NativeTabs.Trigger.Icon>;

let NativeSidebarObserver: ComponentType<ViewProps> | undefined;

// 강조 탭(prominentTabIdentifier)은 iOS 27부터 있습니다. 그 아래에서 넘기면 react-native-screens가 개발 경고를 띄웁니다.
const PROMINENT_TAB_MIN_IOS = 27;

function supportsProminentTab(): boolean {
  return Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= PROMINENT_TAB_MIN_IOS;
}

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
  const prominent = supportsProminentTab() ? ios?.prominent : undefined;

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
              prominent={prominent === name}
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
