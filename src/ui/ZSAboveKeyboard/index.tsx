import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { getActualTopInset } from '../../model/utils';

interface Props {
  render: () => React.ReactNode;
  offset?: number;
}

function ZSAboveKeyboard({
  render,
  offset = 0,
}: Props) {
  const [topValue, setTopValue] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [componentHeight, setComponentHeight] = useState(0);
  const screenHeight = Dimensions.get('window').height;
  const actualTop = getActualTopInset();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowSubscription = Keyboard.addListener(showEvent, (event) => {
      // 키보드 바로 위에 위치하도록 계산: 화면 높이 - 키보드 높이 - 컴포넌트 높이 - offset
      const topValue = screenHeight - event.endCoordinates.height - componentHeight - offset + actualTop;
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
  }, [screenHeight, offset, componentHeight, actualTop]);

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setComponentHeight(height + (Platform.OS === 'ios' ? 100 : 80));
  };

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[styles.container, isKeyboardVisible ? { top: topValue } : { bottom: 0 }]}
      onLayout={handleLayout}
    >
      {render()}
    </Animated.View>
  );
}

export default ZSAboveKeyboard;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8400,
    width: '100%',
  },
});
