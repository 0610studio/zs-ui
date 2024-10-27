import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../model/useThemeProvider';

interface ModalBackgroundProps {
  isCenter?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

function ModalBackground({ isCenter = true, children, onPress }: ModalBackgroundProps) {
  const { palette: { modalBgColor } } = useTheme();
  const styles = useMemo(() => createStyles(modalBgColor), [modalBgColor]);

  return (
    <Animated.View
      style={styles.modalBg}
      entering={FadeIn.duration(50)}
      exiting={FadeOut.duration(50)}
    >
      <Pressable
        style={[styles.fullScreen, isCenter && { justifyContent: 'center', alignItems: 'center' }]}
        onPress={onPress ?? (() => { })}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// 스타일을 생성하는 함수, 모달 배경 색상 인자로 받음
const createStyles = (modalBgColor: string) =>
  StyleSheet.create({
    modalBg: {
      zIndex: 9997,
      backgroundColor: modalBgColor,
      ...StyleSheet.absoluteFillObject,
    },
    // 화면 전체를 덮는 Pressable 스타일 추가
    fullScreen: {
      ...StyleSheet.absoluteFillObject,
    },
  });

export default ModalBackground;
