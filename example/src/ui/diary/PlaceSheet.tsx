import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSButton, ZSRadioGroup, ZSText } from '@0610studio/zs-ui';
import Section from '../kit/Section';
import { GAP } from '../kit/layout';
import { FOOTPRINT_PLACES, type FootprintPlace } from '../../model/diary/common';
import PlaceMap from './PlaceMap';

type Props = {
  value: FootprintPlace | null;
  onConfirm: (place: FootprintPlace) => void;
};

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const PLACE_SHEET_TITLE = '발자국';

export default function PlaceSheet({ value, onConfirm }: Props) {
  const [selectedId, setSelectedId] = useState<string>(value?.id ?? FOOTPRINT_PLACES[0].id);
  const selected = FOOTPRINT_PLACES.find((place) => place.id === selectedId) ?? FOOTPRINT_PLACES[0];
  return (
    <View style={styles.root}>
      <PlaceMap place={selected} />
      <Section surface="group" gap={0}>
        <ZSRadioGroup
          options={FOOTPRINT_PLACES.map((place) => ({ value: place.id, label: place.name, accessibilityHint: place.detail }))}
          value={selectedId}
          onValueChange={setSelectedId}
          accessibilityLabel="발자국 자리"
          testID="poopee-place"
        />
      </Section>
      <ZSText variant="body2" color="textSecondary">
        {selected.detail}
      </ZSText>
      <ZSButton title="이 자리로 남기기" size="large" fullWidth onPress={() => onConfirm(selected)} testID="poopee-place-confirm" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.lg },
});
