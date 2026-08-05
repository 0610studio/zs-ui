const React = require('react');
const { Text, View } = require('react-native');

const createAnimatedComponent = (Component) =>
  React.forwardRef(({ animatedProps, ...props }, ref) =>
    React.createElement(Component, { ...props, ...(animatedProps || {}), ref }, props.children)
  );

const Animated = {
  View: React.forwardRef((props, ref) => React.createElement(View, { ...props, ref }, props.children)),
  Text: React.forwardRef((props, ref) => React.createElement(Text, { ...props, ref }, props.children)),
  createAnimatedComponent,
};

const makeAnim = () => {
  const animation = {
    duration: () => animation,
    delay: () => animation,
    easing: () => animation,
    springify: () => animation,
    withCallback: (callback) => {
      if (typeof callback === 'function') callback(true);
      return animation;
    },
  };

  return animation;
};
const useSharedValue = (v) => ({ value: v });
const useAnimatedStyle = (fn) => fn() || {};
const useAnimatedProps = (fn) => fn() || {};
const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  inOut: (fn) => fn,
  out: (fn) => fn,
  in: (fn) => fn,
};
const useDerivedValue = (fn) => ({ value: fn() });
const withTiming = (v, _cfg) => v;
const withSpring = (v, _cfg) => v;
const withDelay = (delay, anim) => anim;
const withRepeat = (anim) => anim;
const cancelAnimation = () => {};
const interpolate = (value, inputRange, outputRange, _extrapolate) => {
  return outputRange[0];
};
const interpolateColor = (value, inputRange, outputRange) => {
  return outputRange[0];
};

module.exports = {
  __esModule: true,
  default: Animated,
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  FadeIn: makeAnim(),
  FadeOut: makeAnim(),
  FadeInDown: makeAnim(),
  FadeOutDown: makeAnim(),
  FadeInUp: makeAnim(),
  FadeOutUp: makeAnim(),
  LinearTransition: makeAnim(),
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  Easing,
  createAnimatedComponent,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  cancelAnimation,
  interpolate,
  interpolateColor,
};
