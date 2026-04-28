import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, PanResponder, Keyboard, Platform, type KeyboardEvent, type LayoutChangeEvent, type PanResponderGestureState, type GestureResponderEvent, useWindowDimensions, type ViewStyle } from 'react-native';
import { useBottomSheet } from '../../model/useOverlay';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import ModalBackground from '../ui/ModalBackground';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShowBottomSheetProps } from '../../model/types';
import { MAX_FOLDABLE_SINGLE_WIDTH, Z_INDEX_VALUE } from '../../model/utils';
import useKeyboard from '../../model/useKeyboard';
import useFoldingState from '../../model/useFoldingState';

const IS_IOS = Platform.OS === 'ios';

const ANIMATION_CONFIG = {
  keyboard: {
    show: { duration: 250 },
    hide: { duration: 150 },
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
  minimumCloseDistance: 80,
  hideDelay: 200,
  moveThreshold: 10, // 드래그로 인식하기 위한 최소 이동 거리 (px)
} as const;

const getSafeFiniteNumber = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback;

function BottomSheetOverlay({
  headerComponent,
  component,
  options = {},
}: ShowBottomSheetProps) {
  const {
    foldableSingleScreen = false,
    isBackgroundTouchClose = true,
    marginHorizontal = 10,
    marginBottom = 10,
    padding = 14,
  } = options;
  const { height: windowHeight } = useWindowDimensions();
  const { width: windowWidth } = useFoldingState();
  const { palette } = useTheme();
  const { bottomSheetVisible, setBottomSheetVisible, height, maxHeight } = useBottomSheet();
  const { bottom: bottomInsets, top: topInsets } = useSafeAreaInsets();
  const [sheetHeight, setSheetHeight] = useState(0);
  const isAutoHeight = height === 'auto';

  const viewportMaxHeight = useMemo(() =>
    Math.max(
      windowHeight - 30 - bottomInsets - topInsets,
      0
    ),
    [bottomInsets, topInsets, windowHeight]
  );

  const constrainedMaxHeight = useMemo(() => {
    const maxHeightLimit = Math.max(getSafeFiniteNumber(maxHeight, viewportMaxHeight), 0);

    if (isAutoHeight) {
      return Math.min(viewportMaxHeight, maxHeightLimit);
    }

    return Math.min(viewportMaxHeight, maxHeightLimit, Math.max(getSafeFiniteNumber(height, 0), 0));
  }, [height, isAutoHeight, maxHeight, viewportMaxHeight]);

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isGesturing = useSharedValue(false);

  const [localVisible, setLocalVisible] = useState(false);
  const latestCloseOffsetRef = useRef(constrainedMaxHeight + 100);
  const closingOffsetRef = useRef(constrainedMaxHeight + 100);

  useEffect(() => {
    latestCloseOffsetRef.current = sheetHeight > 0 ? sheetHeight + 100 : constrainedMaxHeight + 100;
  }, [constrainedMaxHeight, sheetHeight]);

  const handleKeyboardShow = useCallback((event: KeyboardEvent) => {
    if (!isGesturing.value) {
      const targetY = -event.endCoordinates.height + (IS_IOS ? bottomInsets : 0);
      translateY.value = withTiming(targetY, ANIMATION_CONFIG.keyboard.show);
    }
  }, [bottomInsets]);

  const handleKeyboardHide = useCallback(() => {
    if (!isGesturing.value) {
      translateY.value = withTiming(0, ANIMATION_CONFIG.keyboard.hide);
    }
  }, []);

  useKeyboard({
    handleKeyboardShow,
    handleKeyboardHide,
  });

  // BottomSheet 표시/숨김 애니메이션 처리
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (bottomSheetVisible) {
      closingOffsetRef.current = latestCloseOffsetRef.current;
      Keyboard.dismiss();
      setLocalVisible(true);
      translateY.value = withSpring(0, ANIMATION_CONFIG.spring);
    } else {
      const targetCloseOffset = closingOffsetRef.current || latestCloseOffsetRef.current;
      closingOffsetRef.current = targetCloseOffset;
      translateY.value = withTiming(targetCloseOffset, ANIMATION_CONFIG.close);
      timeoutId = setTimeout(() => {
        setLocalVisible(false);
      }, GESTURE_CONSTANTS.hideDelay);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [bottomSheetVisible]);

  const animatedStyles = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value }
      ],
    };
  });

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const closeBottomSheet = useCallback(() => {
    setBottomSheetVisible(false);
  }, [setBottomSheetVisible]);

  const handleSheetLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);

    setSheetHeight((prevHeight) => {
      if (Math.abs(prevHeight - nextHeight) <= 1) {
        return prevHeight;
      }

      return nextHeight;
    });
  }, []);

  const handlePanResponderGrant = useCallback(() => {
    dismissKeyboard();
    isGesturing.value = true;
    startX.value = translateX.value;
    startY.value = translateY.value;
    scale.value = withTiming(GESTURE_CONSTANTS.scaleAmount, ANIMATION_CONFIG.scale);
  }, [dismissKeyboard]);

  const handlePanResponderMove = useCallback((_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const newTranslateX = (startX.value + gestureState.dx) / GESTURE_CONSTANTS.horizontalDamping;
    translateX.value = newTranslateX;

    const newTranslateY = startY.value + gestureState.dy;
    if (newTranslateY < 0) {
      translateY.value = newTranslateY / GESTURE_CONSTANTS.verticalUpDamping;
    } else {
      translateY.value = newTranslateY / GESTURE_CONSTANTS.verticalDownDamping;
    }
  }, []);

  const handlePanResponderRelease = useCallback((_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    isGesturing.value = false;
    translateX.value = withTiming(0, { duration: 100 });

    const dismissThresholdHeight = sheetHeight > 0 ? sheetHeight : constrainedMaxHeight;
    const dismissDistanceThreshold = Math.max(
      dismissThresholdHeight * GESTURE_CONSTANTS.closeDistanceRatio,
      GESTURE_CONSTANTS.minimumCloseDistance
    );
    const shouldClose = gestureState.vy > GESTURE_CONSTANTS.closeVelocityThreshold ||
      translateY.value > dismissDistanceThreshold;

    if (shouldClose) {
      const targetCloseOffset = latestCloseOffsetRef.current;
      closingOffsetRef.current = targetCloseOffset;
      translateY.value = withTiming(targetCloseOffset, ANIMATION_CONFIG.close);
      closeBottomSheet();
    } else {
      translateY.value = withTiming(0, ANIMATION_CONFIG.close);
    }

    scale.value = withSpring(1, ANIMATION_CONFIG.scaleRestore);
  }, [closeBottomSheet, constrainedMaxHeight, sheetHeight]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 일정 거리 이상 이동했을 때만 PanResponder가 응답 (탭과 드래그 구분)
        const { dx, dy } = gestureState;
        return Math.abs(dx) > GESTURE_CONSTANTS.moveThreshold || Math.abs(dy) > GESTURE_CONSTANTS.moveThreshold;
      },
      onMoveShouldSetPanResponderCapture: () => false,
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

  const containerHeightStyle = useMemo<ViewStyle>(() => {
    if (isAutoHeight) {
      return { maxHeight: constrainedMaxHeight };
    }

    return {
      height: constrainedMaxHeight,
      maxHeight: constrainedMaxHeight,
    };
  }, [constrainedMaxHeight, isAutoHeight]);

  const containerStyle = [
    styles.container,
    containerHeightStyle,
    {
      width: options.type === 'fixed' ? '100%' : windowWidth - marginHorizontal * 2,
      maxWidth: foldableSingleScreen ? MAX_FOLDABLE_SINGLE_WIDTH : '100%',
      marginHorizontal: options.type === 'fixed' ? 0 : marginHorizontal,
      bottom: options.type === 'fixed' ? 0 : marginBottom + bottomInsets,
      paddingBottom: options.type === 'fixed' ? bottomInsets : 0,
      backgroundColor: palette.background.base,
      ... (options.type === 'fixed' ? { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : { borderRadius: 26 }),
    },
    animatedStyles,
  ] as ViewStyle[];

  const pressableViewStyle = [
    styles.pressableView,
    { paddingHorizontal: padding, paddingBottom: padding },
    isAutoHeight ? styles.pressableViewAuto : styles.pressableViewFill,
  ];

  const contentWrapperStyle = [
    styles.contentWrapper,
    isAutoHeight ? styles.contentWrapperAuto : styles.contentWrapperFill,
  ];

  const gestureBarContainerStyle = [
    styles.gestureBarContainer,
    { paddingBottom: padding }
  ];

  const gestureBarStyle = [
    styles.gestureBar,
    { backgroundColor: palette.grey[60] }
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
      <Animated.View style={containerStyle} onLayout={handleSheetLayout}>
        <View style={pressableViewStyle}>
          <View {...panResponder.panHandlers}>
            <View style={gestureBarContainerStyle}>
              <View style={gestureBarStyle} />
            </View>
            {headerComponent}
          </View>

          <View style={contentWrapperStyle}>
            {component}
          </View>
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
  },
  pressableView: {
    width: '100%',
    maxHeight: '100%',
  },
  pressableViewFill: {
    height: '100%',
  },
  pressableViewAuto: {
    flexShrink: 1,
  },
  contentWrapper: {
    minHeight: 0,
  },
  contentWrapperFill: {
    flex: 1,
  },
  contentWrapperAuto: {
    flexShrink: 1,
    maxHeight: '100%',
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

export default BottomSheetOverlay;
