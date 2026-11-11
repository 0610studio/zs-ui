import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useOverlay, useTheme } from '@0610studio/zs-ui';
import Section from '../kit/Section';
import { GAP } from '../kit/layout';
import type { FootprintPlace } from '../../model/diary/common';
import PickRow from './PickRow';
import PlaceMap from './PlaceMap';
import PlaceSheet, { PLACE_SHEET_TITLE } from './PlaceSheet';

type Props = {
  value: FootprintPlace | null;
  onChange: (next: FootprintPlace | null) => void;
  testID?: string;
};

function PinIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z" fill={color} />
      <Path d="M12 12.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z" fill="#ffffff" />
    </Svg>
  );
}

export default function FootprintField({ value, onChange, testID = 'diary-footprint' }: Props) {
  const { colors } = useTheme();
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const openPlace = () =>
    showBottomSheet({
      header: PLACE_SHEET_TITLE,
      component: (
        <PlaceSheet
          value={value}
          onConfirm={(place) => {
            onChange(place);
            hideBottomSheet();
          }}
        />
      ),
    });
  return (
    <Section surface="list">
      <PickRow
        title="발자국"
        value={value?.name}
        placeholder="위치 추가 하기"
        leading={value ? <PinIcon color={colors.primaryMark} /> : 'plus'}
        onPress={openPlace}
        onClear={() => onChange(null)}
        testID={testID}
      />
      {value ? (
        <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOut.duration(200)} style={styles.map}>
          <PlaceMap place={value} />
        </Animated.View>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  map: { paddingVertical: GAP.md },
});
