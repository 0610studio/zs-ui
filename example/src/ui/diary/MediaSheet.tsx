import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ZSButton, ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import AnimalPhoto, { type AnimalPhotoKind } from '../kit/AnimalPhoto';
import { GAP } from '../kit/layout';

const PHOTOS: { kind: AnimalPhotoKind; label: string }[] = [
  { kind: 'bori', label: '갈색 강아지' },
  { kind: 'nabi', label: '검은 고양이' },
  { kind: 'somi', label: '토끼' },
  { kind: 'kkami', label: '검은 강아지' },
];
const THUMB = 72;

type Props = {
  onAdd: (kinds: AnimalPhotoKind[]) => void;
};

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const MEDIA_SHEET_TITLE = '사진/동영상';

export default function MediaSheet({ onAdd }: Props) {
  const { colors } = useTheme();
  const [picked, setPicked] = useState<AnimalPhotoKind[]>([]);
  const toggle = (kind: AnimalPhotoKind) => setPicked((prev) => (prev.includes(kind) ? prev.filter((item) => item !== kind) : [...prev, kind]));
  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {PHOTOS.map(({ kind, label }) => {
          const chosen = picked.includes(kind);
          return (
            <ZSPressable
              key={kind}
              onPress={() => toggle(kind)}
              radius="lg"
              accessibilityRole="checkbox"
              accessibilityLabel={label}
              accessibilityState={{ checked: chosen }}
              testID={`poopee-media-${kind}`}
            >
              <View style={[styles.ring, { borderColor: chosen ? colors.text : 'transparent' }]}>
                <AnimalPhoto kind={kind} width={THUMB} height={THUMB} radius="md" />
              </View>
              {chosen ? (
                <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Svg width={14} height={14} viewBox="0 0 20 20">
                    <Path d="M5.5 10.3L8.7 13.5L14.6 7" stroke="#ffffff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </Svg>
                </View>
              ) : null}
            </ZSPressable>
          );
        })}
      </View>
      <ZSButton
        title={picked.length ? `${picked.length}장 추가` : '추가'}
        size="large"
        fullWidth
        disabled={picked.length === 0}
        onPress={() => onAdd(picked)}
        testID="poopee-media-confirm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.xl, paddingBottom: GAP.lg },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  ring: { padding: 3, borderRadius: 18, borderWidth: 2 },
  badge: { position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
