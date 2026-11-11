import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';
import type { DiaryOption } from '../../model/diary/abnormal';

type Props = {
  options: DiaryOption[];
  value: string | null;
  onSelect: (code: string) => void;
  testID: string;
};

const PRESS_DELAY = 130;

export default function OptionCardSheet({ options, value, onSelect, testID }: Props) {
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <ScrollView style={{ maxHeight: Math.round(windowHeight * 0.6) }} contentContainerStyle={styles.list} accessibilityRole="radiogroup">
        {options.map((option, index) => {
          const selected = option.code === value;
          return (
            <ZSPressable
              key={option.code}
              onPress={() => onSelect(option.code)}
              unstable_pressDelay={PRESS_DELAY}
              radius="xl"
              backgroundColor="surface2"
              accessibilityRole="radio"
              accessibilityLabel={option.description ? `${option.label}, ${option.description}` : option.label}
              accessibilityState={{ checked: selected }}
              testID={`${testID}-${index}`}
              style={styles.row}
            >
              <View style={styles.text}>
                <ZSText variant="subtitle1" emphasized>
                  {option.label}
                </ZSText>
                {option.description ? (
                  <ZSText variant="body2" color="textSecondary">
                    {option.description}
                  </ZSText>
                ) : null}
              </View>
              {selected ? (
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={colors.primaryMark} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              ) : null}
            </ZSPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.lg },
  list: { gap: GAP.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: GAP.lg, paddingVertical: GAP.md, paddingHorizontal: GAP.lg },
  text: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
});
