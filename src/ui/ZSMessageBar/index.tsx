import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import ZSText from "../ZSText";
import { useTheme } from "../../context/ThemeContext";
import { resolveTextColor } from "../../theme/resolveColor";
import { SvgAlertTriangle } from "../../assets/SvgAlertTriangle";
import { SvgProhibition } from "../../assets/SvgProhibition";
import { SvgCheckCircle } from "../../assets/SvgCheckCircle";
import { SvgInfoCircle } from "../../assets/SvgInfoCircle";
import { SvgX } from "../../assets/SvgX";
import type { IntentOptions, Theme, TypoColorOptions, TypoSubStyle } from "../../theme/types";
import { SOLID_TEXT_COLOR } from "../../theme/intentColors";
import { DISABLED_OPACITY, DURATION, RADIUS } from "../../theme/tokens";

const CLOSE_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
const ACTION_HIT_SLOP = { top: 8, bottom: 8, left: 4, right: 8 };
const PRESSED_OPACITY = 0.55;

/** 밝은 배경에서 본문 대비 4.5:1 을 확보하는 잉크. 칩·버튼의 PASTEL/STROKE_TEXT_COLOR 는 짧은 라벨 기준이라 여기선 못 쓴다. */
const INK_ON_LIGHT: Record<IntentOptions, TypoColorOptions> = {
  primary: 'primary.90',
  danger: 'danger.80',
  warning: 'warning.100',
  success: 'success.90',
  information: 'information.60',
  grey: 'grey.70',
};

/** 다크모드 stroke 는 배경이 검정으로 뒤집히므로 밝은 shade 를 쓴다 */
const INK_ON_DARK: Record<IntentOptions, TypoColorOptions> = {
  primary: 'primary.50',
  danger: 'danger.50',
  warning: 'warning.50',
  success: 'success.50',
  information: 'information.50',
  grey: 'grey.70',
};

/**
 * intent 스케일은 다크에서도 라이트와 같아 pastel 배경이 늘 밝다 — 그래서 잉크도 늘 어둡게 둔다.
 * 배경이 실제로 뒤집히는 grey intent 만 'base' 를 그대로 쓴다.
 */
function resolvePastelInk(mode: Theme['mode'], intent: IntentOptions): TypoColorOptions {
  if (intent === 'grey' || mode === 'light') return 'base';
  return 'grey.10';
}

const DEFAULT_ICONS: Record<IntentOptions, React.ComponentType<{ size?: number; color?: string }>> = {
  primary: SvgInfoCircle,
  information: SvgInfoCircle,
  grey: SvgInfoCircle,
  success: SvgCheckCircle,
  warning: SvgAlertTriangle,
  danger: SvgProhibition,
};

const ICON_SIZE: Record<TypoSubStyle, number> = { '1': 24, '2': 22, '3': 20, '4': 19, '5': 17, '6': 16 };
const CLOSE_ICON_SIZE: Record<TypoSubStyle, number> = { '1': 15, '2': 14, '3': 13, '4': 13, '5': 12, '6': 11 };

export type ZSMessageBarVariant = 'pastel' | 'solid' | 'stroke';

