import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSTab, ZSText, useTheme, type ZSTabItem } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

const STATUS_ITEMS: ZSTabItem[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행중' },
  { value: 'done', label: '완료' },
];

const CATEGORY_ITEMS: ZSTabItem[] = [
  { value: 'walk', label: '산책' },
  { value: 'snack', label: '간식' },
  { value: 'care', label: '돌봄' },
  { value: 'hospital', label: '병원' },
];

const DISABLED_ITEMS: ZSTabItem[] = [
  { value: 'ready', label: '대기' },
  { value: 'paid', label: '결제완료' },
  { value: 'canceled', label: '취소', disabled: true },
];

const CONTENT: Record<string, string> = {
  all: '전체 항목이 표시됩니다.',
  ongoing: '진행중인 항목만 표시됩니다.',
  done: '완료된 항목만 표시됩니다.',
};

export default function ZSTabExample() {
  const { palette } = useTheme();
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('walk');
  const [controlled, setControlled] = useState('ongoing');

  return (
    <>
      <Stack.Screen options={{ title: 'ZSTab' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="기본 · fill 레이아웃" gap={14}>
          <ZSTab items={STATUS_ITEMS} onChange={setStatus} />
          <View style={[styles.tabContent, { backgroundColor: palette.background.layer2 }]}>
            <ZSText typo="subTitle.2">{STATUS_ITEMS.find(item => item.value === status)?.label}</ZSText>
            <ZSText typo="caption.1" color="secondary">{CONTENT[status]}</ZSText>
          </View>
        </Section>

        <Section label="hug 레이아웃 · 라벨 폭에 맞춤" gap={10}>
          <ZSTab items={CATEGORY_ITEMS} layout="hug" onChange={setCategory} />
          <ZSText typo="caption.1" color="secondary">
            선택된 값: {category}
          </ZSText>
        </Section>

        <Section label="제어 모드 · value 로 외부 제어" gap={10}>
          <ZSTab items={STATUS_ITEMS} value={controlled} onChange={setControlled} />
          <ZSText typo="caption.1" color="secondary">
            value 를 넘기면 선택 상태를 부모가 소유합니다. ({controlled})
          </ZSText>
        </Section>

        <Section label="intent · 인디케이터 색상" gap={18}>
          {(['primary', 'danger', 'success'] as const).map(intent => (
            <View key={intent} style={styles.intentRow}>
              <ZSText typo="caption.1" color="secondary">intent=&quot;{intent}&quot;</ZSText>
              <ZSTab items={STATUS_ITEMS} intent={intent} />
            </View>
          ))}
        </Section>

        <Section label="아이템 단위 disabled" gap={10}>
          <ZSTab items={DISABLED_ITEMS} />
          <ZSText typo="caption.1" color="secondary">
            item.disabled 를 주면 해당 탭만 선택되지 않습니다.
          </ZSText>
        </Section>

        <Section label="showDivider={false} · 구분선 없이" gap={10}>
          <ZSTab items={STATUS_ITEMS} showDivider={false} />
        </Section>

        <Section label="textSize" gap={18}>
          {(['1', '3', '5'] as const).map(size => (
            <View key={size} style={styles.intentRow}>
              <ZSText typo="caption.1" color="secondary">textSize=&quot;{size}&quot;</ZSText>
              <ZSTab items={STATUS_ITEMS} textSize={size} />
            </View>
          ))}
        </Section>

        <CodeBlock
          code={`<ZSTab
  items={[
    { value: 'all', label: '전체' },
    { value: 'done', label: '완료' },
  ]}
  value={tab}
  onChange={(value, index) => setTab(value)}
  layout="fill"
  intent="primary"
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
  tabContent: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  intentRow: {
    width: '100%',
    gap: 8,
  },
});
