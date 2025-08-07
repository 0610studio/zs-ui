import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  render: () => React.ReactNode;
  offset?: number;
}

function AboveKeyboard({
  render,
  offset = 0,
}: Props) {
  const [bottomValue, setBottomValue] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowSubscription = Keyboard.addListener(showEvent, (event) => {
      setBottomValue(Platform.OS === 'ios' ? event.endCoordinates.height - bottom : 0);
      setIsKeyboardVisible(true);
    });

    const keyboardHideSubscription = Keyboard.addListener(hideEvent, () => {
      setBottomValue(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, []);

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={[styles.container, { bottom: bottomValue + (isKeyboardVisible ? offset : 0) }]}>
      {render()}
    </Animated.View>
  );
}

export default AboveKeyboard;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8400,
    width: '100%',
  },
});
