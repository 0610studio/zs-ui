import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { BarAxis, DevicePostureName, WindowSizeClassName } from '../layout/types';
import type { ZSTabNavigatorAndroidOptions, ZSTabNavigationMode, ZSTabScreenOptions, ZSTabNavigatorScreenProps } from './ZSTabNavigator.types';

export function ZSTabNavigatorScreen(_props: ZSTabNavigatorScreenProps): null {
  return null;
}

function isScreen(child: ReactNode): child is ReactElement<ZSTabNavigatorScreenProps> {
  return isValidElement(child) && child.type === ZSTabNavigatorScreen;
}

export function collectScreens(children: ReactNode): ZSTabNavigatorScreenProps[] {
  return Children.toArray(children)
    .filter(isScreen)
    .map(({ props }) => props);
}

export function badgeText(badge: ZSTabScreenOptions['badge']): string | undefined {
  if (badge === undefined || badge === false) return undefined;
  return badge === true ? '' : String(badge);
}

export function resolveNavigationMode(
  navigationMode: ZSTabNavigatorAndroidOptions['navigationMode'],
  widthClass: WindowSizeClassName,
  heightClass: WindowSizeClassName = 'medium',
  posture: DevicePostureName = 'unknown',
  barAxis: BarAxis = 'vertical',
): ZSTabNavigationMode {
  if (navigationMode === 'bar' || navigationMode === 'rail') return navigationMode;
  if (barAxis === 'horizontal') return 'bar';
  if (widthClass === 'compact' || heightClass === 'compact' || posture === 'tabletop') return 'bar';
  return 'rail';
}
