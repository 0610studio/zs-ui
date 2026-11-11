import { StyleSheet, View } from 'react-native';
import { ZSChip } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';

type Props = {
  options: { code: string; label: string }[];
  selected: string[];
  onPress: (code: string) => void;
  testID: string;
};

export default function ChoiceChips({ options, selected, onPress, testID }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => (
        <ZSChip key={option.code} label={option.label} selected={selected.includes(option.code)} onSelectedChange={() => onPress(option.code)} testID={`${testID}-${option.code}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP.sm },
});
