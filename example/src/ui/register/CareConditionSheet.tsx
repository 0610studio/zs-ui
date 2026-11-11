import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSButton, ZSCheckbox, ZSText } from '@0610studio/zs-ui';
import Section from '../kit/Section';
import { GAP } from '../kit/layout';
import { CARE_CONDITIONS, CARE_CONDITIONS_HINT, CARE_CONDITION_LABEL, toggleCareCondition, type CareCondition } from '../../model/petRegister';

type Props = {
  initialValue: CareCondition[];
  onConfirm: (value: CareCondition[]) => void;
};

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const CARE_CONDITION_SHEET_TITLE = '관리 중인 질환';

export default function CareConditionSheet({ initialValue, onConfirm }: Props) {
  const [selected, setSelected] = useState<CareCondition[]>(initialValue);
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <ZSText variant="body2" color="textSecondary">
          {CARE_CONDITIONS_HINT}
        </ZSText>
      </View>
      <Section surface="list">
        {CARE_CONDITIONS.map((code) => (
          <ZSCheckbox
            key={code}
            label={CARE_CONDITION_LABEL[code]}
            value={selected.includes(code)}
            onValueChange={() => setSelected((prev) => toggleCareCondition(prev, code))}
            testID={`register-care-${code}`}
          />
        ))}
      </Section>
      <ZSButton title="확인" size="large" fullWidth onPress={() => onConfirm(selected)} testID="register-care-confirm" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.lg },
  head: { gap: GAP.xs },
});
