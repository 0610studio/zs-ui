import { useEffect, useState } from "react";
import { Keyboard, Platform, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { ShowAboveKeyboardProps } from "../../model/types";
import { useAboveKeyboard } from "../../model/useOverlay";
import { Z_INDEX_VALUE } from "../../model/utils";

function AboveKeyboard({
  render,
}: ShowAboveKeyboardProps) {
  const [bottomValue, setBottomValue] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { aboveKeyboardVisible, marginBottom } = useAboveKeyboard();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowSubscription = Keyboard.addListener(showEvent, (event) => {
      setBottomValue(Platform.OS === 'ios' ? event.endCoordinates.height : 0)
      setIsKeyboardVisible(true);
    });

    const keyboardHideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, []);

  return (
    aboveKeyboardVisible && isKeyboardVisible ?
      <Animated.View entering={FadeInDown.duration(600)} exiting={FadeOutDown} style={[styles.container, { bottom: bottomValue + marginBottom }]}>
        {render()}
      </Animated.View>
      : null
  );
}

export default AboveKeyboard;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX_VALUE.ABOVE_KEYBOARD,
    width: '100%',
  },
});