import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState, type ForwardRefExoticComponent, type ReactNode, type RefAttributes } from 'react';
import {
  AccessibilityInfo,
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { withOpacity } from '../../theme/color';
import { timingConfig } from '../../theme/motion';
import { SPACE } from '../../theme/spacing';
import { MIN_TOUCH_TARGET, OPACITY } from '../../theme/state';
import { capFontScale } from '../../theme/fontScale';
import { SvgX } from '../../assets/SvgX';
import SvgExclamation from '../../assets/SvgExclamation';
import ZSPressable from '../ZSPressable';
import ZSText from '../ZSText';
import { useNotifyInputFocus } from '../ZSScreen/InputFocusContext';
import FieldBorder, { type BorderColors } from './FieldBorder';
import { FieldActiveContext } from './FieldActiveContext';
import { adornmentTranslateY, FIELD_SPEC, fieldGeometry, floatTranslateY, labelOverhangReserve, labelSlot, type ZSTextFieldVariant } from './geometry';
import { placeholderColor } from './placeholderColor';

export type { ZSTextFieldVariant } from './geometry';

export interface ZSTextFieldProps extends Omit<TextInputProps, 'style' | 'editable'> {
  label: string;
  variant?: ZSTextFieldVariant;
  value?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  clearable?: boolean;
  clearAccessibilityLabel?: string;
  showCount?: boolean;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
}

export type ZSTextFieldRef = TextInputInstance;

const ADORNMENT_GAP = SPACE.md;
const ANDROID_SELECTION_OPACITY = 0.4;
const CLEAR_SIZE = 20;

function estimateLabelWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) width += /[ᄀ-ᇿ　-鿿가-힯＀-￯]/.test(char) ? fontSize : fontSize * 0.58;
  return width;
}

function numberStyle(style: TextStyle, key: 'fontSize' | 'lineHeight', fallback: number): number {
  const value = style[key];
  return typeof value === 'number' ? value : fallback;
}

