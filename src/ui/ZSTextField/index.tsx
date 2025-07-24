import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { LayoutChangeEvent, Platform, StyleProp, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
  let fErrorColor = errorColor || palette.danger.main;

  // 폰트 크기 및 패밀리 추출
  const fontSize = useMemo(() => extractStyle(typography[primaryStyle][subStyle], 'fontSize') as number || 17, [typography, primaryStyle, subStyle]);
  const fontFamily = useMemo(() => extractStyle(typography[primaryStyle][subStyle], 'fontFamily') as string || '', [typography, primaryStyle, subStyle]);

  // 컴포넌트 상태 관리
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const labelAnimationValue = useSharedValue(0);
  const boxHeightValue = useSharedValue(0);

  // 포커스 및 값 변경 시 라벨 애니메이션 트리거
  useEffect(() => {
    labelAnimationValue.value = withTiming(
      value !== '' || isFocused ? 1 : 0,
      { duration: 150 }
    );
  }, [value, isFocused]);

  // 라벨 애니메이션 스타일
  const animatedLabelStyle = useAnimatedStyle(() => {
    const labelFontSize = interpolate(
      labelAnimationValue.value,
      [0, 1],
      [fontSize + (boxStyle === 'inbox' ? 1 : 0), boxStyle === 'inbox' ? 10 : 11],
      'clamp'
    );

    const labelTop = interpolate(
      labelAnimationValue.value,
      [0, 1],
      [
        isTextArea ? 12 : 0,
        isTextArea ? -12 : -(boxHeightValue.value / 2) - 1 + (boxStyle === 'inbox' ? 17 : 2),
      ],
      'clamp'
    );

    return {
      top: labelTop,
      fontSize: labelFontSize,
    };
  });

  // 레이아웃 핸들러
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (boxHeightValue.value !== height) boxHeightValue.value = height;
  }, [boxHeightValue]);

  // 포커스 및 블러 핸들러
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  // 상태에 따른 테두리 색상 설정
  const computedBorderColor = useMemo(() => (
    status === 'error' ? fErrorColor : isFocused ? (focusColor || palette.primary.main) : (borderColor || palette.grey[30])
  ), [status, fErrorColor, isFocused, focusColor, borderColor, palette]);

  // 상태에 따른 라벨 색상 설정
  const computedLabelColor = useMemo(() => (
    status === 'error' ? fErrorColor : isFocused ? (focusColor || palette.primary.main) : value ? (labelColor || palette.text.secondary) : (placeHolderColor || palette.grey[40])
  ), [status, fErrorColor, isFocused, focusColor, value, placeHolderColor, labelColor, palette]);

  // 컨테이너 스타일 정의
  const containerStyle: StyleProp<ViewStyle> = useMemo(() => ({
    width: '100%',
    justifyContent: isTextArea ? 'flex-start' : 'center',
    borderRadius,
    paddingHorizontal,
    backgroundColor: inputBgColor || palette.background.base,
    paddingTop: boxStyle === 'inbox' ? 13 : 0,
    ...(boxStyle === 'outline' || boxStyle === 'inbox' ? { borderWidth } : {}),
    ...(boxStyle === 'underline' ? { borderBottomWidth: borderWidth } : {}),
    ...(innerBoxStyle === 'top' ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: borderWidth / 2 }
      : innerBoxStyle === 'middle' ? { borderRadius: 0, borderTopWidth: borderWidth / 2, borderBottomWidth: borderWidth / 2 }
        : innerBoxStyle === 'bottom' ? { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: borderWidth / 2 }
          : {}),
  }), [isTextArea, borderRadius, paddingHorizontal, inputBgColor, borderWidth, boxStyle, innerBoxStyle, palette]);

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
  }), [fontSize, paddingHorizontal, labelBgColor, boxStyle, fontFamily, palette]);

  // 텍스트 변경 핸들러
  const handleTextChange = useCallback((text: string) => {
    if (onChangeText) onChangeText(text);
  }, [onChangeText]);

  return (
    <ViewAtom style={{ alignSelf: 'stretch', width: '100%' }}>
      <ViewAtom
        style={[containerStyle, { borderColor: computedBorderColor }]}
        onLayout={handleLayout}
        pointerEvents={disabled ? 'none' : 'auto'}
      >
        <TextInput
          {...textInputProps}
          style={[
            { paddingTop: 7 + iosOffset, paddingBottom: 5 + iosOffset, color: palette.text.base },
            textInputProps?.style,
            { fontSize, width: '100%', paddingRight: 25, fontFamily },
          ]}
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
          <Animated.Text allowFontScaling={allowFontScaling} style={[animatedLabelStyle, labelTextStyle, { color: computedLabelColor }]}>
            {label}
          </Animated.Text>
        </ViewAtom>

        {(value && isFocused) && (
          <ButtonClose marginTop={isTextArea ? 13 : undefined} onChangeText={onChangeText} />
        )}
      </ViewAtom>

      {status === 'error' && errorMessage && (
        <ErrorComponent errorMessage={errorMessage} errorColor={fErrorColor} />
      )}
    </ViewAtom>
  );
}

export default React.memo(ZSTextField);
