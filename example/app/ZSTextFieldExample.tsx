import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ErrorComponent, ZSContainer, ZSTextField, useTheme } from 'zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function ZSTextFieldExample() {
  const [nick, setNick] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, serUserId] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'ZSTextField' }} />
      <ZSContainer keyboardScrollExtraOffset={130} style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="boxStyle · status" gap={22}>
          <ZSTextField
            boxStyle="underline"
            label="닉네임 (underline · error)"
            value={nick}
            inputBgColor={palette.background.base}
            labelBgColor={palette.background.base}
            focusColor={palette.primary.darker}
            onChangeText={setNick}
            textInputProps={{
              multiline: false,
              style: { color: palette.text.primary },
            }}
            status={nick ? 'default' : 'error'}
            errorMessage="닉네임을 입력해주세요"
          />

          <ZSTextField
            boxStyle="outline"
            label="아이디 (outline)"
            value={userId}
            onChangeText={serUserId}
          />

          <ZSTextField
            boxStyle="inbox"
            label="이메일 (inbox · maxLength 5)"
            value={email}
            onChangeText={setEmail}
            textInputProps={{ maxLength: 5 }}
          />

          <ZSTextField
            label="메모 (isTextArea)"
            value={memo}
            onChangeText={setMemo}
            textInputProps={{
              multiline: true,
              style: { minHeight: 150, textAlignVertical: 'top' },
            }}
            isTextArea
          />
        </Section>

        <Section label="ErrorComponent" gap={10}>
          <ErrorComponent errorMessage="에러메시지" errorColor={palette.danger.main} />
        </Section>

        <CodeBlock
          code={`<ZSTextField
  boxStyle="outline"
  label="아이디"
  value={userId}
  onChangeText={setUserId}
  status="error"
  errorMessage="..."
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
    paddingBottom: 90,
    paddingHorizontal: 20,
  },
});
