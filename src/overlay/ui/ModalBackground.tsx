import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ModalBackgroundProps {
  modalBgColor: string;
  isCenter?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

function ModalBackground({ modalBgColor, isCenter = true, children, onPress }: ModalBackgroundProps) {
  const styles = useMemo(() => createStyles(modalBgColor), [modalBgColor]);

  return (
    <Animated.View
      style={[styles.modalBg, isCenter && { justifyContent: 'center', alignItems: 'center' }]}
      entering={FadeIn.duration(50)}
      exiting={FadeOut.duration(50)}
    >
      <Pressable
        style={styles.fullScreen}
        onPress={onPress ?? (() => { })}
      >
      </Pressable>

      {children}
    </Animated.View>
  );
}

const createStyles = (modalBgColor: string) =>
  StyleSheet.create({
    modalBg: {
      zIndex: 9997,
      backgroundColor: modalBgColor,
      ...StyleSheet.absoluteFillObject,
    },
    fullScreen: {
      width: '100%',
      height: '100%',
      ...StyleSheet.absoluteFillObject,
    },
  });

export default ModalBackground;
