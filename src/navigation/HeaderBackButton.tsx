import { StyleSheet, type ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import ZSPressable from '../ui/ZSPressable';
import { SPACE } from '../theme/spacing';
import { headerButtonContainerColor } from './headerButton';

const SIZE = 40;
const ARROW = 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z';

export function HeaderBackButton({ tintColor }: { tintColor?: ColorValue }) {
  const navigation = useNavigation();
  const { colors, accessibilityLabels } = useTheme();
  return (
    <ZSPressable
      onPress={() => navigation.goBack()}
      radius="full"
      backgroundColor={headerButtonContainerColor(colors)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabels.navigateUp}
      testID="zs-header-back"
      style={styles.button}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d={ARROW} fill={tintColor ?? colors.text} />
      </Svg>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  button: { width: SIZE, height: SIZE, marginEnd: SPACE.md, alignItems: 'center', justifyContent: 'center' },
});
