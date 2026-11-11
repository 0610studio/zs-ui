import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { resolveColor, type ColorName } from '../../theme/color';
import type { ShadowToken } from '../../theme/shadow';

export interface ZSBoxProps extends ViewProps {
  backgroundColor?: ColorName | (string & {});
  shadow?: ShadowToken;
}

function ZSBox({ backgroundColor, shadow = 'none', style, ...props }: ZSBoxProps) {
  const { colors, shadows } = useTheme();
  const resolved = resolveColor(colors, backgroundColor);
  return <View {...props} style={[resolved ? { backgroundColor: resolved } : null, shadows[shadow], style]} />;
}

export default React.memo(ZSBox);
