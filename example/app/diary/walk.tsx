import { Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ZSPressable, ZSScreen, ZSText, useOverlay, useTheme } from '@0610studio/zs-ui';
import RecipeHeader from '../../src/ui/recipe/RecipeHeader';
import ContentIcon from '../../src/ui/kit/ContentIcon';
import { GAP } from '../../src/ui/kit/layout';
import { COLUMN_GAP, usePageInset, useWideLayout } from '../../src/ui/kit/SplitColumns';
import { NOT_IN_EXAMPLE_MESSAGE } from '../../src/model/diary/common';
import { WALK_HOW_TO } from '../../src/model/diary/walk';

const ART = 72;

function HowCard({ title, description, image, onPress, testID }: { title: string; description: string; image: number; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  const wide = useWideLayout();
  return (
    <ZSPressable onPress={onPress} radius="xl" backgroundColor="surface2" accessibilityRole="button" accessibilityLabel={`${title}, ${description}`} testID={testID} style={[styles.card, wide ? styles.cardWide : null]}>
      {wide ? (
        <View style={styles.tileTop}>
          <Image source={image} style={styles.art} resizeMode="contain" />
          <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} />
        </View>
      ) : (
        <Image source={image} style={styles.art} resizeMode="contain" />
      )}
      <View style={styles.cardText}>
        <ZSText variant="subtitle1" emphasized>
          {title}
        </ZSText>
        <ZSText variant="body2" color="textSecondary" lineBreakStrategyIOS="hangul-word">
          {description}
        </ZSText>
      </View>
      {wide ? null : <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} />}
    </ZSPressable>
  );
}

export default function DiaryWalkHowTo() {
  const { showSnackbar } = useOverlay();
  const wide = useWideLayout();
  const inset = usePageInset();
  return (
    <>
      <RecipeHeader title="산책" />
      <ZSScreen backgroundColor="background" style={[styles.container, { paddingHorizontal: inset }]}>
        <ZSText variant="h2" emphasized accessibilityRole="header">
          {WALK_HOW_TO.title}
        </ZSText>
        <View style={wide ? styles.cardsWide : styles.cards}>
          <HowCard
            title={WALK_HOW_TO.live.title}
            description={WALK_HOW_TO.live.description}
            image={require('../../assets/barabom/walk/walk_dog.png')}
            onPress={() => showSnackbar({ message: NOT_IN_EXAMPLE_MESSAGE })}
            testID="diary-walk-live"
          />
          <HowCard
            title={WALK_HOW_TO.manual.title}
            description={WALK_HOW_TO.manual.description}
            image={require('../../assets/barabom/walk/male_phone.png')}
            onPress={() => router.replace({ pathname: '/diary/write/[category]', params: { category: 'walk' } })}
            testID="diary-walk-manual"
          />
        </View>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: GAP['2xl'], paddingBottom: GAP['3xl'], gap: GAP['2xl'] },
  cards: { gap: GAP.md },
  cardsWide: { flexDirection: 'row', alignItems: 'stretch', gap: COLUMN_GAP },
  card: { flexDirection: 'row', alignItems: 'center', gap: GAP.lg, padding: GAP.lg },
  cardWide: { flex: 1, flexDirection: 'column', alignItems: 'stretch', gap: GAP.md },
  tileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  art: { width: ART, height: ART },
  cardText: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
});
