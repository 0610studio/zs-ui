import { useMemo, useCallback, useState, forwardRef, useEffect, useRef } from 'react';
import { LayoutChangeEvent, Platform, StyleProp, TextInput, TextInputProps, TextStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming, ReduceMotion } from 'react-native-reanimated';
import ButtonClose from './ui/ButtonClose';
import ErrorComponent from './ui/ErrorComponent';
import { TypoOptions, TypoStyle, TypoSubStyle } from '../../theme/types';
import { extractStyle } from '../../model/utils';
import { useTheme } from '../../context/ThemeContext';
import ViewAtom from '../atoms/ViewAtom';

export type BoxStyle = 'outline' | 'underline' | 'inbox';

const iosOffset = Platform.OS === 'ios' ? 8 : 4;
const ANIM_DURATION = 150;
const TIMING_CONFIG = { duration: ANIM_DURATION, reduceMotion: ReduceMotion.System };

interface TextFieldProps {
  typo?: TypoOptions;
  status?: 'default' | 'error';
  value: string;
  onChangeText?: (text: string) => void;
  inputBgColor?: string;
  labelBgColor?: string;
  label?: string;
  labelColor?: string;
  placeHolderColor?: string;
  fontSize?: number;
  borderColor?: string;
  borderRadius?: number;
  focusColor?: string;
  errorColor?: string;
  paddingHorizontal?: number;
  borderWidth?: number;
  errorMessage?: string;
  textInputProps?: TextInputProps;
  boxStyle?: BoxStyle;
  innerBoxStyle?: 'top' | 'middle' | 'bottom';
  disabled?: boolean;
  allowFontScaling?: boolean;
  isTextArea?: boolean;
}

export type ZSTextFieldRef = TextInput;

