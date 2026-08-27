import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSChip, ZSContainer, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

const FILTER_OPTIONS = ['강아지', '고양이', '햄스터', '토끼', '앵무새', '고슴도치'];
const SORT_OPTIONS = ['거리순', '인기순', '최신순'];

export default function ZSChipExample() {
  const { palette } = useTheme();
  const [basicSelected, setBasicSelected] = useState(false);
  const [filters, setFilters] = useState<string[]>(['강아지']);
  const [sortIndex, setSortIndex] = useState(0);

  const toggleFilter = (name: string, next: boolean) => {
    setFilters(prev => (next ? [...prev, name] : prev.filter(item => item !== name)));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'ZSChip' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="기본 · 토글" gap={10}>
          <ZSChip label="즐겨찾기만 보기" onChange={setBasicSelected} />
          <ZSText typo="caption.1" color="secondary">
            선택 상태: {basicSelected ? '선택됨' : '해제됨'}
          </ZSText>
        </Section>

        <Section label="필터 · 다중 선택" gap={10}>
          <View style={styles.chipRow}>
            {FILTER_OPTIONS.map(name => (
              <ZSChip
                key={name}
                label={name}
                selected={filters.includes(name)}
                onChange={next => toggleFilter(name, next)}
                checkIcon
              />
            ))}
          </View>
          <ZSText typo="caption.1" color="secondary">
            선택된 필터: {filters.length > 0 ? filters.join(', ') : '없음'}
          </ZSText>
        </Section>

        <Section label="단일 선택 · 정렬" gap={10}>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((name, index) => (
              <ZSChip
                key={name}
                label={name}
                variant="solid"
                selected={sortIndex === index}
                onChange={() => setSortIndex(index)}
              />
            ))}
          </View>
          <ZSText typo="caption.1" color="secondary">
            selected를 외부 상태로 제어하면 라디오처럼 하나만 선택됩니다.
          </ZSText>
        </Section>

        <Section label="variant · pastel / solid / stroke" gap={10}>
          <View style={styles.chipRow}>
            <ZSChip label="pastel" variant="pastel" initialSelected />
            <ZSChip label="solid" variant="solid" initialSelected />
            <ZSChip label="stroke" variant="stroke" initialSelected />
          </View>
        </Section>

        <Section label="intent 색상" gap={10}>
          <View style={styles.chipRow}>
            <ZSChip label="primary" initialSelected />
            <ZSChip label="success" intent="success" initialSelected />
            <ZSChip label="danger" intent="danger" initialSelected />
            <ZSChip label="warning" intent="warning" initialSelected />
            <ZSChip label="information" intent="information" initialSelected />
            <ZSChip label="grey" intent="grey" initialSelected />
          </View>
        </Section>

        <Section label="textSize · 1 ~ 6" gap={10}>
          <View style={styles.chipRow}>
            {(['1', '3', '6'] as const).map(size => (
              <ZSChip key={size} label={`textSize ${size}`} textSize={size} initialSelected checkIcon />
            ))}
          </View>
        </Section>

        <Section label="비활성" gap={10}>
          <View style={styles.chipRow}>
            <ZSChip label="비활성 · 해제" disabled />
            <ZSChip label="비활성 · 선택" disabled initialSelected />
          </View>
        </Section>

        <CodeBlock
          code={`<ZSChip
  label="강아지"
  selected={filters.includes('강아지')}
  onChange={(next) => toggleFilter('강아지', next)}
  intent="primary"
  variant="pastel"
  checkIcon
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
  chipRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
