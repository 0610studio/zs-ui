import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ZSBanner, ZSBox, ZSText, radiusStyle, useOverlay } from '@0610studio/zs-ui';
import type { HeaderMenuItem } from '../../ScreenHeader';
import Section from '../../kit/Section';
import { GAP } from '../../kit/layout';
import PlaceMap from '../PlaceMap';
import { PetNoteCard } from '../PetBubble';
import AlbumGrid from './AlbumGrid';
import TrendCard from './TrendCard';
import DetailHead from './DetailHead';
import RecordViewer, { hasViewer } from './Viewers';
import { NOT_IN_EXAMPLE_MESSAGE } from '../../../model/diary/common';
import { DETAIL_TEXT, MENU_LABEL, formatDetailDateTime, menuFor, playFeedback, recordLabel, trendsFor, type RecordMenuAction } from '../../../model/diary/detail';
import { removeRecord, type DiaryRecord } from '../../../model/diary/records';

/** iOS 메뉴 아이콘(SF Symbol) */
const MENU_ICON: Record<RecordMenuAction, HeaderMenuItem['icon']> = {
  delete: 'trash',
  hide: 'eye.slash',
  modify: 'pencil',
  quickRecord: 'bolt',
  careHabit: 'checkmark.circle',
};

export type RecordMenu = { accessibilityLabel: string; items: HeaderMenuItem[] };
export type RecordNotice = { accessibilityLabel: string; onPress: () => void };

/**
 * 기록 ⋮ 메뉴 — 분류별 규칙 그대로(바라봄). 보호자·글쓴이가 아니면 메뉴 대신 경고(notice).
 * 삭제·숨기기가 끝나면 onFinished — 상세 화면은 뒤로, 건강수첩 홈 옆 칸은 목록을 다시 읽는다.
 */
export function useRecordMenu(record: DiaryRecord, onFinished: () => void): { menu?: RecordMenu; notice?: RecordNotice } {
  const { showAlert, showSnackbar, showLoader, hideLoader } = useOverlay();

  const finish = async (message: string) => {
    showLoader();
    await removeRecord(record.id);
    hideLoader();
    showSnackbar({ message });
    onFinished();
  };

  const onMenu = (action: RecordMenuAction) => {
    if (action === 'delete') {
      showAlert({
        title: DETAIL_TEXT.deleteTitle(recordLabel(record)),
        message: DETAIL_TEXT.deleteMessage(formatDetailDateTime(record.at)),
        confirm: { label: DETAIL_TEXT.confirm, destructive: true, onPress: () => finish(DETAIL_TEXT.deleted) },
        cancel: { label: DETAIL_TEXT.cancel },
      });
      return;
    }
    if (action === 'hide') {
      showAlert({ title: DETAIL_TEXT.hideMessage, confirm: { label: MENU_LABEL.hide, onPress: () => finish(DETAIL_TEXT.hidden) }, cancel: { label: DETAIL_TEXT.cancel } });
      return;
    }
    // 수정·간편기록·돌봄 습관은 다른 화면
    showSnackbar({ message: NOT_IN_EXAMPLE_MESSAGE });
  };

  if (!record.canEdit) {
    return { notice: { accessibilityLabel: DETAIL_TEXT.noPermissionLabel, onPress: () => showSnackbar({ message: DETAIL_TEXT.noPermission, type: 'error' }) } };
  }
  return {
    menu: {
      accessibilityLabel: DETAIL_TEXT.menu,
      items: menuFor({ category: record.category, partner: !!record.measure?.partner, legacy: !!record.measure?.legacy }).map((action) => ({
        key: action,
        title: MENU_LABEL[action],
        icon: MENU_ICON[action],
        destructive: action === 'delete',
        onPress: () => onMenu(action),
      })),
    },
  };
}

/** 놀이 — 오늘 놀이 합계 + 한마디 말풍선 */
export function PlayBubble({ record }: { record: DiaryRecord }) {
  if (!record.play) return null;
  return (
    <PetNoteCard testID="record-play-bubble">
      <ZSText variant="body2" emphasized>
        {DETAIL_TEXT.playTotal(record.play.minutes)}
      </ZSText>
      <ZSText variant="body2" color="textSecondary">
        {playFeedback(record.play.minutes)}
      </ZSText>
    </PetNoteCard>
  );
}

