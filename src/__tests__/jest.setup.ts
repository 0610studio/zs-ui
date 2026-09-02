// JSX transform 을 위해 React 를 전역으로 둔다
const React = require('react');
globalThis.React = React;




jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, left: 0, right: 0, bottom: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    initialWindowMetrics: { frame: { x: 0, y: 0, width: 0, height: 0 }, insets: inset },
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = (props) => React.createElement('View', props, props.children);
  return new Proxy({}, {
    get: () => View,
  });
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      ...RN.AccessibilityInfo,
      announceForAccessibility: jest.fn(),
    },
    ActivityIndicator: (props) => {
      const React = require('react');
      return React.createElement('View', { testID: 'activity-indicator', ...props });
    },
  };
});
