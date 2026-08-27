import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, PanResponder, Keyboard, Platform, type KeyboardEvent, type LayoutChangeEvent, type PanResponderGestureState, type GestureResponderEvent, useWindowDimensions, type ViewStyle } from 'react-native';
import { useBottomSheet } from '../../model/useOverlay';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import ModalBackground from '../ui/ModalBackground';
import { useTheme } from '../../context/ThemeContext';
import { BackPriority, useBackHandler } from '../../context/BackHandlerContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShowBottomSheetProps } from '../../model/types';
import { OVERLAY_FOLDABLE_SINGLE_WIDTH, Z_INDEX_VALUE } from '../../model/utils';
import { RADIUS } from '../../theme/tokens';
import useFoldingState from '../../model/useFoldingState';

const IS_IOS = Platform.OS === 'ios';
const KEYBOARD_SHOW_EVENT = IS_IOS ? 'keyboardWillShow' : 'keyboardDidShow';
const KEYBOARD_HIDE_EVENT = IS_IOS ? 'keyboardWillHide' : 'keyboardDidHide';

// 닫힐 때 시트를 화면 밖으로 완전히 밀어내기 위한 추가 이동 거리.
const CLOSE_SLACK = 100;

const ANIMATION_CONFIG = {
  open: { damping: 24, stiffness: 260, mass: 0.9, restDisplacementThreshold: 0.2, reduceMotion: ReduceMotion.System },
  restore: { damping: 22, stiffness: 240, mass: 0.85, restDisplacementThreshold: 0.1, restSpeedThreshold: 2, reduceMotion: ReduceMotion.System },
  close: { duration: 200, reduceMotion: ReduceMotion.System },
  backdropShow: { duration: 200, reduceMotion: ReduceMotion.System },
  backdropHide: { duration: 150, reduceMotion: ReduceMotion.System },
  scale: { duration: 180, reduceMotion: ReduceMotion.System },
  keyboardShow: { duration: 250, reduceMotion: ReduceMotion.System },
  keyboardHide: { duration: 150, reduceMotion: ReduceMotion.System },
} as const;

