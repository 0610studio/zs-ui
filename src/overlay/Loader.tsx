import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import { ContainedLoadingIndicator } from '@expo/ui/jetpack-compose';
import { useTheme } from '../context/ThemeContext';
import { timingConfig } from '../theme/motion';
import { SPACE } from '../theme/spacing';
import { Z_INDEX_VALUE } from '../model/utils';
import { NativeHost } from '../native/NativeHost';
import { useComposeColors } from '../native/composeColors';
import ZSText from '../ui/ZSText';
import { Veil } from './veil';

export const LOADER_BOX_SIZE = 88;
export const LOADER_PROGRESS_WIDTH = 120;
const LOADER_PROGRESS_HEIGHT = 4;

interface Props {
  visible: boolean;
  accessibilityLabel: string;
  /** 0~1. 주면 진행 표시 아래에 막대와 백분율을 그린다 */
  progress?: number;
}

const clampProgress = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0);

export default function Loader({ visible, accessibilityLabel, progress }: Props) {
  const { colors } = useTheme();
  const composeColors = useComposeColors();
  const [mounted, setMounted] = useState(visible);
  const [label, setLabel] = useState(accessibilityLabel);
  const [shownProgress, setShownProgress] = useState(progress);
  const opacity = useSharedValue(0);

  if (visible && !mounted) setMounted(true);
  if (visible && accessibilityLabel !== label) setLabel(accessibilityLabel);
  // 닫히는 전환 동안에는 마지막 진행률을 그대로 보인다
  if (visible && !Object.is(progress, shownProgress)) setShownProgress(progress);

  useEffect(() => {
    if (!mounted) return;
    opacity.value = withTiming(visible ? 1 : 0, timingConfig('fast'), (finished) => {
      if (finished && !visible) runOnJS(setMounted)(false);
    });
  }, [mounted, opacity, visible]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!mounted) return null;

  const value = shownProgress === undefined ? null : clampProgress(shownProgress);
  const percent = value === null ? null : Math.floor(value * 100);

  const content = (
    <View
      style={[StyleSheet.absoluteFill, styles.center, { zIndex: Z_INDEX_VALUE.LOADING }]}
      accessible
      accessibilityViewIsModal
      importantForAccessibility="yes"
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      accessibilityValue={percent === null ? undefined : { min: 0, max: 100, now: percent }}
      testID="zs-loader"
    >
      <Veil kind="scrim" blurTarget={null} progress={opacity} pointerEvents="none" style={StyleSheet.absoluteFill} />
      {/* 진행률은 진행 표시 아래에 매달아, 생기거나 사라져도 진행 표시가 움직이지 않는다 */}
      <View style={styles.center}>
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
        {value === null || percent === null ? null : (
          <Veil kind="veil" radius="lg" progress={opacity} style={styles.progressBox}>
            <Animated.View style={[styles.progressContent, fadeStyle]}>
              <LoaderProgressBar value={value} trackColor={colors.surface4} fillColor={colors.primary} />
              <ZSText variant="label" color="textSecondary" style={styles.percent} testID="zs-loader-percent">
                {`${percent}%`}
              </ZSText>
            </Animated.View>
          </Veil>
        )}
      </View>
    </View>
  );

  if (Platform.OS === 'ios') return <FullWindowOverlay>{content}</FullWindowOverlay>;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => {}}>
      {content}
    </Modal>
  );
}

function LoaderProgressBar({ value, trackColor, fillColor }: { value: number; trackColor: string; fillColor: string }) {
  const width = useSharedValue(value);

  useEffect(() => {
    width.value = withTiming(value, timingConfig('fast'));
  }, [value, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View style={[styles.track, { backgroundColor: trackColor }]} testID="zs-loader-progress">
      <Animated.View style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} testID="zs-loader-progress-fill" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  box: { width: LOADER_BOX_SIZE, height: LOADER_BOX_SIZE, alignItems: 'center', justifyContent: 'center' },
  progressBox: { position: 'absolute', top: '100%', marginTop: SPACE.md, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md },
  progressContent: { alignItems: 'center', gap: SPACE.sm },
  track: { width: LOADER_PROGRESS_WIDTH, height: LOADER_PROGRESS_HEIGHT, borderRadius: LOADER_PROGRESS_HEIGHT / 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: LOADER_PROGRESS_HEIGHT / 2 },
  percent: { fontVariant: ['tabular-nums'] },
});
