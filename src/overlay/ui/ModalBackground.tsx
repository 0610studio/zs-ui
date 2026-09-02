import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, type AnimatedStyle } from 'react-native-reanimated';
import { Z_INDEX_VALUE } from '../../model/utils';

interface ModalBackgroundProps {
  zIndex?: number;
  modalBgColor: string;
  position?: 'center' | 'left' | 'right' | 'pop' | 'bottom';
  children: React.ReactNode;
  onPress?: () => void;
  /** 전달하면 기본 FadeIn/FadeOut(50ms) 대신 이 스타일로 배경만 페이드한다 (자식은 형제 노드라 영향 없음). */
  backdropAnimatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  backdropAccessibilityLabel?: string;
}

const POSITION_STYLE: Partial<Record<NonNullable<ModalBackgroundProps['position']>, ViewStyle>> = {
  center: { justifyContent: 'center', alignItems: 'center' },
  left: { justifyContent: 'flex-start', alignItems: 'center' },
  right: { justifyContent: 'flex-end', alignItems: 'center' },
  bottom: { justifyContent: 'flex-end' },
};

const NOOP = () => { };

function ModalBackground({
  modalBgColor,
  position = 'center',
  children,
  onPress,
  zIndex = Z_INDEX_VALUE.DEFAULT,
  backdropAnimatedStyle,
  backdropAccessibilityLabel,
}: ModalBackgroundProps) {
  const styles = useMemo(() => createStyles(modalBgColor), [modalBgColor]);

  if (backdropAnimatedStyle) {
    return (
      <View style={[styles.host, { zIndex }, POSITION_STYLE[position]]}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable
            style={styles.fullScreen}
            onPress={onPress ?? NOOP}
            accessibilityRole="button"
            accessibilityLabel={backdropAccessibilityLabel}
          />
        </Animated.View>

        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.modalBg, { zIndex }, POSITION_STYLE[position]]}
      entering={FadeIn.duration(50)}
      exiting={FadeOut.duration(50)}
    >
      <Pressable
        style={styles.fullScreen}
        onPress={onPress ?? NOOP}
      >
      </Pressable>

      {children}
    </Animated.View>
  );
}

const createStyles = (modalBgColor: string) =>
  StyleSheet.create({
    host: {
      ...StyleSheet.absoluteFill,
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: modalBgColor,
    },
    modalBg: {
      backgroundColor: modalBgColor,
      ...StyleSheet.absoluteFill,
    },
    fullScreen: {
      width: '100%',
      height: '100%',
      ...StyleSheet.absoluteFill,
    },
  });

export default ModalBackground;
