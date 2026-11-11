import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSChip, ZSScreen, ZSText } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const FILTER_OPTIONS = ['강아지', '고양이', '햄스터', '토끼', '앵무새', '고슴도치'];
const SORT_OPTIONS = ['거리순', '인기순', '최신순'];

export default function ZSChipExample() {
  const [basicSelected, setBasicSelected] = useState(false);
  const [filters, setFilters] = useState<string[]>(['강아지']);
  const [sortIndex, setSortIndex] = useState(0);

  const toggleFilter = (name: string, next: boolean) => {
    setFilters(prev => (next ? [...prev, name] : prev.filter(item => item !== name)));
  };

  return (
    <>
      <ScreenHeader title="ZSChip" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="기본 · 토글" surface="plain" gap={10}>
          <ZSChip label="즐겨찾기만 보기" onSelectedChange={setBasicSelected} />
          <ZSText variant="label" color="textSecondary">
            선택 상태: {basicSelected ? '선택됨' : '해제됨'}
          </ZSText>
        </Section>

        <Section label="필터 · 다중 선택" surface="plain" gap={10}>
          <View style={styles.chipRow}>
            {FILTER_OPTIONS.map(name => (
              <ZSChip
                key={name}
                label={name}
                selected={filters.includes(name)}
                onSelectedChange={next => toggleFilter(name, next)}
              />
            ))}
          </View>
          <ZSText variant="label" color="textSecondary">
            선택된 필터: {filters.length > 0 ? filters.join(', ') : '없음'}
          </ZSText>
        </Section>

        <Section label="단일 선택 · 정렬" surface="plain" gap={10}>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((name, index) => (
              <ZSChip
                key={name}
                label={name}
                checkIcon={false}
                selected={sortIndex === index}
                onSelectedChange={() => setSortIndex(index)}
              />
            ))}
          </View>
          <ZSText variant="label" color="textSecondary">
            selected를 외부 상태로 제어하면 라디오처럼 하나만 선택됩니다.
          </ZSText>
        </Section>

        <Section label="색 · color" surface="plain" gap={10}>
          <View style={styles.chipRow}>
            <ZSChip label="primary (기본)" defaultSelected />
            <ZSChip label="secondary" color="secondary" defaultSelected />
            <ZSChip label="neutral" color="neutral" defaultSelected />
            <ZSChip label="success" color="success" defaultSelected />
            <ZSChip label="error" color="error" defaultSelected />
            <ZSChip label="info" color="info" defaultSelected />
          </View>
        </Section>

        <Section label="비활성" surface="plain" gap={10}>
          <View style={styles.chipRow}>
            <ZSChip label="비활성 · 해제" disabled />
            <ZSChip label="비활성 · 선택" disabled defaultSelected />
          </View>
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  chipRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
