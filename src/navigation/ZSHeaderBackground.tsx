import { useContext, useEffect, type RefObject } from 'react';
import { Platform, StyleSheet, View, type ColorValue, type HostInstance } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { timingConfig } from '../theme/motion';
import { mixHex } from '../ui/hexColor';
import { Veil, useVeilMaterial } from '../overlay/veil';
import { HeaderFillContext } from './headerFill';
import { useHeaderInset } from './useHeaderInset';

export interface ZSHeaderBackgroundProps {
  color?: ColorValue;
  scrolledColor?: ColorValue;
  scrolled?: boolean;
  height?: number;
  blurTarget?: RefObject<HostInstance | null>;
}

export function ZSHeaderBackground({ color, scrolledColor, scrolled = false, height, blurTarget }: ZSHeaderBackgroundProps) {
  const { colors } = useTheme();
  const headerInset = useHeaderInset();
  const coverHeight = height ?? headerInset;
  const progress = useSharedValue(scrolled ? 1 : 0);
  const veiled = scrolledColor === undefined;
  const material = useVeilMaterial('veil', blurTarget ?? null);
  const from = String(color ?? colors.background);
  const to = veiled ? (mixHex(material.color, from, material.opacity) ?? from) : String(scrolledColor);

  useEffect(() => {
    progress.value = withTiming(scrolled ? 1 : 0, timingConfig('fast'));
  }, [progress, scrolled]);

  const animatedStyle = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(progress.value, [0, 1], [from, to]) }));

  const reportFill = useContext(HeaderFillContext);
  const drawn = Platform.OS === 'android' && coverHeight > 0;
  useEffect(() => {
    if (!reportFill || !drawn) return undefined;
    reportFill({ progress, from, to });
    return () => reportFill(null);
  }, [reportFill, drawn, progress, from, to]);

  if (!drawn) return null;
  if (!veiled) return <Animated.View pointerEvents="none" style={[styles.cover, { height: coverHeight }, animatedStyle]} />;
  return (
    <View pointerEvents="none" style={[styles.cover, { height: coverHeight }]}>
      <Veil kind="veil" edge="bottom" floating={false} blurTarget={blurTarget ?? null} progress={progress} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { position: 'absolute', top: 0, left: 0, right: 0 },
});
