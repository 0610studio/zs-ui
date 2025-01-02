import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, StyleSheet, View, PanResponder } from 'react-native';
import { useOverlay } from '../../model/useOverlay';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ModalBackground from '../ui/ModalBackground';
import { useTheme } from '../../model';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShowBottomSheetProps } from '../../model/types';

const { width } = Dimensions.get('window');

function BottomSheetOverlay({
  headerComponent,
  component,
  options = {},
}: ShowBottomSheetProps) {
  const {
    isBackgroundTouchClose = true,
    marginHorizontal = 10,
    marginBottom = 10,
    height = 300,
    padding = 14,
  } = options;

  const [localVisible, setLocalVisible] = useState(false);
  const { bottomSheetVisible, setBottomSheetVisible } = useOverlay();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (bottomSheetVisible) {
      setLocalVisible(true);
      translateY.value = withSpring(0, {
        damping: 50,
        stiffness: 300,
        mass: 0.7,
        velocity: 100,
        restDisplacementThreshold: 0.2,
      });
    } else {
      translateY.value = withTiming(height + 100, { duration: 150 });
      setTimeout(() => {
        setLocalVisible(false);
      }, 200);
    }
  }, [bottomSheetVisible]);

  // ----------------------------------------------------------------

  if (!localVisible) return null;

  const { palette } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const startX = useRef(0);
  const startY = useRef(0);

  // ----------------------------------------------------------------

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    };
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startX.current = translateX.value;
        startY.current = translateY.value;
      },
      onPanResponderMove: (_, gestureState) => {
        const newTranslateX = (startX.current + gestureState.dx) / 20;
        translateX.value = newTranslateX;

        const newTranslateY = startY.current + gestureState.dy;
        if (newTranslateY < 0) {
          translateY.value = newTranslateY / 20;
        } else {
          translateY.value = newTranslateY / 1.5;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.value = withTiming(0, { duration: 100 });

        // 빠른 플리킹 제스처를 했을 때, 혹은 화면의 1/3 이상 내렸을 때, 닫기
        if (gestureState.vy > 0.5 || translateY.value > height / 3) {
          translateY.value = withTiming(height + 100, { duration: 150 });
          setBottomSheetVisible(false);
        } else {
          translateY.value = withTiming(0, { duration: 150 });
        }
      },
    })
  ).current;

  return (
    <ModalBackground
      modalBgColor={palette.modalBgColor}
      onPress={() => {
        if (isBackgroundTouchClose) setBottomSheetVisible(false);
      }}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: width - marginHorizontal * 2,
            height,
            marginHorizontal,
            bottom: marginBottom + bottom,
            backgroundColor: palette.background.base,
          },
          animatedStyles,
        ]}
      >
        <View
          style={[
            styles.pressableView,
            { paddingHorizontal: padding, paddingBottom: padding },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={[styles.gestureBarContainer, { paddingBottom: padding }]}>
              <View style={[styles.gestureBar, { backgroundColor: palette.divider }]} />
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

export default BottomSheetOverlay;