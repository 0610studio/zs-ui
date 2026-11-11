import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { radiusStyle, useTheme, withOpacity } from '@0610studio/zs-ui';
import type { FootprintPlace } from '../../model/diary/common';

type Props = {
  place: FootprintPlace;
  height?: number;
};

const WIDTH = 320;

export default function PlaceMap({ place, height = 140 }: Props) {
  const { colors, mode } = useTheme();
  const dark = mode === 'dark';
  const ground = dark ? '#23262b' : '#eef1ec';
  const green = dark ? '#24372a' : '#d5ead2';
  const water = dark ? '#1d3140' : '#cfe5f3';
  const road = dark ? '#3a3f46' : '#ffffff';
  const px = place.x * WIDTH;
  const py = place.y * height;
  return (
    <View style={[styles.root, radiusStyle('lg'), { height, borderColor: colors.border }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height={height} viewBox={`0 0 ${WIDTH} ${height}`} preserveAspectRatio="xMidYMid slice">
        <Rect x={0} y={0} width={WIDTH} height={height} fill={ground} />
        <Path d={`M0 ${height * 0.78} C ${WIDTH * 0.35} ${height * 0.62}, ${WIDTH * 0.6} ${height * 0.98}, ${WIDTH} ${height * 0.8} L ${WIDTH} ${height} L 0 ${height} Z`} fill={water} />
        <Rect x={WIDTH * 0.08} y={height * 0.12} width={WIDTH * 0.34} height={height * 0.42} rx={14} fill={green} />
        <Rect x={WIDTH * 0.6} y={height * 0.38} width={WIDTH * 0.3} height={height * 0.3} rx={14} fill={green} />
        <Path d={`M0 ${height * 0.58} L ${WIDTH} ${height * 0.5}`} stroke={road} strokeWidth={10} />
        <Path d={`M${WIDTH * 0.5} 0 L ${WIDTH * 0.46} ${height}`} stroke={road} strokeWidth={8} />
        <Circle cx={px} cy={py} r={18} fill={withOpacity(colors.primary, 0.25)} />
        <Path
          d={`M${px} ${py + 2} C ${px - 9} ${py - 8}, ${px - 11} ${py - 14}, ${px - 11} ${py - 19} A 11 11 0 1 1 ${px + 11} ${py - 19} C ${px + 11} ${py - 14}, ${px + 9} ${py - 8}, ${px} ${py + 2} Z`}
          fill={colors.primary}
          stroke={colors.onPrimary}
          strokeWidth={1.5}
        />
        <Circle cx={px} cy={py - 19} r={4} fill={colors.onPrimary} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
