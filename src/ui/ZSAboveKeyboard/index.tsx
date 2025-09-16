import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Dimensions, View, LayoutChangeEvent } from 'react-native';
import { Z_INDEX_VALUE } from '../../model/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSPortal } from '../../overlay';
import useKeyboard from '../../model/useKeyboard';

const screenHeight = Dimensions.get('window').height;
const HIDDEN_BOTTOM_OFFSET = -300;

interface Props {
  children: React.ReactNode;
  keyboardShowOffset?: number;
  keyboardHideOffset?: number;
  handleLayoutHeight?: (height: number) => void;
  isFocused?: boolean;
  showOnlyKeyboardVisible?: boolean;
}

function ZSAboveKeyboard({
  keyboardShowOffset = 0,
  keyboardHideOffset = 0,
  children,
  handleLayoutHeight,
  isFocused = true,
  showOnlyKeyboardVisible = false,
}: Props) {
  const [topValue, setTopValue] = useState(0);
  const componentHeightRef = useRef(0);
  const { bottom } = useSafeAreaInsets();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  useEffect(() => {
    // 키보드 바로 위에 위치하도록 계산
    if (keyboardHeight) {
      const topValue = screenHeight - keyboardHeight - componentHeightRef.current - keyboardShowOffset - (Platform.OS === 'android' ? 13 : 0);
      setTopValue(topValue);
    }
  }, [keyboardHeight, keyboardShowOffset]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    componentHeightRef.current = height;
    handleLayoutHeight?.(height);
  };

  const isVisible = showOnlyKeyboardVisible ? isKeyboardVisible : true;

  return (
    <ZSPortal isFocused={isFocused}>
      <View style={[styles.container, !isVisible ? { bottom: HIDDEN_BOTTOM_OFFSET } : isKeyboardVisible ? { top: topValue } : { bottom: keyboardHideOffset + bottom }]}>
        <View onLayout={handleLayout}>
          {children}
        </View>
      </View>
    </ZSPortal>
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
