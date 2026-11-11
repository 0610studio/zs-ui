import React from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { SvgChevron } from '../../../assets/SvgChevron';
import { withOpacity } from '../../../theme/color';
import { springConfig } from '../../../theme/motion';
import { radiusStyle } from '../../../theme/radius';
import { SPACE } from '../../../theme/spacing';
import { MIN_TOUCH_TARGET, OPACITY } from '../../../theme/state';
import ZSText from '../../ZSText';
import type { DateString } from '../core';

export interface CalendarHeaderContext {
  visibleMonth: DateString;
  onPrev: () => void;
  onNext: () => void;
  onTitlePress?: () => void;
}

export interface CalendarHeaderProps extends CalendarHeaderContext {
  monthTitle: (year: number, month: number) => string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  style?: StyleProp<ViewStyle>;
}

export const headerButtonSize = (): number => (Platform.OS === 'android' ? MIN_TOUCH_TARGET.android : MIN_TOUCH_TARGET.ios);
export const HEADER_CHEVRON_SIZE = 24;

interface HeaderButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  testID: string;
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

function HeaderButton({ onPress, accessibilityLabel, testID, style, children }: HeaderButtonProps) {
  const { colors } = useTheme();
  const stateColor = withOpacity(colors.text, OPACITY.pressed);
  const highlight = useSharedValue(0);
  const highlightStyle = useAnimatedStyle(() => ({ opacity: highlight.value }));
  const isAndroid = Platform.OS === 'android';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={isAndroid ? undefined : () => {
        cancelAnimation(highlight);
        highlight.value = 1;
      }}
      onPressOut={isAndroid ? undefined : () => {
        highlight.value = withSpring(0, springConfig('fade', 'fast'));
      }}
      hitSlop={SPACE.md}
      android_ripple={isAndroid ? { color: stateColor, foreground: true } : undefined}
      style={[radiusStyle('full'), styles.clip, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
      {isAndroid ? null : (
        <Animated.View pointerEvents="none" style={[styles.highlight, { backgroundColor: stateColor }, highlightStyle]} />
      )}
    </Pressable>
  );
}

export default function CalendarHeader({
  visibleMonth,
  onPrev,
  onNext,
  onTitlePress,
  monthTitle,
  prevMonthLabel,
  nextMonthLabel,
  style,
}: CalendarHeaderProps) {
  const { colors } = useTheme();
  const year = Number(visibleMonth.slice(0, 4));
  const month = Number(visibleMonth.slice(5, 7));
  const title = monthTitle(year, month);
  const titleText = <ZSText variant="subtitle1">{title}</ZSText>;
  const size = headerButtonSize();
  const arrowStyle = [styles.arrow, { width: size, height: size }];
  const titleStyle = [styles.title, { minHeight: size }];

  return (
    <View style={[styles.header, style]} testID="calendar-header">
      <HeaderButton onPress={onPrev} accessibilityLabel={prevMonthLabel} testID="calendar-header-prev" style={arrowStyle}>
        <SvgChevron direction="left" size={HEADER_CHEVRON_SIZE} color={colors.text} />
      </HeaderButton>

      {onTitlePress ? (
        <HeaderButton onPress={onTitlePress} accessibilityLabel={title} testID="calendar-header-title" style={titleStyle}>
          {titleText}
        </HeaderButton>
      ) : (
        <View accessible accessibilityRole="header" accessibilityLabel={title} testID="calendar-header-title" style={titleStyle}>
          {titleText}
        </View>
      )}

      <HeaderButton onPress={onNext} accessibilityLabel={nextMonthLabel} testID="calendar-header-next" style={arrowStyle}>
        <SvgChevron direction="right" size={HEADER_CHEVRON_SIZE} color={colors.text} />
      </HeaderButton>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACE.xs,
    paddingVertical: SPACE.sm,
  },
  clip: { overflow: 'hidden' },
  arrow: { alignItems: 'center', justifyContent: 'center' },
  title: { flexShrink: 1, paddingHorizontal: SPACE.md, justifyContent: 'center' },
  highlight: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
