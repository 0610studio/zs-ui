import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';
import { ZSScreen, ZSText, ZSTextField, useTheme, type ZSTextFieldVariant } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const VARIANTS: ZSTextFieldVariant[] = ['outlined', 'inbox', 'underline'];
const SEARCH_ICON_SIZE = 20;
const SEARCH_PATH =
  'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';

function SearchIcon({ color }: { color: string }) {
  if (Platform.OS === 'android') {
    return (
      <Svg width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} viewBox="0 0 24 24">
        <Path d={SEARCH_PATH} fill={color} />
      </Svg>
    );
  }
  return <SymbolView name={{ ios: 'magnifyingglass', android: 'search' }} tintColor={color} size={SEARCH_ICON_SIZE} />;
}

function VariantSection({ variant }: { variant: ZSTextFieldVariant }) {
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('wrong@');
  return (
    <Section label={variant} surface="plain" gap={16}>
      <ZSTextField variant={variant} label="이름" value={value} onChangeText={setValue} helperText="실명으로 입력하세요" required testID={`field-${variant}-name`} />
      <ZSTextField
        variant={variant}
        label="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        errorText={email.includes('@') && email.split('@')[1] ? undefined : '이메일 형식이 아닙니다'}
        testID={`field-${variant}-email`}
      />
      <ZSTextField variant={variant} label="비활성" value="수정할 수 없는 값" disabled />
    </Section>
  );
}

export default function ZSTextFieldExample() {
  const { colors } = useTheme();
  const [memo, setMemo] = useState('');
  const [secure, setSecure] = useState(true);

  return (
    <>
      <ScreenHeader title="ZSTextField" />
      <ZSScreen backgroundColor="background" keyboardScrollExtraOffset={130} style={styles.container}>
        {VARIANTS.map((variant) => (
          <VariantSection key={variant} variant={variant} />
        ))}
        <Section label="앞·뒤 요소" surface="plain" gap={16}>
          <ZSTextField
            label="검색"
            placeholder="이름·태그"
            startAdornment={<SearchIcon color={colors.textSecondary} />}
            testID="field-search"
          />
          <ZSTextField variant="inbox" label="몸무게" keyboardType="decimal-pad" endAdornment={<ZSText color="textSecondary">kg</ZSText>} />
          <ZSTextField
            label="비밀번호"
            secureTextEntry={secure}
            clearable={false}
            endAdornment={
              <Pressable accessibilityRole="button" accessibilityLabel={secure ? '비밀번호 보기' : '비밀번호 숨기기'} hitSlop={12} onPress={() => setSecure((on) => !on)}>
                <ZSText variant="label" emphasized>{secure ? '보기' : '숨기기'}</ZSText>
              </Pressable>
            }
          />
        </Section>
        <Section label="여러 줄 · 글자 수" surface="plain" gap={16}>
          <ZSTextField label="메모" value={memo} onChangeText={setMemo} multiline minRows={2} maxRows={5} maxLength={200} showCount testID="field-memo" />
          <ZSTextField variant="underline" label="인증번호" defaultValue="" keyboardType="number-pad" maxLength={6} showCount testID="field-code" />
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
});
