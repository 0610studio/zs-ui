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
export const Keyboard = {
  dismiss: () => {},
  addListener: (_event: string, _cb: any) => ({ remove: () => {} }),
};
export const PanResponder = { create: (_: any) => ({ panHandlers: {} }) };
export const ScrollView = React.forwardRef((props: any, ref: any) => 
  React.createElement('ScrollView', { ...props, ref }, props.children)
);
export const TextInput = React.forwardRef((props: any, ref: any) => 
  React.createElement('TextInput', { ...props, ref }, props.children)
);

export default { Platform, StyleSheet, View, Text, StatusBar, Pressable, TouchableOpacity, Dimensions, Keyboard, PanResponder, ScrollView, TextInput };


