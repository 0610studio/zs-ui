import type { ReactNode } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ZSBox, ZSButton, ZSPressable, ZSText, radiusStyle, useTheme, withOpacity } from '@0610studio/zs-ui';
import AnimalPhoto from '../../kit/AnimalPhoto';
import ContentIcon from '../../kit/ContentIcon';
import { GAP, ROW_HEIGHT } from '../../kit/layout';
import { categoryIcon } from '../diaryAssets';
import { getCategory } from '../../../model/diary/categories';
import { OVERVIEW_EMPTY, OVERVIEW_TEXT, petSubline, type OverviewEmptyKind, type OverviewPet } from '../../../model/diary/overview';

const AVATAR = 52;
const EMPTY_ART = 72;

export function OverviewCard({ title, description, onPress, children, testID }: { title: string; description?: string; onPress: () => void; children: ReactNode; testID: string }) {
  const { colors } = useTheme();
  return (
    <ZSBox backgroundColor="surface2" style={[styles.card, radiusStyle('xl')]} testID={testID}>
      <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={OVERVIEW_TEXT.sectionA11y(title)} testID={`${testID}-title`} style={styles.titlePress}>
        <View style={styles.titleText}>
          <ZSText variant="subtitle1" emphasized accessibilityRole="header">
            {title}
          </ZSText>
          {description ? (
            <ZSText variant="caption" color="textSecondary">
              {description}
            </ZSText>
          ) : null}
        </View>
        <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} />
      </ZSPressable>
      {children}
    </ZSBox>
  );
}

export function EmptyCard({ kind, onPress }: { kind: OverviewEmptyKind; onPress: () => void }) {
  const { colors, mode } = useTheme();
  const empty = OVERVIEW_EMPTY[kind];
  const category = getCategory(empty.category);
  return (
    <ZSPressable
      onPress={onPress}
      radius="xl"
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${empty.title.replace('\n', ' ')}, ${OVERVIEW_TEXT.empty.recordAction}`}
      testID={`overview-empty-${kind}`}
      style={[styles.empty, { backgroundColor: withOpacity(category.color, mode === 'dark' ? 0.16 : 0.24) }]}
    >
      <View style={styles.emptyText}>
        <ZSText variant="caption" emphasized color="textSecondary">
          {category.label}
        </ZSText>
        <ZSText variant="subtitle1" emphasized>
          {empty.title}
        </ZSText>
        <View style={styles.emptyAction}>
          <ZSText variant="label" emphasized color="textSecondary">
            {OVERVIEW_TEXT.empty.recordAction}
          </ZSText>
          <ContentIcon name="chevronRight" size={16} color={colors.textSecondary} />
        </View>
      </View>
      <Image source={categoryIcon(empty.category)} style={styles.emptyArt} resizeMode="contain" />
    </ZSPressable>
  );
}

function SearchGlyph({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM15.5 15.5L20 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileCard({ pet, now, onChange, onAlbum, onExport, onSearch }: { pet: OverviewPet; now: Date; onChange: () => void; onAlbum: () => void; onExport: () => void; onSearch: () => void }) {
  const { colors } = useTheme();
  return (
    <ZSBox backgroundColor="surface2" style={[styles.card, radiusStyle('xl')]} testID="overview-profile">
      <View style={styles.petRow}>
        <AnimalPhoto kind={pet.photo} width={AVATAR} height={AVATAR} radius="full" />
        <View style={styles.petText}>
          <ZSText variant="h4" emphasized testID="overview-pet-name">
            {pet.name}
          </ZSText>
          <ZSText variant="caption" color="textSecondary">
            {petSubline(pet, now)}
          </ZSText>
        </View>
        <ZSButton title={OVERVIEW_TEXT.changePet} variant="tonal" size="small" onPress={onChange} accessibilityLabel={`반려동물 ${OVERVIEW_TEXT.changePet}`} testID="overview-change-pet" />
      </View>
      <View style={styles.actions}>
        <ZSButton title={OVERVIEW_TEXT.album} variant="outlined" color="neutral" size="small" onPress={onAlbum} style={styles.action} testID="overview-album" />
        <ZSButton title={OVERVIEW_TEXT.export} variant="outlined" color="neutral" size="small" onPress={onExport} style={styles.action} testID="overview-export" />
        <ZSPressable onPress={onSearch} radius="full" accessibilityRole="button" accessibilityLabel={OVERVIEW_TEXT.search} testID="overview-search" style={styles.search}>
          <SearchGlyph color={colors.text} />
          <ZSText variant="body2">{OVERVIEW_TEXT.search}</ZSText>
        </ZSPressable>
      </View>
    </ZSBox>
  );
}

export function PetSheet({ pets, current, now, onPick }: { pets: OverviewPet[]; current: OverviewPet['id']; now: Date; onPick: (pet: OverviewPet) => void }) {
  const { colors } = useTheme();
  const surface = Platform.OS === 'android' ? 'surface3' : 'surface2';
  return (
    <View style={styles.sheet}>
      <View style={styles.sheetList}>
        {pets.map((pet) => (
          <ZSPressable
            key={pet.id}
            onPress={() => onPick(pet)}
            radius="lg"
            backgroundColor={surface}
            accessibilityRole="radio"
            accessibilityState={{ selected: pet.id === current }}
            accessibilityLabel={pet.name}
            testID={`overview-pet-${pet.id}`}
            style={styles.sheetRow}
          >
            <AnimalPhoto kind={pet.photo} width={40} height={40} radius="full" />
            <View style={styles.petText}>
              <ZSText variant="subtitle1">{pet.name}</ZSText>
              <ZSText variant="caption" color="textSecondary">
                {petSubline(pet, now)}
              </ZSText>
            </View>
            {pet.id === current ? (
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={colors.primaryMark} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            ) : null}
          </ZSPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: GAP.lg, gap: GAP.md },
  titlePress: { flexDirection: 'row', alignItems: 'center', gap: GAP.sm, margin: -GAP.sm, padding: GAP.sm, borderRadius: 12 },
  titleText: { flex: 1, gap: GAP.xxs },
  empty: { flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingHorizontal: GAP.xl, paddingVertical: GAP.lg },
  emptyText: { flex: 1, gap: GAP.xs },
  emptyAction: { flexDirection: 'row', alignItems: 'center', gap: GAP.xxs, marginTop: GAP.xs },
  emptyArt: { width: EMPTY_ART, height: EMPTY_ART },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: GAP.md },
  petText: { flex: 1, gap: GAP.xxs },
  actions: { flexDirection: 'row', alignItems: 'center', gap: GAP.sm },
  action: { flex: 1 },
  search: { flexDirection: 'row', alignItems: 'center', gap: GAP.xs, minHeight: 36, paddingHorizontal: GAP.sm },
  sheet: { gap: GAP.lg, paddingBottom: GAP.xl },
  sheetList: { gap: GAP.sm },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: GAP.md, minHeight: ROW_HEIGHT.double, paddingHorizontal: GAP.lg },
});
