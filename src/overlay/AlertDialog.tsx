import { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type BoxShadowValue, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { FullWindowOverlay } from 'react-native-screens';
import { useTheme } from '../context/ThemeContext';
import type { ShowAlertProps } from '../model/types';
import { withOpacity } from '../theme/color';
import { capFontScale } from '../theme/fontScale';
import { springConfig, timingConfig } from '../theme/motion';
import { radiusStyle } from '../theme/radius';
import { SPACE } from '../theme/spacing';
import ZSButton from '../ui/ZSButton';
import ZSText from '../ui/ZSText';
import { Veil } from './veil';

interface Props {
  alert: ShowAlertProps;
  onClose: () => void;
}

export const ALERT_MAX_WIDTH = 360;
const SIDE_MARGIN = SPACE['3xl'];
const BUTTON_GAP = SPACE.sm;
const DARK_CARD_EDGE: BoxShadowValue[] = [
  { offsetX: 0, offsetY: 1, blurRadius: 0, color: withOpacity('#ffffff', 0.07), inset: true },
  { offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: StyleSheet.hairlineWidth, color: withOpacity('#ffffff', 0.06), inset: true },
];
export const ALERT_ENTER_SCALE = 0.96;
export const ALERT_EXIT_SCALE = 0.98;
export const ALERT_STACK_FONT_SCALE = 1.3;

type NaturalWidths = [number | undefined, number | undefined];

export default function AlertDialog({ alert, onClose }: Props) {
  const { colors, mode, maxFontSizeMultiplier } = useTheme();
  const { width, height, fontScale = 1 } = useWindowDimensions();
  const [visible, setVisible] = useState(true);
  const closing = useRef(false);
  const pendingPress = useRef<(() => void) | undefined>(undefined);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(ALERT_ENTER_SCALE);
  const dismissible = alert.dismissible ?? false;

  const [rowWidth, setRowWidth] = useState(0);
  const [natural, setNatural] = useState<NaturalWidths>([undefined, undefined]);
  const largeText = capFontScale(fontScale, maxFontSizeMultiplier) >= ALERT_STACK_FONT_SCALE;
  const crowded = rowWidth > 0 && natural.some((w) => w !== undefined && w > (rowWidth - BUTTON_GAP) / 2);
  const stacked = alert.cancel != null && (largeText || crowded);

  useEffect(() => {
    scale.value = withSpring(1, Platform.OS === 'ios' ? springConfig('fade') : springConfig('move'));
    opacity.value = withSpring(1, springConfig('fade'));
  }, [opacity, scale]);

  useEffect(() => {
    if (visible) return;
    onClose();
    pendingPress.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const close = (onPress?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    pendingPress.current = onPress;
    scale.value = withTiming(ALERT_EXIT_SCALE, timingConfig('fast'));
    opacity.value = withTiming(0, timingConfig('fast'), (finished) => {
      if (finished) scheduleOnRN(setVisible, false);
    });
  };

  const cancelByBack = () => {
    if (alert.cancel || dismissible) close(alert.cancel?.onPress);
  };

  const measureNatural = (index: 0 | 1) => (event: LayoutChangeEvent) => {
    const measured = event.nativeEvent.layout.width;
    setNatural((prev) => {
      if (prev[index] === measured) return prev;
      const next: NaturalWidths = [...prev];
      next[index] = measured;
      return next;
    });
  };

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  const cancelButton = alert.cancel ? (
    <ZSButton
      key="cancel"
      title={alert.cancel.label}
      variant="tonal"
      color="neutral"
      onPress={() => close(alert.cancel?.onPress)}
      size="medium"
      testID="zs-alert-cancel"
      style={stacked ? styles.stackedButton : styles.button}
    />
  ) : null;
  const confirmButton = (
    <ZSButton
      key="confirm"
      title={alert.confirm.label}
      variant="filled"
      color={alert.confirm.destructive ? 'error' : 'primary'}
      size="medium"
      onPress={() => close(alert.confirm.onPress)}
      testID="zs-alert-confirm"
      style={stacked ? styles.stackedButton : styles.button}
    />
  );

  const content = (
    <View style={styles.root}>
      <Veil kind="scrim" blurTarget={null} progress={opacity} style={StyleSheet.absoluteFill}>
        <Pressable
          testID="zs-alert-backdrop"
          accessible={false}
          style={StyleSheet.absoluteFill}
          onPress={dismissible ? () => close(alert.cancel?.onPress) : undefined}
        />
      </Veil>
      <Animated.View
        testID="zs-alert"
        accessibilityViewIsModal
        style={[
          styles.card,
          radiusStyle('3xl'),
          {
            width: Math.min(width - SIDE_MARGIN * 2, ALERT_MAX_WIDTH),
            maxHeight: height - SIDE_MARGIN * 2,
            backgroundColor: mode === 'dark' ? colors.surface3 : colors.surface1,
          },
          mode === 'dark' ? { boxShadow: DARK_CARD_EDGE } : null,
          cardStyle,
        ]}
      >
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} bounces={false}>
          <ZSText variant="h4" accessibilityRole="header">
            {alert.title}
          </ZSText>
          {alert.message ? (
            <ZSText variant="body2" color="textSecondary">
              {alert.message}
            </ZSText>
          ) : null}
        </ScrollView>
        <View onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)} style={[styles.buttons, stacked && styles.buttonsStacked]}>
          {stacked ? [confirmButton, cancelButton] : [cancelButton, confirmButton]}
          {alert.cancel && !largeText ? (
            <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.measure}>
              <View onLayout={measureNatural(0)}>
                <ZSButton title={alert.cancel.label} variant="tonal" color="neutral" size="medium" disabled />
              </View>
              <View onLayout={measureNatural(1)}>
                <ZSButton title={alert.confirm.label} variant="filled" size="medium" disabled />
              </View>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );

  if (Platform.OS === 'ios') return <FullWindowOverlay>{content}</FullWindowOverlay>;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={cancelByBack}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { paddingTop: SPACE['2xl'] + SPACE.xxs, paddingBottom: SPACE['2xl'], paddingHorizontal: SPACE['2xl'] },
  body: { flexGrow: 0 },
  bodyContent: { gap: SPACE.sm },
  buttons: { flexDirection: 'row', gap: BUTTON_GAP, marginTop: SPACE['3xl'] },
  buttonsStacked: { flexDirection: 'column' },
  button: { flex: 1 },
  stackedButton: { alignSelf: 'stretch' },
  measure: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0, alignItems: 'flex-start' },
});
