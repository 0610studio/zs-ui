import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ZSButton, ZSScreen, ZSSelect, ZSText, type ZSSelectOption } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { GAP, PAGE_CONTENT, ROW_INSET } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const DOMAINS = [
  { label: 'gmail.com', value: 'gmail.com' },
  { label: 'naver.com', value: 'naver.com' },
  { label: 'kakao.com', value: 'kakao.com' },
];
const PETS = [
  { label: '강아지', value: 'dog' },
  { label: '고양이', value: 'cat' },
  { label: '토끼', value: 'rabbit' },
  { label: '햄스터', value: 'hamster' },
];
const CITIES = ['서울', '부산', '대구', '인천', '광주', '대전'].map((city) => ({ label: city, value: city }));
const SIZES: ZSSelectOption<number>[] = [
  { label: '작게', value: 12 },
  { label: '보통', value: 16 },
  { label: '크게', value: 20 },
];

export default function ZSSelectExample() {
  const [domain, setDomain] = useState('gmail.com');
  const [city, setCity] = useState('서울');
  const [size, setSize] = useState<number | null>(null);
  const [pet, setPet] = useState<string | null>('dog');

  return (
    <>
      <ScreenHeader title="ZSSelect" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="이메일 도메인" surface="plain" gap={FIELD_GAP}>
          <View style={styles.field}>
            <ZSSelect label="도메인" options={DOMAINS} value={domain} onValueChange={setDomain} testID="select-domain" />
            <ZSText variant="caption" color="textSecondary" style={styles.note} testID="select-domain-value">{`선택: ${domain}`}</ZSText>
          </View>
        </Section>
        <Section label="선택 전 · placeholder" surface="plain" gap={FIELD_GAP}>
          <View style={styles.field}>
            <ZSSelect<number>
              label="글자 크기"
              options={SIZES}
              value={size}
              onValueChange={setSize}
              placeholder="크기를 고르세요"
              accessibilityHint="본문 글자 크기가 바뀝니다"
              testID="select-size"
            />
            <View style={styles.noteRow}>
              <ZSText variant="caption" color="textSecondary" testID="select-size-value">{`선택: ${size ?? '없음'}`}</ZSText>
              {size !== null ? (
                <ZSButton title="선택 지우기" variant="text" size="small" onPress={() => setSize(null)} style={styles.clear} testID="select-size-clear" />
              ) : null}
            </View>
          </View>
        </Section>
        <Section label="비제어 · placeholder 없음" surface="plain" gap={FIELD_GAP}>
          <ZSSelect label="도시(비제어)" options={CITIES} />
          <ZSSelect label="도시(defaultValue)" options={CITIES} defaultValue="부산" />
        </Section>
        <Section label="칸 모양 · variant" surface="plain" gap={FIELD_GAP}>
          <ZSSelect label="반려동물(outlined)" options={PETS} value={pet} onValueChange={setPet} testID="select-pet-outlined" />
          <ZSSelect label="반려동물(inbox)" options={PETS} value={pet} onValueChange={setPet} variant="inbox" testID="select-pet-inbox" />
          <ZSSelect label="반려동물(underline)" options={PETS} value={pet} onValueChange={setPet} variant="underline" testID="select-pet-underline" />
        </Section>
        <Section label="메뉴 배경 · menuColor" surface="plain" gap={FIELD_GAP}>
          <ZSSelect label="역할 색(primaryContainer)" options={PETS} value={pet} onValueChange={setPet} menuColor="primaryContainer" testID="select-pet-role-color" />
          <View style={styles.field}>
            <ZSSelect label="직접 지정(#E8F3EF)" options={PETS} value={pet} onValueChange={setPet} menuColor="#E8F3EF" testID="select-pet-hex-color" />
            <ZSText variant="caption" color="textSecondary" style={styles.note}>
              {Platform.OS === 'ios' ? 'iOS 메뉴는 시스템이 그려 menuColor 를 쓰지 않습니다(HIG).' : '메뉴를 열면 면 색이 바뀝니다.'}
            </ZSText>
          </View>
        </Section>
        <Section label="도시 · 비활성" surface="plain" gap={FIELD_GAP}>
          <ZSSelect label="도시" options={CITIES} value={city} onValueChange={setCity} />
          <ZSSelect label="비활성" options={CITIES} value={city} onValueChange={setCity} disabled />
        </Section>
      </ZSScreen>
    </>
  );
}

/** 칸 사이 — ZSTextField 예제와 같은 16 */
const FIELD_GAP = GAP.lg;

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  // 칸 + 아래 안내 한 줄 — ZSTextField 도움말처럼 칸에 붙인다
  field: { gap: GAP.xs },
  note: { paddingHorizontal: ROW_INSET },
  noteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32, paddingHorizontal: ROW_INSET },
  clear: { marginRight: -12 },
});
