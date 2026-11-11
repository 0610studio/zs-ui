import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ZSText } from '@0610studio/zs-ui';
import RecipeHeader from '../../../src/ui/recipe/RecipeHeader';
import { GAP, PAGE_INSET } from '../../../src/ui/kit/layout';
import { DIARY_SCREENS } from '../../../src/ui/diary/screens';
import type { DiaryCategoryCode } from '../../../src/model/diary/categories';

export default function DiaryWrite() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const Screen = DIARY_SCREENS[category as DiaryCategoryCode];
  if (Screen) return <Screen />;
  return (
    <>
      <RecipeHeader title="건강수첩" />
      <View style={styles.empty}>
        <ZSText variant="body1" color="textSecondary">
          준비 중인 수첩이에요
        </ZSText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: PAGE_INSET, gap: GAP.sm },
});
