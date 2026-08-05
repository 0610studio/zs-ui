import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ZSText from "../ZSText";
import { useTheme } from "../../context/ThemeContext";
import { DISABLED_OPACITY, DURATION } from "../../theme/tokens";

const ANIMATION_DURATION = DURATION.slow;
const CONTAINER_INSET = 3;
const SEGMENT_HORIZONTAL_PADDING = 14;

export type ZSSegmentedTextSize = '1' | '2' | '3' | '4' | '5' | '6';

export interface ZSSegmentedProps extends ViewProps {
  /** 세그먼트 라벨 목록 (2개 이상) */
  options: string[];
  /** 선택 인덱스를 외부에서 제어할 때 사용 (미지정 시 내부 상태로 동작) */
  selectedIndex?: number;
  /** 비제어 모드의 초기 선택 인덱스 */
  initialIndex?: number;
  onChange?: (index: number) => void;
  /** true(기본): 부모 폭을 가득 채움 · false: 가장 긴 라벨 폭에 맞춰 콘텐츠 크기로 렌더링 */
  fullWidth?: boolean;
  containerHeight?: number;
  textSize?: ZSSegmentedTextSize;
  /** 트랙 배경색 (기본: palette.background.layer2) */
  trackColor?: string;
  /** 선택 블럭 색상 (기본: palette.background.base) */
  thumbColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

function ZSSegmented({
  options,
  selectedIndex,
  initialIndex = 0,
  onChange,
  fullWidth = true,
  containerHeight = 40,
  textSize = '2',
  trackColor,
  thumbColor,
  disabled = false,
  style,
  onLayout,
  ...props
}: ZSSegmentedProps) {
  const { palette } = useTheme();
  const [internalIndex, setInternalIndex] = useState(initialIndex);
  const [trackWidth, setTrackWidth] = useState(0);
  const [labelWidths, setLabelWidths] = useState<number[]>([]);
  const translateX = useSharedValue(0);

  const count = Math.max(options.length, 1);
  const index = Math.min(selectedIndex ?? internalIndex, count - 1);
  const measuredWidths = labelWidths.slice(0, count);
  const maxLabelWidth = measuredWidths.length === count && measuredWidths.every(w => w > 0)
    ? Math.max(...measuredWidths)
    : 0;
  const segmentWidth = fullWidth
    ? (trackWidth > 0 ? (trackWidth - CONTAINER_INSET * 2) / count : 0)
    : (maxLabelWidth > 0 ? Math.ceil(maxLabelWidth) + SEGMENT_HORIZONTAL_PADDING * 2 : 0);

  useEffect(() => {
    if (segmentWidth <= 0) return;
    translateX.value = withTiming(index * segmentWidth, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.quad),
    });
  }, [index, segmentWidth, translateX]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(prev => (prev === width ? prev : width));
    onLayout?.(event);
  };

  const handlePress = (nextIndex: number) => {
    if (disabled || nextIndex === index) return;
    if (selectedIndex === undefined) setInternalIndex(nextIndex);
    onChange?.(nextIndex);
  };

  return (
    <View
      style={[
        styles.container,
        fullWidth ? styles.fullWidth : styles.hugContent,
        {
          height: containerHeight,
          borderRadius: containerHeight / 2,
          backgroundColor: trackColor ?? palette.background.layer2,
          opacity: disabled ? DISABLED_OPACITY : 1,
        },
        style,
      ]}
      onLayout={handleLayout}
      accessibilityRole='tablist'
      {...props}
    >
      {/* 라벨 폭 측정용 히든 박스 — 활성(굵은) typo 기준으로 측정해 상태 전환 시 넘침 방지 */}
      {!fullWidth && (
        <View
          pointerEvents='none'
          accessible={false}
          importantForAccessibility='no-hide-descendants'
          style={styles.measureBox}
        >
          {options.map((label, optionIndex) => (
            <ZSText
              key={`measure_${optionIndex}_${label}`}
              typo={`subTitle.${textSize}`}
              allowFontScaling={false}
              numberOfLines={1}
              onLayout={event => {
                const measuredWidth = event.nativeEvent.layout.width;
                setLabelWidths(prev => {
                  if (prev[optionIndex] === measuredWidth) return prev;
                  const next = [...prev];
                  next[optionIndex] = measuredWidth;
                  return next;
                });
              }}
            >
              {label}
            </ZSText>
          ))}
        </View>
      )}
      {segmentWidth > 0 && (
        <Animated.View
          testID='zs-segmented-thumb'
          pointerEvents='none'
          style={[
            styles.thumb,
            {
              width: segmentWidth,
              height: containerHeight - CONTAINER_INSET * 2,
              borderRadius: (containerHeight - CONTAINER_INSET * 2) / 2,
              backgroundColor: thumbColor ?? palette.background.base,
              // 다크 모드에서는 밝은 그림자로 thumb 를 구분
              shadowColor: palette.grey[100],
            },
            thumbAnimatedStyle,
          ]}
        />
      )}

      {options.map((label, optionIndex) => {
        const isActive = optionIndex === index;
        return (
          <Pressable
            key={`${optionIndex}_${label}`}
            testID={`zs-segmented-segment-${optionIndex}`}
            style={[styles.segment, fullWidth ? styles.segmentFlex : { width: segmentWidth > 0 ? segmentWidth : undefined }]}
            onPress={() => handlePress(optionIndex)}
            disabled={disabled}
            accessibilityRole='tab'
            accessibilityState={{ selected: isActive }}
          >
            <ZSText
              typo={isActive ? `subTitle.${textSize}` : `body.${textSize}`}
              color={isActive ? 'base' : 'secondary'}
              allowFontScaling={false}
              numberOfLines={1}
            >
              {label}
            </ZSText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default React.memo(ZSSegmented);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: CONTAINER_INSET,
    position: 'relative',
  },
  // flexWrap 부모에서도 폭이 부모 기준으로 고정되도록 stretch 대신 100% 사용
  fullWidth: {
    width: '100%',
  },
  hugContent: {
    alignSelf: 'flex-start',
  },
  measureBox: {
    position: 'absolute',
    width: 2000,
    opacity: 0,
    flexDirection: 'row',
    gap: 20,
  },
  thumb: {
    position: 'absolute',
    top: CONTAINER_INSET,
    left: CONTAINER_INSET,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentFlex: {
    flex: 1,
  },
});
