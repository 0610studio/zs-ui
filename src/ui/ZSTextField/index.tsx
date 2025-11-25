import React, { useMemo, useCallback, useState, useEffect, forwardRef } from 'react';
import { LayoutChangeEvent, Platform, StyleProp, TextInput, TextInputProps, TextStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ButtonClose from './ui/ButtonClose';
import ErrorComponent from './ui/ErrorComponent';
import { TypoOptions, TypoStyle, TypoSubStyle } from '../../theme/types';
import { extractStyle } from '../../model/utils';
import { useTheme } from '../../context/ThemeContext';
import ViewAtom from '../atoms/ViewAtom';

export type BoxStyle = 'outline' | 'underline' | 'inbox';

const iosOffset = Platform.OS === 'ios' ? 8 : 4;

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

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const boxHeightValue = useSharedValue(0);
  
  const hasValue = value !== '';
  const isError = status === 'error';
  
  const labelAnimationValue = useSharedValue(0);
  const focusAnimationValue = useSharedValue(0);
  const errorAnimationValue = useSharedValue(0);

  useEffect(() => {
    const animationOptions = { duration: 200 };
    
    labelAnimationValue.value = withTiming(hasValue || isFocused ? 1 : 0, animationOptions);
    focusAnimationValue.value = withTiming(isFocused ? 1 : 0, animationOptions);
    errorAnimationValue.value = withTiming(isError ? 1 : 0, animationOptions);
  }, [hasValue, isFocused, isError, labelAnimationValue, focusAnimationValue, errorAnimationValue]);

  const animationConstants = useMemo(() => ({
    baseFontSize: fontSize + (boxStyle === 'inbox' ? 1 : 0),
    targetFontSize: boxStyle === 'inbox' ? 10 : 11,
    baseTop: isTextArea ? 12 : 0,
    targetTopOffset: boxStyle === 'inbox' ? 17 : 2,
  }), [fontSize, boxStyle, isTextArea]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    'worklet';
    
    const labelFontSize = interpolate(
      labelAnimationValue.value,
      [0, 1],
      [animationConstants.baseFontSize, animationConstants.targetFontSize],
      'clamp'
    );

    const labelTop = interpolate(
      labelAnimationValue.value,
      [0, 1],
      [
        animationConstants.baseTop,
        isTextArea ? -12 : -(boxHeightValue.value / 2) - 1 + animationConstants.targetTopOffset,
      ],
      'clamp'
    );

    return {
      top: labelTop,
      fontSize: labelFontSize,
    };
  }, [animationConstants, isTextArea]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    boxHeightValue.value = height;
  }, [boxHeightValue]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const colorConfig = useMemo(() => ({
    primaryColor: focusColor || palette.primary.main,
    defaultBorderColor: borderColor || palette.grey[30],
    defaultLabelColor: labelColor || palette.text.secondary,
    placeholderColor: placeHolderColor || palette.grey[40],
    errorColor: fErrorColor,
  }), [focusColor, palette.primary.main, borderColor, palette.grey, labelColor, palette.text.secondary, placeHolderColor, fErrorColor]);

  const animatedColorStyle = useAnimatedStyle(() => {
    'worklet';
    
    const borderColor = errorAnimationValue.value > 0 
      ? colorConfig.errorColor
      : focusAnimationValue.value > 0
        ? colorConfig.primaryColor
        : colorConfig.defaultBorderColor;
    
    return {
      borderColor,
    };
  }, [colorConfig]);

  const animatedLabelColorStyle = useAnimatedStyle(() => {
    'worklet';
    
    const labelColor = errorAnimationValue.value > 0
      ? colorConfig.errorColor
      : focusAnimationValue.value > 0
        ? colorConfig.primaryColor
        : labelAnimationValue.value > 0
          ? colorConfig.defaultLabelColor
          : colorConfig.placeholderColor;
    
    return {
      color: labelColor,
    };
  }, [colorConfig]);

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

  const labelTextStyle: StyleProp<TextStyle> = {
    fontSize,
    left: paddingHorizontal,
    backgroundColor: labelBgColor || palette.background.base,
    paddingHorizontal: boxStyle === 'outline' ? 5 : 0,
    paddingVertical: 2,
    textAlignVertical: 'center',
    fontFamily,
    borderRadius: boxStyle === 'outline' ? 5 : 0,
    overflow: 'hidden',
  };

  const handleTextChange = (text: string) => {
    if (onChangeText) onChangeText(text);
  };

  const textInputStyle = [
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
  ];

  const shouldShowCloseButton = value && isFocused;
  const shouldShowError = status === 'error' && errorMessage;

  return (
    <ViewAtom style={{ alignSelf: 'stretch', width: '100%' }}>
      <Animated.View
        style={[styleConfig, animatedColorStyle]}
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
          <Animated.Text allowFontScaling={allowFontScaling} style={[animatedLabelStyle, labelTextStyle, animatedLabelColorStyle]}>
            {label}
          </Animated.Text>
        </ViewAtom>

        {shouldShowCloseButton && (
          <ButtonClose marginTop={isTextArea ? 13 : undefined} onChangeText={onChangeText} />
        )}
      </Animated.View>

      {shouldShowError && (
        <ErrorComponent errorMessage={errorMessage} errorColor={fErrorColor} />
      )}
    </ViewAtom>
  );
});

ZSTextField.displayName = 'ZSTextField';

export default ZSTextField;
