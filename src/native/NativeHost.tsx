import React, { useMemo } from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import { Host } from '@expo/ui';
import type { HostProps as ComposeHostProps } from '@expo/ui/jetpack-compose';
import { dynamicTypeSize } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '../context/ThemeContext';
import { dynamicTypeSizeLimit } from '../theme/fontScale';
import { createMaterialColorScheme } from './composeColors';

export interface NativeHostProps {
  children: React.ReactNode;
  matchContents?: boolean | { vertical?: boolean; horizontal?: boolean };
  style?: StyleProp<ViewStyle>;
  testID?: string;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
}

export function NativeHost({ children, matchContents, style, testID, pointerEvents }: NativeHostProps) {
  const { mode, seedColor, colors, maxFontSizeMultiplier } = useTheme();
  const android = Platform.OS === 'android';
  const typeSizeLimit = Platform.OS === 'ios' ? dynamicTypeSizeLimit(maxFontSizeMultiplier) : undefined;
  const composeProps = useMemo<Pick<ComposeHostProps, 'colorOverrides'> | null>(
    () => (android ? { colorOverrides: createMaterialColorScheme(colors, mode) } : null),
    [android, colors, mode],
  );
  return (
    <Host
      colorScheme={mode}
      seedColor={android ? seedColor : colors.text}
      {...(typeSizeLimit ? { modifiers: [dynamicTypeSize({ max: typeSizeLimit })] } : null)}
      {...composeProps}
      matchContents={matchContents}
      style={style}
      testID={testID}
      pointerEvents={pointerEvents}
    >
      {children}
    </Host>
  );
}
