import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, Platform, StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { withPromise } from "../../model/utils";

const DEFAULT_MARGIN_X = 20;
const DEFAULT_MARGIN_TOP = 0;
const DEFAULT_MARGIN_BOTTOM = 20;
const DEFAULT_BORDER_RADIUS = 14;
const DURATION = { duration: 250 };

interface Props {
  loadingComponent?: React.ReactNode;
  height?: number;
  disabled?: boolean;
  primaryOnPress: () => Promise<any>;
  primaryLabelComponent: React.ReactNode;
  primaryButtonStyle?: TouchableOpacityProps['style'];
  secondaryOnPress?: () => void;
  secondaryLabelComponent?: React.ReactNode;
  secondaryButtonStyle?: TouchableOpacityProps['style'];
}

function ZSBottomButton({
  loadingComponent = <ActivityIndicator />,
  height = 55,
  disabled = false,
  primaryLabelComponent,
  primaryOnPress,
  primaryButtonStyle = {},
  secondaryOnPress,
  secondaryLabelComponent,
  secondaryButtonStyle = {}
}: Props) {
  const isKeyboardVisible = useSharedValue(0);
  const keyboardHeight = useSharedValue(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePress = async () => {
    setIsLoading(true);
    try {
      await withPromise(primaryOnPress);
    } finally {
      setIsLoading(false);
    }
  };

  // ** 소프트 키보드 핸들링
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(showEvent, (event) => {
      requestAnimationFrame(() => {
        keyboardHeight.value = event.endCoordinates.height; // 키보드 높이 설정
        isKeyboardVisible.value = 1; // 키보드가 보임
      });
    });

    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
      requestAnimationFrame(() => {
        isKeyboardVisible.value = 0; // 키보드가 숨김
      });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [isKeyboardVisible, keyboardHeight]);

  // ** 애니메이션 스타일을 useAnimatedStyle로 최적화
  const animatedStyle = useAnimatedStyle(() => {
    const getBottom = interpolate(
      isKeyboardVisible.value,
      [0, 1],
      [DEFAULT_MARGIN_BOTTOM, 0],
      'clamp',
    );

    const getMargin = interpolate(
      isKeyboardVisible.value,
      [0, 1],
      [DEFAULT_MARGIN_X, 0],
      'clamp',
    );

    const getRadius = interpolate(
      isKeyboardVisible.value,
      [0, 1],
      [DEFAULT_BORDER_RADIUS, 0],
      'clamp',
    );

    return {
      marginBottom: withTiming(getBottom, DURATION),
      marginLeft: withTiming(getMargin, DURATION),
      marginRight: withTiming(getMargin, DURATION),
      borderRadius: withTiming(getRadius, DURATION),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {secondaryLabelComponent && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[secondaryButtonStyle, { height }, styles.touchSecondaryContainer]}
          onPress={secondaryOnPress}
        >
          {secondaryLabelComponent}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        style={[primaryButtonStyle, { height }, styles.touchContainer]}
        onPress={handlePress}
        disabled={disabled || isLoading}
      >
        {isLoading ? loadingComponent : primaryLabelComponent}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2,
  },
  touchSecondaryContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DEFAULT_BORDER_RADIUS,
    marginTop: DEFAULT_MARGIN_TOP,
    marginBottom: DEFAULT_MARGIN_BOTTOM,
    marginLeft: DEFAULT_MARGIN_X,
    marginRight: DEFAULT_MARGIN_X,
    overflow: 'hidden',
    flexDirection: 'row',
  },
});

export default ZSBottomButton;
