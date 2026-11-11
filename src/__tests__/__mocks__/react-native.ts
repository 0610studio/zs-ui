import React from 'react';

export const Platform: { OS: 'ios' | 'android'; Version?: number | string } = { OS: 'ios' };
const flatten = (style: any): any => {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flatten));
  }
  return style || {};
};

export const StyleSheet = {
  create: (styles: any) => styles,
  absoluteFillObject: {},
  absoluteFill: {},
  hairlineWidth: 0.5,
  flatten,
};

export const View = React.forwardRef((props: any, ref: any) =>
  React.createElement('View', { ...props, ref }, props.children)
);
export const Text = (props: any) => React.createElement('Text', props, props.children);
export const processColor = (color: unknown) => color;
export const Image = Object.assign((props: any) => React.createElement('Image', props), {
  resolveAssetSource: (source: number) => ({ uri: `asset://${source}` }),
});
export const StatusBar = Object.assign(() => null, { setBarStyle: (_style: 'default' | 'light-content' | 'dark-content') => {} });
export const Pressable = (props: any) => {
  const [pressed, setPressed] = React.useState(false);
  const children = typeof props.children === 'function' ? props.children({ pressed }) : props.children;
  const style = typeof props.style === 'function' ? props.style({ pressed }) : props.style;
  return React.createElement(
    'Pressable',
    {
      ...props,
      style,
      onPressIn: (event: unknown) => {
        setPressed(true);
        props.onPressIn?.(event);
      },
      onPressOut: (event: unknown) => {
        setPressed(false);
        props.onPressOut?.(event);
      },
    },
    children,
  );
};
export const TouchableOpacity = (props: any) => React.createElement('TouchableOpacity', props, props.children);
export const Modal = (props: any) => React.createElement('Modal', props, props.visible === false ? null : props.children);
export const Dimensions = {
  get: (_: string) => ({ width: 390, height: 844 }),
};
export const useWindowDimensions = () => Dimensions.get('window');
export const Appearance = {
  getColorScheme: (): 'light' | 'dark' | null => 'light',
  setColorScheme: (_scheme: 'light' | 'dark' | 'auto' | 'unspecified') => {},
  addChangeListener: () => ({ remove: () => {} }),
};
export const useColorScheme = () => Appearance.getColorScheme();
export const Keyboard = {
  dismiss: () => {},
  addListener: (_event: string, _cb: any) => ({ remove: () => {} }),
};
type BackCallback = () => boolean;
const backSubscriptions: BackCallback[] = [];
export const BackHandler = {
  addEventListener: (_event: string, cb: BackCallback) => {
    backSubscriptions.push(cb);
    return {
      remove: () => {
        const index = backSubscriptions.indexOf(cb);
        if (index >= 0) backSubscriptions.splice(index, 1);
      },
    };
  },
  mockPressBack: () => {
    for (let i = backSubscriptions.length - 1; i >= 0; i--) {
      if (backSubscriptions[i]?.()) return true;
    }
    return false;
  },
};
export const PanResponder = { create: (_: any) => ({ panHandlers: {} }) };
export const ScrollView = Object.assign(
  React.forwardRef((props: any, ref: any) =>
    React.createElement('ScrollView', { ...props, ref }, props.children)
  ),
  { Context: React.createContext<any>(null) },
);
export const VirtualizedList = Object.assign(() => null, { contextType: React.createContext<any>(null) });
export const RefreshControl = (props: Record<string, unknown>) => React.createElement('RefreshControl', props);
export const I18nManager = { isRTL: false };
export const PixelRatio = { get: () => 3, getFontScale: () => 1, roundToNearestPixel: (value: number) => Math.round(value * 3) / 3 };
export const Alert = { alert: jest.fn() };
type AppStateListener = (state: string) => void;
const appStateListeners = new Set<AppStateListener>();
export const AppState = {
  currentState: 'active',
  addEventListener: (_event: string, listener: AppStateListener) => {
    appStateListeners.add(listener);
    return { remove: () => appStateListeners.delete(listener) };
  },
  mockChange: (state: string) => appStateListeners.forEach((listener) => listener(state)),
};
type A11yListener = (enabled: boolean) => void;
const a11yListeners = new Map<string, Set<A11yListener>>();
export const AccessibilityInfo = {
  isDarkerSystemColorsEnabled: jest.fn(() => Promise.resolve(false)),
  isHighTextContrastEnabled: jest.fn(() => Promise.resolve(false)),
  announceForAccessibility: jest.fn(),
  announceForAccessibilityWithOptions: jest.fn(),
  addEventListener: (event: string, listener: A11yListener) => {
    if (!a11yListeners.has(event)) a11yListeners.set(event, new Set());
    a11yListeners.get(event)!.add(listener);
    return { remove: () => a11yListeners.get(event)?.delete(listener) };
  },
  mockEmit: (event: string, enabled: boolean) => a11yListeners.get(event)?.forEach((listener) => listener(enabled)),
};
export const TextInput = Object.assign(
  React.forwardRef((props: any, ref: any) =>
    React.createElement('TextInput', { ...props, ref }, props.children)
  ),
  { State: { currentlyFocusedInput: (): any => null } },
);

export default { Platform, StyleSheet, View, Text, processColor, Image, StatusBar, Pressable, TouchableOpacity, Modal, Dimensions, useWindowDimensions, Appearance, useColorScheme, Keyboard, BackHandler, PanResponder, ScrollView, VirtualizedList, RefreshControl, TextInput, I18nManager, PixelRatio, Alert, AppState, AccessibilityInfo };

