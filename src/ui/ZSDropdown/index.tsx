import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import ZSTextField from "../ZSTextField";
import ErrorComponent from "../ZSTextField/ui/ErrorComponent";
import { SvgChevronDown } from "../../assets/SvgChevronDown";
import { useTheme } from "../../context/ThemeContext";
import { DISABLED_OPACITY, DURATION } from "../../theme/tokens";

const CHEVRON_SIZE = 20;
const CHEVRON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
/** ZSTextField 의 기본 우측 여백 (ButtonClose 가 right: 15 에 놓인다) */
const FIELD_PADDING_RIGHT = 15;
const CLOSE_BUTTON_WIDTH = 18;
const CHEVRON_GAP = 6;

/** 입력형에서는 값 삭제 버튼과 겹치지 않도록 carret 을 그만큼 왼쪽으로 민다 */
const CHEVRON_RIGHT_EDITABLE = FIELD_PADDING_RIGHT + CLOSE_BUTTON_WIDTH + CHEVRON_GAP;
const TIMING_CONFIG = { duration: DURATION.fast, easing: Easing.out(Easing.quad) } as const;

type ZSTextFieldProps = React.ComponentProps<typeof ZSTextField>;

export interface ZSDropdownProps extends Omit<ZSTextFieldProps, 'value' | 'onChangeText' | 'errorMessage'> {
  /** 선택된 값. 외부(바텀시트 등)에서 주입한다 */
  value?: string;
  /** carret 또는 필드를 눌렀을 때 호출 — 보통 바텀시트를 연다 */
  onPress: () => void;
  /**
   * 전달하면 입력형이 된다: 필드에 직접 타이핑할 수 있고 carret 을 눌러야 onPress 가 불린다.
   * 미전달 시 표시 전용이 되어 필드 전체가 press 대상이 되고 포커스·키보드가 뜨지 않는다.
   */
  onChangeText?: (text: string) => void;
  /** 열림 상태. true면 carret 이 뒤집힌다 */
  expanded?: boolean;
  errorMessage?: string;
  /** carret 커스텀 요소 */
  chevron?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** 필드 아래 함께 렌더할 요소 (바텀시트 등) */
  children?: React.ReactNode;
}

/**
 * 선택형 입력 필드. ZSTextField 표면 위에 carret 을 얹어 "눌러서 고르는 입력" 을 표현한다.
 *
 * 선택 값(`value`)과 선택 UI(`children`)는 외부가 소유한다 — 이 컴포넌트는 표면과 트리거만 담당한다.
 *
 * @example
 * ```tsx
 * // 표시 전용: 필드 전체를 누르면 바텀시트가 열린다
 * const { showBottomSheet } = useOverlay();
 * <ZSDropdown label='도메인' value={domain} onPress={() => showBottomSheet({ ... })} />
 *
 * // 입력형: 직접 입력 + carret 으로 선택
 * <ZSDropdown label='도메인' value={domain} onChangeText={setDomain} onPress={openSheet} />
 * ```
 */
function ZSDropdown({
  value,
  onPress,
  onChangeText,
  expanded = false,
  status = 'default',
  errorMessage,
  errorColor,
  disabled = false,
  chevron,
  containerStyle,
  children,
  textInputProps,
  ...fieldProps
}: ZSDropdownProps) {
  const { palette } = useTheme();
  const isEditable = onChangeText !== undefined;

  const rotation = useDerivedValue(() => withTiming(expanded ? 180 : 0, TIMING_CONFIG), [expanded]);
  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const chevronRight = isEditable ? CHEVRON_RIGHT_EDITABLE : FIELD_PADDING_RIGHT;

  const mergedTextInputProps = useMemo(() => ({
    ...textInputProps,
    // carret 영역만큼 우측 여백을 확보해 긴 값이 아이콘 아래로 파고들지 않게 한다.
    // ZSTextField 가 자체 style 뒤에 이어 붙이므로 여기서 평탄화해 우선순위를 확정한다.
    style: StyleSheet.flatten([{ paddingRight: chevronRight + CHEVRON_SIZE + CHEVRON_GAP }, textInputProps?.style]),
    // 표시 전용은 포커스·키보드를 막는다
    ...(isEditable ? null : { editable: false }),
  }), [textInputProps, chevronRight, isEditable]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress();
  }, [disabled, onPress]);

  const field = (
    <ZSTextField
      {...fieldProps}
      status={status}
      errorColor={errorColor}
      disabled={disabled}
      value={value ?? ''}
      onChangeText={onChangeText}
      textInputProps={mergedTextInputProps}
    />
  );

  const shouldShowError = status === 'error' && errorMessage !== undefined && errorMessage !== '';

  return (
    <>
      <View style={containerStyle}>
        <View style={styles.field}>
          {isEditable ? field : (
            <Pressable
              onPress={handlePress}
              disabled={disabled}
              accessibilityRole='button'
              accessibilityState={{ expanded, disabled }}
              testID='zs-dropdown-surface'
            >
              {/* 필드 전체를 press 대상으로 삼고 내부 TextInput 의 포커스를 차단한다 */}
              <View pointerEvents='none'>{field}</View>
            </Pressable>
          )}

          <Pressable
            style={[styles.chevron, { right: chevronRight, opacity: disabled ? DISABLED_OPACITY : 1 }]}
            hitSlop={CHEVRON_HIT_SLOP}
            disabled={disabled}
            onPress={handlePress}
            accessibilityRole='button'
            accessibilityState={{ expanded, disabled }}
            testID='zs-dropdown-chevron'
          >
            <Animated.View style={chevronAnimatedStyle}>
              {chevron ?? <SvgChevronDown size={CHEVRON_SIZE} color={disabled ? palette.grey[40] : palette.grey[60]} />}
            </Animated.View>
          </Pressable>
        </View>

        {shouldShowError && (
          <ErrorComponent errorMessage={errorMessage} errorColor={errorColor || palette.danger.main} />
        )}
      </View>
      {children}
    </>
  );
}

export default React.memo(ZSDropdown);

const styles = StyleSheet.create({
  field: {
    position: 'relative',
  },
  chevron: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
