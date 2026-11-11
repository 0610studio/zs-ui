import { StyleSheet, View } from 'react-native';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';

type Props = {
  steps: readonly string[];
  current: number;
};

export default function StepProgress({ steps, current }: Props) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${steps.length}단계 중 ${current}단계, ${steps[current - 1] ?? ''}`}
      style={styles.root}
      testID="register-steps"
    >
      {steps.map((label, index) => {
        const reached = index < current;
        const now = index === current - 1;
        return (
          <View key={label} style={styles.step}>
            <View style={[styles.bar, { backgroundColor: reached ? colors.primary : colors.surface4 }]} />
            <ZSText variant="caption" emphasized={now} color={now ? 'text' : 'textSecondary'}>
              {label}
            </ZSText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', gap: GAP.sm },
  step: { flex: 1, gap: GAP.xs + GAP.xxs },
  bar: { height: 4, borderRadius: 2 },
});
