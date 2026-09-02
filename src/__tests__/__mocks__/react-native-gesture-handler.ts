import React from 'react';

const View: React.FC<any> = (props) => React.createElement('View', props, props.children);

export const PanGestureHandler = View;
export const TapGestureHandler = View;
export const LongPressGestureHandler = View;
export const GestureHandlerRootView = View as any;
export const GestureDetector: React.FC<any> = (props) =>
  React.createElement('View', { testID: 'gesture-detector' }, props.children);
export const State = {} as any;

/** 체이닝으로 등록된 콜백을 보관해, 테스트가 제스처 핸들러를 직접 부를 수 있게 한다 */
type GestureCallbacks = Record<string, ((...args: any[]) => void) | undefined>;

export interface MockGesture {
  __type: 'pan' | 'race';
  __callbacks: GestureCallbacks;
  __children?: MockGesture[];
  [key: string]: any;
}

function createPanGesture(): MockGesture {
  const callbacks: GestureCallbacks = {};
  const gesture: MockGesture = { __type: 'pan', __callbacks: callbacks };

  const chain = (name: string) => {
    gesture[name] = (...args: any[]) => {
      if (typeof args[0] === 'function') callbacks[name] = args[0];
      return gesture;
    };
  };

  ['onStart', 'onUpdate', 'onEnd', 'onFinalize', 'onBegin', 'onChange'].forEach(chain);
  ['enabled', 'activeOffsetX', 'activeOffsetY', 'failOffsetX', 'failOffsetY', 'simultaneousWithExternalGesture', 'blocksExternalGesture', 'runOnJS'].forEach(
    (name) => {
      gesture[name] = () => gesture;
    },
  );

  return gesture;
}

export const Gesture = {
  Pan: createPanGesture,
  Tap: createPanGesture,
  Race: (...children: MockGesture[]): MockGesture => ({
    __type: 'race',
    __callbacks: {},
    __children: children,
  }),
  Simultaneous: (...children: MockGesture[]): MockGesture => ({
    __type: 'race',
    __callbacks: {},
    __children: children,
  }),
};

export default {
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  State,
};
