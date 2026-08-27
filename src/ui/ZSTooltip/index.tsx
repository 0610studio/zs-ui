import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import ZSText from "../ZSText";
import { useTheme } from "../../context/ThemeContext";
import { createShadow } from "../../theme/elevation";
import { DURATION, RADIUS } from "../../theme/tokens";
import { SvgX } from "../../assets/SvgX";
import { SvgTooltipTail } from "../../assets/SvgTooltipTail";
import type { ShadowStyle, TypoOptions } from "../../theme/types";

const FLOATING_START_DELAY = 220;
const FLOATING_ANIMATION_DURATION = 1100;
const FLOATING_OFFSET = 2;
const TAIL_WIDTH = 12;
const TAIL_HEIGHT = 7;
const CLOSE_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/** 말풍선을 배경에서 띄우는 그림자. boxShadow 로 변환해 iOS·Android 가 동일하게 렌더된다. */
const BUBBLE_SHADOW: ShadowStyle = {
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.16,
  shadowRadius: 8,
};

export type ZSTooltipPlacement = 'top' | 'bottom';
export type ZSTooltipTailAlign = 'start' | 'center' | 'end';

export interface ZSTooltipProps extends ViewProps {
  /** 말풍선 메시지 (children 지정 시 children 우선) */
  message?: string;
  /** 커스텀 콘텐츠 */
  children?: React.ReactNode;
  /** 표시 여부를 외부에서 제어할 때 사용 (미지정 시 내부 상태로 동작) */
  visible?: boolean;
  /** 비제어 모드의 초기 표시 상태 */
  initialVisible?: boolean;
  /** 닫기 버튼 탭 시 호출 */
  onClose?: () => void;
  /** 앵커 기준 말풍선 위치 — top 이면 꼬리가 아래를 향함 (기본: top) */
  placement?: ZSTooltipPlacement;
  /** true면 닫기(X) 버튼 표시 */
  showClose?: boolean;
  /** true면 위아래로 살짝 떠다니는 애니메이션 */
  floating?: boolean;
  /** 말풍선 배경색 (기본: 테마 반전 색 — light 는 어두운 배경, dark 는 밝은 배경) */
  backgroundColor?: string;
  /** 메시지·닫기 아이콘 색 (기본: palette.background.base) */
  textColor?: string;
  typo?: TypoOptions;
  /** 꼬리 정렬 (기본: start) */
  tailAlign?: ZSTooltipTailAlign;
  /** start/end 정렬 시 가장자리에서 꼬리까지의 간격 */
  tailOffset?: number;
  closeAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function ZSTooltip({
  message,
  children,
  visible,
  initialVisible = true,
  onClose,
  placement = 'top',
  showClose = false,
  floating = false,
  backgroundColor,
  textColor,
  typo = 'body.4',
  tailAlign = 'start',
  tailOffset = 16,
  closeAccessibilityLabel = '툴팁 닫기',
  style,
  ...props
}: ZSTooltipProps) {
  const { palette } = useTheme();
  // 다크 모드에서는 밝은 그림자로 말풍선을 구분한다.
  const bubbleShadow = useMemo(() => createShadow(BUBBLE_SHADOW, palette.grey[100]), [palette.grey]);
  const [internalVisible, setInternalVisible] = useState(initialVisible);
  const isVisible = visible ?? internalVisible;
  const floatingTranslateY = useSharedValue(0);

  // 테마 반전 표면: light 는 어두운 말풍선 + 밝은 텍스트, dark 는 그 반대
  const bubbleColor = backgroundColor ?? palette.grey[90];
  const contentColor = textColor ?? palette.background.base;

  useEffect(() => {
    if (!floating || !isVisible) return;

    floatingTranslateY.value = 0;
    floatingTranslateY.value = withDelay(
      FLOATING_START_DELAY,
      withRepeat(
        withTiming(-FLOATING_OFFSET, {
          duration: FLOATING_ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );

    return () => {
      cancelAnimation(floatingTranslateY);
    };
  }, [floating, isVisible, floatingTranslateY]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingTranslateY.value }],
  }));

  const handleClose = () => {
    if (visible === undefined) setInternalVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const isTop = placement === 'top';

  const tail = (
    <View
      pointerEvents='none'
      style={[
        tailAlign === 'center'
          ? styles.tailCenter
          : tailAlign === 'end'
            ? { alignSelf: 'flex-end', marginRight: tailOffset }
            : { alignSelf: 'flex-start', marginLeft: tailOffset },
        // 말풍선과 꼬리 사이 헤어라인 틈 방지 오버랩 · bottom 은 180도 회전
        isTop ? styles.tailTop : styles.tailBottom,
      ]}
    >
      <SvgTooltipTail width={TAIL_WIDTH} height={TAIL_HEIGHT} color={bubbleColor} />
    </View>
  );

  return (
    <Animated.View
      entering={(isTop ? FadeInUp : FadeInDown).duration(DURATION.fast).easing(Easing.out(Easing.quad))}
      exiting={(isTop ? FadeOutDown : FadeOutUp).duration(DURATION.fast).easing(Easing.in(Easing.quad))}
      pointerEvents='box-none'
      style={[styles.container, { boxShadow: bubbleShadow }, style]}
      {...props}
    >
      <Animated.View style={floatingStyle}>
        {!isTop && tail}
        <View style={[styles.bubble, { backgroundColor: bubbleColor }]}>
          <View style={styles.contentRow}>
            {children ?? (
              <ZSText typo={typo} style={[styles.message, { color: contentColor }]}>
                {message}
              </ZSText>
            )}
            {showClose && (
              <Pressable
                accessibilityLabel={closeAccessibilityLabel}
                accessibilityRole='button'
                hitSlop={CLOSE_HIT_SLOP}
                onPress={handleClose}
                style={styles.closeButton}
                testID='zs-tooltip-close'
              >
                <SvgX size={10} color={contentColor} />
              </Pressable>
            )}
          </View>
        </View>
        {isTop && tail}
      </Animated.View>
    </Animated.View>
  );
}

export default React.memo(ZSTooltip);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  bubble: {
    borderRadius: RADIUS.lg,
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  message: {
    flexShrink: 1,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  tailCenter: {
    alignSelf: 'center',
  },
  tailTop: {
    marginTop: -0.5,
  },
  tailBottom: {
    marginBottom: -0.5,
    transform: [{ rotate: '180deg' }],
  },
});
