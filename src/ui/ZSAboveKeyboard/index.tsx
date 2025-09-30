import { useRef } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useKeyboard from "../../model/useKeyboard";
import { Z_INDEX_VALUE } from "../../model/utils";

// Edge-to-edge 디스플레이 정책
// Android 11 (API 30) 이전: adjustResize가 시스템 레벨에서 자동으로 패딩을 추가
// Android 11 (API 30) 이후: 일부 기기에서 패딩이 적용되지 않음
const isLegacyAndroidKeyboardBehavior = (Platform.OS === 'android' && Platform.Version < 30);

const HIDDEN_BOTTOM_OFFSET = -300;

interface Props {
  children: React.ReactNode;
  keyboardShowOffset?: number;
  keyboardHideOffset?: number;
  handleLayoutHeight?: (height: number) => void;
  showOnlyKeyboardVisible?: boolean;
}

function ZSAboveKeyboard({
  keyboardShowOffset = 0,
  keyboardHideOffset = 0,
  children,
  handleLayoutHeight,
  showOnlyKeyboardVisible = false,
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
    <View style={[styles.container, { bottom: !isVisible ? HIDDEN_BOTTOM_OFFSET : keyboardVisiblePadding }]} onLayout={handleLayout}>
      <View style={{ width: "100%" }} onLayout={handleLayout}>
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
