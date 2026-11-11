import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ZSScreen } from '@0610studio/zs-ui';
import RecipeHeader from '../../../src/ui/recipe/RecipeHeader';
import { GAP } from '../../../src/ui/kit/layout';
import { usePageInset, useWideLayout } from '../../../src/ui/kit/SplitColumns';
import { PlayBubble, RecordDetailBody, RecordNotFound, useRecordMenu } from '../../../src/ui/diary/detail/RecordDetail';
import { recordTitle } from '../../../src/model/diary/detail';
import { findRecord, type DiaryRecord } from '../../../src/model/diary/records';

/** 없는 기록 — 지웠거나 잘못된 경로 */
function NotFound() {
  const inset = usePageInset();
  return (
    <>
      <RecipeHeader title="기록" />
      <ZSScreen backgroundColor="background" style={[styles.container, { paddingHorizontal: inset }]}>
        <RecordNotFound />
      </ZSScreen>
    </>
  );
}

/**
 * 화면 레시피 · 건강수첩 기록 상세(읽기 전용) — 바라봄 DiaryDetail. 건강수첩 홈 목록에서 행을 누르면 창 폭과 상관없이 이 화면으로 온다.
 * 상단 바 ⋮ 메뉴는 분류별 규칙 그대로, 보호자·글쓴이가 아니면 메뉴 대신 경고 버튼.
 */
export default function DiaryRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = findRecord(id ?? '');
  if (!record) return <NotFound />;
  return <RecordScreen record={record} />;
}

function RecordScreen({ record }: { record: DiaryRecord }) {
  const inset = usePageInset();
  // 넓은 창(폴더블 펼침)은 세로가 낮아 아래 고정 말풍선이 그래프를 가린다 — 본문 끝에 붙인다
  const wide = useWideLayout();
  const dockBubble = !!record.play && !wide;
  const { menu, notice } = useRecordMenu(record, () => router.back());

  return (
    <>
      <RecipeHeader title={recordTitle(record)} menu={menu} notice={notice} />
      <ZSScreen
        backgroundColor="background"
        style={[styles.container, { paddingHorizontal: inset }, dockBubble ? styles.withBubble : null]}
        bottomComponent={
          dockBubble ? (
            // 놀이 — 화면 아래 고정 말풍선(오늘 놀이 합계 + 한마디)
            <View style={[styles.dock, { paddingHorizontal: inset }]}>
              <PlayBubble record={record} />
            </View>
          ) : undefined
        }
      >
        <RecordDetailBody record={record} />
        {record.play && !dockBubble ? <PlayBubble record={record} /> : null}
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP['2xl'] },
  withBubble: { paddingBottom: GAP['3xl'] * 4 },
  dock: { paddingBottom: GAP.md },
});
