import React from 'react';

export const Platform = { OS: 'ios' } as const;
export const StyleSheet = {
  create: (styles: any) => styles,
  absoluteFillObject: {},
  flatten: (style: any) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style);
    }
    return style || {};
  }
};

export const View = React.forwardRef((props: any, ref: any) => 
  React.createElement('View', { ...props, ref }, props.children)
);
export const Text = (props: any) => React.createElement('Text', props, props.children);
export const StatusBar = () => null;
export const Pressable = (props: any) => React.createElement('Pressable', props, props.children);
export const TouchableOpacity = (props: any) => React.createElement('TouchableOpacity', props, props.children);
export const Dimensions = {
  get: (_: string) => ({ width: 390, height: 844 }),
};
export const useWindowDimensions = () => Dimensions.get('window');
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
  // 테스트 헬퍼: 실제 안드로이드처럼 최신 등록(LIFO)부터 호출하고 true면 소비.
  mockPressBack: () => {
    for (let i = backSubscriptions.length - 1; i >= 0; i--) {
      if (backSubscriptions[i]()) return true;
    }
    return false;
  },
};
export const PanResponder = { create: (_: any) => ({ panHandlers: {} }) };
export const ScrollView = React.forwardRef((props: any, ref: any) => 
  React.createElement('ScrollView', { ...props, ref }, props.children)
);
export const TextInput = React.forwardRef((props: any, ref: any) => 
  React.createElement('TextInput', { ...props, ref }, props.children)
);

export default { Platform, StyleSheet, View, Text, StatusBar, Pressable, TouchableOpacity, Dimensions, useWindowDimensions, Keyboard, BackHandler, PanResponder, ScrollView, TextInput };

