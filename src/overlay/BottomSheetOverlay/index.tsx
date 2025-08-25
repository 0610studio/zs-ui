import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View, PanResponder, Keyboard, Platform } from 'react-native';
import { useBottomSheet } from '../../model/useOverlay';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import ModalBackground from '../ui/ModalBackground';
import { useTheme } from '../../model';
import { useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context';
import { ShowBottomSheetProps } from '../../model/types';
import { MAX_OVERLAY_WIDTH, Z_INDEX_VALUE } from '../../model/utils';

const IS_IOS = Platform.OS === 'ios';

const keyboardEvents = ({
  showEvent: IS_IOS ? 'keyboardWillShow' as const : 'keyboardDidShow' as const,
  hideEvent: IS_IOS ? 'keyboardWillHide' as const : 'keyboardDidHide' as const,
});

const ANIMATION_CONFIG = {
  keyboard: {
    show: { duration: IS_IOS ? 250 : 300 },
    hide: { duration: IS_IOS ? 150 : 200 },
  },
  spring: {
    damping: 50,
    stiffness: 300,
    mass: 0.7,
    velocity: 100,
    restDisplacementThreshold: 0.2,
  },
  close: { duration: 150 },
  scale: { duration: 200 },
  scaleRestore: {
    damping: 15,
    stiffness: 300,
  },
} as const;

const GESTURE_CONSTANTS = {
  scaleAmount: 0.985,
  horizontalDamping: 18,
  verticalUpDamping: 18,
  verticalDownDamping: 1.5,
  closeVelocityThreshold: 0.5,
  closeDistanceRatio: 1 / 3,
  hideDelay: 200,
} as const;

function BottomSheetOverlay({
  headerComponent,
  component,
  options = {},
}: ShowBottomSheetProps) {
  const {
    isBackgroundTouchClose = true,
    marginHorizontal = 10,
    marginBottom = 10,
    padding = 14,
  } = options;
  const { palette, dimensions: { width: windowWidth, height: windowHeight } } = useTheme();
  const { bottomSheetVisible, setBottomSheetVisible, height } = useBottomSheet();
  const { bottom } = useSafeAreaInsets();
  
  // 화면의 크기보다 높이가 높으면 화면의 크기로 제한 
  const maxHeight = useMemo(() => 
    Math.min(
      windowHeight - 30 - (initialWindowMetrics?.insets.bottom || 0) - (initialWindowMetrics?.insets.top || 0),
      height
    ),
    [windowHeight, height]
  );
  
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isGesturing = useSharedValue(false);
  
  const [localVisible, setLocalVisible] = useState(false);

  const handleKeyboardShow = useCallback((event: any) => {
    'worklet';
    if (!isGesturing.value) {
      const targetY = IS_IOS ? (-event.endCoordinates.height + bottom) : 0;
      translateY.value = withTiming(targetY, ANIMATION_CONFIG.keyboard.show);
    }
  }, [translateY, bottom, isGesturing]);

  const handleKeyboardHide = useCallback(() => {
    'worklet';
    if (!isGesturing.value) {
      translateY.value = withTiming(0, ANIMATION_CONFIG.keyboard.hide);
    }
  }, [translateY, isGesturing]);

  useEffect(() => {
    const keyboardShowSubscription = Keyboard.addListener(keyboardEvents.showEvent, handleKeyboardShow);
    const keyboardHideSubscription = Keyboard.addListener(keyboardEvents.hideEvent, handleKeyboardHide);

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, [keyboardEvents.showEvent, keyboardEvents.hideEvent, handleKeyboardShow, handleKeyboardHide]);

  // BottomSheet 표시/숨김 애니메이션 처리
  useEffect(() => {
    if (bottomSheetVisible) {
      Keyboard.dismiss();
      setLocalVisible(true);
      translateY.value = withSpring(0, ANIMATION_CONFIG.spring);
    } else {
      translateY.value = withTiming(maxHeight + 100, ANIMATION_CONFIG.close);
      setTimeout(() => {
        setLocalVisible(false);
      }, GESTURE_CONSTANTS.hideDelay);
    }
  }, [bottomSheetVisible, translateY, maxHeight]);

  const animatedStyles = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value }
      ],
    };
  }, [translateY, translateX, scale]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const closeBottomSheet = useCallback(() => {
    setBottomSheetVisible(false);
  }, [setBottomSheetVisible]);

  const handlePanResponderGrant = useCallback(() => {
    'worklet';
    runOnJS(dismissKeyboard)();
    isGesturing.value = true;
    startX.value = translateX.value;
    startY.value = translateY.value;
    scale.value = withTiming(GESTURE_CONSTANTS.scaleAmount, ANIMATION_CONFIG.scale);
  }, [translateX, translateY, scale, startX, startY, isGesturing, dismissKeyboard]);

  const handlePanResponderMove = useCallback((_, gestureState) => {
    'worklet';
    const newTranslateX = (startX.value + gestureState.dx) / GESTURE_CONSTANTS.horizontalDamping;
    translateX.value = newTranslateX;

    const newTranslateY = startY.value + gestureState.dy;
    if (newTranslateY < 0) {
      translateY.value = newTranslateY / GESTURE_CONSTANTS.verticalUpDamping;
    } else {
      translateY.value = newTranslateY / GESTURE_CONSTANTS.verticalDownDamping;
    }
  }, [translateX, translateY, startX, startY]);

  const handlePanResponderRelease = useCallback((_, gestureState) => {
    'worklet';
    isGesturing.value = false;
    translateX.value = withTiming(0, { duration: 100 });

    // 빠른 플리킹 제스처를 했을 때, 혹은 화면의 1/3 이상 내렸을 때, 닫기
    const shouldClose = gestureState.vy > GESTURE_CONSTANTS.closeVelocityThreshold || 
                      translateY.value > maxHeight * GESTURE_CONSTANTS.closeDistanceRatio;
    
    if (shouldClose) {
      translateY.value = withTiming(maxHeight + 100, ANIMATION_CONFIG.close);
      runOnJS(closeBottomSheet)();
    } else {
      translateY.value = withTiming(0, ANIMATION_CONFIG.close);
    }

    // 사이즈 원래대로 복귀
    scale.value = withSpring(1, ANIMATION_CONFIG.scaleRestore);
  }, [translateX, translateY, scale, maxHeight, isGesturing, closeBottomSheet]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handlePanResponderGrant,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    }),
    [handlePanResponderGrant, handlePanResponderMove, handlePanResponderRelease]
  );

  // 배경 터치 핸들러
  const handleBackgroundPress = useCallback(() => {
    if (isBackgroundTouchClose) setBottomSheetVisible(false);
  }, [isBackgroundTouchClose, setBottomSheetVisible]);

  const containerStyle = [
    styles.container,
    {
      width: windowWidth - marginHorizontal * 2,
      height: maxHeight,
      marginHorizontal,
      bottom: marginBottom + bottom,
      backgroundColor: palette.background.base,
    },
    animatedStyles,
  ];

  const pressableViewStyle = [
    styles.pressableView,
    { paddingHorizontal: padding, paddingBottom: padding },
  ];

  const gestureBarContainerStyle = [
    styles.gestureBarContainer,
    { paddingBottom: padding }
  ];

  const gestureBarStyle = [
    styles.gestureBar,
    { backgroundColor: palette.divider }
  ];

  if (!localVisible) {
    return null;
  }

  return (
    <ModalBackground
      zIndex={Z_INDEX_VALUE.BOTTOM_SHEET1}
      key={localVisible ? 'visiblebs' : 'hiddenbs'}
      modalBgColor={palette.modalBgColor}
      onPress={handleBackgroundPress}
    >
      <Animated.View style={containerStyle}>
        <View style={pressableViewStyle}>
          <View {...panResponder.panHandlers}>
            <View style={gestureBarContainerStyle}>
              <View style={gestureBarStyle} />
            </View>
            {headerComponent}
          </View>

          {component}
        </View>
      </Animated.View>
    </ModalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 26,
    overflow: 'hidden',
    zIndex: Z_INDEX_VALUE.BOTTOM_SHEET2,
    maxWidth: MAX_OVERLAY_WIDTH,
  },
  pressableView: {
    width: '100%',
    height: '100%',
  },
  gestureBarContainer: {
    width: '100%',
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureBar: {
    width: 45,
    height: 3,
    borderRadius: 2,
  },
});

const arePropsEqual = (
  prevProps: ShowBottomSheetProps, 
  nextProps: ShowBottomSheetProps
): boolean => {
  return (
    prevProps.headerComponent === nextProps.headerComponent &&
    prevProps.component === nextProps.component &&
    prevProps.options?.isBackgroundTouchClose === nextProps.options?.isBackgroundTouchClose &&
    prevProps.options?.marginHorizontal === nextProps.options?.marginHorizontal &&
    prevProps.options?.marginBottom === nextProps.options?.marginBottom &&
    prevProps.options?.padding === nextProps.options?.padding
  );
};

export default React.memo(BottomSheetOverlay, arePropsEqual);