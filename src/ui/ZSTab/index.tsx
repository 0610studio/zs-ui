import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ZSText from "../ZSText";
import { useTheme } from "../../context/ThemeContext";
import { STROKE_TEXT_COLOR } from "../../theme/intentColors";
import { DISABLED_OPACITY, DURATION } from "../../theme/tokens";
import type { IntentOptions, TypoColorOptions, TypoSubStyle } from "../../theme/types";

const ANIMATION_DURATION = DURATION.slow;
const TIMING_CONFIG = { duration: ANIMATION_DURATION, easing: Easing.out(Easing.quad) } as const;
const INDICATOR_HEIGHT = 2;
const DIVIDER_WIDTH = 1;
const HUG_GAP = 20;

/** typo 크기(subStyle)별 아이템 세로 패딩 */
const PADDING_VERTICAL: Record<TypoSubStyle, number> = { '1': 14, '2': 13, '3': 12, '4': 10, '5': 9, '6': 8 };

export type ZSTabLayout = 'fill' | 'hug';

export interface ZSTabItem {
  /** 아이템 식별자. onChange 로 되돌려준다 */
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ZSTabProps extends ViewProps {
  items: ZSTabItem[];
  /** 선택 값을 외부에서 제어할 때 사용 (미지정 시 내부 상태로 동작) */
  value?: string;
  /** 비제어 모드의 초기 선택 값 (미지정 시 첫 아이템) */
  initialValue?: string;
  onChange?: (value: string, index: number) => void;
  /** fill(기본): 부모 폭을 균등 분할 · hug: 라벨 폭에 맞춰 좌측 정렬 */
  layout?: ZSTabLayout;
  intent?: IntentOptions;
  textSize?: TypoSubStyle;
  /** 인디케이터 색상 (기본: palette[intent][50]) */
  indicatorColor?: string;
  /** 탭 하단 구분선 표시 (기본: true) */
  showDivider?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

type ItemLayout = { x: number; width: number };

/**
 * 하단 인디케이터형 탭. 선택된 아이템 아래로 밑줄이 미끄러지며 이동한다.
 *
 * 트랙 안에서 블록이 움직이는 형태가 필요하면 ZSSegmented 를 사용한다.
 *
 * @example
 * ```tsx
 * <ZSTab items={[{ value: 'all', label: '전체' }, { value: 'done', label: '완료' }]} onChange={setTab} />
 * <ZSTab items={items} value={tab} onChange={setTab} layout='hug' intent='danger' />
 * ```
 */
function ZSTab({
  items,
  value,
  initialValue,
  onChange,
  layout = 'fill',
  intent = 'primary',
  textSize = '2',
  indicatorColor,
  showDivider = true,
  disabled = false,
  style,
  ...props
}: ZSTabProps) {
  const { palette } = useTheme();
  const [internalValue, setInternalValue] = useState(initialValue ?? items[0]?.value);
  const [itemLayouts, setItemLayouts] = useState<ItemLayout[]>([]);

  const currentValue = value ?? internalValue;
  const foundIndex = items.findIndex(item => item.value === currentValue);
  const index = foundIndex >= 0 ? foundIndex : 0;

  const activeLayout = itemLayouts[index];
  const isMeasured = (activeLayout?.width ?? 0) > 0;

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  // 최초 측정 시엔 0 에서 미끄러져 들어오지 않도록 애니메이션 없이 배치한다.
  const hasPositioned = useRef(false);

  useEffect(() => {
    if (!activeLayout || activeLayout.width <= 0) return;

    if (!hasPositioned.current) {
      hasPositioned.current = true;
      indicatorX.value = activeLayout.x;
      indicatorWidth.value = activeLayout.width;
      return;
    }
    indicatorX.value = withTiming(activeLayout.x, TIMING_CONFIG);
    indicatorWidth.value = withTiming(activeLayout.width, TIMING_CONFIG);
  }, [activeLayout, indicatorX, indicatorWidth]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleItemLayout = (itemIndex: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setItemLayouts(prev => {
      const previous = prev[itemIndex];
      if (previous?.x === x && previous?.width === width) return prev;
      const next = [...prev];
      next[itemIndex] = { x, width };
      return next;
    });
  };

  const handlePress = (item: ZSTabItem, itemIndex: number) => {
    if (disabled || item.disabled || itemIndex === index) return;
    if (value === undefined) setInternalValue(item.value);
    onChange?.(item.value, itemIndex);
  };

  const activeTextColor: TypoColorOptions = STROKE_TEXT_COLOR[intent];
  const isFill = layout === 'fill';

  return (
    <View
      style={[
        styles.container,
        isFill ? styles.fullWidth : styles.hugContent,
        showDivider && { borderBottomWidth: DIVIDER_WIDTH, borderBottomColor: palette.grey[30] },
        { opacity: disabled ? DISABLED_OPACITY : 1 },
        style,
      ]}
      accessibilityRole='tablist'
      {...props}
    >
      <View style={[styles.row, isFill ? styles.rowFill : styles.rowHug]}>
        {items.map((item, itemIndex) => {
          const isActive = itemIndex === index;
          const isItemDisabled = disabled || item.disabled === true;
          return (
            <Pressable
              key={item.value}
              testID={`zs-tab-item-${itemIndex}`}
              style={[styles.item, { paddingVertical: PADDING_VERTICAL[textSize] }, isFill && styles.itemFill]}
              onPress={() => handlePress(item, itemIndex)}
              onLayout={handleItemLayout(itemIndex)}
              disabled={isItemDisabled}
              accessibilityRole='tab'
              accessibilityState={{ selected: isActive, disabled: isItemDisabled }}
            >
              <ZSText
                typo={isActive ? `subTitle.${textSize}` : `body.${textSize}`}
                color={item.disabled ? 'disabled' : isActive ? activeTextColor : 'secondary'}
                allowFontScaling={false}
                numberOfLines={1}
              >
                {item.label}
              </ZSText>
            </Pressable>
          );
        })}

        {isMeasured && (
          <Animated.View
            testID='zs-tab-indicator'
            pointerEvents='none'
            style={[
              styles.indicator,
              // 구분선을 덮어 인디케이터가 탭에 붙어 보이도록 한 픽셀 내린다
              { bottom: showDivider ? -DIVIDER_WIDTH : 0, backgroundColor: indicatorColor ?? palette[intent][50] },
              indicatorAnimatedStyle,
            ]}
          />
        )}
      </View>
    </View>
  );
}

export default React.memo(ZSTab);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  // flexWrap 부모에서도 폭이 부모 기준으로 고정되도록 stretch 대신 100% 사용
  fullWidth: {
    width: '100%',
  },
  hugContent: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  rowFill: {
    flex: 1,
  },
  rowHug: {
    gap: HUG_GAP,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  itemFill: {
    flex: 1,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    height: INDICATOR_HEIGHT,
  },
});
