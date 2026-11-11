import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { getPaletteColors, withOpacity, type PaletteColor, type ThemeColors } from '../../theme/color';
import { DURATION, springConfig, timingConfig } from '../../theme/motion';
import { SPACE } from '../../theme/spacing';
import { OPACITY } from '../../theme/state';
import type { TextVariant } from '../../theme/typeScale';
import { mixHex } from '../hexColor';
import { AnimatedZSPressable } from '../ZSPressable';
import ZSText from '../ZSText';

export type ZSButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';
export type ZSButtonSize = 'small' | 'medium' | 'large';

export interface ZSButtonProps {
  title: string;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: ZSButtonVariant;
  color?: PaletteColor;
  size?: ZSButtonSize;
  icon?: ImageSourcePropType | React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  preventDoublePress?: boolean;
  disabled?: boolean;
  maxFontSizeMultiplier?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

interface SizeSpec {
  height: number;
  paddingHorizontal: number;
  variant: TextVariant;
  icon: number;
}

const SIZES: Record<ZSButtonSize, SizeSpec> = {
  small: { height: 36, paddingHorizontal: SPACE.lg, variant: 'subtitle2', icon: 18 },
  medium: { height: 48, paddingHorizontal: SPACE.xl, variant: 'subtitle2', icon: 20 },
  large: { height: 56, paddingHorizontal: SPACE['2xl'], variant: 'subtitle1', icon: 22 },
};

const OUTLINE_INK_MIX = 0.12;

interface VariantColors {
  container: string | undefined;
  content: string;
  border: string | undefined;
}

function variantColors(colors: ThemeColors, color: PaletteColor, variant: ZSButtonVariant): VariantColors {
  const tone = getPaletteColors(colors, color);
  const ink = color === 'primary' ? colors.text : tone.main;
  switch (variant) {
    case 'filled':
      return { container: tone.main, content: tone.onMain, border: undefined };
    case 'tonal':
      return { container: tone.container, content: tone.onContainer, border: undefined };
    case 'outlined':
      return { container: undefined, content: ink, border: mixHex(colors.text, colors.border, OUTLINE_INK_MIX) ?? colors.border };
    default:
      return { container: undefined, content: ink, border: undefined };
  }
}

const PRESSED_SCALE = 0.97;

function isImageSource(icon: unknown): icon is ImageSourcePropType {
  return typeof icon === 'number' || (typeof icon === 'object' && icon !== null && 'uri' in (icon as object));
}

function ZSButton({
  title,
  onPress,
  onLongPress,
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  icon,
  fullWidth = false,
  loading = false,
  preventDoublePress = false,
  disabled = false,
  maxFontSizeMultiplier,
  style,
  testID,
  accessibilityLabel,
}: ZSButtonProps) {
  const { colors, typography } = useTheme();
  const android = Platform.OS === 'android';
  const spec = SIZES[size];
  const palette = variantColors(colors, color, variant);
  const emphasized = variant === 'filled';

  const containerColor = disabled
    ? palette.container
      ? withOpacity(colors.text, OPACITY.disabledBackground)
      : undefined
    : palette.container;
  const contentColor = disabled ? withOpacity(colors.text, OPACITY.disabled) : palette.content;
  const borderColor = disabled && palette.border ? withOpacity(colors.text, OPACITY.disabledBackground) : palette.border;
  const paddingVertical = Math.max(0, (spec.height - (typography[spec.variant].lineHeight ?? spec.height)) / 2 - (borderColor ? 1 : 0));

  const press = useSharedValue(0);
  const pressStyle = useAnimatedStyle(() => (android ? {} : { transform: [{ scale: 1 - (1 - PRESSED_SCALE) * press.value }] }));

  const handlePressIn = useCallback(() => {
    if (!android) press.value = withSpring(1, springConfig('move', 'fast'));
  }, [android, press]);
  const handlePressOut = useCallback(() => {
    if (!android) press.value = withSpring(0, springConfig('fade', 'fast'));
  }, [android, press]);

  const content = useSharedValue(loading ? 0 : 1);
  useEffect(() => {
    content.value = withTiming(loading ? 0 : 1, timingConfig('fast'));
  }, [content, loading]);
  const contentStyle = useAnimatedStyle(() => ({ opacity: content.value }));

  return (
    <AnimatedZSPressable
      animated
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      loading={loading}
      preventDoublePress={preventDoublePress}
      disabled={disabled}
      radius="full"
      pressedColor={contentColor}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? title}
      style={[
        {
          minHeight: spec.height,
          paddingVertical,
          paddingHorizontal: variant === 'text' ? Math.max(SPACE.md, spec.paddingHorizontal - SPACE.sm) : spec.paddingHorizontal,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: containerColor,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
        },
        disabled || loading ? { opacity: 1 } : null,
        pressStyle,
        style,
      ]}
    >
      <Animated.View style={[styles.content, contentStyle]}>
        {icon ? (
          isImageSource(icon) ? (
            <Image source={icon} style={{ width: spec.icon, height: spec.icon }} tintColor={contentColor} />
          ) : (
            <View>{icon}</View>
          )
        ) : null}
        <ZSText variant={spec.variant} emphasized={emphasized} color={contentColor} numberOfLines={1} maxFontSizeMultiplier={maxFontSizeMultiplier}>
          {title}
        </ZSText>
      </Animated.View>
      {loading ? (
        <Animated.View entering={FadeIn.duration(DURATION.fast)} exiting={FadeOut.duration(DURATION.fast)} pointerEvents="none" style={styles.spinner}>
          <ActivityIndicator size="small" color={contentColor} />
        </Animated.View>
      ) : null}
    </AnimatedZSPressable>
  );
}

export default React.memo(ZSButton);

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, flexShrink: 1 },
  spinner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
