import { useEffect, useState } from "react";
import { Keyboard, Platform, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Z_INDEX_VALUE } from "../../model/utils";

interface Props {
  render: () => React.ReactNode;
  offset?: number;
}

function ZSBottomCta({
  render,
  offset = 0,
}: Props) {
  const [bottomValue, setBottomValue] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowSubscription = Keyboard.addListener(showEvent, (event) => {
      setBottomValue(event.endCoordinates.height)
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

export default ZSBottomCta;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX_VALUE.BOTTOM_CTA,
    width: '100%',
  },
});