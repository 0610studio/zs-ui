import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { RADIUS, radiusStyle, useTheme, type RadiusToken } from '@0610studio/zs-ui';

export type AnimalPhotoKind = 'bori' | 'nabi' | 'somi' | 'kkami';

type Scene = { top: string; wall: string; floor0: string; floor1: string; horizon: number; fur: string; fur2: string; furD: string; shape: 'dog' | 'cat' | 'rabbit' };

const SCENES: Record<AnimalPhotoKind, Scene> = {
  bori: { top: '#dfe5e8', wall: '#cfd8d9', floor0: '#b4bf9f', floor1: '#9eab88', horizon: 64, fur: '#684a30', fur2: '#80603f', furD: '#553b25', shape: 'dog' },
  nabi: { top: '#e3e4e6', wall: '#d3d5d9', floor0: '#b8a58c', floor1: '#a28d73', horizon: 70, fur: '#3b3734', fur2: '#4d4844', furD: '#2c2927', shape: 'cat' },
  somi: { top: '#e7e5ea', wall: '#d9d6df', floor0: '#c6c2cd', floor1: '#b5b0bd', horizon: 68, fur: '#a3826a', fur2: '#b8987e', furD: '#8f7058', shape: 'rabbit' },
  kkami: { top: '#e4e5e2', wall: '#d5d8d3', floor0: '#bfb6a4', floor1: '#aca290', horizon: 62, fur: '#2f2b28', fur2: '#3f3a36', furD: '#1f1c1a', shape: 'dog' },
};

type Fit = { scale: number; cx: number; base: number };

const SQUARE_FIT: Record<AnimalPhotoKind, Fit> = {
  bori: { scale: 0.98, cx: 0.6, base: 1.06 },
  nabi: { scale: 0.9, cx: 0.5, base: 1.03 },
  somi: { scale: 0.84, cx: 0.5, base: 0.98 },
  kkami: { scale: 0.98, cx: 0.6, base: 1.06 },
};

const PHOTO_DIM_DARK = 0.36;
const PHOTO_EDGE_DARK = 'rgba(255,255,255,0.08)';
const HIGHLIGHT = { light: 0.42, dark: 0.12 } as const;

type Props = {
  kind: AnimalPhotoKind;
  width: number;
  height: number;
  radius?: RadiusToken;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function AnimalPhoto({ kind, width, height, radius = 'lg', accessibilityLabel, style }: Props) {
  const { mode } = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const scene = SCENES[kind];
  const dark = mode === 'dark';
  const fit = SQUARE_FIT[kind];
  const size = height * fit.scale;
  const x = width * fit.cx - size / 2;
  const y = height * fit.base - size;
  const corner = radiusStyle(radius);

  return (
    <View
      style={[{ width, height, overflow: 'hidden' }, corner, style]}
      accessible={accessibilityLabel != null}
      accessibilityRole={accessibilityLabel != null ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel != null ? 'yes' : 'no-hide-descendants'}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={scene.top} />
            <Stop offset={(scene.horizon - 0.5) / 100} stopColor={scene.wall} />
            <Stop offset={scene.horizon / 100} stopColor={scene.floor0} />
            <Stop offset="1" stopColor={scene.floor1} />
          </LinearGradient>
          <RadialGradient id={`${id}hi`} gradientUnits="userSpaceOnUse" cx={width * 0.28} cy={height * 0.12} rx={width * 0.9} ry={height * 0.7} fx={width * 0.28} fy={height * 0.12}>
            <Stop offset="0" stopColor="#ffffff" stopOpacity={dark ? HIGHLIGHT.dark : HIGHLIGHT.light} />
            <Stop offset="0.6" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`${id}sh`}>
            <Stop offset="0" stopColor="#000000" stopOpacity={0.2} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={`${id}fur`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={scene.fur2} />
            <Stop offset="1" stopColor={scene.fur} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id}bg)`} />
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id}hi)`} />
        <Ellipse cx={x + size * 0.53} cy={y + size * 0.99} rx={size * 0.41} ry={size * 0.06} fill={`url(#${id}sh)`} />
        <G transform={`translate(${x}, ${y}) scale(${size / 200})`}>
          <Silhouette shape={scene.shape} fur={`url(#${id}fur)`} furD={scene.furD} />
        </G>
      </Svg>
      {dark ? <DarkDim radius={RADIUS[radius]} /> : null}
    </View>
  );
}

function DarkDim({ radius }: { radius: number }) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: radius, borderCurve: 'continuous', backgroundColor: `rgba(0,0,0,${PHOTO_DIM_DARK})`, borderWidth: 0.5, borderColor: PHOTO_EDGE_DARK }]}
    />
  );
}

function Silhouette({ shape, fur, furD }: { shape: Scene['shape']; fur: string; furD: string }) {
  if (shape === 'cat') {
    return (
      <>
        <Path d="M136 189c26 2 40-14 34-34" fill="none" stroke={fur} strokeWidth={10} strokeLinecap="round" />
        <Path d="M82 92c-18 18-26 52-22 96 0 5 4 8 9 8h62c5 0 9-3 9-8 4-44-4-78-22-96z" fill={fur} />
        <Path d="M70 66 72 24l26 22zM130 66l-2-42-26 22z" fill={fur} stroke={fur} strokeWidth={6} strokeLinejoin="round" />
        <Ellipse cx={100} cy={68} rx={33} ry={29} fill={fur} />
        <Path d="M100 196v-36" stroke={furD} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </>
    );
  }
  if (shape === 'rabbit') {
    return (
      <>
        <Path d="M100 70c-22 0-36 14-36 32 0 8 3 14 7 19-14 10-23 28-23 46 0 16 10 27 24 27h56c14 0 24-11 24-27 0-18-9-36-23-46 4-5 7-11 7-19 0-18-14-32-36-32z" fill={fur} />
        <Path d="M88 74c-16-2-28 12-30 36-2 20 2 36 10 38s12-12 14-30c2-18 6-32 6-44z" fill={furD} />
        <Path d="M112 74c16-2 28 12 30 36 2 20-2 36-10 38s-12-12-14-30c-2-18-6-32-6-44z" fill={furD} />
      </>
    );
  }
  return (
    <>
      <Path d="M158 158c16-8 24-26 21-44" fill="none" stroke={fur} strokeWidth={10} strokeLinecap="round" />
      <Path d="M27 71c0-6 4-10 10-11l19-5c4-13 14-21 28-21 14 0 22 10 24 23 2 12 4 22 12 34 18 20 36 40 44 66 4 14 6 28 2 39H63c-2-16 0-36-1-56-1-18-3-36-7-48-4-6-10-8-18-10-6-1-10-5-10-11z" fill={fur} />
      <Path d="M85 39c12 0 18 12 17 28-1 13-6 21-12 21-7 0-9-10-9-22s0-26 4-27z" fill={furD} />
      <Ellipse cx={31} cy={69} rx={5.5} ry={4.5} fill={furD} />
      <Path d="M150 196c0-22-10-40-30-47" fill="none" stroke={furD} strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
    </>
  );
}
