import React from 'react';

const View: React.FC<any> = (props) => React.createElement('View', props, props.children);

export const PanGestureHandler = View;
export const TapGestureHandler = View;
export const LongPressGestureHandler = View;
export const GestureHandlerRootView = View as any;
export const State = {} as any;

export default {
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  GestureHandlerRootView,
  State,
};


