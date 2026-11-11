import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ZSScreen, ZSSegmentedControl, ZSSegmentedPages, ZSText, radiusStyle, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { GAP, PAGE_CONTENT, ROW_HEIGHT, ROW_INSET, RULE, TABULAR } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const PERIOD_OPTIONS = [
  { label: '일간', value: 'day' },
  { label: '주간', value: 'week' },
  { label: '월간', value: 'month' },
  { label: '연간', value: 'year' },
];
const TAB_OPTIONS = [
  { label: '산책', value: 'walk' },
  { label: '식사', value: 'meal' },
  { label: '건강', value: 'health' },
];
type LogRow = { title: string; time: string; value: string };
/** 탭처럼 쓰는 예 — 반려동물의 오늘 기록을 탭마다 한 페이지씩 */
const TODAY_LOG: Record<string, LogRow[]> = {
  walk: [
    { title: '아침 산책', time: '07:30', value: '32분 · 1.8km' },
    { title: '공원 놀이', time: '12:10', value: '15분' },
    { title: '저녁 산책', time: '19:00', value: '41분 · 2.4km' },
  ],
  meal: [
    { title: '아침 사료', time: '08:00', value: '80g' },
    { title: '간식', time: '15:20', value: '2개' },
    { title: '저녁 사료', time: '18:30', value: '80g' },
  ],
  health: [
    { title: '몸무게', time: '09:00', value: '4.2kg' },
    { title: '물 마시기', time: '하루', value: '320ml' },
    { title: '양치', time: '21:00', value: '했어요' },
  ],
};
/** 페이지 높이 — 기록 3줄. 큰 글자로 넘치면 페이지 안에서 스크롤한다 */
const LOG_PAGE_HEIGHT = ROW_HEIGHT.single * 3 + RULE * 2;
const VIEW_OPTIONS = [
  { label: '목록', value: 'list' },
  { label: '격자', value: 'grid' },
];
const SORT_OPTIONS = [
  { label: '↑', value: 'asc', accessibilityLabel: '오름차순' },
  { label: '↓', value: 'desc', accessibilityLabel: '내림차순' },
];

export default function ZSSegmentedControlExample() {
  const { colors } = useTheme();
  const [basic, setBasic] = useState('walk');
  const [tab, setTab] = useState('walk');
  const [period, setPeriod] = useState('week');

  return (
    <>
      <ScreenHeader title="ZSSegmentedControl" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="기본 · 2개 세그먼트" surface="plain" gap={10}>
          <ZSSegmentedControl
            options={[
              { label: '산책', value: 'walk' },
              { label: '간식', value: 'snack' },
            ]}
            onValueChange={setBasic}
          />
          <ZSText variant="label" color="textSecondary">
            선택된 값: {basic}
          </ZSText>
        </Section>

        <Section label="탭처럼 사용 · 콘텐츠 전환" surface="plain" gap={14}>
          <ZSSegmentedControl options={TAB_OPTIONS} value={tab} onValueChange={setTab} accessibilityLabel="오늘 기록" testID="segmented-control-tabs" />
          {/* 고른 쪽으로 페이지가 넘어가고, 좌우로 밀어도 넘어간다 */}
          <ZSSegmentedPages
            options={TAB_OPTIONS}
            value={tab}
            onValueChange={setTab}
            swipeEnabled
            style={[styles.logPages, radiusStyle('xl'), { backgroundColor: colors.surface2 }]}
            testID="segmented-pages-tabs"
            renderPage={(page) => (
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {TODAY_LOG[page].map((row, index) => (
                  <Fragment key={row.title}>
                    {index > 0 ? <View style={[styles.logRule, { backgroundColor: colors.border }]} /> : null}
                    <View style={styles.logRow}>
                      <ZSText variant="caption" color="textSecondary" style={[styles.logTime, TABULAR]}>
                        {row.time}
                      </ZSText>
                      <ZSText variant="subtitle1" style={styles.logTitle}>
                        {row.title}
                      </ZSText>
                      <ZSText variant="label" color="textSecondary" style={TABULAR}>
                        {row.value}
                      </ZSText>
                    </View>
                  </Fragment>
                ))}
              </ScrollView>
            )}
          />
          <ZSText variant="label" color="textSecondary">
            아래에 ZSSegmentedPages 를 두면 고른 쪽으로 페이지가 넘어간다. swipeEnabled 로 좌우 밀기도 켤 수 있다.
          </ZSText>
        </Section>

        <Section label="4개 세그먼트 · 제어 모드" surface="plain" gap={10}>
          <ZSSegmentedControl
            options={PERIOD_OPTIONS}
            value={period}
            onValueChange={setPeriod}
          />
          <ZSText variant="label" color="textSecondary">
            value를 넘기면 외부 상태로 제어됩니다. ({PERIOD_OPTIONS.find((option) => option.value === period)?.label})
          </ZSText>
        </Section>

        <Section label="라벨 폭 · 가로 행 안 (fullWidth false)" surface="plain" gap={10}>
          <View style={styles.inlineRow}>
            <ZSText variant="subtitle1">보기</ZSText>
            <ZSSegmentedControl options={VIEW_OPTIONS} fullWidth={false} accessibilityLabel="보기" testID="segmented-control-inline" />
          </View>
        </Section>

        <Section label="기호 라벨 · 스크린 리더 이름" surface="plain" gap={10}>
          <View style={styles.inlineRow}>
            <ZSText variant="subtitle1">정렬</ZSText>
            <ZSSegmentedControl options={SORT_OPTIONS} fullWidth={false} accessibilityLabel="정렬" testID="segmented-control-symbol" />
          </View>
          <ZSText variant="label" color="textSecondary">
            칸은 옵션 accessibilityLabel(오름차순·내림차순)로, 컨트롤은 accessibilityLabel(정렬)로 읽힌다.
          </ZSText>
        </Section>

        <Section label="비활성" surface="plain" gap={14}>
          <ZSSegmentedControl options={[{ label: '수정', value: 'edit' }, { label: '삭제', value: 'delete' }]} disabled />
          <ZSText variant="label" color="textSecondary">
            크기·색은 props로 바꾸지 않는다 — 두 플랫폼 같은 모양(회색 트랙 + 흰 썸, primary 없음)으로 그린다. 라벨은 짧은 명사로 2~5개.
          </ZSText>
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logPages: {
    flex: 0,
    width: '100%',
    height: LOG_PAGE_HEIGHT,
  },
  logRow: {
    minHeight: ROW_HEIGHT.single,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.md,
    paddingHorizontal: ROW_INSET,
    paddingVertical: GAP.sm,
  },
  logTime: {
    minWidth: 36,
  },
  logTitle: {
    flex: 1,
  },
  logRule: {
    height: RULE,
    marginStart: ROW_INSET,
  },
  sizeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeLabel: {
    width: 86,
  },
  sizeControl: {
    flex: 1,
  },
});
