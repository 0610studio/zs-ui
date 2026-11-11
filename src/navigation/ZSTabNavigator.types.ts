import type React from 'react';
import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { NativeTabs } from 'expo-router/native-tabs';
import type { ColorName } from '../theme/color';

type MinimizeBehavior = React.ComponentProps<typeof NativeTabs>['minimizeBehavior'];

export interface ZSTabIcon {
  sf?: string;
  md?: string;
  drawable?: string;
  src?: ImageSourcePropType;
}

export interface ZSTabScreenOptions {
  title: string;
  icon?: ZSTabIcon;
  badge?: boolean | number | string;
  hidden?: boolean;
  role?: 'search';
  accessibilityLabel?: string;
  disabled?: boolean;
}

export interface ZSTabNavigatorScreenProps {
  name: string;
  options: ZSTabScreenOptions;
  listeners?: { tabPress?: () => void };
}

export type ZSTabNavigatorSidebar = 'automatic' | 'sidebar' | 'tabBar';

export interface ZSTabNavigatorIOSOptions {
  minimizeBehavior?: MinimizeBehavior;
  disableTransparentOnScrollEdge?: boolean;
  sidebar?: ZSTabNavigatorSidebar;
  prominent?: string;
  bottomAccessory?: ReactNode;
}

export type ZSTabNavigationMode = 'bar' | 'rail';

export type ZSTabBarStyle = 'floating' | 'standard';

export interface ZSTabNavigatorAndroidOptions {
  navigationMode?: 'auto' | ZSTabNavigationMode;
  barStyle?: ZSTabBarStyle;
  hideOnKeyboard?: boolean;
}

export interface ZSTabNavigatorProps {
  children: ReactNode;
  unselectedIconColor?: ColorName | (string & {});
  unselectedLabelColor?: ColorName | (string & {});
  ios?: ZSTabNavigatorIOSOptions;
  android?: ZSTabNavigatorAndroidOptions;
}
