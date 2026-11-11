import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ZSCheckbox, ZSScreen, ZSRadioGroup, ZSText, type ZSRadioOption } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const OPTIONS: ZSRadioOption[] = [
  { value: 'none', label: '답변이 필요없어요' },
  { value: 'app', label: '앱 알림으로 받을게요' },
  { value: 'email', label: '이메일로 받을게요' },
];

export default function SelectionExample() {
  const [responseType, setResponseType] = useState('app');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(true);

  return (
    <>
      <ScreenHeader title="Selection" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="ZSRadioGroup · 하나 고르기" surface="list">
          <ZSRadioGroup options={OPTIONS} value={responseType} onValueChange={setResponseType} testID="radio" />
        </Section>
        <ZSText variant="caption" color="textSecondary" testID="radio-value">{`답변: ${responseType}`}</ZSText>

        <Section label="ZSCheckbox · 여러 개 고르기" surface="list">
          <ZSCheckbox value={agreeTerms} onValueChange={setAgreeTerms} label="이용약관 동의 (필수)" testID="check-terms" />
          <ZSCheckbox value={agreeMarketing} onValueChange={setAgreeMarketing} label="마케팅 수신 동의 (선택)" testID="check-marketing" />
          <ZSCheckbox value onValueChange={() => undefined} label="비활성" disabled />
        </Section>
        <ZSText variant="caption" color="textSecondary" testID="check-state">{`약관 ${agreeTerms ? '동의' : '미동의'} · 마케팅 ${agreeMarketing ? '동의' : '미동의'}`}</ZSText>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
});
