import { Image, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';
import { DIARY_CATEGORIES, SELECT_SHEET_TITLE, type DiaryCategoryCode } from '../../model/diary/categories';
import { categoryIcon } from './diaryAssets';

const ICON = 32;
const CELL_SURFACE = Platform.OS === 'android' ? 'surface3' : 'surface2';

type Props = {
  onPick: (code: DiaryCategoryCode) => void;
};

/** 시트 헤더 — 제목은 showBottomSheet header 로(헤더 줄에서 시트를 끈다), 수첩 설명 (?) 는 headerRight 로 */
export const CATEGORY_SHEET_TITLE = SELECT_SHEET_TITLE;

export function CategoryHelpButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <ZSPressable onPress={onPress} radius="full" accessibilityRole="button" accessibilityLabel="수첩 설명 보기" testID="diary-select-help" style={styles.help}>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={9.2} stroke={colors.textSecondary} strokeWidth={1.8} fill="none" />
        <Path d="M9.6 9.4a2.5 2.5 0 014.8.9c0 1.7-2.4 2.1-2.4 3.6M12 16.8v.2" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      </Svg>
    </ZSPressable>
  );
}

export default function CategorySheet({ onPick }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {DIARY_CATEGORIES.map((category) => (
          <View key={category.code} style={styles.cell}>
            <ZSPressable
              onPress={() => onPick(category.code)}
              radius="lg"
              backgroundColor={CELL_SURFACE}
              accessibilityRole="button"
              accessibilityLabel={category.label}
              testID={`diary-category-${category.code}`}
              style={styles.cellInner}
            >
              <Image source={categoryIcon(category.code)} style={styles.icon} resizeMode="contain" />
              <ZSText variant="caption" emphasized numberOfLines={1}>
                {category.label}
              </ZSText>
            </ZSPressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.xl },
  help: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GAP.xs },
  cell: { width: '33.333%', padding: GAP.xs },
  cellInner: { alignItems: 'center', justifyContent: 'center', gap: GAP.sm, paddingVertical: GAP.lg },
  icon: { width: ICON, height: ICON },
});
