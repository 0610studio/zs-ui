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
  // dismissable 미지정 시 isBackgroundTouchClose(deprecated) 승계
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

  const bottomSpace = isFixed ? bottomInsets : marginBottom + bottomInsets;
  const closeOffsetRef = useRef(0);

  useEffect(() => {
    const measured = sheetHeight > 0 ? sheetHeight : constrainedMaxHeight;
    closeOffsetRef.current = measured + bottomSpace + CLOSE_SLACK;
  }, [bottomSpace, constrainedMaxHeight, sheetHeight]);

  const hideSheet = useCallback(() => {
    setLocalVisible(false);
  }, []);

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
    // 닫힘 애니메이션이 끝난 시점에 언마운트 — setTimeout 매직넘버 커플링을 피한다
    translateY.value = withTiming(closeOffsetRef.current, ANIMATION_CONFIG.close, (finished) => {
      if (finished) scheduleOnRN(hideSheet);
    });
    backdropOpacity.value = withTiming(0, ANIMATION_CONFIG.backdropHide);
  }, [backdropOpacity, bottomSheetVisible, hideSheet, isGesturing, keyboardOffset, scale, translateY]);

  // 보일 때만 구독해 닫힌 시트가 앱 전역 키보드 이벤트에 반응하지 않게 한다
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
      // 닫힘 중에 잡으면 완료 콜백이 취소돼 언마운트가 막힌다
      onMoveShouldSetPanResponder: (_, gestureState) =>
        bottomSheetVisible && Math.abs(gestureState.dy) > GESTURE_CONSTANTS.moveThreshold,
      onPanResponderGrant: () => {
        Keyboard.dismiss();
        isGesturing.value = true;
        if (!isFixed) {
          scale.value = withTiming(GESTURE_CONSTANTS.scaleAmount, ANIMATION_CONFIG.scale);
        }
      },
      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (gestureState.dy < 0) {
          // fixed 는 위로 끌어도 바닥이 떨어지지 않게 막는다 (floating 은 감쇠 이동)
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
          // fixed 는 복귀 스프링이 0을 넘겨 위로 튀는 것도 막는다
          overshootClamping: isFixed,
        });
      },
    }),
    [bottomSheetVisible, closeBottomSheet, constrainedMaxHeight, dismissable, isFixed, isGesturing, scale, sheetHeight, translateY]
  );

  const handleBackgroundPress = useCallback(() => {
    if (dismissable) closeBottomSheet();
  }, [closeBottomSheet, dismissable]);

  // dismissable=false 여도 back 을 소비해 시트 밑 화면으로 내비게이션이 새지 않게 한다
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

  // 절대배치 필수: flex 자식이면 Yoga 가 콘텐츠의 % 높이를 가용 높이로 해석해 auto 시트가
  // maxHeight 까지 팽창한다. bottom 만 지정하면 높이가 indefinite 로 남아 콘텐츠 크기로 잡힌다.
  const foldableWidth = Math.min(
    windowWidth - (isFixed ? 0 : marginHorizontal * 2),
    OVERLAY_FOLDABLE_SINGLE_WIDTH
  );

  const containerStyle = [
    styles.container,
    containerHeightStyle,
    {
      bottom: isFixed ? 0 : marginBottom + bottomInsets,
      paddingBottom: isFixed ? bottomInsets : 0,
      backgroundColor: palette.background.base,
      ...(isFixed
        ? { borderTopLeftRadius: RADIUS.sheet, borderTopRightRadius: RADIUS.sheet, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
        : { borderRadius: RADIUS.sheet }),
      ...(foldableSingleScreen
        ? {
          left: Math.max((windowWidth - foldableWidth) / 2, 0),
          width: foldableWidth,
        }
        : {
          left: 0,
          right: 0,
          marginHorizontal: isFixed ? 0 : marginHorizontal,
        }),
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
    position: 'absolute',
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
