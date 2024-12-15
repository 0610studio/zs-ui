import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, Keyboard, Platform, useWindowDimensions } from 'react-native';
import { Gesture, GestureType } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS, useDerivedValue } from 'react-native-reanimated';

const DIMENSIONS_HEIGHT = Dimensions.get('window').height;
const INPUT_HEIGHT_CORRECTION = 40; // 인풋 높이 보정
const NATURAL_GESTURE_TOP = -17; // 자연스러운 제스쳐를 위해 상단 여유 공간 추가
const NATURAL_GESTURE_X = 8;
const DEFAULT_BG_OPACITY = 40;
const HANDLE_HEIGHT = 35;

const timingConfig100 = {
  duration: 100,
  easing: Easing.inOut(Easing.quad),
};

const timingConfig200 = {
  duration: 200,
  easing: Easing.inOut(Easing.quad),
};

interface Props {
  bottomSheetPadding: number;
  closeOffset: number;
  contentsGestureEnable: boolean;
  isHandleVisible: boolean;
  bottomSheetMarginX: number;
}

function useBottomSheetOverlay({
  bottomSheetPadding,
  closeOffset,
  contentsGestureEnable,
  bottomSheetMarginX,
  isHandleVisible,
}: Props) {
  const handleHeight = isHandleVisible ? HANDLE_HEIGHT : 0;
  const { width: windowWidth } = useWindowDimensions();
  const panGestureRef = useRef<GestureType>(Gesture.Pan());
  const listScrollPosition = useSharedValue(0);
  const gestureComponent = useSharedValue('');
  const tabAbsoluteY = useSharedValue(0);
  const screenWidth = useSharedValue(Dimensions.get('window').width);
  const screenHeight = useSharedValue(1);
  const openPosition = useSharedValue(0);
  const bsScale = useSharedValue(1);
  const bgOpacity = useSharedValue(DEFAULT_BG_OPACITY);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(closeOffset);
  const fullScreen = useSharedValue(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  // ** 바텀시트 백그라운드 애니메이션 스타일 정의
  const bsModalBgStyle = useAnimatedStyle(() => ({
    backgroundColor: `#1E1E1E${bgOpacity.value}`,
  }));

  // ** 바텀시트 애니메이션 스타일 정의
  const bsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: bsScale.value },
    ],
  }));

  // ** 화면 너비 설정
  useEffect(() => {
    screenWidth.value = windowWidth - (bottomSheetMarginX ? bottomSheetMarginX * 2 : 0);
  }, [windowWidth, bottomSheetMarginX]);

  // ** 바텀시트 초기화
  const initBottomSheet = useCallback(() => {
    screenHeight.value = 1;
    openPosition.value = 0;
  }, [screenHeight, openPosition]);

  // ** 백버튼 핸들러 정의 (안드로이드 전용)
  const backPressHandler = useCallback(() => {
    if (bottomSheetVisible) {
      setBottomSheetVisible(false);
      return true;
    }
    return false;
  }, [bottomSheetVisible]);

  // ** 백버튼 이벤트 리스너 설정
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backPressHandler);

    return () => backHandler.remove();
  }, [backPressHandler]);

  // ** 바텀시트 보이기 상태 감지 후 초기화
  useEffect(() => {
    if (!bottomSheetVisible) initBottomSheet();
  }, [bottomSheetVisible, initBottomSheet]);

  // ** 백그라운드 클릭시 키보드나 바텀시트 닫기
  const backgroundPressHandler = useCallback(() => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      handleVisible(false);
    }
  }, [isKeyboardVisible]);

  // ** 키보드 닫기
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // ** 애니메이션을 사용한 바텀시트 초기 크기 설정
  const initSize = useCallback(() => {
    bsScale.value = withTiming(1, timingConfig100);
    translateX.value = withTiming(0, timingConfig100);
    bgOpacity.value = DEFAULT_BG_OPACITY;
  }, [bsScale, translateX, bgOpacity]);

  // ** 소프트 키보드 핸들링 (보이기, 숨기기)
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setIsKeyboardVisible(true);
        if (!fullScreen.value) return;
        const tabAbsoluteYValue = tabAbsoluteY.value;
        const screenTopToTarget = tabAbsoluteYValue - openPosition.value; // 모달 상단에서 인풋까지 거리
        const keyboardHeight = event.endCoordinates.height; // 키보드 높이
        const keyboardLine = DIMENSIONS_HEIGHT - keyboardHeight;

        translateY.value = withTiming(keyboardLine - screenTopToTarget - INPUT_HEIGHT_CORRECTION, timingConfig200);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);

        // 키보드가 사라질 때 화면의 높이를 원래대로 돌립니다.
        if (!fullScreen.value) return;
        handleVisible(true);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [fullScreen, openPosition, tabAbsoluteY, translateY]);

  // ** 바텀시트 열기 함수
  const openBottomSheet = useCallback(() => {
    setTimeout(() => {
      if (screenHeight.value === 1) return openBottomSheet();
      translateY.value = withTiming(openPosition.value, timingConfig200);
      fullScreen.value = true;
    }, 200);
  }, [screenHeight, openPosition, translateY]);

  // ** 바텀시트 위치 변경
  const onOpenPositionChange = useCallback(
    (value: number) => {
      if (fullScreen.value && screenHeight.value !== 1) {
        translateY.value = withTiming(value, timingConfig200);
      }
    },
    [fullScreen, screenHeight, translateY]
  );

  // ** 애니메이션 값이 변경될 때 처리
  useDerivedValue(() => {
    runOnJS(onOpenPositionChange)(openPosition.value);
    return openPosition.value;
  }, [openPosition]);

  // ** 바텀시트 상태 관리 (열기/닫기)
  const handleVisible = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setBottomSheetVisible(true);
        openBottomSheet();
      } else {
        translateY.value = withTiming(closeOffset, timingConfig200);
        fullScreen.value = false;
        setTimeout(() => {
          setBottomSheetVisible(false);
        }, 200);
      }
    },
    [closeOffset, fullScreen, openBottomSheet, translateY]
  );

  // ** 탭 제스처 설정
  const onTapEvent = Gesture.Tap().onStart((event) => {
    tabAbsoluteY.value = event.absoluteY;
  });

  // ** 팬 제스처 설정
  const onGestureEvent = Gesture.Pan()
    .onStart((event) => {
      'worklet';
      runOnJS(dismissKeyboard)();

      // 제스쳐 영역 판단
      if (openPosition.value + handleHeight > event.absoluteY) {
        gestureComponent.value = 'Handler';
        bsScale.value = withTiming(0.98, timingConfig100);
      } else {
        gestureComponent.value = 'Contents';
        if (contentsGestureEnable) bsScale.value = withTiming(0.98, timingConfig100);
      }
    })
    .onUpdate((event) => {
      'worklet';
      // 제스처 제어 로직
      if (!contentsGestureEnable && gestureComponent.value === 'Contents') return;

      const translateXValue = event.translationX;
      const translateYValue = event.translationY;
      const calcBg = Math.round(DEFAULT_BG_OPACITY + translateYValue * -1);

      // 백그라운드 컬러 업데이트
      if (calcBg < 70 && calcBg > DEFAULT_BG_OPACITY) {
        bgOpacity.value = calcBg;
      }

      // 자연스러운 X축 움직임
      if (NATURAL_GESTURE_X > translateXValue && translateXValue > -NATURAL_GESTURE_X && bsScale.value !== 1) {
        translateX.value = translateXValue;
      }

      // 상단 제스처 제한
      if (fullScreen.value && translateYValue < NATURAL_GESTURE_TOP) return;
      if (!fullScreen.value && translateYValue > 0 && translateY.value === closeOffset) return;

      const result = translateYValue + (fullScreen.value ? openPosition.value : 30);
      translateY.value = result;
    })
    .onEnd(() => {
      'worklet';
      runOnJS(initSize)();
      const shouldOpen = translateY.value < openPosition.value + screenHeight.value / 2;
      runOnJS(handleVisible)(shouldOpen);
    })
    .withRef(panGestureRef);

  return {
    HANDLE_HEIGHT,
    bottomSheetVisible,
    bsAnimatedStyle,
    onGestureEvent,
    handleVisible,
    screenWidth,
    screenHeight,
    handleHeight,
    openPosition,
    bottomSheetPadding,
    onTapEvent,
    panGestureRef,
    listScrollPosition,
    bsModalBgStyle,
    backgroundPressHandler,
  };
}

export default useBottomSheetOverlay;
