import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View, VirtualizedList, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '../context/ThemeContext';
import { springConfig, timingConfig } from '../theme/motion';
import { RADIUS } from '../theme/radius';
import type { IOSBottomSheetProps } from './IOSBottomSheet';
import { Veil } from './veil';

const VirtualizedListContext = VirtualizedList.contextType;

/** A sheet in the existing UIWindow, without a UIKit modal changing the bar axis. */
export default function WindowBottomSheet({ open, snapPoints, dismissible, onClose, children }: IOSBottomSheetProps) {
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const maxHeight = Math.max(1, height - top);
  const detents = snapPoints?.map(point => Math.max(1, Math.min(maxHeight, typeof point === 'number' ? point : height * Number.parseFloat(point) / 100))).sort((a, b) => a - b);
  const [detent, setDetent] = useState(0);
  const targetHeight = detents?.length ? detents[Math.min(detent, detents.length - 1)] : undefined;
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const closing = useRef(false);
  const closed = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const offset = useSharedValue(height);
  const opacity = useSharedValue(0);
  const settle = useMemo(() => springConfig('move'), []);
  const finish = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    onCloseRef.current();
  }, []);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    opacity.value = withTiming(0, timingConfig());
    offset.value = withTiming(height, timingConfig(), finished => {
      if (finished) scheduleOnRN(finish);
    });
  }, [finish, height, offset, opacity]);

  useEffect(() => {
    if (!open) { close(); return; }
    closing.current = false;
    closed.current = false;
    offset.value = withSpring(0, settle);
    opacity.value = withTiming(1, timingConfig());
  }, [open, close, offset, opacity, settle]);

  const pan = usePanGesture({
    enabled: open,
    activeOffsetY: [-8, 8],
    onUpdate: event => {
      'worklet';
      offset.value = Math.max(0, event.translationY);
    },
    onDeactivate: event => {
      'worklet';
      if (event.translationY < -40 && detents && detent < detents.length - 1) {
        scheduleOnRN(setDetent, detent + 1);
      } else if (event.translationY > 40 && detent > 0) {
        scheduleOnRN(setDetent, detent - 1);
      } else if (dismissible && (event.translationY > Math.max(60, measuredHeight * 0.25) || event.velocityY > 900)) {
        scheduleOnRN(close);
        return;
      }
      offset.value = withSpring(0, settle);
    },
  });
  const motion = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  const escape = dismissible ? close : undefined;
  return (
    <FullWindowOverlay>
      <GestureHandlerRootView style={styles.root}>
        <KeyboardAvoidingView behavior="padding" style={styles.root}>
          <Veil kind="scrim" blurTarget={null} progress={opacity} style={StyleSheet.absoluteFill}>
            <Pressable testID="zs-bottom-sheet-backdrop" accessible={false} style={StyleSheet.absoluteFill} onPress={escape} />
          </Veil>
          <GestureDetector gesture={pan}>
            <Animated.View
              testID="zs-bottom-sheet-window"
              accessibilityViewIsModal
              onAccessibilityEscape={escape}
              onLayout={event => setMeasuredHeight(event.nativeEvent.layout.height)}
              style={[styles.sheet, { maxHeight, height: targetHeight, paddingBottom: bottom, backgroundColor: colors.surface2 }, motion]}
            >
              <View testID="zs-bottom-sheet-handle" style={styles.handleArea}>
                <View style={[styles.handle, { backgroundColor: colors.surface5 }]} />
              </View>
              <View style={targetHeight === undefined ? styles.content : styles.fill}>
                <VirtualizedListContext.Provider value={null}>
                  <ScrollView.Context.Provider value={null}>{children}</ScrollView.Context.Provider>
                </VirtualizedListContext.Provider>
              </View>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </FullWindowOverlay>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { width: '100%', borderTopLeftRadius: RADIUS['3xl'], borderTopRightRadius: RADIUS['3xl'], borderCurve: 'continuous', overflow: 'hidden' },
  handleArea: { height: 28, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 36, height: 5, borderRadius: RADIUS.full },
  content: { flexShrink: 1 },
  fill: { flex: 1 },
});
