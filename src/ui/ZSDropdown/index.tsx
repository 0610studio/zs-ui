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
/** ZSTextField 의 기본 우측 여백 (ButtonClose 가 right: 15) */
const FIELD_PADDING_RIGHT = 15;
const CLOSE_BUTTON_WIDTH = 18;
const CHEVRON_GAP = 6;

/** 입력형은 값 삭제 버튼과 겹치지 않게 carret 을 왼쪽으로 민다 */
const CHEVRON_RIGHT_EDITABLE = FIELD_PADDING_RIGHT + CLOSE_BUTTON_WIDTH + CHEVRON_GAP;
const TIMING_CONFIG = { duration: DURATION.fast, easing: Easing.out(Easing.quad) } as const;

type ZSTextFieldProps = React.ComponentProps<typeof ZSTextField>;

export interface ZSDropdownProps extends Omit<ZSTextFieldProps, 'value' | 'onChangeText' | 'errorMessage'> {
  value?: string;
  /** carret·필드 press 시 호출 */
  onPress: () => void;
  /** 전달하면 입력형(타이핑 가능, carret 만 onPress). 미전달 시 표시 전용(필드 전체 press, 키보드 없음) */
  onChangeText?: (text: string) => void;
  /** true면 carret 이 뒤집힌다 */
  expanded?: boolean;
  errorMessage?: string;
  chevron?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** 필드 아래 함께 렌더할 요소 */
  children?: React.ReactNode;
}

/** 선택형 입력 필드. 값(`value`)과 선택 UI(`children`)는 외부가 소유하고, 여기서는 표면과 트리거만 담당한다. */
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
  label = '선택 항목',
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
    // ZSTextField 가 자체 style 뒤에 이어 붙이므로 여기서 평탄화해 우선순위를 확정한다
    style: StyleSheet.flatten([{ paddingRight: chevronRight + CHEVRON_SIZE + CHEVRON_GAP }, textInputProps?.style]),
    ...(isEditable ? null : { editable: false }),
  }), [textInputProps, chevronRight, isEditable]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress();
  }, [disabled, onPress]);

  const field = (
    <ZSTextField
      {...fieldProps}
      label={label}
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
          {field}

          {!isEditable && (
            <Pressable
              style={styles.surface}
              onPress={handlePress}
              disabled={disabled}
              accessibilityRole='button'
              accessibilityLabel={value ? `${label}, 현재 값 ${value}` : label}
              accessibilityHint='옵션 목록 열기'
              accessibilityState={{ expanded, disabled }}
              testID='zs-dropdown-surface'
            />
          )}

          {isEditable ? (
            <Pressable
              style={[styles.chevron, { right: chevronRight, opacity: disabled ? DISABLED_OPACITY : 1 }]}
              hitSlop={CHEVRON_HIT_SLOP}
              disabled={disabled}
              onPress={handlePress}
              accessibilityRole='button'
              accessibilityLabel={`${label} 옵션 열기`}
              accessibilityState={{ expanded, disabled }}
              testID='zs-dropdown-chevron'
            >
              <Animated.View style={chevronAnimatedStyle}>
                {chevron ?? <SvgChevronDown size={CHEVRON_SIZE} color={disabled ? palette.grey[40] : palette.grey[60]} />}
              </Animated.View>
            </Pressable>
          ) : (
            <Animated.View
              pointerEvents='none'
              style={[styles.chevron, { right: chevronRight, opacity: disabled ? DISABLED_OPACITY : 1 }, chevronAnimatedStyle]}
              testID='zs-dropdown-chevron'
            >
              {chevron ?? <SvgChevronDown size={CHEVRON_SIZE} color={disabled ? palette.grey[40] : palette.grey[60]} />}
            </Animated.View>
          )}
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
  surface: {
    ...StyleSheet.absoluteFill,
  },
  chevron: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