const ZSTextField = forwardRef<ZSTextFieldRef, TextFieldProps>(({
  typo = 'body.2',
  status = 'default',
  value,
  onChangeText,
  label = 'Placeholder',
  labelColor,
  placeHolderColor,
  inputBgColor,
  labelBgColor,
  borderWidth = 1.2,
  borderColor,
  focusColor,
  errorColor,
  borderRadius = 14,
  paddingHorizontal = 15,
  errorMessage,
  textInputProps,
  boxStyle = 'outline',
  innerBoxStyle,
  disabled = false,
  allowFontScaling = true,
  isTextArea = false,
}, ref) => {
  const { typography, palette } = useTheme();
  const [primaryStyle, subStyle] = typo.split('.') as [TypoStyle, TypoSubStyle];
  const fErrorColor = errorColor || palette.danger.main;

  const fontSize = extractStyle(typography[primaryStyle][subStyle], 'fontSize') as number || 17;
  const fontFamily = extractStyle(typography[primaryStyle][subStyle], 'fontFamily') as string || '';
  const floatProgress = useSharedValue(value !== '' ? 1 : 0);
  const [isFocusedForUI, setIsFocusedForUI] = useState<boolean>(false);
  const boxHeightValue = useSharedValue(0);

  const isError = status === 'error';
  const hasValue = value !== '';

  const isFocusedRef = useRef(false);
  const hasValueRef = useRef(hasValue);
  hasValueRef.current = hasValue;

  useEffect(() => {
    const target = hasValue ? 1 : 0;
    if (!isFocusedRef.current && floatProgress.value !== target) {
      floatProgress.value = withTiming(target, TIMING_CONFIG);
    }
  }, [hasValue]);

  const animationConstants = useMemo(() => ({
    baseFontSize: fontSize + (boxStyle === 'inbox' ? 1 : 0),
    targetFontSize: boxStyle === 'inbox' ? 10 : 11,
    baseTop: isTextArea ? 12 : 0,
    targetTopOffset: boxStyle === 'inbox' ? 17 : 2,
  }), [fontSize, boxStyle, isTextArea]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const progress = floatProgress.value;

    const labelTranslateY = interpolate(
      progress,
      [0, 1],
      [
        0,
        isTextArea ? -24 : -(boxHeightValue.value / 2) - 1 + animationConstants.targetTopOffset - animationConstants.baseTop,
      ],
      'clamp'
    );

    const labelScale = interpolate(
      progress,
      [0, 1],
      [1, animationConstants.targetFontSize / animationConstants.baseFontSize],
      'clamp'
    );

    return {
      transform: [
        { translateY: labelTranslateY },
        { scale: labelScale },
      ],
    };
  }, [animationConstants, isTextArea]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    boxHeightValue.value = height;
  }, []);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    if (floatProgress.value !== 1) {
      floatProgress.value = withTiming(1, TIMING_CONFIG);
    }
    setIsFocusedForUI(true);
  }, []);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    const target = hasValueRef.current ? 1 : 0;
    if (floatProgress.value !== target) {
      floatProgress.value = withTiming(target, TIMING_CONFIG);
    }
    setIsFocusedForUI(false);
  }, []);

  const colorConfig = useMemo(() => ({
    primaryColor: focusColor || palette.primary.main,
    defaultBorderColor: borderColor || palette.grey[30],
    defaultLabelColor: labelColor || palette.text.secondary,
    placeholderColor: placeHolderColor || palette.grey[40],
    errorColor: fErrorColor,
  }), [focusColor, palette.primary.main, borderColor, palette.grey, labelColor, palette.text.secondary, placeHolderColor, fErrorColor]);

  const currentBorderColor = isError
    ? colorConfig.errorColor
    : isFocusedForUI
      ? colorConfig.primaryColor
      : colorConfig.defaultBorderColor;

  const currentLabelColor = isError
    ? colorConfig.errorColor
    : isFocusedForUI
      ? colorConfig.primaryColor
      : hasValue
        ? colorConfig.defaultLabelColor
        : colorConfig.placeholderColor;

  const styleConfig = useMemo(() => {
    const baseStyle = {
      width: '100%' as const,
      justifyContent: isTextArea ? 'flex-start' as const : 'center' as const,
      borderRadius,
      paddingHorizontal,
      backgroundColor: inputBgColor || palette.background.base,
      paddingTop: boxStyle === 'inbox' ? 13 : 0,
    };

    // 박스 스타일에 따른 테두리 설정
    let borderStyle = {};
    if (boxStyle === 'outline' || boxStyle === 'inbox') {
      borderStyle = { borderWidth };
    } else if (boxStyle === 'underline') {
      borderStyle = { borderBottomWidth: borderWidth };
    }

    // innerBoxStyle에 따른 스타일 설정
    let innerStyle = {};
    if (innerBoxStyle === 'top') {
      innerStyle = {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: borderWidth / 2
      };
    } else if (innerBoxStyle === 'middle') {
      innerStyle = {
        borderRadius: 0,
        borderTopWidth: borderWidth / 2,
        borderBottomWidth: borderWidth / 2
      };
    } else if (innerBoxStyle === 'bottom') {
      innerStyle = {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTopWidth: borderWidth / 2
      };
    }

    return { ...baseStyle, ...borderStyle, ...innerStyle };
  }, [isTextArea, borderRadius, paddingHorizontal, inputBgColor, borderWidth, boxStyle, innerBoxStyle, palette.background.base]);

  const labelTextStyle: StyleProp<TextStyle> = useMemo(() => ({
    fontSize,
    top: animationConstants.baseTop,
    left: paddingHorizontal,
    transformOrigin: 'left center',
    backgroundColor: labelBgColor || palette.background.base,
    paddingHorizontal: boxStyle === 'outline' ? 5 : 0,
    paddingVertical: 2,
    textAlignVertical: 'center' as const,
    fontFamily,
    borderRadius: boxStyle === 'outline' ? 5 : 0,
    ...(Platform.OS === 'android' ? { overflow: 'hidden' as const } : {}),
  }), [fontSize, animationConstants.baseTop, paddingHorizontal, labelBgColor, palette.background.base, boxStyle, fontFamily]);

  const handleTextChange = (text: string) => {
    if (onChangeText) onChangeText(text);
  };

  const textInputStyle = useMemo(() => [
    {
      paddingTop: 7 + iosOffset,
      paddingBottom: 5 + iosOffset,
      color: palette.text.base,
      fontSize,
      width: '100%' as const,
      paddingRight: 25,
      fontFamily,
      ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
    },
    textInputProps?.style,
  ], [palette.text.base, fontSize, fontFamily, textInputProps?.style]);

  const shouldShowCloseButton = value && isFocusedForUI;
  const shouldShowError = status === 'error' && errorMessage;

  return (
    <ViewAtom style={{ alignSelf: 'stretch', width: '100%' }}>
      <ViewAtom
        style={[styleConfig, { borderColor: currentBorderColor }]}
        onLayout={handleLayout}
        pointerEvents={disabled ? 'none' : 'auto'}
      >
        <TextInput
          {...textInputProps}
          ref={ref}
          style={textInputStyle}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleTextChange}
          allowFontScaling={allowFontScaling}
          selectionColor={palette.grey[50]}
          autoCorrect={false}
          spellCheck={false}
        />

        <ViewAtom pointerEvents="none" style={{ position: 'absolute' }}>
          <Animated.Text allowFontScaling={allowFontScaling} style={[labelTextStyle, { color: currentLabelColor }, animatedLabelStyle]}>
            {label}
          </Animated.Text>
        </ViewAtom>

        {shouldShowCloseButton && (
          <ButtonClose marginTop={isTextArea ? 13 : undefined} onChangeText={onChangeText} />
        )}
      </ViewAtom>

      {shouldShowError && (
        <ErrorComponent errorMessage={errorMessage} errorColor={fErrorColor} />
      )}
    </ViewAtom>
  );
});

ZSTextField.displayName = 'ZSTextField';

export default ZSTextField;