const ZSTextField: ForwardRefExoticComponent<ZSTextFieldProps & RefAttributes<ZSTextFieldRef>> = forwardRef<ZSTextFieldRef, ZSTextFieldProps>(
  (
    {
      label,
      variant = 'outlined',
      value,
      defaultValue,
      onChangeText,
      helperText,
      errorText,
      required = false,
      clearable = true,
      clearAccessibilityLabel,
      showCount = false,
      disabled = false,
      minRows = 1,
      maxRows,
      startAdornment,
      endAdornment,
      style,
      inputStyle,
      multiline = false,
      maxLength,
      maxFontSizeMultiplier,
      placeholder,
      onFocus,
      onBlur,
      testID,
      ...inputProps
    },
    forwardedRef,
  ) => {
    const { colors, typography, accessibilityLabels, maxFontSizeMultiplier: appMaxFontSizeMultiplier } = useTheme();
    const { fontScale = 1 } = useWindowDimensions();
    const maxMultiplier = maxFontSizeMultiplier ?? appMaxFontSizeMultiplier;
    const platform = Platform.OS === 'android' ? 'android' : 'ios';
    const notifyInputFocus = useNotifyInputFocus();
    const inputRef = useRef<TextInputInstance | null>(null);
    const isRTL = I18nManager.isRTL;

    const controlled = value !== undefined;
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() => (defaultValue ?? '') !== '');
    const [uncontrolledLength, setUncontrolledLength] = useState(() => (defaultValue ?? '').length);
    const hasValue = controlled ? value !== '' : uncontrolledHasValue;
    const length = controlled ? value.length : uncontrolledLength;

    const [inputFocused, setFocused] = useState(false);
    const opened = useContext(FieldActiveContext);
    const focused = inputFocused || opened;
    const isError = Boolean(errorText);
    const floated = focused || hasValue || startAdornment != null;

    const bodyStyle = typography.body1;
    const valueStyle = typography.emphasized.body1;
    const fontSize = numberStyle(bodyStyle, 'fontSize', 16);
    const scale = capFontScale(fontScale, maxMultiplier);
    const baseLineHeight = numberStyle(bodyStyle, 'lineHeight', fontSize * 1.4);
    const lineHeight = baseLineHeight * scale;
    const labelScale = numberStyle(typography.caption, 'fontSize', 12) / fontSize;
    const labelLineHeight = numberStyle(typography.caption, 'lineHeight', 16) * scale;
    const geometry = useMemo(
      () => fieldGeometry(variant, platform, { lineHeight, labelScale, labelLineHeight }, multiline),
      [variant, platform, lineHeight, labelScale, labelLineHeight, multiline],
    );
    const labelReserve = labelOverhangReserve(variant, { lineHeight, labelScale, labelLineHeight }, baseLineHeight);
    const slot = useMemo(() => labelSlot(variant, geometry, multiline), [variant, geometry, multiline]);
    const labelText = required ? `${label} *` : label;
    // 입력 중 글꼴 속성이 바뀌면 iOS 한글 조합이 끊길 수 있습니다.
    const textStyle = useMemo<TextStyle>(() => {
      if (platform !== 'ios' || multiline) return valueStyle;
      const { lineHeight: _lineHeight, ...rest } = valueStyle;
      return rest;
    }, [platform, multiline, valueStyle]);

    const float = useSharedValue(floated ? 1 : 0);
    const focus = useSharedValue(0);
    const error = useSharedValue(isError ? 1 : 0);
    const [initialLabelWidth] = useState(() => estimateLabelWidth(labelText, fontSize * scale));
    const labelWidth = useSharedValue(initialLabelWidth);
    const labelHeight = useSharedValue(0);
    const labelOffset = useSharedValue(geometry.restTop - slot.top);

    useEffect(() => {
      float.value = withTiming(floated ? 1 : 0, timingConfig('fast'));
    }, [float, floated]);
    useEffect(() => {
      focus.value = withTiming(focused ? 1 : 0, timingConfig('fast'));
    }, [focus, focused]);
    useEffect(() => {
      error.value = withTiming(isError ? 1 : 0, timingConfig('fast'));
    }, [error, isError]);

    const disabledColor = withOpacity(colors.text, OPACITY.disabled);
    const accent = isError ? colors.error : colors.text;
    const borderColors = useMemo<BorderColors>(
      () =>
        disabled
          ? { rest: withOpacity(colors.text, OPACITY.disabledBackground), active: colors.text, error: colors.error }
          : { rest: colors.borderStrong, active: colors.text, error: colors.error },
      [disabled, colors],
    );
    const fill = variant === 'inbox' ? (disabled ? withOpacity(colors.text, 0.04) : colors.background) : undefined;
    const placeholderTextColor = useMemo(() => placeholderColor(colors.textSecondary, colors.background), [colors.textSecondary, colors.background]);

    const restLabelColor = disabled ? disabledColor : colors.textSecondary;
    const focusLabelColor = disabled ? disabledColor : colors.text;
    const errorLabelColor = disabled ? disabledColor : colors.error;
    const labelAnimatedStyle = useAnimatedStyle(() => {
      const progress = float.value;
      const height = labelHeight.value || lineHeight;
      const restTop = slot.top + labelOffset.value;
      return {
        color: interpolateColor(error.value, [0, 1], [interpolateColor(focus.value, [0, 1], [restLabelColor, focusLabelColor]) as string, errorLabelColor]) as string,
        transform: [{ translateY: progress * floatTranslateY(geometry, restTop, height, labelScale) }, { scale: 1 + progress * (labelScale - 1) }],
      };
    });

    const adornmentAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: multiline ? 0 : adornmentTranslateY(geometry, slot, float.value) }],
    }));

    const handleLabelLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { y, width, height } = event.nativeEvent.layout;
        labelOffset.value = y;
        labelWidth.value = width;
        labelHeight.value = height;
      },
      [labelOffset, labelWidth, labelHeight],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        if (!controlled) {
          setUncontrolledHasValue(text !== '');
          if (showCount) setUncontrolledLength(text.length);
        }
        onChangeText?.(text);
      },
      [controlled, showCount, onChangeText],
    );

    const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
      (event) => {
        setFocused(true);
        notifyInputFocus?.();
        onFocus?.(event);
      },
      [notifyInputFocus, onFocus],
    );
    const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
      (event) => {
        setFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const handleClear = useCallback(() => {
      if (!controlled) inputRef.current?.clear();
      handleChangeText('');
    }, [controlled, handleChangeText]);

    const setRefs = useCallback(
      (node: TextInputInstance | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const announcedError = useRef(errorText);
    useEffect(() => {
      const previous = announcedError.current;
      announcedError.current = errorText;
      if (Platform.OS !== 'ios' || !errorText || errorText === previous) return;
      AccessibilityInfo.announceForAccessibilityWithOptions(`${label}, ${errorText}`, { queue: true });
    }, [errorText, label]);

    const showClear = clearable && hasValue && focused && !disabled;
    const helper = errorText ?? helperText;
    const count = showCount && maxLength !== undefined ? `${length}/${maxLength}` : undefined;
    const contentInset = { paddingTop: geometry.paddingTop, paddingBottom: geometry.paddingBottom };
    const focusInput = useCallback(() => inputRef.current?.focus(), []);
    const adornmentInset = multiline ? { paddingTop: geometry.paddingTop } : null;

    const clearTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET.android : MIN_TOUCH_TARGET.ios;
    const trailing = showClear ? (
      <ZSPressable
        accessibilityLabel={clearAccessibilityLabel ?? accessibilityLabels.clearText}
        onPress={handleClear}
        radius="full"
        style={[styles.clearTarget, { width: clearTarget, height: clearTarget, margin: -(clearTarget - CLEAR_SIZE) / 2 }]}
      >
        <View style={[styles.clearButton, { backgroundColor: withOpacity(colors.textSecondary, 0.4) }]}>
          <SvgX size={10} color={colors.background} />
        </View>
      </ZSPressable>
    ) : isError ? (
      <SvgExclamation size={20} backgroundColor={colors.error} exclamationColor={colors.onError} />
    ) : null;

    return (
      <View style={[styles.root, labelReserve > 0 ? { paddingTop: labelReserve } : null, style]}>
        <View style={[styles.row, { paddingHorizontal: geometry.paddingHorizontal, alignItems: multiline ? 'flex-start' : 'center' }]}>
          <FieldBorder
            variant={variant}
            radius={variant === 'underline' ? 'none' : FIELD_SPEC[platform].radius}
            colors={borderColors}
            fill={fill}
            disabled={disabled}
            focus={focus}
            error={error}
            float={float}
            labelWidth={labelWidth}
            labelScale={labelScale}
            paddingHorizontal={geometry.paddingHorizontal}
            isRTL={isRTL}
          />
          {startAdornment != null ? <Animated.View style={[styles.adornment, adornmentInset, adornmentAnimatedStyle]}>{startAdornment}</Animated.View> : null}
          <Wrapper multiline={multiline} disabled={disabled} inset={contentInset} onPress={focusInput}>
            <TextInput
              {...inputProps}
              ref={setRefs}
              testID={testID}
              value={value}
              defaultValue={defaultValue}
              onChangeText={handleChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={!disabled}
              multiline={multiline}
              maxLength={maxLength}
              maxFontSizeMultiplier={maxMultiplier}
              accessibilityLabel={inputProps.accessibilityLabel ?? label}
              accessibilityHint={inputProps.accessibilityHint ?? helper}
              placeholder={floated ? placeholder : undefined}
              placeholderTextColor={placeholderTextColor}
              selectionColor={Platform.OS === 'android' ? withOpacity(accent, ANDROID_SELECTION_OPACITY) : accent}
              cursorColor={accent}
              selectionHandleColor={accent}
              style={[
                textStyle,
                styles.input,
                multiline ? styles.multilineInput : contentInset,
                {
                  color: disabled ? disabledColor : colors.text,
                  textAlignVertical: multiline ? 'top' : 'center',
                  height: multiline ? undefined : geometry.paddingTop + geometry.paddingBottom + lineHeight,
                  minHeight: multiline ? lineHeight * minRows : undefined,
                  maxHeight: multiline && maxRows !== undefined ? lineHeight * maxRows : undefined,
                },
                inputStyle,
              ]}
            />
          </Wrapper>
          {trailing != null || endAdornment != null ? (
            <Animated.View style={[styles.adornment, styles.trailing, adornmentInset, adornmentAnimatedStyle]}>
              {trailing}
              {endAdornment}
            </Animated.View>
          ) : null}
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.labelSlot,
              { top: slot.top, bottom: slot.bottom, left: geometry.paddingHorizontal, right: geometry.paddingHorizontal, justifyContent: slot.center ? 'center' : 'flex-start' },
            ]}
          >
            <Animated.Text
              numberOfLines={1}
              maxFontSizeMultiplier={maxMultiplier}
              onLayout={handleLabelLayout}
              style={[textStyle, styles.label, { transformOrigin: isRTL ? 'right top' : 'left top' }, labelAnimatedStyle]}
            >
              {labelText}
            </Animated.Text>
          </View>
        </View>
        {helper || count ? (
          <View style={[styles.supporting, { paddingHorizontal: geometry.paddingHorizontal }]}>
            {helper ? (
              <ZSText
                variant="caption"
                color={disabled ? disabledColor : isError ? 'error' : 'textSecondary'}
                style={styles.helper}
                accessibilityLiveRegion={isError ? 'polite' : undefined}
              >
                {helper}
              </ZSText>
            ) : (
              <View style={styles.helper} />
            )}
            {count ? (
              <ZSText variant="caption" color="textSecondary">
                {count}
              </ZSText>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  },
);

ZSTextField.displayName = 'ZSTextField';

function Wrapper({ multiline, disabled, inset, onPress, children }: { multiline: boolean; disabled: boolean; inset: ViewStyle; onPress: () => void; children: ReactNode }) {
  if (!multiline) return <>{children}</>;
  return (
    <Pressable accessible={false} disabled={disabled} onPress={onPress} style={[styles.multilineSlot, inset]}>
      {children}
    </Pressable>
  );
}

export default ZSTextField;

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  row: { flexDirection: 'row' },
  input: { flex: 1, paddingHorizontal: 0, includeFontPadding: false },
  multilineSlot: { flex: 1 },
  multilineInput: { flex: 0, paddingTop: 0, paddingBottom: 0 },
  adornment: { justifyContent: 'center', marginEnd: ADORNMENT_GAP },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginEnd: 0, marginStart: ADORNMENT_GAP },
  clearTarget: { alignItems: 'center', justifyContent: 'center' },
  clearButton: { width: CLEAR_SIZE, height: CLEAR_SIZE, borderRadius: CLEAR_SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  labelSlot: { position: 'absolute', alignItems: 'flex-start' },
  label: { includeFontPadding: false },
  supporting: { flexDirection: 'row', gap: SPACE.sm, paddingTop: SPACE.xs },
  helper: { flex: 1 },
});
