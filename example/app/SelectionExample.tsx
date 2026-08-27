import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ZSCheckBox, ZSContainer, ZSRadioGroup, ZSText, useTheme } from '@0610studio/zs-ui';
import type { RadioOption } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

const OPTIONS: RadioOption[] = [
  { value: '답변이 필요없어요.', index: 'none' },
  { value: '앱 알림으로 받고싶어요.', index: 'app' },
  { value: '이메일로 받고싶어요.', index: 'email' },
];

export default function SelectionExample() {
  const [responseType, setResponseType] = useState<RadioOption>();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Selection' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="ZSRadioGroup · 단일 선택" gap={10}>
          <ZSRadioGroup
            options={OPTIONS}
            value={responseType}
            onSelect={setResponseType}
          />
        </Section>

        <Section label="ZSRadioGroup · Grid rowCount 2" gap={10}>
          <ZSRadioGroup
            options={OPTIONS}
            value={responseType}
            onSelect={setResponseType}
            rowCount={2}
          />
        </Section>

        <CodeBlock
          code={`<ZSRadioGroup
  options={[{ value: '...', index: 'none' }]}
  value={responseType}
  onSelect={setResponseType}
  rowCount={2}
/>`}
        />

        <Section label="ZSCheckBox" gap={10}>
          <ZSCheckBox
            value={agreeTerms}
            onChange={setAgreeTerms}
            label="이용약관에 동의합니다. (필수)"
            labelStyle={{ typo: 'body.4' }}
            moreComponent={
              <ZSText typo="caption.1" color="information">
                보기
              </ZSText>
            }
          />
          <ZSCheckBox
            value={agreeMarketing}
            onChange={setAgreeMarketing}
            label="마케팅 정보 수신에 동의합니다. (선택)"
            labelStyle={{ typo: 'body.4' }}
            activeColor={palette.secondary.main}
          />
          <ZSCheckBox
            value={true}
            onChange={() => {}}
            label="비활성화 상태"
            labelStyle={{ typo: 'body.4' }}
            disabled
          />
        </Section>

        <CodeBlock
          code={`<ZSCheckBox
  value={agreeTerms}
  onChange={setAgreeTerms}
  label="이용약관에 동의합니다. (필수)"
  moreComponent={<ZSText>보기</ZSText>}
/>`}
        />
      </ZSContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
});
