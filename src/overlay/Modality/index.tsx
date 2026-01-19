import React, { useEffect, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context';
import Animated, { FadeOut, useAnimatedStyle, withTiming, withDelay, useSharedValue } from 'react-native-reanimated';
import { useModality } from '../../model/useOverlay';
import { MAX_FOLDABLE_SINGLE_WIDTH, Z_INDEX_VALUE } from '../../model/utils';
import ZSView from '../../ui/ZSView';
import { useTheme } from '../../context/ThemeContext';

const windowHeight = Dimensions.get('window').height;

function Modality({
  foldableSingleScreen,
  modalityComponent,
}: {
  modalityComponent: React.ReactNode;
  foldableSingleScreen: boolean;
}) {
  const { palette } = useTheme();
  const [localVisible, setLocalVisible] = useState(false);
  const { modalityVisible } = useModality();
  const insets = useSafeAreaInsets();
  const backScale = useSharedValue(1);
  const backTranslateY = useSharedValue(0);
  const backBorderRadius = useSharedValue(0);
  const mainTranslateY = useSharedValue(windowHeight);
  const backgroundOpacity = useSharedValue(1);
  const overrideMargin = 10;
  const mainScreenMargin = insets.top;
  const mainScrrenPadding = (initialWindowMetrics?.insets.bottom || insets.bottom);

  // 애니메이션 트리거
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (modalityVisible) {
      // 모달이 열리는 애니메이션
      setLocalVisible(true);
      backScale.value = withDelay(100, withTiming(0.92, { duration: 200 }));
      backTranslateY.value = withDelay(300, withTiming(insets.top, { duration: 200 }));
      backBorderRadius.value = withDelay(100, withTiming(12, { duration: 200 }));
      mainTranslateY.value = withDelay(200, withTiming(overrideMargin + insets.top, { duration: 200 }));
      backgroundOpacity.value = withTiming(1, { duration: 500 });
    } else {
      // 모달이 닫히는 애니메이션 (역순)
      backScale.value = withTiming(1, { duration: 100 });
      backTranslateY.value = withTiming(0, { duration: 100 });
      backBorderRadius.value = withTiming(0, { duration: 100 });
      mainTranslateY.value = withTiming(windowHeight, { duration: 200 });
      backgroundOpacity.value = withTiming(0, { duration: 300 });
      timeoutId = setTimeout(() => {
        setLocalVisible(false);
      }, 500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [modalityVisible, insets.top]);

  // 부모 스크린
  const backScreenAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { scaleX: backScale.value },
        { translateY: backTranslateY.value }
      ],
      borderTopLeftRadius: backBorderRadius.value,
      borderTopRightRadius: backBorderRadius.value,
    };
  });

  // 아래에서 등장하는 Modality 화면
  const mainScreenAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: mainTranslateY.value }
      ]
    };
  });

  // 배경 불투명도 스타일
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: backgroundOpacity.value
    };
  });

  return (
    !localVisible ? null :
      <Animated.View
        key={localVisible ? 'visiblemd' : 'hiddenmd'}
        style={[
          styles.animatedBackground,
          { backgroundColor: palette.background.neutral },
          backgroundAnimatedStyle
        ]}
      >
        <StatusBar backgroundColor={modalityVisible ? palette.background.neutral : palette.background.base} />

        <Animated.View
          exiting={FadeOut.duration(300)}
          style={[
            styles.backScreen,
            { backgroundColor: palette.background.layer2, width: '100%', height: windowHeight, maxWidth: foldableSingleScreen ? MAX_FOLDABLE_SINGLE_WIDTH : '100%' },
            backScreenAnimatedStyle
          ]}
        />

        <Animated.View
          style={[
            {
              height: windowHeight - mainScreenMargin,
              paddingBottom: mainScrrenPadding,
              backgroundColor: palette.background.base,
              width: '100%',
              maxWidth: foldableSingleScreen ? MAX_FOLDABLE_SINGLE_WIDTH : '100%',
              alignSelf: 'center',
            },
            styles.mainScreen,
            mainScreenAnimatedStyle
          ]}
        >
          <ZSView style={[styles.contents, { width: '100%'}]}>
            {modalityComponent}
          </ZSView>
        </Animated.View>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  contents: {
    flex: 1,
    paddingTop: 10,
    zIndex: Z_INDEX_VALUE.MODAL4,
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: Z_INDEX_VALUE.MODAL1,
    alignSelf: 'center',
  },
  backScreen: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: Z_INDEX_VALUE.MODAL2,
  },
  mainScreen: {
    position: 'absolute',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: Z_INDEX_VALUE.MODAL3,
    overflow: 'hidden',
  },
});

export default Modality;
