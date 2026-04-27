import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Z_INDEX_VALUE } from '../../model/utils';

interface ModalBackgroundProps {
  zIndex?: number;
  modalBgColor: string;
  position?: 'center' | 'left' | 'right' | 'pop'; // TODO: 'left' | 'right' 미구현
  children: React.ReactNode;
  onPress?: () => void;
}

function ModalBackground({ modalBgColor, position = 'center', children, onPress, zIndex = Z_INDEX_VALUE.DEFAULT }: ModalBackgroundProps) {
  const styles = useMemo(() => createStyles(modalBgColor), [modalBgColor]);

  return (
    <Animated.View
      style={[styles.modalBg, { zIndex }, position === 'center' && { justifyContent: 'center', alignItems: 'center' }, position === 'left' && { justifyContent: 'flex-start', alignItems: 'center' }, position === 'right' && { justifyContent: 'flex-end', alignItems: 'center' }]}
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