/**
 * 기록 상세 본문(읽기 전용) — 머리(일시·소비·스티커) → 안내 → 메모 → 그래프 → 분류별 칸 → 발자국 → 사진첩.
 * 넓은 창(폴더블 펼침)도 한 열 전체 폭 — 그래프는 키우고 사진첩은 칸 수를 늘린다(LineChart·AlbumGrid).
 */
export function RecordDetailBody({ record }: { record: DiaryRecord }) {
  const { showSnackbar } = useOverlay();
  const notInExample = () => showSnackbar({ message: NOT_IN_EXAMPLE_MESSAGE });
  const trends = trendsFor(record);
  const hasDetail = trends.length > 0 || hasViewer(record) || !!record.footprint || record.files.length > 0;

  const start = (
    <>
      <DetailHead record={record} />
      {record.fromHabit ? <ZSBanner status="info" message={DETAIL_TEXT.habit} action={{ label: DETAIL_TEXT.habitAction, onPress: notInExample }} fullWidth testID="record-habit" /> : null}
      {record.measure?.legacy ? <ZSBanner status="warning" title={DETAIL_TEXT.legacyTitle} message={DETAIL_TEXT.legacyMessage} fullWidth testID="record-legacy" /> : null}
      {record.measure?.partner ? (
        // 병원이 남긴 기록 — 누를 수 없는 표시
        <ZSBox backgroundColor="primaryContainer" style={[styles.partner, radiusStyle('full')]} testID="record-partner">
          <ZSText variant="label" emphasized color="onPrimaryContainer">
            {DETAIL_TEXT.partner(record.measure.partner)}
          </ZSText>
        </ZSBox>
      ) : null}
      {record.memo ? (
        <ZSBox backgroundColor="surface2" style={[styles.memo, radiusStyle('xl')]} testID="record-memo">
          <ZSText variant="body1">{record.memo}</ZSText>
        </ZSBox>
      ) : null}
    </>
  );

  const end = hasDetail ? (
    <>
      {trends.map((trend, index) => (
        <TrendCard key={trend.key} trend={trend} testID={`record-graph-${index}`} />
      ))}
      <RecordViewer record={record} onOpenRecord={(next) => router.push({ pathname: '/diary/record/[id]', params: { id: next } })} onNotInExample={notInExample} />
      {record.footprint ? (
        <Section label={record.footprint.onWalk ? DETAIL_TEXT.location : DETAIL_TEXT.footprint} surface="plain">
          <PlaceMap place={record.footprint.place} height={120} />
        </Section>
      ) : null}
      {record.files.length > 0 ? (
        <Section label={DETAIL_TEXT.album} surface="plain">
          <AlbumGrid files={record.files} onOpen={(index) => router.push({ pathname: '/diary/gallery', params: { id: record.id, index: String(index) } })} testID="record-album" />
        </Section>
      ) : null}
    </>
  ) : null;

  return (
    <>
      {start}
      {end}
    </>
  );
}

/** 없는 기록 — 지웠거나 잘못된 경로(바라봄 ErrorFallback 404) */
export function RecordNotFound() {
  return (
    <View style={styles.empty}>
      <ZSText variant="subtitle1" emphasized>
        정보를 찾지 못했어요.
      </ZSText>
      <ZSText variant="body2" color="textSecondary">
        삭제되었거나 잘못된 경로에요.
      </ZSText>
    </View>
  );
}

const styles = StyleSheet.create({
  // 읽기 전용이라 입력 칸 같은 최소 높이 없이 글 높이만큼
  memo: { paddingHorizontal: GAP.lg, paddingVertical: GAP.lg },
  partner: { alignSelf: 'flex-start', paddingHorizontal: GAP.md, paddingVertical: GAP.xs + 2 },
  empty: { alignItems: 'center', gap: GAP.sm, paddingVertical: GAP['3xl'] },
});
