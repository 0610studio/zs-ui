import React, { useEffect, useRef, useState } from 'react';
import { PixelRatio, Platform, StyleSheet, View, type BoxShadowValue, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import ZSText from '../ZSText';
import ZSPressable from '../ZSPressable';
import { useTheme } from '../../context/ThemeContext';
import { minFontSizeMultiplier } from '../../theme/fontScale';
import { useControllableState } from '../../model/useControllableState';
import { withOpacity } from '../../theme/color';
import { springConfig } from '../../theme/motion';
import { radiusStyle } from '../../theme/radius';
import { SPACE } from '../../theme/spacing';
import { OPACITY } from '../../theme/state';

export interface ZSSegmentedControlOption<T extends string | number = string> {
  label: string;
  value: T;
  accessibilityLabel?: string;
}

export interface ZSSegmentedControlProps<T extends string | number = string> {
  options: ZSSegmentedControlOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T, index: number) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const TRACK_HEIGHT = 40;
const TRACK_BORDER_WIDTH = 1;
const THUMB_INSET = TRACK_BORDER_WIDTH + SPACE.xxs;
const SEGMENT_PADDING_X = SPACE.md;
const THUMB_EDGE_WIDTH = 0.5;
const THUMB_EDGE_OPACITY = 0.08;
const THUMB_SHADOW: Omit<BoxShadowValue, 'color'> = { offsetX: 0, offsetY: 1, blurRadius: 3 };
const THUMB_SHADOW_OPACITY = 0.08;

type SegmentLayout = { x: number; width: number };

function ZSSegmentedControl<T extends string | number = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  fullWidth = true,
  accessibilityLabel,
  style,
  testID,
}: ZSSegmentedControlProps<T>) {
  const { colors, mode, maxFontSizeMultiplier } = useTheme();
  const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.value);
  const index = Math.max(0, options.findIndex((option) => option.value === current));
  const ios = Platform.OS === 'ios';

  const [layouts, setLayouts] = useState<SegmentLayout[]>([]);
  const [labelWidths, setLabelWidths] = useState<number[]>([]);
  const active = layouts[index];

  const thumbX = useSharedValue(0);
  const thumbWidth = useSharedValue(0);
  const trackStart = useSharedValue(0);
  const trackEnd = useSharedValue(0);
  const positioned = useRef(false);

  const first = layouts[0];
  const last = layouts[options.length - 1];
  useEffect(() => {
    if (!first || !last) return;
    trackStart.value = first.x;
    trackEnd.value = last.x + last.width;
  }, [first, last, trackStart, trackEnd]);

  useEffect(() => {
    if (!active || active.width <= 0) return;
    if (!positioned.current) {
      positioned.current = true;
      thumbX.value = active.x;
      thumbWidth.value = active.width;
      return;
    }
    thumbX.value = withSpring(active.x, springConfig('move', 'fast'));
    thumbWidth.value = withSpring(active.width, springConfig('move', 'fast'));
  }, [active, thumbX, thumbWidth]);

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const start = trackStart.value;
    const end = trackEnd.value;
    if (end <= start) return { width: thumbWidth.value, transform: [{ translateX: thumbX.value }] };
    const left = Math.min(Math.max(thumbX.value, start), end);
    const right = Math.max(Math.min(thumbX.value + thumbWidth.value, end), left);
    return { width: right - left, transform: [{ translateX: left }] };
  });

  const handleSegmentLayout = (segmentIndex: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => {
      const previous = prev[segmentIndex];
      if (previous?.x === x && previous?.width === width) return prev;
      const next = [...prev];
      next[segmentIndex] = { x, width };
      return next;
    });
  };

  const handleLabelLayout = (segmentIndex: number) => (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setLabelWidths((prev) => {
      if (prev[segmentIndex] === width) return prev;
      const next = [...prev];
      next[segmentIndex] = width;
      return next;
    });
  };

  const measuredLabels = labelWidths.slice(0, options.length);
  const hugSegmentWidth =
    !fullWidth && measuredLabels.length === options.length && measuredLabels.every((width) => width > 0)
      ? Math.max(...measuredLabels) + SEGMENT_PADDING_X * 2
      : undefined;

  const handlePress = (optionValue: T, segmentIndex: number) => {
    if (disabled || segmentIndex === index) return;
    setCurrent(optionValue);
    onValueChange?.(optionValue, segmentIndex);
  };

  const disabledLabelColor = withOpacity(colors.text, OPACITY.disabled);
  const labelMaxScale = minFontSizeMultiplier(1.6, maxFontSizeMultiplier);
  const ratio = PixelRatio.get();
  const thumbEdgeWidth = Math.max(1, Math.round(THUMB_EDGE_WIDTH * ratio)) / ratio;
  const thumbFill = mode === 'dark' ? colors.surface4 : colors.surface1;
  const thumbShadow = mode === 'dark' || disabled ? null : { boxShadow: [{ ...THUMB_SHADOW, color: withOpacity(colors.shadow, THUMB_SHADOW_OPACITY) }] };

  return (
    <View style={[styles.wrapper, fullWidth && styles.fullWidth, style]}>
      <View
        accessibilityRole={ios ? undefined : 'radiogroup'}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[styles.track, fullWidth && styles.trackFill, { backgroundColor: colors.surface2 }]}
      >
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, radiusStyle('full'), { borderWidth: TRACK_BORDER_WIDTH, borderColor: colors.border }]} />
        {(active?.width ?? 0) > 0 && (
          <Animated.View
            testID="zs-segment-thumb"
            pointerEvents="none"
            style={[
              styles.thumb,
              { backgroundColor: thumbFill, borderWidth: thumbEdgeWidth, borderColor: withOpacity(colors.text, THUMB_EDGE_OPACITY) },
              thumbShadow,
              thumbAnimatedStyle,
            ]}
          />
        )}
        {fullWidth ? null : (
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.measure}>
            {options.map((option, segmentIndex) => (
              <ZSText
                key={`${segmentIndex}-${option.value}`}
                variant="subtitle2"
                emphasized
                numberOfLines={1}
                maxFontSizeMultiplier={labelMaxScale}
                onLayout={handleLabelLayout(segmentIndex)}
              >
                {option.label}
              </ZSText>
            ))}
          </View>
        )}
        {options.map((option, segmentIndex) => {
          const selected = segmentIndex === index;
          return (
            <ZSPressable
              key={`${segmentIndex}-${option.value}`}
              testID={`zs-segment-${segmentIndex}`}
              radius="full"
              disabled={disabled}
              onPress={() => handlePress(option.value, segmentIndex)}
              onLayout={handleSegmentLayout(segmentIndex)}
              accessibilityRole={ios ? 'button' : 'radio'}
              accessibilityLabel={option.accessibilityLabel ?? option.label}
              accessibilityHint={ios ? accessibilityLabel : undefined}
              accessibilityState={ios ? { selected, disabled } : { checked: selected, disabled }}
              style={[styles.segment, fullWidth && styles.segmentFill, hugSegmentWidth !== undefined && { minWidth: hugSegmentWidth }, disabled && styles.opaque]}
            >
              <ZSText
                variant="subtitle2"
                emphasized={selected}
                color={disabled ? disabledLabelColor : selected ? colors.text : colors.textSecondary}
                numberOfLines={1}
                maxFontSizeMultiplier={labelMaxScale}
              >
                {option.label}
              </ZSText>
            </ZSPressable>
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(ZSSegmentedControl) as typeof ZSSegmentedControl;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  track: {
    flexDirection: 'row',
    minHeight: TRACK_HEIGHT,
    padding: THUMB_INSET,
    ...radiusStyle('full'),
  },
  trackFill: {
    flex: 1,
  },
  thumb: {
    position: 'absolute',
    top: THUMB_INSET,
    bottom: THUMB_INSET,
    left: 0,
    ...radiusStyle('full'),
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TRACK_HEIGHT - THUMB_INSET * 2,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SEGMENT_PADDING_X,
  },
  segmentFill: {
    flex: 1,
  },
  opaque: {
    opacity: 1,
  },
  measure: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    alignItems: 'flex-start',
  },
});
