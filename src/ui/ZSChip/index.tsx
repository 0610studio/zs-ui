import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ZSText from "../ZSText";
import { useTheme } from "../../context/ThemeContext";
import { resolveTextColor } from "../../theme/resolveColor";
import { SvgCheck } from "../../assets/SvgCheck";
import type { IntentOptions, TypoColorOptions, TypoSubStyle } from "../../theme/types";
import { PASTEL_TEXT_COLOR, SOLID_TEXT_COLOR, STROKE_TEXT_COLOR } from "../../theme/intentColors";
import { DISABLED_OPACITY, DURATION, RADIUS } from "../../theme/tokens";

const ANIMATION_DURATION = DURATION.base;
const PRESS_DURATION = DURATION.press;
const PRESS_SCALE = 0.04;

export type ZSChipVariant = 'pastel' | 'solid' | 'stroke';

const PADDING_HORIZONTAL: Record<TypoSubStyle, number> = { '1': 18, '2': 16, '3': 14, '4': 12, '5': 10, '6': 9 };
const PADDING_VERTICAL: Record<TypoSubStyle, number> = { '1': 10, '2': 9, '3': 8, '4': 7, '5': 5, '6': 4 };
const CHECK_ICON_SIZE: Record<TypoSubStyle, number> = { '1': 18, '2': 17, '3': 15, '4': 14, '5': 12, '6': 11 };

export interface ZSChipProps extends ViewProps {
  label: string;
  /** 미지정 시 내부 상태로 토글 */
  selected?: boolean;
  initialSelected?: boolean;
  onChange?: (selected: boolean) => void;
  intent?: IntentOptions;
  /** 기본: pastel */
  variant?: ZSChipVariant;
  textSize?: TypoSubStyle;
  /** 선택 시 체크 아이콘 */
  checkIcon?: boolean;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

function ZSChip({
  label,
  selected,
  initialSelected = false,
  onChange,
  intent = 'primary',
  variant = 'pastel',
  textSize = '3',
  checkIcon = false,
  leftIcon,
  disabled = false,
  style,
  ...props
}: ZSChipProps) {
  const { palette } = useTheme();
  const [internalSelected, setInternalSelected] = useState(initialSelected);
  const isSelected = selected ?? internalSelected;
  const progress = useSharedValue(isSelected ? 1 : 0);
  const pressProgress = useSharedValue(0);

  const unselectedBackground = palette.background.base;
  const unselectedBorder = palette.grey[30];
  const selectedColors: { background: string; border: string; text: TypoColorOptions } = variant === 'solid'
    ? { background: palette[intent][50], border: palette[intent][50], text: SOLID_TEXT_COLOR[intent] }
    : variant === 'pastel'
      ? { background: palette[intent][10], border: palette[intent][30], text: PASTEL_TEXT_COLOR[intent] }
      : { background: unselectedBackground, border: palette[intent][50], text: STROKE_TEXT_COLOR[intent] };

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.quad),
    });
  }, [isSelected, progress]);

  const chipAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [unselectedBackground, selectedColors.background]),
    borderColor: interpolateColor(progress.value, [0, 1], [unselectedBorder, selectedColors.border]),
    transform: [{ scale: 1 - pressProgress.value * PRESS_SCALE }],
  }));

  const handlePress = () => {
    if (disabled) return;
    const next = !isSelected;
    if (selected === undefined) setInternalSelected(next);
    onChange?.(next);
  };

  const textColor: TypoColorOptions = isSelected ? selectedColors.text : 'secondary';

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => { pressProgress.value = withTiming(1, { duration: PRESS_DURATION }); }}
      onPressOut={() => { pressProgress.value = withTiming(0, { duration: PRESS_DURATION }); }}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityState={{ selected: isSelected, disabled }}
      style={styles.pressable}
      {...props}
    >
      <Animated.View
        style={[
          styles.chip,
          {
            paddingHorizontal: PADDING_HORIZONTAL[textSize],
            paddingVertical: PADDING_VERTICAL[textSize],
            opacity: disabled ? DISABLED_OPACITY : 1,
          },
          chipAnimatedStyle,
          style,
        ]}
      >
        {leftIcon}
        {checkIcon && isSelected && (
          <Animated.View testID='zs-chip-check'>
            <SvgCheck
              size={CHECK_ICON_SIZE[textSize]}
              color={resolveTextColor(palette, textColor)}
              strokeWidth='2.4'
            />
          </Animated.View>
        )}
        <ZSText
          typo={`body.${textSize}`}
          color={textColor}
          allowFontScaling={false}
          numberOfLines={1}
        >
          {label}
        </ZSText>
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(ZSChip);

const styles = StyleSheet.create({
  // flexWrap 부모에서 콘텐츠 폭으로 렌더되도록 hug
  pressable: {
    alignSelf: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: RADIUS.pill,
  },
});
