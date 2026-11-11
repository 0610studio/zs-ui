import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import { ContainedLoadingIndicator } from '@expo/ui/jetpack-compose';
import { useTheme } from '../context/ThemeContext';
import { timingConfig } from '../theme/motion';
import { Z_INDEX_VALUE } from '../model/utils';
import { NativeHost } from '../native/NativeHost';
import { useComposeColors } from '../native/composeColors';
import { Veil } from './veil';

export const LOADER_BOX_SIZE = 88;

interface Props {
  visible: boolean;
  accessibilityLabel: string;
}

export default function Loader({ visible, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const composeColors = useComposeColors();
  const [mounted, setMounted] = useState(visible);
  const [label, setLabel] = useState(accessibilityLabel);
  const opacity = useSharedValue(0);

  if (visible && !mounted) setMounted(true);
  if (visible && accessibilityLabel !== label) setLabel(accessibilityLabel);

  useEffect(() => {
    if (!mounted) return;
    opacity.value = withTiming(visible ? 1 : 0, timingConfig('fast'), (finished) => {
      if (finished && !visible) runOnJS(setMounted)(false);
    });
  }, [mounted, opacity, visible]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!mounted) return null;

  const content = (
    <View
      style={[StyleSheet.absoluteFill, styles.center, { zIndex: Z_INDEX_VALUE.LOADING }]}
      accessible
      accessibilityViewIsModal
      importantForAccessibility="yes"
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      testID="zs-loader"
    >
      <Veil kind="scrim" blurTarget={null} progress={opacity} pointerEvents="none" style={StyleSheet.absoluteFill} />
      {Platform.OS === 'android' ? (
        <Animated.View style={fadeStyle}>
          <NativeHost matchContents>
            <ContainedLoadingIndicator {...composeColors.loadingIndicator} />
          </NativeHost>
        </Animated.View>
      ) : (
        <Veil kind="veil" radius="lg" progress={opacity} style={styles.box}>
          <Animated.View style={fadeStyle}>
            <ActivityIndicator size="large" color={colors.textSecondary} />
          </Animated.View>
        </Veil>
      )}
    </View>
  );

  if (Platform.OS === 'ios') return <FullWindowOverlay>{content}</FullWindowOverlay>;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => {}}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  box: { width: LOADER_BOX_SIZE, height: LOADER_BOX_SIZE, alignItems: 'center', justifyContent: 'center' },
});
