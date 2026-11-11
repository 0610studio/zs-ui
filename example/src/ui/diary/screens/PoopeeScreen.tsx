import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { useOverlay } from '@0610studio/zs-ui';
import Section from '../../kit/Section';
import { getCategory } from '../../../model/diary/categories';
import { EMPTY_POOPEE, POOPEE, POOPEE_KINDS, findPoopeeOption, type PoopeeKind, type PoopeeValues } from '../../../model/diary/poopee';
import DiaryWriteShell, { useDiaryCommon } from '../DiaryWriteShell';
import MediaField from '../MediaField';
import PickRow from '../PickRow';
import PoopeeOptionSheet, { poopeeSheetTitle } from '../poopee/PoopeeOptionSheet';
import { poopeeImage } from '../poopee/poopeeImages';

export function PoopeeScreen() {
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [common, setCommon] = useDiaryCommon();
  const [values, setValues] = useState<PoopeeValues>(EMPTY_POOPEE);
  const set = <K extends keyof PoopeeValues>(key: K, value: PoopeeValues[K]) => setValues((prev) => ({ ...prev, [key]: value }));

  const openOption = (kind: PoopeeKind) =>
    showBottomSheet({
      header: poopeeSheetTitle(kind),
      component: (
        <PoopeeOptionSheet
          kind={kind}
          value={values[kind]}
          onSelect={(code) => {
            set(kind, code);
            hideBottomSheet();
          }}
        />
      ),
    });

  return (
    <DiaryWriteShell
      category={getCategory('poopee')}
      common={common}
      setCommon={setCommon}
      memoTab={{ media: false }}
      body={
        <>
          <Section surface="list">
            {POOPEE_KINDS.map((kind) => {
              const meta = POOPEE[kind];
              const option = findPoopeeOption(kind, values[kind]);
              return (
                <PickRow
                  key={kind}
                  title={meta.title}
                  value={option?.label}
                  placeholder={meta.addLabel}
                  leading={option ? <Image source={poopeeImage(kind, option.code)} style={styles.leadImage} resizeMode="contain" /> : 'plus'}
                  onPress={() => openOption(kind)}
                  onClear={() => set(kind, null)}
                  testID={`poopee-${kind}`}
                />
              );
            })}
          </Section>
          <MediaField value={values.media} onChange={(next) => set('media', next)} testID="poopee-media" />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  leadImage: { width: 30, height: 30 },
});
