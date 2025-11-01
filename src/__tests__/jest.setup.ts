// React를 전역으로 설정하여 JSX transform이 작동하도록 함
import React from 'react';
declare const global: any;
global.React = React;

// RNGH는 moduleNameMapper를 통해 수동 목으로 대체됨

// Reanimated는 moduleNameMapper로 mock 처리됨


// safe-area-context mock
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, left: 0, right: 0, bottom: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => inset,
    initialWindowMetrics: { frame: { x: 0, y: 0, width: 0, height: 0 }, insets: inset },
  };
});

// svg 단순 목
jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = (props: any) => React.createElement('View', props, props.children);
  return new Proxy({}, {
    get: () => View,
  });
});

// ActivityIndicator mock
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    ActivityIndicator: (props: any) => {
      const React = require('react');
      return React.createElement('View', { testID: 'activity-indicator', ...props });
    },
  };
});


