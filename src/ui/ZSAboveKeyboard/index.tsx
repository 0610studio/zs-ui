import { useRef } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useKeyboard from "../../model/useKeyboard";
import { Z_INDEX_VALUE } from "../../model/utils";

// Android 11(API 30) 이전엔 adjustResize 가 시스템에서 패딩을 넣어주지만,
// 이후로는 일부 기기에서 적용되지 않는다.
const isLegacyAndroidKeyboardBehavior = (Platform.OS === 'android' && Platform.Version < 30);

const HIDDEN_BOTTOM_OFFSET = -300;

interface Props extends ViewProps {
  children: React.ReactNode;
  keyboardShowOffset?: number;
  keyboardHideOffset?: number;
  handleLayoutHeight?: (height: number) => void;
  showOnlyKeyboardVisible?: boolean;
  backgroundColor?: string;
}

function ZSAboveKeyboard({
  keyboardShowOffset = 0,
  keyboardHideOffset = 0,
  children,
  handleLayoutHeight,
  showOnlyKeyboardVisible = false,
  backgroundColor,
  ...props
}: Props) {
  const { bottom } = useSafeAreaInsets();
  const componentHeightRef = useRef(0);
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const keyboardVisiblePadding =
    !isKeyboardVisible ? (0 + keyboardHideOffset)
      : isLegacyAndroidKeyboardBehavior ? 0
        : (keyboardHeight - (Platform.OS === 'ios' ? bottom : 0) + keyboardShowOffset);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    componentHeightRef.current = height;
    handleLayoutHeight?.(height);
  };

  const isVisible = showOnlyKeyboardVisible ? isKeyboardVisible : true;

  return (
    <View style={[styles.container, { bottom: !isVisible ? HIDDEN_BOTTOM_OFFSET : 0 }]} onLayout={handleLayout} {...props}>
      <View style={{ width: "100%", backgroundColor, paddingBottom: keyboardVisiblePadding }}>
        {children}
      </View>
    </View >
  );
}

export default ZSAboveKeyboard;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX_VALUE.ABOVE_KEYBOARD,
    width: '100%',
  },
});
