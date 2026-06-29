import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

interface UseKeyboardReturn {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

interface UseKeyboardProps {
  handleKeyboardShow?: (event: KeyboardEvent) => void;
  handleKeyboardHide?: () => void;
}

const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

const useKeyboard = ({
  handleKeyboardShow,
  handleKeyboardHide,
}: UseKeyboardProps = {}): UseKeyboardReturn => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const handleKeyboardShowRef = useRef(handleKeyboardShow);
  const handleKeyboardHideRef = useRef(handleKeyboardHide);
  handleKeyboardShowRef.current = handleKeyboardShow;
  handleKeyboardHideRef.current = handleKeyboardHide;

  useEffect(() => {
    const showListener = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
      handleKeyboardShowRef.current?.(event);
    };

    const hideListener = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
      handleKeyboardHideRef.current?.();
    };

    const keyboardShowSubscription = Keyboard.addListener(showEvent, showListener);
    const keyboardHideSubscription = Keyboard.addListener(hideEvent, hideListener);

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight,
  };
};

export default useKeyboard;