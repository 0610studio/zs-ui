import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSSegmentedControl, ZSText, ZSTextField } from '@0610studio/zs-ui';
import { GAP } from '../../kit/layout';
import { getCategory } from '../../../model/diary/categories';
import { sanitizeDigits } from '../../../model/diary/common';
import { validatePlay, validateWeight } from '../../../model/diary/simple';
import { toDisplayWeight, toKgWeight, type WeightUnit } from '../../../model/petRegister';
import DiaryWriteShell, { useDiaryCommon } from '../DiaryWriteShell';

const WEIGHT_UNITS: { label: string; value: WeightUnit }[] = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
];

export function MemoScreen() {
  const [common, setCommon] = useDiaryCommon();
  return <DiaryWriteShell category={getCategory('memo')} common={common} setCommon={setCommon} autoFocusMemo />;
}

export function WeightScreen() {
  const [common, setCommon] = useDiaryCommon();
  const [weightKg, setWeightKg] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  return (
    <DiaryWriteShell
      category={getCategory('weight')}
      common={common}
      setCommon={setCommon}
      validate={() => validateWeight(weightKg)}
      body={
        <View style={styles.row}>
          <View style={styles.flex1}>
            <ZSTextField
              label="몸무게"
              placeholder="몸무게 입력"
              value={toDisplayWeight(weightKg, unit)}
              onChangeText={(text) => setWeightKg(toKgWeight(text, unit))}
              keyboardType="decimal-pad"
              maxLength={8}
              autoFocus
              testID="diary-weight"
            />
          </View>
          <ZSSegmentedControl options={WEIGHT_UNITS} value={unit} onValueChange={setUnit} style={styles.unit} testID="diary-weight-unit" />
        </View>
      }
    />
  );
}

export function PlayScreen() {
  const [common, setCommon] = useDiaryCommon();
  const [minutes, setMinutes] = useState('');
  return (
    <DiaryWriteShell
      category={getCategory('play')}
      common={common}
      setCommon={setCommon}
      validate={() => validatePlay(minutes)}
      body={
        <ZSTextField
          label="놀이 시간"
          placeholder="놀이 시간 입력"
          value={minutes}
          onChangeText={(text) => setMinutes(sanitizeDigits(text))}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus
          endAdornment={
            <ZSText variant="body1" color="textSecondary">
              분
            </ZSText>
          }
          testID="diary-play"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: GAP.sm },
  flex1: { flexGrow: 1, flexShrink: 1 },
  unit: { width: 104, marginTop: GAP.sm },
});
