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
import { useNotify } from '../../model/useNotify';
import { ScrollViewAtom } from '../../ui';

const { width, height } = Dimensions.get('window');

function Modality({
  modalityComponent,
  onModalityClosed
}: {
  modalityComponent?: React.ReactNode;
  onModalityClosed?: () => void;
}) {
  const [localVisible, setLocalVisible] = useState(false);
  const { modalityVisible } = useNotify();
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
      backgroundOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // 모달이 닫히는 애니메이션 (역순)
      backScale.value = withTiming(1, { duration: 100 });
      backTranslateY.value = withTiming(0, { duration: 100 });
      backBorderRadius.value = withTiming(0, { duration: 100 });
      mainTranslateY.value = withTiming(height, { duration: 200 });
      backgroundOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => {
        setLocalVisible(false);
      }, 500);
    }
  }, [modalityVisible, insets.top, onModalityClosed]);

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
        backgroundAnimatedStyle
      ]}
    >
      <Animated.View
        exiting={FadeOut.duration(300)}
        style={[
          styles.backScreen,
          backScreenAnimatedStyle
        ]}
      />

      <Animated.View
        style={[
          styles.overlayBackground,
          backgroundAnimatedStyle
        ]}
      />

      <Animated.View
        style={[
          {
            height: height - (10 + insets.top),
            paddingBottom: insets.bottom
          },
          styles.mainScreen,
          mainScreenAnimatedStyle
        ]}
      >
        <ScrollViewAtom
          style={styles.scrollStyle}
          bounces={false}
          contentContainerStyle={styles.scrollContainerStyle}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {modalityComponent}
        </ScrollViewAtom>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollStyle: {
    flex: 1,
    width: width,
  },
  scrollContainerStyle: {
    flexGrow: 1,
    alignItems: 'center',
    width: width,
    paddingTop: 10,
  },
  animatedBackground: {
    width,
    height,
    position: 'absolute',
    backgroundColor: 'black',
  },
  backScreen: {
    position: 'absolute',
    width,
    height,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8000,
  },
  overlayBackground: {
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 8001,
    position: 'absolute',
  },
  mainScreen: {
    width,
    backgroundColor: 'white',
    position: 'absolute',
    borderRadius: 16,
    zIndex: 8002,
    overflow: 'hidden',
  },
});

export default Modality;
