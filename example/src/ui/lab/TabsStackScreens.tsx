import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import ScreenScrollView from '../kit/ScreenScrollView';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ZSChip, ZSText, useTheme, useWindowLayout } from '@0610studio/zs-ui';
import Section from '../kit/Section';
import ScreenHeader from '../ScreenHeader';
import LabValueRow from './LabValueRow';
import { EndMarker, LiveSize } from './FoldableLab';

export type TabsStackTab = 'feed' | 'profile';

const LABELS: Record<TabsStackTab, string> = { feed: '피드', profile: '프로필' };

function detailHref(tab: TabsStackTab, n: number): Href {
  return { pathname: `/lab/tabs-stack/${tab}/detail`, params: { n: String(n) } } as Href;
}

export function TabsStackRoot({ tab }: { tab: TabsStackTab }) {
  const { colors } = useTheme();
  const { widthClass } = useWindowLayout();
  const [count, setCount] = useState(0);
  const [memo, setMemo] = useState('');
  const label = LABELS[tab];

  return (
    <>
      <ScreenHeader title={label} />
      <ScreenScrollView
        style={{ backgroundColor: colors.surface1 }}
        contentContainerStyle={styles.content}
      >
        <LiveSize padded={false} />
        <Section gap={0}>
          <LabValueRow label="탭" value={tab} testID={`tabs-stack-${tab}-title`} />
          <LabValueRow label="창 너비 클래스" value={widthClass} testID={`tabs-stack-${tab}-width-class`} />
          <LabValueRow label="카운트" value={String(count)} testID={`tabs-stack-${tab}-count`} isLast />
        </Section>
        <View style={styles.actions}>
          <ZSChip label={`${label} +1`} selected={false} onSelectedChange={() => setCount(count + 1)} testID={`tabs-stack-${tab}-plus`} />
          <ZSChip label="상세 열기" selected={false} onSelectedChange={() => router.push(detailHref(tab, 1))} testID={`tabs-stack-${tab}-open`} />
          <ZSChip label="랩 목록으로" selected={false} onSelectedChange={() => router.dismissTo('/lab')} testID="tabs-stack-exit" />
        </View>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="메모"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          testID={`tabs-stack-${tab}-input`}
        />
        {Array.from({ length: 16 }, (_, index) => (
          <View key={index} style={[styles.card, { backgroundColor: colors.surface2 }]}>
            <ZSText variant="subtitle1" emphasized>{`${label} 카드 ${index + 1}`}</ZSText>
            <ZSText variant="body2">긴 목록에서 탭을 바꾸고 기기를 접거나 펼친 뒤에도 횟수와 메모, 스크롤 위치가 유지되는지 확인합니다.</ZSText>
          </View>
        ))}
        <EndMarker testID={`tabs-stack-${tab}-end`} label="마지막 카드가 탭 바 위에 전부 보여야 합니다." />
      </ScreenScrollView>
    </>
  );
}

export function TabsStackDetail({ tab }: { tab: TabsStackTab }) {
  const { colors } = useTheme();
  const { n } = useLocalSearchParams<{ n?: string }>();
  const depth = Number(n ?? '1');
  const label = `${LABELS[tab]} 상세 ${depth}`;

  return (
    <>
      <ScreenHeader title={label} />
      <ScreenScrollView
        style={{ backgroundColor: colors.surface1 }}
        contentContainerStyle={styles.content}
      >
        <ZSText variant="h4" emphasized testID={`tabs-stack-${tab}-detail`}>{label}</ZSText>
        <View style={styles.actions}>
          <ZSChip
            label="다음 상세"
            selected={false}
            onSelectedChange={() => router.push(detailHref(tab, depth + 1))}
            testID={`tabs-stack-${tab}-next`}
          />
        </View>
      </ScreenScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
  card: { padding: 16, gap: 8, borderRadius: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
