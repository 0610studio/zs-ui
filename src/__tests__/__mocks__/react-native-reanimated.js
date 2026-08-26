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
// 실제 reanimated처럼 렌더 간 안정된 참조를 반환한다 (effect deps로 쓰이는 경우 재실행 방지).
const useSharedValue = (v) => React.useRef({ value: v }).current;
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
// 완료 콜백은 실제 동작처럼 duration 이후 비동기로 호출한다 (fake timer로 제어 가능).
const withTiming = (v, cfg, callback) => {
  if (typeof callback === 'function') {
    setTimeout(() => callback(true), (cfg && cfg.duration) || 0);
  }
  return v;
};
const withSpring = (v, cfg, callback) => {
  if (typeof callback === 'function') {
    setTimeout(() => callback(true), 0);
  }
  return v;
};
const runOnJS = (fn) => fn;
const useReducedMotion = () => false;
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
  runOnJS,
  useReducedMotion,
  withDelay,
  withRepeat,
  cancelAnimation,
  interpolate,
  interpolateColor,
};
