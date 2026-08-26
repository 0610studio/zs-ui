import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ErrorComponent, ZSContainer, ZSTextField, useTheme } from 'zs-ui';
import type { BoxStyle } from 'zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

/** boxStyle 하나당 기본 · 값 입력 · error · disabled 상태를 한 번에 나열하는 섹션 */
function StateSection({ boxStyle }: { boxStyle: BoxStyle }) {
  const [value, setValue] = useState<string>('');

  return (
    <Section label={`boxStyle · ${boxStyle}`} gap={22}>
      <ZSTextField
        boxStyle={boxStyle}
        label="기본 (직접 입력)"
        value={value}
        onChangeText={setValue}
      />
      <ZSTextField
        boxStyle={boxStyle}
        label="값 입력됨"
        value="입력된 값"
      />
      <ZSTextField
        boxStyle={boxStyle}
        label="에러 (status=error)"
        value=""
        status="error"
        errorMessage="필수 입력 항목입니다"
      />
      <ZSTextField
        boxStyle={boxStyle}
        label="비활성화 (disabled)"
        value=""
        disabled
      />
      <ZSTextField
        boxStyle={boxStyle}
        label="비활성화 + 값"
        value="수정 불가 값"
        disabled
      />
    </Section>
  );
}

/** isTextArea 상태 나열 — multiline 스타일이 필요해 별도 섹션으로 분리 */
function TextAreaSection() {
  const [memo, setMemo] = useState<string>('');
  const textAreaInputProps = {
    multiline: true,
    style: { minHeight: 120, textAlignVertical: 'top' as const },
  };

  return (
    <Section label="isTextArea" gap={22}>
      <ZSTextField
        label="기본 (직접 입력)"
        value={memo}
        onChangeText={setMemo}
        textInputProps={textAreaInputProps}
        isTextArea
      />
      <ZSTextField
        label="에러 (status=error)"
        value=""
        status="error"
        errorMessage="내용을 입력해주세요"
        textInputProps={textAreaInputProps}
        isTextArea
      />
      <ZSTextField
        label="비활성화 + 값"
        value="수정할 수 없는 메모입니다"
        disabled
        textInputProps={textAreaInputProps}
        isTextArea
      />
    </Section>
  );
}

export default function ZSTextFieldExample() {
  const [email, setEmail] = useState<string>('');
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'ZSTextField' }} />
      <ZSContainer keyboardScrollExtraOffset={130} style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <StateSection boxStyle="outline" />
        <StateSection boxStyle="underline" />
        <StateSection boxStyle="inbox" />
        <TextAreaSection />

        <Section label="기타 옵션" gap={22}>
          <ZSTextField
            boxStyle="outline"
            label="maxLength 5"
            value={email}
            onChangeText={setEmail}
            textInputProps={{ maxLength: 5 }}
          />
          <ZSTextField
            boxStyle="outline"
            label="focusColor 커스텀"
            value=""
            focusColor={palette.primary.darker}
          />
        </Section>

        <Section label="ErrorComponent" gap={10}>
          <ErrorComponent errorMessage="에러메시지" errorColor={palette.danger.main} />
        </Section>

        <CodeBlock
          code={`<ZSTextField
  boxStyle="outline"   // 'outline' | 'underline' | 'inbox'
  label="아이디"
  value={userId}
  onChangeText={setUserId}
  status="error"       // 'default' | 'error'
  errorMessage="..."
  disabled             // 반투명 처리 + 입력 차단
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
