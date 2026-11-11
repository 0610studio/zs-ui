import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP, ROW_HEIGHT } from '../kit/layout';

type Props = {
  title: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  unit: string;
  testID: string;
};

export default function CountStepper({ title, value, onChange, min = 1, unit, testID }: Props) {
  const { colors } = useTheme();
  const atMin = value <= min;
  const button = (kind: 'minus' | 'plus') => {
    const disabled = kind === 'minus' && atMin;
    return (
      <ZSPressable
        onPress={() => onChange(kind === 'minus' ? Math.max(min, value - 1) : value + 1)}
        disabled={disabled}
        radius="full"
        accessibilityRole="button"
        accessibilityLabel={`${title} ${kind === 'minus' ? '줄이기' : '늘리기'}`}
        testID={`${testID}-${kind}`}
        style={[styles.button, { borderColor: colors.border }]}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24">
          <Path d={kind === 'minus' ? 'M5 12h14' : 'M12 5v14M5 12h14'} stroke={colors.text} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      </ZSPressable>
    );
  };
  return (
    <View style={styles.row}>
      <ZSText variant="subtitle1" style={styles.title}>
        {title}
      </ZSText>
      {button('minus')}
      <ZSText variant="subtitle1" emphasized accessibilityLiveRegion="polite" style={styles.value} testID={`${testID}-value`}>
        {`${value}${unit}`}
      </ZSText>
      {button('plus')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', minHeight: ROW_HEIGHT.double, flexDirection: 'row', alignItems: 'center', gap: GAP.sm, paddingVertical: GAP.md },
  title: { flexGrow: 1, flexShrink: 1 },
  button: { width: 36, height: 36, borderWidth: StyleSheet.hairlineWidth * 2, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 44, textAlign: 'center' },
});
