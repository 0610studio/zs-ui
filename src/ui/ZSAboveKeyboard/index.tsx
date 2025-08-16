import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Dimensions, View, LayoutChangeEvent } from 'react-native';
import { Z_INDEX_VALUE } from '../../model/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSPortal } from '../../overlay';

const screenHeight = Dimensions.get('window').height;
const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

interface Props {
  children: React.ReactNode;
  keyboardShowOffset?: number;
  keyboardHideOffset?: number;
  handleLayoutHeight?: (height: number) => void;
}

function ZSAboveKeyboard({
  keyboardShowOffset = 0,
  keyboardHideOffset = 0,
  children,
  handleLayoutHeight,
}: Props) {
  const [topValue, setTopValue] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [componentHeight, setComponentHeight] = useState(0);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    const keyboardShowSubscription = Keyboard.addListener(showEvent, (event) => {
      // 키보드 바로 위에 위치하도록 계산
      const topValue = screenHeight - event.endCoordinates.height - componentHeight - keyboardShowOffset - (Platform.OS === 'android' ? 13 : 0);
      setTopValue(topValue);
      setIsKeyboardVisible(true);
    });

    const keyboardHideSubscription = Keyboard.addListener(hideEvent, () => {
      setTopValue(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, [componentHeight]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setComponentHeight(height);
    handleLayoutHeight?.(height);
  };

  return (
    <ZSPortal>
      <View style={[styles.container, isKeyboardVisible ? { top: topValue } : { bottom: keyboardHideOffset + bottom }]}>
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
