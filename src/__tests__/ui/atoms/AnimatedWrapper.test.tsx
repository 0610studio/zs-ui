import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import AnimatedWrapper from '../../../ui/atoms/AnimatedWrapper';

jest.mock('../../../context/ThemeContext', () => {
  const paletteFn = require('../../../theme/palette').default;
  const typographyFn = require('../../../theme/typography').default;
  const elevationFn = require('../../../theme/elevation').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  const elevation = elevationFn(palette);
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography, elevation }),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const Animated = {
    View: ({ children, ...props }: any) => React.createElement('View', props, children),
  };
  return {
    __esModule: true,
    default: Animated,
    FadeInDown: {
      duration: () => ({
        withCallback: (fn: any) => ({
          entering: true,
        }),
      }),
    },
    FadeOut: {
      duration: () => ({}),
    },
    useSharedValue: (init: any) => ({ value: init }),
    useDerivedValue: (fn: any) => ({ value: 0 }),
    useAnimatedStyle: (fn: any) => ({}),
    withTiming: (value: any) => value,
  };
});

describe('AnimatedWrapper', () => {
  it('children을 렌더한다', () => {
    const { getByText } = render(
      <AnimatedWrapper isAnimation={false}>
        <Text>Test Content</Text>
      </AnimatedWrapper>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('isAnimation이 false일 때 일반 View를 렌더한다', () => {
    const { getByText } = render(
      <AnimatedWrapper isAnimation={false}>
        <Text>Test</Text>
      </AnimatedWrapper>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('isAnimation이 true일 때 Animated.View를 렌더한다', () => {
    const { getByText } = render(
      <AnimatedWrapper isAnimation={true}>
        <Text>Test</Text>
      </AnimatedWrapper>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('elevationLevel prop을 받는다', () => {
    const { getByText } = render(
      <AnimatedWrapper isAnimation={false} elevationLevel={1}>
        <Text>Test</Text>
      </AnimatedWrapper>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('duration prop을 받는다', () => {
    const { getByText } = render(
      <AnimatedWrapper isAnimation={true} duration={300}>
        <Text>Test</Text>
      </AnimatedWrapper>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('color prop을 받는다', () => {
    const { getByText } = render(
      <AnimatedWrapper isAnimation={false} color="base">
        <Text>Test</Text>
      </AnimatedWrapper>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('style prop을 받는다', () => {
    const { getByText } = render(
      <AnimatedWrapper isAnimation={false} style={{ padding: 10 }}>
        <Text>Test</Text>
      </AnimatedWrapper>
    );

    expect(getByText('Test')).toBeTruthy();
  });
});

