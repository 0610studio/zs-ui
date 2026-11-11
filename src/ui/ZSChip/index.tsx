import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { minFontSizeMultiplier } from '../../theme/fontScale';
import { getPaletteColors, withOpacity, type PaletteColor } from '../../theme/color';
import { springConfig } from '../../theme/motion';
import { SPACE } from '../../theme/spacing';
import { OPACITY } from '../../theme/state';
import { useControllableState } from '../../model/useControllableState';
import { SvgCheck } from '../../assets/SvgCheck';
import ZSPressable from '../ZSPressable';
import ZSText from '../ZSText';

export interface ZSChipProps {
  label: string;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  color?: PaletteColor;
  checkIcon?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const CHECK_SIZE = 18;
const CHIP_HEIGHT = 36;
const BORDER_WIDTH = 1;
const LEADING_GAP = SPACE.sm;
const EDGE_PADDING = SPACE.lg;
const LEADING_PADDING = SPACE.sm;
const CHECK_ENTER_SCALE = 0.55;

function clamp01(value: number): number {
  'worklet';
  return Math.min(1, Math.max(0, value));
}

function useCheckStyle(progress: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    opacity: clamp01(progress.value),
    transform: [{ scale: CHECK_ENTER_SCALE + (1 - CHECK_ENTER_SCALE) * progress.value }],
  }));
}

/**
 * 아이콘 없는 칩의 체크 자리 — 왼쪽 여백(16→8)과 체크 자리 폭(0→26)을 한 뷰의 paddingLeft·width 로 함께 움직인다.
 * 체크는 여백 끝에서 시작하고 뷰 오른쪽 끝에서 잘리므로, 칩 여백·자리를 따로 움직이던 때와 매 프레임 같다.
 */
function GrowingCheck({ progress, color }: { progress: SharedValue<number>; color: string }) {
  const slotStyle = useAnimatedStyle(() => {
    const edge = EDGE_PADDING - (EDGE_PADDING - LEADING_PADDING) * progress.value;
    return { paddingLeft: edge, width: edge + Math.max(0, (CHECK_SIZE + LEADING_GAP) * progress.value) };
  });
  const checkStyle = useCheckStyle(progress);
  return (
    <Animated.View style={[styles.growingSlot, slotStyle]}>
      <Animated.View style={[styles.check, checkStyle]}>
        <SvgCheck size={CHECK_SIZE} color={color} />
      </Animated.View>
    </Animated.View>
  );
}

/** 아이콘 칩 — 선택되면 아이콘과 체크가 같은 자리에서 맞바꾸는 페이드 */
function IconCheck({ progress, color, icon }: { progress: SharedValue<number>; color: string; icon: React.ReactNode }) {
  const iconStyle = useAnimatedStyle(() => ({ opacity: clamp01(1 - progress.value) }));
  const checkStyle = useCheckStyle(progress);
  return (
    <View style={styles.iconSlot}>
      <Animated.View style={iconStyle}>{icon}</Animated.View>
      <Animated.View style={[styles.check, styles.checkOverIcon, checkStyle]}>
        <SvgCheck size={CHECK_SIZE} color={color} />
      </Animated.View>
    </View>
  );
}

function ZSChip({ label, selected, defaultSelected = false, onSelectedChange, color = 'primary', checkIcon = true, icon, disabled = false, style, testID }: ZSChipProps) {
  const { colors, typography, maxFontSizeMultiplier } = useTheme();
  const [isSelected, setSelected] = useControllableState(selected, defaultSelected, onSelectedChange);
  const tone = getPaletteColors(colors, color);

  const contentColor = disabled
    ? withOpacity(colors.text, OPACITY.disabled)
    : isSelected
      ? tone.onMain
      : colors.text;
  const containerColor = isSelected ? (disabled ? withOpacity(colors.text, OPACITY.disabledBackground) : tone.main) : colors.surface2;
  const borderColor = isSelected ? 'transparent' : disabled ? withOpacity(colors.text, OPACITY.disabledBackground) : colors.border;

  const progress = useSharedValue(isSelected ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, springConfig('move', 'fast'));
  }, [progress, isSelected]);

  // 처음 선택되기 전에는 체크와 그 애니메이션 스타일을 만들지 않는다 — 안 보이는 체크에 칩마다 드는 마운트 비용을 아낀다.
  // 선택되는 렌더에서 바로 만들고 progress 0(투명·폭 0)에서 움직이기 시작하므로 보이는 것은 같다.
  const [checkReady, setCheckReady] = useState(isSelected);
  if (isSelected && !checkReady) setCheckReady(true);

  const hasIcon = icon != null && icon !== false && icon !== '';
  const growing = checkIcon && !hasIcon;
  const restPadding = hasIcon ? LEADING_PADDING : EDGE_PADDING;
  const animatedLeading = checkIcon && checkReady;

  const handlePress = () => setSelected(!isSelected);

  let leading: React.ReactNode = null;
  if (growing && animatedLeading) {
    leading = <GrowingCheck progress={progress} color={contentColor} />;
  } else if (hasIcon) {
    leading = animatedLeading ? <IconCheck progress={progress} color={contentColor} icon={icon} /> : <View style={styles.iconSlot}>{icon}</View>;
  }

  return (
    <ZSPressable
      onPress={handlePress}
      disabled={disabled}
      radius="full"
      pressedColor={contentColor}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled }}
      accessibilityLabel={label}
      style={[
        {
          alignSelf: 'flex-start',
          minHeight: CHIP_HEIGHT,
          paddingVertical: Math.max(0, (CHIP_HEIGHT - (typography.subtitle2.lineHeight ?? CHIP_HEIGHT)) / 2 - BORDER_WIDTH),
          paddingLeft: growing && animatedLeading ? 0 : restPadding,
          paddingRight: EDGE_PADDING,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: containerColor,
          borderWidth: BORDER_WIDTH,
          borderColor,
        },
        disabled ? { opacity: 1 } : null,
        style,
      ]}
    >
      {leading}
      <ZSText variant="subtitle2" emphasized={isSelected} color={contentColor} numberOfLines={1} maxFontSizeMultiplier={minFontSizeMultiplier(1.6, maxFontSizeMultiplier)}>
        {label}
      </ZSText>
    </ZSPressable>
  );
}

export default React.memo(ZSChip);

const styles = StyleSheet.create({
  growingSlot: { overflow: 'hidden', alignItems: 'flex-start' },
  check: { width: CHECK_SIZE, height: CHECK_SIZE },
  iconSlot: { marginEnd: LEADING_GAP, alignItems: 'center', justifyContent: 'center' },
  checkOverIcon: { position: 'absolute' },
});
