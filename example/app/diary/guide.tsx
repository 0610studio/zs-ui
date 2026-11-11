import { Image, Platform, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { ZSScreen, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../../src/ui/kit/Section';
import { GAP, MODAL_MAX_WIDTH, PAGE_INSET } from '../../src/ui/kit/layout';
import { categoryIcon } from '../../src/ui/diary/diaryAssets';
import { CATEGORY_GROUPS, CATEGORY_GUIDE, findCategory } from '../../src/model/diary/categories';

const WELL = 48;

function Bullets({ lines }: { lines: string[] }) {
  return (
    <View style={styles.bullets}>
      {lines.map((line) => (
        <View key={line} style={styles.bullet}>
          <ZSText variant="body2" color="textSecondary">
            ·
          </ZSText>
          <ZSText variant="body2" color="textSecondary" style={styles.bulletText}>
            {line}
          </ZSText>
        </View>
      ))}
    </View>
  );
}

/** 수첩 설명 — 바라봄 수첩 설명 모달(묶음별 수첩 카드 + 함께 쓰는 기능). 전체 높이 모달 */
export default function DiaryGuide() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: '건강수첩' }} />
      {Platform.OS === 'ios' ? (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="xmark" accessibilityLabel="닫기" onPress={() => router.back()}>
            닫기
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <ZSScreen backgroundColor="background" maxContentWidth={MODAL_MAX_WIDTH} style={styles.container}>
        <View style={styles.hero}>
          <ZSText variant="h2" emphasized accessibilityRole="header">
            {CATEGORY_GUIDE.heroTitle}
          </ZSText>
          <ZSText variant="body1" color="textSecondary">
            {CATEGORY_GUIDE.heroDescription}
          </ZSText>
        </View>
        {CATEGORY_GROUPS.map((group) => (
          <Section key={group.title} label={group.title} surface="list">
            {group.codes.map((code) => {
              const category = findCategory(code);
              if (!category) return null;
              return (
                <View key={code} style={styles.card} testID={`diary-guide-${code}`}>
                  <View style={[styles.well, { backgroundColor: colors.background }]}>
                    <Image source={categoryIcon(code)} style={styles.icon} resizeMode="contain" />
                  </View>
                  <View style={styles.cardText}>
                    <ZSText variant="caption" emphasized color="textSecondary">
                      {category.label}
                    </ZSText>
                    <ZSText variant="subtitle1" emphasized>
                      {category.summary}
                    </ZSText>
                    <Bullets lines={category.features} />
                  </View>
                </View>
              );
            })}
          </Section>
        ))}
        <Section surface="group">
          <ZSText variant="subtitle1" emphasized>
            {CATEGORY_GUIDE.commonTitle}
          </ZSText>
          <Bullets lines={CATEGORY_GUIDE.commonFeatures} />
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: PAGE_INSET, paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP['2xl'] },
  hero: { gap: GAP.md },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: GAP.md, paddingVertical: GAP.lg },
  well: { width: WELL, height: WELL, borderRadius: WELL / 2, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 30, height: 30 },
  // flex: 1 대신 grow+shrink — 시트·모달 안 가로 줄 글이 줄바꿈되게
  cardText: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
  bullets: { gap: GAP.xxs, marginTop: GAP.xxs },
  bullet: { flexDirection: 'row', gap: GAP.xs },
  bulletText: { flexGrow: 1, flexShrink: 1 },
});
