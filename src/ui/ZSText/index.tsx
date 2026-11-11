import React from 'react';
import { Platform, Text, type TextProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { resolveColor, type ColorName } from '../../theme/color';
import { IOS_TEXT_STYLE, type TextVariant } from '../../theme/typeScale';
import { useSkeletonTextLayout } from '../ZSSkeleton/SkeletonShapes';

export interface ZSTextProps extends TextProps {
  variant?: TextVariant;
  emphasized?: boolean;
  color?: ColorName | (string & {});
}

function ZSText({ variant = 'body1', emphasized = false, color = 'text', style, onTextLayout, maxFontSizeMultiplier, ...props }: ZSTextProps) {
  const { colors, typography, maxFontSizeMultiplier: appMaxFontSizeMultiplier } = useTheme();
  const typeStyle = emphasized ? typography.emphasized[variant] : typography[variant];
  const handleTextLayout = useSkeletonTextLayout(onTextLayout);

  return (
    <Text
      {...(Platform.OS === 'ios' ? { dynamicTypeRamp: IOS_TEXT_STYLE[variant], lineBreakStrategyIOS: 'hangul-word' as const } : null)}
      {...props}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? appMaxFontSizeMultiplier}
      onTextLayout={handleTextLayout}
      style={[typeStyle, { color: resolveColor(colors, color) }, style]}
    />
  );
}

export default React.memo(ZSText);
