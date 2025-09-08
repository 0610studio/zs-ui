
import { StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Z_INDEX_VALUE } from "../../model/utils";
import useKeyboard from "../../model/useKeyboard";

interface Props {
  render: () => React.ReactNode;
  offset?: number;
}

function ZSBottomCta({
  render,
  offset = 0,
}: Props) {
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={[styles.container, { bottom: keyboardHeight + (isKeyboardVisible ? offset : 0) }]}>
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