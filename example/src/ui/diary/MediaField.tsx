import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ZSPressable, useOverlay, useTheme } from '@0610studio/zs-ui';
import AnimalPhoto from '../kit/AnimalPhoto';
import Section from '../kit/Section';
import { GAP } from '../kit/layout';
import type { MediaItem } from '../../model/diary/common';
import MediaSheet, { MEDIA_SHEET_TITLE } from './MediaSheet';

const THUMB = 80;

type Props = {
  value: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  testID?: string;
};

export default function MediaField({ value, onChange, testID = 'diary-media' }: Props) {
  const { colors } = useTheme();
  const { showBottomSheet, hideBottomSheet } = useOverlay();

  const openMedia = () =>
    showBottomSheet({
      header: MEDIA_SHEET_TITLE,
      component: (
        <MediaSheet
          onAdd={(kinds) => {
            const stamp = Date.now();
            onChange([...value, ...kinds.map((kind, index) => ({ id: `${stamp}-${index}`, kind }))]);
            hideBottomSheet();
          }}
        />
      ),
    });

  return (
    <Section label="사진/동영상" surface="plain" gap={0}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <ZSPressable onPress={openMedia} radius="lg" backgroundColor="surface2" accessibilityRole="button" accessibilityLabel="사진/동영상 추가" testID={`${testID}-add`} style={styles.add}>
          <Svg width={30} height={30} viewBox="0 0 24 24">
            <Path
              d="M4 7a3 3 0 013-3h7M20 11v6a3 3 0 01-3 3H7a3 3 0 01-3-3v-6M4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 18M18 3v6M15 6h6"
              stroke={colors.textSecondary}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </ZSPressable>
        {[...value].reverse().map((item) => (
          <Animated.View key={item.id} entering={FadeInDown} style={styles.thumb}>
            <AnimalPhoto kind={item.kind} width={THUMB} height={THUMB} radius="lg" />
            <ZSPressable
              onPress={() => onChange(value.filter((media) => media.id !== item.id))}
              radius="full"
              accessibilityRole="button"
              accessibilityLabel="사진 지우기"
              testID={`${testID}-remove-${item.id}`}
              style={[styles.remove, { backgroundColor: colors.text }]}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24">
                <Path d="M6 6l12 12M18 6L6 18" stroke={colors.background} strokeWidth={3} strokeLinecap="round" />
              </Svg>
            </ZSPressable>
          </Animated.View>
        ))}
      </ScrollView>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { gap: GAP.sm, paddingTop: GAP.xs, paddingRight: GAP.xs },
  add: { width: THUMB, height: THUMB, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: THUMB, height: THUMB },
  remove: { position: 'absolute', top: -GAP.xs, right: -GAP.xs, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
});