const GESTURE_CONSTANTS = {
  scaleAmount: 0.99,
  dragUpDamping: 3,
  closeVelocityThreshold: 0.5,
  closeDistanceRatio: 0.28,
  minimumCloseDistance: 80,
  moveThreshold: 8,
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
    marginHorizontal = 10,
    marginBottom = 10,
    padding = 14,
  } = options;
  // dismissable 미지정 시 isBackgroundTouchClose(deprecated)를 승계한다.
  const dismissable = options.dismissable ?? options.isBackgroundTouchClose ?? true;
  const isFixed = options.type === 'fixed';

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
  const keyboardOffset = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const isGesturing = useSharedValue(false);

  const [localVisible, setLocalVisible] = useState(false);

  // 시트 바닥부터 화면 바닥까지의 간격 — 닫힘 시 화면 밖으로 밀어낼 거리 계산에 쓴다.
  const bottomSpace = isFixed ? bottomInsets : marginBottom + bottomInsets;
  const closeOffsetRef = useRef(0);

  useEffect(() => {
    const measured = sheetHeight > 0 ? sheetHeight : constrainedMaxHeight;
    closeOffsetRef.current = measured + bottomSpace + CLOSE_SLACK;
  }, [bottomSpace, constrainedMaxHeight, sheetHeight]);

  const hideSheet = useCallback(() => {
    setLocalVisible(false);
  }, []);

  // 초기 마운트(한 번도 열린 적 없음)에서는 close 애니메이션을 돌릴 필요가 없다.
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (bottomSheetVisible) {
      hasOpenedRef.current = true;
      Keyboard.dismiss();
      keyboardOffset.value = 0;
      scale.value = 1;
      translateY.value = closeOffsetRef.current;
      translateY.value = withSpring(0, ANIMATION_CONFIG.open);
      backdropOpacity.value = withTiming(1, ANIMATION_CONFIG.backdropShow);
      setLocalVisible(true);
      return;
    }
    if (!hasOpenedRef.current) {
      return;
    }
    // 닫힘 애니메이션이 실제로 끝난 시점에 언마운트한다 (setTimeout 매직넘버 커플링 제거).
    translateY.value = withTiming(closeOffsetRef.current, ANIMATION_CONFIG.close, (finished) => {
      if (finished) scheduleOnRN(hideSheet);
    });
    backdropOpacity.value = withTiming(0, ANIMATION_CONFIG.backdropHide);
  }, [backdropOpacity, bottomSheetVisible, hideSheet, isGesturing, keyboardOffset, scale, translateY]);

  // 키보드 회피는 translateY와 분리된 keyboardOffset으로 덧셈 합성한다.
  // 시트가 보일 때만 구독해, 닫힌 시트가 앱 전역 키보드 이벤트에 반응하지 않게 한다.
  useEffect(() => {
    if (!localVisible) {
      return;
    }
    const handleKeyboardShow = (event: KeyboardEvent) => {
      if (isGesturing.value) {
        return;
      }
      const target = -Math.max(event.endCoordinates.height - (IS_IOS ? bottomInsets : 0), 0);
      keyboardOffset.value = withTiming(target, ANIMATION_CONFIG.keyboardShow);
    };
    const handleKeyboardHide = () => {
      if (isGesturing.value) {
        return;
      }
      keyboardOffset.value = withTiming(0, ANIMATION_CONFIG.keyboardHide);
    };
    const showSubscription = Keyboard.addListener(KEYBOARD_SHOW_EVENT, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(KEYBOARD_HIDE_EVENT, handleKeyboardHide);
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [bottomInsets, isGesturing, keyboardOffset, localVisible]);

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value + keyboardOffset.value },
        { scale: scale.value },
      ],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

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

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // 닫힘 애니메이션 중 잡으면 완료 콜백이 취소돼 언마운트가 막히므로, 열려 있을 때만 응답한다.
      onMoveShouldSetPanResponder: (_, gestureState) =>
        bottomSheetVisible && Math.abs(gestureState.dy) > GESTURE_CONSTANTS.moveThreshold,
      onPanResponderGrant: () => {
        Keyboard.dismiss();
        isGesturing.value = true;
        // fixed 시트는 바닥이 화면에 붙어 있어야 하므로 scale 축소(바닥이 들림)를 걸지 않는다.
        if (!isFixed) {
          scale.value = withTiming(GESTURE_CONSTANTS.scaleAmount, ANIMATION_CONFIG.scale);
        }
      },
      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (gestureState.dy < 0) {
          // fixed 시트는 위로 끌어도 바닥이 떨어지지 않게 이동을 막는다. floating은 감쇠 이동 유지.
          translateY.value = isFixed ? 0 : gestureState.dy / GESTURE_CONSTANTS.dragUpDamping;
          return;
        }
        translateY.value = gestureState.dy;
      },
      onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        isGesturing.value = false;
        if (!isFixed) {
          scale.value = withSpring(1, ANIMATION_CONFIG.restore);
        }

        const dismissThresholdHeight = sheetHeight > 0 ? sheetHeight : constrainedMaxHeight;
        const dismissDistanceThreshold = Math.max(
          dismissThresholdHeight * GESTURE_CONSTANTS.closeDistanceRatio,
          GESTURE_CONSTANTS.minimumCloseDistance
        );
        const shouldClose = dismissable && (
          gestureState.vy > GESTURE_CONSTANTS.closeVelocityThreshold ||
          translateY.value > dismissDistanceThreshold
        );

        if (shouldClose) {
          closeBottomSheet();
          return;
        }

        translateY.value = withSpring(0, {
          ...ANIMATION_CONFIG.restore,
          velocity: gestureState.vy * 1000,
          // fixed 시트는 복귀 스프링이 0을 넘겨(위로 튀어) 바닥이 떨어지는 것도 막는다.
          overshootClamping: isFixed,
        });
      },
    }),
    [bottomSheetVisible, closeBottomSheet, constrainedMaxHeight, dismissable, isFixed, isGesturing, scale, sheetHeight, translateY]
  );

  const handleBackgroundPress = useCallback(() => {
    if (dismissable) closeBottomSheet();
  }, [closeBottomSheet, dismissable]);

  // dismissable=false여도 true를 반환해 back을 소비 — 시트 밑 화면으로 내비게이션이 새는 것을 막는다.
  useBackHandler(
    () => {
      if (dismissable) closeBottomSheet();
      return true;
    },
    { enabled: localVisible, priority: BackPriority.SHEET }
  );

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
      marginHorizontal: isFixed || foldableSingleScreen ? 0 : marginHorizontal,
      marginBottom: isFixed ? 0 : marginBottom + bottomInsets,
      paddingBottom: isFixed ? bottomInsets : 0,
      backgroundColor: palette.background.base,
      ...(isFixed
        ? { borderTopLeftRadius: RADIUS.sheet, borderTopRightRadius: RADIUS.sheet, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
        : { borderRadius: RADIUS.sheet }),
      ...(foldableSingleScreen
        ? {
          alignSelf: 'center' as const,
          width: Math.min(windowWidth - (isFixed ? 0 : marginHorizontal * 2), OVERLAY_FOLDABLE_SINGLE_WIDTH),
        }
        : null),
    },
    animatedSheetStyle,
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
    { backgroundColor: palette.grey[20] }
  ];

  if (!localVisible) {
    return null;
  }

  return (
    <ModalBackground
      zIndex={Z_INDEX_VALUE.BOTTOM_SHEET1}
      position="bottom"
      modalBgColor={palette.modalBgColor}
      onPress={handleBackgroundPress}
      backdropAnimatedStyle={animatedBackdropStyle}
      backdropAccessibilityLabel="닫기"
    >
      <Animated.View
        style={containerStyle}
        onLayout={handleSheetLayout}
        accessibilityViewIsModal
      >
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
    alignSelf: 'stretch',
    borderRadius: RADIUS.sheet,
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
    borderRadius: 1.5,
  },
});

export default BottomSheetOverlay;
