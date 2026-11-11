import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../../kit/layout';
import { POOPEE, type PoopeeKind } from '../../../model/diary/poopee';
import { poopeeImage } from './poopeeImages';

type Props = {
  kind: PoopeeKind;
  value: string | null;
  onSelect: (code: string) => void;
};

const IMAGE = 56;
const PRESS_DELAY = 130;

function CheckMark({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const poopeeSheetTitle = (kind: PoopeeKind) => POOPEE[kind].title;

export default function PoopeeOptionSheet({ kind, value, onSelect }: Props) {
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const meta = POOPEE[kind];
  return (
    <View style={styles.root}>
      <ScrollView style={{ maxHeight: Math.round(windowHeight * 0.6) }} contentContainerStyle={styles.list} accessibilityRole="radiogroup">
        {meta.options.map((option, index) => {
          const selected = option.code === value;
          return (
            <ZSPressable
              key={option.code}
              onPress={() => onSelect(option.code)}
              unstable_pressDelay={PRESS_DELAY}
              radius="xl"
              backgroundColor="surface2"
              accessibilityRole="radio"
              accessibilityLabel={`${option.label}, ${option.description}`}
              accessibilityState={{ checked: selected }}
              testID={`poopee-option-${kind}-${index}`}
              style={styles.row}
            >
              <View style={[styles.image, { backgroundColor: colors.background }]}>
                <Image source={poopeeImage(kind, option.code)} style={styles.imageInner} resizeMode="contain" />
              </View>
              <View style={styles.text}>
                <ZSText variant="subtitle1" emphasized>
                  {option.label}
                </ZSText>
                <ZSText variant="body2" color="textSecondary">
                  {option.description}
                </ZSText>
              </View>
              {selected ? <CheckMark color={colors.primaryMark} /> : null}
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
  image: { width: IMAGE, height: IMAGE, borderRadius: IMAGE / 2, alignItems: 'center', justifyContent: 'center' },
  imageInner: { width: IMAGE - 8, height: IMAGE - 8 },
  text: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
});
