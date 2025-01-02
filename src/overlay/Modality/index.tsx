import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue
} from 'react-native-reanimated';
import { useOverlay } from '../../model/useOverlay';
import { ZSView } from '../../ui';
import { useTheme } from '../../model';

const { width, height } = Dimensions.get('window');

function Modality({
  modalityComponent,
}: {
  modalityComponent?: React.ReactNode;
}) {
  const { palette } = useTheme();
  const [localVisible, setLocalVisible] = useState(false);
  const { modalityVisible } = useOverlay();
  const insets = useSafeAreaInsets();
  const backScale = useSharedValue(1);
  const backTranslateY = useSharedValue(0);
  const backBorderRadius = useSharedValue(0);
  const mainTranslateY = useSharedValue(height);
  const backgroundOpacity = useSharedValue(1);

  // 애니메이션 트리거
  useEffect(() => {
    if (modalityVisible) {
      // 모달이 열리는 애니메이션
      setLocalVisible(true);
      backScale.value = withDelay(200, withTiming(0.92, { duration: 300 }));
      backTranslateY.value = withDelay(400, withTiming(insets.top, { duration: 300 }));
      backBorderRadius.value = withDelay(200, withTiming(16, { duration: 300 }));
      mainTranslateY.value = withDelay(300, withTiming(10 + insets.top, { duration: 300 }));
      backgroundOpacity.value = withTiming(1, { duration: 600 });
    } else {
      // 모달이 닫히는 애니메이션 (역순)
      backScale.value = withTiming(1, { duration: 100 });
      backTranslateY.value = withTiming(0, { duration: 100 });
      backBorderRadius.value = withTiming(0, { duration: 100 });
      mainTranslateY.value = withTiming(height, { duration: 200 });
      backgroundOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => {
        setLocalVisible(false);
      }, 500);
    }
  }, [modalityVisible]);

  // 부모 스크린
  const backScreenAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scaleX: backScale.value },
        { translateY: backTranslateY.value }
      ],
      borderRadius: backBorderRadius.value
    };
  });

  // 아래에서 등장하는 Modality 화면
  const mainScreenAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: mainTranslateY.value }
      ]
    };
  });

  // 배경 불투명도 스타일
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value
    };
  });

  if (!localVisible) return null;

  return (
    <Animated.View
      style={[
        styles.animatedBackground,
        { backgroundColor: palette.background.neutral },
        backgroundAnimatedStyle
      ]}
    >
      <Animated.View
        exiting={FadeOut.duration(300)}
        style={[
          styles.backScreen,
          { backgroundColor: palette.background.layer2 },
          backScreenAnimatedStyle
        ]}
      />

      <Animated.View
        style={[
          {
            height: height - (10 + insets.top),
            paddingBottom: insets.bottom,
            backgroundColor: palette.background.base
          },
          styles.mainScreen,
          mainScreenAnimatedStyle
        ]}
      >
        <ZSView style={styles.contents}>
          {modalityComponent}
        </ZSView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contents: {
    flex: 1,
    width: width,
    paddingTop: 10,
  },
  animatedBackground: {
    width,
    height,
    position: 'absolute',
  },
  backScreen: {
    position: 'absolute',
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8000,
  },
  mainScreen: {
    width,
    position: 'absolute',
    borderRadius: 16,
    zIndex: 8002,
    overflow: 'hidden',
  },
});

export default Modality;
