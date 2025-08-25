import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { LayoutChangeEvent, Platform, StyleProp, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming, runOnUI, useDerivedValue } from 'react-native-reanimated';
import ButtonClose from './ui/ButtonClose';
import ErrorComponent from './ui/ErrorComponent';
import { TypoOptions, TypoStyle, TypoSubStyle } from '../../theme';
import { extractStyle } from '../../model/utils';
import { useTheme } from '../../model/useThemeProvider';
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

function ZSTextField({
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
}: TextFieldProps): JSX.Element {
  const { typography, palette } = useTheme();
  const [primaryStyle, subStyle] = typo.split('.') as [TypoStyle, TypoSubStyle];
  const fErrorColor = errorColor || palette.danger.main;

  const fontSize = useMemo(() => {
    return extractStyle(typography[primaryStyle][subStyle], 'fontSize') as number || 17;
  }, [typography, primaryStyle, subStyle]);
  
  const fontFamily = useMemo(() => {
    return extractStyle(typography[primaryStyle][subStyle], 'fontFamily') as string || '';
  }, [typography, primaryStyle, subStyle]);

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const boxHeightValue = useSharedValue(0);
  const isFocusedValue = useSharedValue(false);
  const hasValueState = useSharedValue(false);
  const errorState = useSharedValue(false);

  const labelAnimationValue = useDerivedValue(() => {
    'worklet';
    const shouldShow = hasValueState.value || isFocusedValue.value;
    return withTiming(shouldShow ? 1 : 0, { duration: 100 });
  }, []);

  const focusAnimationValue = useDerivedValue(() => {
    'worklet';
    return withTiming(isFocusedValue.value ? 1 : 0, { duration: 150 });
  }, []);

  const errorAnimationValue = useDerivedValue(() => {
    'worklet';
    return withTiming(errorState.value ? 1 : 0, { duration: 150 });
  }, []);

  // 상태 동기화를 위한 useEffect
  useEffect(() => {
    runOnUI(() => {
      'worklet';
      isFocusedValue.value = isFocused;
      hasValueState.value = value !== '';
      errorState.value = status === 'error';
    })();
  }, [value, isFocused, status, isFocusedValue, hasValueState, errorState]);

  const animationConstants = {
    baseFontSize: fontSize + (boxStyle === 'inbox' ? 1 : 0),
    targetFontSize: boxStyle === 'inbox' ? 10 : 11,
    baseTop: isTextArea ? 12 : 0,
    targetTopOffset: boxStyle === 'inbox' ? 17 : 2,
  };

  // 라벨 애니메이션 스타일
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
  }, [animationConstants.baseFontSize, animationConstants.targetFontSize, animationConstants.baseTop, animationConstants.targetTopOffset, isTextArea]);

  // 레이아웃 핸들러
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    'worklet';
    
    const { height } = event.nativeEvent.layout;
    if (boxHeightValue.value !== height) boxHeightValue.value = height;
  }, [boxHeightValue]);

  // 포커스 및 블러 핸들러
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const colorConfig = useMemo(() => ({
    primaryColor: focusColor || palette.primary.main,
    defaultBorderColor: borderColor || palette.grey[30],
    defaultLabelColor: labelColor || palette.text.secondary,
    placeholderColor: placeHolderColor || palette.grey[40],
    errorColor: fErrorColor,
  }), [focusColor, palette.primary.main, borderColor, palette.grey, labelColor, palette.text.secondary, placeHolderColor, fErrorColor]);

  // 애니메이션된 색상 스타일
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
  }, [colorConfig, errorAnimationValue, focusAnimationValue]);

  // 애니메이션된 라벨 색상 스타일
  const animatedLabelColorStyle = useAnimatedStyle(() => {
    'worklet';
    
    const hasValueAnimation = hasValueState.value ? 1 : 0;
    const labelColor = errorAnimationValue.value > 0
      ? colorConfig.errorColor
      : focusAnimationValue.value > 0
        ? colorConfig.primaryColor
        : hasValueAnimation > 0
          ? colorConfig.defaultLabelColor
          : colorConfig.placeholderColor;
    
    return {
      color: labelColor,
    };
  }, [colorConfig, errorAnimationValue, focusAnimationValue]);

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

  // 컨테이너 스타일 정의
  const containerStyle: StyleProp<ViewStyle> = styleConfig;

  // 라벨 스타일 정의
  const labelTextStyle: StyleProp<TextStyle> = useMemo(() => ({
    fontSize,
    left: paddingHorizontal,
    backgroundColor: labelBgColor || palette.background.base,
    paddingHorizontal: boxStyle === 'outline' ? 5 : 0,
    paddingVertical: 2,
    textAlignVertical: 'center',
    fontFamily,
    borderRadius: boxStyle === 'outline' ? 5 : 0,
    overflow: 'hidden',
  }), [fontSize, paddingHorizontal, labelBgColor, boxStyle, fontFamily, palette.background.base]);

  // 텍스트 변경 핸들러
  const handleTextChange = useCallback((text: string) => {
    if (onChangeText) onChangeText(text);
  }, [onChangeText]);

  const textInputStyle = useMemo(() => [
    { 
      paddingTop: 7 + iosOffset, 
      paddingBottom: 5 + iosOffset, 
      color: palette.text.base,
      fontSize, 
      width: '100%' as const, 
      paddingRight: 25, 
      fontFamily 
    },
    textInputProps?.style,
  ], [palette.text.base, fontSize, fontFamily, textInputProps?.style]);

  const shouldShowCloseButton = value && isFocused;
  const shouldShowError = status === 'error' && errorMessage;

  return (
    <ViewAtom style={{ alignSelf: 'stretch', width: '100%' }}>
      <Animated.View
        style={[containerStyle, animatedColorStyle]}
        onLayout={handleLayout}
        pointerEvents={disabled ? 'none' : 'auto'}
      >
        <TextInput
          {...textInputProps}
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
}

const arePropsEqual = (prevProps: TextFieldProps, nextProps: TextFieldProps): boolean => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.status === nextProps.status &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.errorMessage === nextProps.errorMessage &&
    prevProps.typo === nextProps.typo &&
    prevProps.boxStyle === nextProps.boxStyle &&
    prevProps.innerBoxStyle === nextProps.innerBoxStyle &&
    prevProps.isTextArea === nextProps.isTextArea &&
    prevProps.label === nextProps.label &&
    prevProps.focusColor === nextProps.focusColor &&
    prevProps.borderColor === nextProps.borderColor &&
    prevProps.labelColor === nextProps.labelColor &&
    prevProps.onChangeText === nextProps.onChangeText
  );
};

export default React.memo(ZSTextField, arePropsEqual);
