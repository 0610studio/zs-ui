const React = require('react');

const Animated = {
  View: (props) => React.createElement('View', props, props.children),
};

const makeAnim = () => ({ duration: () => ({}) });
const useSharedValue = (v) => ({ value: v });
const useAnimatedStyle = (fn) => fn() || {};
const withTiming = (v, _cfg) => v;
const withSpring = (v, _cfg) => v;
const withDelay = (delay, anim) => anim;
const interpolate = (value, inputRange, outputRange, _extrapolate) => {
  return outputRange[0];
};

module.exports = {
  __esModule: true,
  default: Animated,
  FadeIn: makeAnim(),
  FadeOut: makeAnim(),
  FadeInDown: makeAnim(),
  FadeOutDown: makeAnim(),
  FadeInUp: makeAnim(),
  FadeOutUp: makeAnim(),
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
};


