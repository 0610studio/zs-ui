import { StyleSheet, View } from 'react-native';
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
  selected: AnimalPhotoKind | null;
  onSelect: (photo: AnimalPhotoKind | null) => void;
};

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const PHOTO_SHEET_TITLE = '사진 고르기';

export default function PhotoSheet({ selected, onSelect }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {PHOTOS.map(({ kind, label }) => {
          const chosen = kind === selected;
          return (
            <ZSPressable
              key={kind}
              onPress={() => onSelect(kind)}
              radius="full"
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ checked: chosen }}
              testID={`register-photo-${kind}`}
            >
              <View style={[styles.ring, { borderColor: chosen ? colors.text : 'transparent' }]}>
                <AnimalPhoto kind={kind} width={THUMB} height={THUMB} radius="full" />
              </View>
            </ZSPressable>
          );
        })}
      </View>
      {selected ? <ZSButton title="사진 지우기" variant="tonal" color="neutral" fullWidth onPress={() => onSelect(null)} testID="register-photo-clear" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.xl, paddingBottom: GAP.xl },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  ring: { padding: 3, borderRadius: 999, borderWidth: 2 },
});
