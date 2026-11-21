import type { ReactNode } from 'react';

const React = require('react');
globalThis.React = React;

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, left: 0, right: 0, bottom: 0 };
  return {
    SafeAreaProvider: ({ children }: { children?: ReactNode }) => children,
    SafeAreaView: ({ children }: { children?: ReactNode }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 400, height: 800 }),
    initialWindowMetrics: { frame: { x: 0, y: 0, width: 0, height: 0 }, insets: inset },
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = (props: { children?: ReactNode }) => React.createElement('View', props, props.children);
  return new Proxy({}, {
    get: () => View,
  });
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    ActivityIndicator: (props: Record<string, unknown>) => {
      const React = require('react');
      return React.createElement('View', { testID: 'activity-indicator', ...props });
    },
  };
});
