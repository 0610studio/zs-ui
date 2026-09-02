import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSDropdown, ZSText, useOverlay, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

const DOMAINS = ['gmail.com', 'naver.com', 'kakao.com'];
const CITIES = ['서울', '부산', '대구', '인천', '광주', '대전'];

function SelectList({ options, onSelect }: { options: string[]; onSelect: (value: string) => void }) {
  const { palette } = useTheme();

  return (
    <View style={styles.sheet}>
      {options.map((option, index) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          style={[
            styles.sheetRow,
            index < options.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.grey[20] },
          ]}
        >
          <ZSText typo="body.2">{option}</ZSText>
        </Pressable>
      ))}
    </View>
  );
}

export default function ZSDropdownExample() {
  const { palette } = useTheme();
  const { showBottomSheet, hideOverlay } = useOverlay();

  const [domain, setDomain] = useState('');
  const [city, setCity] = useState('');
  const [editableDomain, setEditableDomain] = useState('');
  const [required, setRequired] = useState('');
  const [expanded, setExpanded] = useState(false);

  const openSheet = (options: string[], onSelect: (value: string) => void) => {
    setExpanded(true);
    showBottomSheet({
      options: { height: 'auto' },
      component: (
        <SelectList
          options={options}
          onSelect={value => {
            onSelect(value);
            setExpanded(false);
            hideOverlay('bottomSheet');
          }}
        />
      ),
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'ZSDropdown' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="표시 전용 · 필드 전체가 트리거" gap={12}>
          <ZSDropdown
            label="이메일 도메인"
            value={domain}
            expanded={expanded}
            onPress={() => openSheet(DOMAINS, setDomain)}
          />
          <ZSText typo="caption.1" color="secondary">
            onChangeText 를 넘기지 않으면 키보드가 뜨지 않고 필드 전체가 press 대상이 됩니다.
          </ZSText>
        </Section>

        <Section label="입력형 · 직접 입력 + 선택" gap={12}>
          <ZSDropdown
            label="이메일 도메인"
            value={editableDomain}
            onChangeText={setEditableDomain}
            onPress={() => openSheet(DOMAINS, setEditableDomain)}
          />
          <ZSText typo="caption.1" color="secondary">
            onChangeText 를 넘기면 타이핑이 가능하고, carret 을 눌러야 시트가 열립니다.
          </ZSText>
        </Section>

        <Section label="boxStyle" gap={16}>
          <ZSDropdown label="outline (기본)" value={city} onPress={() => openSheet(CITIES, setCity)} />
          <ZSDropdown label="inbox" boxStyle="inbox" value={city} onPress={() => openSheet(CITIES, setCity)} />
          <ZSDropdown label="underline" boxStyle="underline" value={city} onPress={() => openSheet(CITIES, setCity)} />
        </Section>

        <Section label="에러 · disabled" gap={16}>
          <ZSDropdown
            label="지역 (필수)"
            value={required}
            status={required ? 'default' : 'error'}
            errorMessage="지역을 선택해주세요."
            onPress={() => openSheet(CITIES, setRequired)}
          />
          <ZSDropdown label="선택 불가" value="gmail.com" disabled onPress={() => {}} />
        </Section>

        <CodeBlock
          code={`const { showBottomSheet } = useOverlay();

<ZSDropdown
  label="이메일 도메인"
  value={domain}
  expanded={expanded}
  onPress={() => showBottomSheet({ component: <SelectList /> })}
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
  sheet: {
    width: '100%',
    paddingHorizontal: 20,
  },
  sheetRow: {
    width: '100%',
    paddingVertical: 16,
  },
});
