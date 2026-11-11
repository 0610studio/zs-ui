import React from 'react';

const View: React.FC<any> = (props) => React.createElement('View', props, props.children);

export const GestureHandlerRootView = View as any;
export const GestureDetector: React.FC<any> = (props) =>
  React.createElement('View', { testID: 'gesture-detector' }, props.children);
export const State = {} as any;

export interface MockGesture {
  __type: 'pan' | 'tap' | 'competing' | 'simultaneous' | 'exclusive';
  __config: Record<string, any>;
  __children?: MockGesture[];
}

const single = (type: MockGesture['__type']) => (config: Record<string, any> = {}): MockGesture => ({
  __type: type,
  __config: config,
});

const composed = (type: MockGesture['__type']) => (...children: MockGesture[]): MockGesture => ({
  __type: type,
  __config: {},
  __children: children,
});

export const usePanGesture = single('pan');
export const useTapGesture = single('tap');
export const useCompetingGestures = composed('competing');
export const useSimultaneousGestures = composed('simultaneous');
export const useExclusiveGestures = composed('exclusive');

export default {
  GestureHandlerRootView,
  GestureDetector,
  State,
  usePanGesture,
  useTapGesture,
  useCompetingGestures,
  useSimultaneousGestures,
  useExclusiveGestures,
};
