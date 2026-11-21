import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type TextLayoutEvent, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { enterTransition, exitTransition, layoutTransition } from '../../overlay/transitions';
import { getPaletteColors } from '../../theme/color';
import { radiusStyle } from '../../theme/radius';
import { SPACE } from '../../theme/spacing';
import { MIN_TOUCH_TARGET } from '../../theme/state';
import { SvgX } from '../../assets/SvgX';
import ZSPressable from '../ZSPressable';
import ZSText from '../ZSText';
import StatusIcon, { type StatusIconKind } from './StatusIcon';

export type ZSBannerStatus = 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type ZSBannerVariant = 'tonal' | 'outlined';

export interface ZSBannerProps {
  message: string;
  title?: string;
  status?: ZSBannerStatus;
  variant?: ZSBannerVariant;
  icon?: React.ReactNode | null;
  action?: { label: string; onPress: () => void };
  onClose?: () => void;
  closeAccessibilityLabel?: string;
  visible?: boolean;
  defaultVisible?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const FIRST_LINE_FALLBACK = 22;
const MIN_HEIGHT = 56;
const CLOSE_SIZE = MIN_TOUCH_TARGET.ios;
const CLOSE_ICON = 20;

const ICON_SIZE = 22;

const ICON_KIND: Record<ZSBannerStatus, StatusIconKind> = {
  info: 'info',
  neutral: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

const BANNER_ENTERING = enterTransition();
const BANNER_EXITING = exitTransition();
const BANNER_LAYOUT = layoutTransition();

function ZSBanner({
  message,
  title,
  status = 'info',
  variant = 'tonal',
  icon,
  action,
  onClose,
  closeAccessibilityLabel,
  visible,
  defaultVisible = true,
  fullWidth = true,
  style,
  testID = 'zs-banner',
}: ZSBannerProps) {
  const { colors, accessibilityLabels } = useTheme();
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isVisible = visible ?? internalVisible;

  useEffect(() => {
    if (visible) setInternalVisible(true);
  }, [visible]);

  const [firstLine, setFirstLine] = useState<{ height: number; multiline: boolean; maxHeight?: number } | null>(null);
  const handleFirstTextLayout = useCallback((event: TextLayoutEvent) => {
    const { lines } = event.nativeEvent;
    const height = lines[0]?.height;
    if (!height) return;
    const multiline = lines.length > 1;
    // Android can reserve an extra line when text exactly fits the available width.
    const maxHeight = Platform.OS === 'android' ? Math.ceil(lines.reduce((sum, line) => sum + line.height, 0)) : undefined;
    setFirstLine((prev) => {
      if (prev && Math.abs(prev.height - height) < 0.5 && prev.multiline === multiline && prev.maxHeight === maxHeight) return prev;
      return { height, multiline, maxHeight };
    });
  }, []);
  const measuredTextStyle = firstLine?.maxHeight === undefined ? undefined : { maxHeight: firstLine.maxHeight };

  const tone =
    status === 'neutral'
      ? { main: colors.textSecondary, container: colors.surface2, onContainer: colors.text }
      : getPaletteColors(colors, status);
  const tonal = variant === 'tonal';
  const background = tonal ? tone.container : colors.background;
  const ink = tonal ? tone.onContainer : colors.text;

  if (!isVisible) return null;

  const handleClose = () => {
    if (visible === undefined) setInternalVisible(false);
    onClose?.();
  };

  const iconNode = icon === undefined ? <StatusIcon kind={ICON_KIND[status]} size={ICON_SIZE} color={tone.main} ink={background} /> : icon;
  const closeOffset = { marginVertical: ((firstLine?.height ?? FIRST_LINE_FALLBACK) - CLOSE_SIZE) / 2, marginEnd: -(CLOSE_SIZE - CLOSE_ICON) / 2 };

  return (
    <Animated.View
      entering={BANNER_ENTERING}
      exiting={BANNER_EXITING}
      layout={BANNER_LAYOUT}
      style={fullWidth ? styles.fullWidth : styles.hug}
    >
      <View
        accessibilityRole={status === 'error' || status === 'warning' ? 'alert' : 'summary'}
        accessibilityLiveRegion="polite"
        testID={testID}
        style={[
          styles.container,
          radiusStyle('xl'),
          { alignItems: title || firstLine?.multiline ? 'flex-start' : 'center', backgroundColor: background, borderColor: tonal ? 'transparent' : tone.main, borderWidth: tonal ? 0 : 1 },
          style,
        ]}
      >
        {iconNode != null ? <View style={[styles.iconSlot, firstLine ? { minHeight: firstLine.height } : null]}>{iconNode}</View> : null}

        <View style={[styles.content, fullWidth && styles.contentFill]}>
          {title != null ? (
            <ZSText variant="body2" emphasized color={ink} onTextLayout={handleFirstTextLayout} style={measuredTextStyle}>
              {title}
            </ZSText>
          ) : null}
          <ZSText
            variant="body2"
            emphasized={title == null}
            color={ink}
            onTextLayout={title == null ? handleFirstTextLayout : undefined}
            style={title == null ? measuredTextStyle : undefined}
          >
            {message}
          </ZSText>
          {action ? (
            <ZSPressable onPress={action.onPress} radius="full" pressedColor={ink} style={styles.action}>
              <ZSText variant="body2" emphasized color={tonal ? ink : tone.main}>
                {action.label}
              </ZSText>
            </ZSPressable>
          ) : null}
        </View>

        {onClose ? (
          <ZSPressable onPress={handleClose} radius="full" pressedColor={ink} accessibilityLabel={closeAccessibilityLabel ?? accessibilityLabels.closeMessage} testID={`${testID}-close`} style={[styles.close, closeOffset]}>
            <SvgX size={CLOSE_ICON} color={ink} />
          </ZSPressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default React.memo(ZSBanner);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACE.md,
    minHeight: MIN_HEIGHT,
    paddingVertical: SPACE.lg,
    paddingHorizontal: SPACE.lg,
  },
  fullWidth: { width: '100%' },
  hug: { alignSelf: 'flex-start' },
  iconSlot: { justifyContent: 'center', flexShrink: 0, minHeight: FIRST_LINE_FALLBACK },
  content: { flexShrink: 1, gap: SPACE.xs },
  contentFill: { flex: 1 },
  action: { alignSelf: 'flex-start', marginTop: SPACE.xs, paddingVertical: SPACE.xs },
  close: { width: CLOSE_SIZE, height: CLOSE_SIZE, alignItems: 'center', justifyContent: 'center' },
});