export interface ZSMessageBarProps extends ViewProps {
  message: string;
  title?: string;
  intent?: IntentOptions;
  /** 배경 스타일 (기본: pastel) */
  variant?: ZSMessageBarVariant;
  /** null 이면 숨김. 미지정 시 intent 기본 아이콘 */
  icon?: React.ReactNode | null;
  actionLabel?: string;
  onAction?: () => void;
  showClose?: boolean;
  onClose?: () => void;
  /** 미지정 시 닫기 버튼으로 내부 제어 */
  visible?: boolean;
  textSize?: TypoSubStyle;
  /** false면 콘텐츠 폭으로 hug (기본: true) */
  fullWidth?: boolean;
  /** false면 페이드를 끈다 (기본: true) */
  animated?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

function ZSMessageBar({
  message,
  title,
  intent = 'information',
  variant = 'pastel',
  icon,
  actionLabel,
  onAction,
  showClose = false,
  onClose,
  visible,
  textSize = '3',
  fullWidth = true,
  animated = true,
  disabled = false,
  style,
  ...props
}: ZSMessageBarProps) {
  const { palette } = useTheme();
  const [internalVisible, setInternalVisible] = useState(true);
  const isVisible = visible ?? internalVisible;

  useEffect(() => {
    if (visible) setInternalVisible(true);
  }, [visible]);

  // 본문이 중립 잉크여도 아이콘은 intent 색을 유지해 성공·경고·오류를 구분시킨다
  const colors: { background: string; border: string; text: TypoColorOptions; icon: TypoColorOptions } = variant === 'solid'
    ? {
      background: palette[intent][50],
      border: palette[intent][50],
      text: SOLID_TEXT_COLOR[intent],
      icon: SOLID_TEXT_COLOR[intent],
    }
    : variant === 'pastel'
      ? {
        background: palette[intent][5],
        border: palette[intent][20],
        text: resolvePastelInk(palette.mode, intent),
        icon: INK_ON_LIGHT[intent],
      }
      : {
        background: palette.background.base,
        border: palette[intent][30],
        text: palette.mode === 'dark' ? INK_ON_DARK[intent] : INK_ON_LIGHT[intent],
        icon: palette.mode === 'dark' ? INK_ON_DARK[intent] : INK_ON_LIGHT[intent],
      };

  const iconColor = resolveTextColor(palette, colors.icon) ?? palette[intent][60];

  const handleClose = () => {
    if (disabled) return;
    if (visible === undefined) setInternalVisible(false);
    onClose?.();
  };

  const handleAction = () => {
    if (disabled) return;
    onAction?.();
  };

  if (!isVisible) return null;

  const DefaultIcon = DEFAULT_ICONS[intent];
  const iconNode = icon === undefined
    ? <DefaultIcon size={ICON_SIZE[textSize]} color={iconColor} />
    : icon;

  // 여러 줄이면 아이콘·닫기를 첫 줄에 맞춘다
  const crossAlign = title ? 'flex-start' : 'center';

  return (
    // layout 과 opacity 를 같은 노드에 두면 Reanimated 가 덮어쓰기 경고를 낸다
    <Animated.View
      entering={animated ? FadeIn.duration(DURATION.base) : undefined}
      exiting={animated ? FadeOut.duration(DURATION.press) : undefined}
      layout={animated ? LinearTransition.duration(DURATION.slow) : undefined}
      style={fullWidth ? styles.fullWidth : styles.hug}
      testID='zs-message-bar-root'
    >
      <View
        accessibilityRole='alert'
        accessibilityLiveRegion='polite'
        testID='zs-message-bar-container'
        style={[
          styles.container,
          {
            alignItems: crossAlign,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        {iconNode != null && (
          <View style={[styles.iconSlot, { height: ICON_SIZE[textSize] * 1.25 }]} testID='zs-message-bar-icon'>
            {iconNode}
          </View>
        )}

        <View style={[styles.content, fullWidth && styles.contentFill]}>
          {title != null && (
            <ZSText typo={`subTitle.${textSize}`} color={colors.text}>
              {title}
            </ZSText>
          )}
          <ZSText typo={`body.${textSize}`} color={colors.text}>
            {message}
          </ZSText>

          {actionLabel != null && (
            <Pressable
              onPress={handleAction}
              disabled={disabled}
              hitSlop={ACTION_HIT_SLOP}
              accessibilityRole='button'
              style={({ pressed }) => [styles.action, pressed && { opacity: PRESSED_OPACITY }]}
            >
              <ZSText typo={`label.${textSize}`} color={colors.text} style={styles.actionLabel}>
                {actionLabel}
              </ZSText>
            </Pressable>
          )}
        </View>

        {showClose && (
          <Pressable
            onPress={handleClose}
            disabled={disabled}
            hitSlop={CLOSE_HIT_SLOP}
            accessibilityRole='button'
            accessibilityLabel='메시지 닫기'
            testID='zs-message-bar-close'
            style={({ pressed }) => [
              { height: ICON_SIZE[textSize] * 1.25, justifyContent: 'center' },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
          >
            <SvgX size={CLOSE_ICON_SIZE[textSize]} color={iconColor} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export default React.memo(ZSMessageBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fullWidth: {
    width: '100%',
  },
  // opacity 는 layout 이 걸린 래퍼가 아니라 안쪽 View 에만 준다
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  hug: {
    alignSelf: 'flex-start',
  },
  iconSlot: {
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flexShrink: 1,
    gap: 3,
  },
  contentFill: {
    flex: 1,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  actionLabel: {
    textDecorationLine: 'underline',
  },
});
