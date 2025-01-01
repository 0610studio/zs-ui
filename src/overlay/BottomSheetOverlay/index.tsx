import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { useOverlay } from '../../model/useOverlay';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS
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
  const { palette } = useTheme();
  const { bottomSheetVisible, setBottomSheetVisible } = useOverlay();
  const { bottom } = useSafeAreaInsets();
  const {
    isBackgroundTouchClose = true,
    marginHorizontal = 10,
    marginBottom = 10,
    height = 300,
    padding = 24,
  } = options;

  const translateY = useSharedValue(height);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    if (bottomSheetVisible) {
      translateY.value = withSpring(0, {
        damping: 50,     // 높은 감쇠값으로 탄력 최소화
        stiffness: 300,  // 높은 강성으로 빠른 초기 속도
        mass: 0.7,       // 가벼운 질량으로 반응성 향상
        velocity: 100,    // 초기 속도 부여
        restDisplacementThreshold: 0.2, // 정밀한 도착 지점 제어
      });
    } else {
      translateY.value = withSpring(height, {
        damping: 20,
        stiffness: 90,
      }, (finished) => {
        if (finished) {
          runOnJS(setBottomSheetVisible)(false);
        }
      });
    }
  }, [bottomSheetVisible, height]);

  if (!bottomSheetVisible) return null;

  return (
    <ModalBackground onPress={() => {
      if (isBackgroundTouchClose) setBottomSheetVisible(false);
    }}>
      <Animated.View
        style={[
          styles.container,
          {
            width: width - marginHorizontal * 2,
            height,
            marginHorizontal,
            bottom: marginBottom + bottom,
            backgroundColor: palette.background.base,
            padding,
          },
          animatedStyles
        ]}
      >
        <Pressable style={styles.pressableView}>
          {headerComponent}
          {component}
        </Pressable>
      </Animated.View>
    </ModalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pressableView: {
    width: '100%',
    height: '100%',
  }
});

export default BottomSheetOverlay;