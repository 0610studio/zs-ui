import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ZSPressable, ZSScreen, ZSSegmentedControl, ZSText, ZSTextField, useOverlay, type DateString } from '@0610studio/zs-ui';
import RecipeHeader from '../recipe/RecipeHeader';
import { GAP } from '../kit/layout';
import { usePageInset } from '../kit/SplitColumns';
import DatePickerSheet, { DATE_SHEET_TITLE } from '../barabom/DatePickerSheet';
import {
  PET_NAME,
  SAVED_MESSAGE,
  createCommonForm,
  formatPrice,
  formatRecordDate,
  formatRecordTime,
  sanitizeDigits,
  saveDiaryRecord,
  type DiaryCommonForm,
} from '../../model/diary/common';
import type { DiaryCategory } from '../../model/diary/categories';
import FootprintField from './FootprintField';
import MediaField from './MediaField';
import StickerSheet, { STICKER_SHEET_TITLE } from './StickerSheet';
import StickerView from './StickerView';
import TimePickerSheet, { TIME_SHEET_TITLE } from './TimePickerSheet';

const STICKER = 56;

const toDateString = (date: Date): DateString =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` as DateString;

export function useDiaryCommon(initial?: Partial<DiaryCommonForm>): [DiaryCommonForm, Dispatch<SetStateAction<DiaryCommonForm>>] {
  return useState<DiaryCommonForm>(() => ({ ...createCommonForm(), ...initial }));
}

function HighlightButton({ text, onPress, accessibilityLabel, testID }: { text: string; onPress: () => void; accessibilityLabel: string; testID: string }) {
  return (
    <ZSPressable onPress={onPress} radius="sm" backgroundColor="surface2" accessibilityRole="button" accessibilityLabel={accessibilityLabel} testID={testID} style={styles.highlight}>
      <ZSText variant="subtitle1" emphasized>
        {text}
      </ZSText>
    </ZSPressable>
  );
}

type Props = {
  category: DiaryCategory;
  common: DiaryCommonForm;
  setCommon: Dispatch<SetStateAction<DiaryCommonForm>>;
  body?: ReactNode;
  targetLabel?: string;
  showTime?: boolean;
  onDateChange?: (next: Date) => void;
  memoTab?: { footprint?: boolean; media?: boolean };
  autoFocusMemo?: boolean;
  validate?: () => string | null;
};

export default function DiaryWriteShell({ category, common, setCommon, body, targetLabel, showTime = true, onDateChange, memoTab, autoFocusMemo = false, validate }: Props) {
  const { showBottomSheet, hideBottomSheet, showSnackbar, showLoader, hideLoader, showAlert } = useOverlay();
  const [tab, setTab] = useState<'record' | 'memo'>('record');
  const inset = usePageInset();
  const [saving, setSaving] = useState(false);
  const label = targetLabel ?? category.label;
  const tabs: { value: 'record' | 'memo'; label: string }[] = [
    { value: 'record', label: `${category.label} 기록` },
    { value: 'memo', label: '메모' },
  ];
  const set = <K extends keyof DiaryCommonForm>(key: K, value: DiaryCommonForm[K]) => setCommon((prev) => ({ ...prev, [key]: value }));

  const openSticker = () =>
    showBottomSheet({
      header: STICKER_SHEET_TITLE,
      component: (
        <StickerSheet
          value={common.sticker}
          onSelect={(sticker) => {
            set('sticker', sticker);
            hideBottomSheet();
          }}
        />
      ),
    });

  const openDate = () =>
    showBottomSheet({
      header: DATE_SHEET_TITLE,
      component: (
        <DatePickerSheet
          initialDate={toDateString(common.recordedAt)}
          onConfirm={(date) => {
            const [year, month, day] = date.split('-').map(Number);
            const next = new Date(common.recordedAt);
            next.setFullYear(year, month - 1, day);
            set('recordedAt', next);
            onDateChange?.(next);
            hideBottomSheet();
          }}
        />
      ),
    });

  const openTime = () =>
    showBottomSheet({
      header: TIME_SHEET_TITLE,
      component: (
        <TimePickerSheet
          initialTime={common.recordedAt}
          onConfirm={(time) => {
            const next = new Date(common.recordedAt);
            next.setHours(time.getHours(), time.getMinutes(), 0, 0);
            set('recordedAt', next);
            hideBottomSheet();
          }}
        />
      ),
    });

  const save = async () => {
    if (saving) return;
    const error = validate?.() ?? null;
    if (error) {
      showAlert({ title: error, confirm: { label: '확인' } });
      return;
    }
    setSaving(true);
    showLoader({ accessibilityLabel: '저장하는 중' });
    await saveDiaryRecord(category.code, common.recordedAt);
    hideLoader();
    showSnackbar({ message: SAVED_MESSAGE });
    router.back();
  };

  const sentence = `${PET_NAME} ${label} 기록해요`;
  const particle = (
    <ZSText variant="subtitle1" style={styles.particle}>
      에
    </ZSText>
  );
  const memoField = (
    <ZSTextField
      label="메모"
      placeholder="이곳에 메모를 작성해주세요. ✏️"
      value={common.memo}
      onChangeText={(text) => set('memo', text)}
      multiline
      minRows={6}
      maxRows={12}
      autoFocus={autoFocusMemo}
      testID="diary-memo"
    />
  );
  const memoExtras = (
    <>
      {memoTab?.footprint === false ? null : <FootprintField value={common.footprint} onChange={(next) => set('footprint', next)} />}
      <ZSTextField
        label="소비금액"
        placeholder="소비 금액 입력"
        value={formatPrice(common.price)}
        onChangeText={(text) => set('price', sanitizeDigits(text))}
        keyboardType="number-pad"
        maxLength={13}
        endAdornment={
          <ZSText variant="body1" color="textSecondary">
            원
          </ZSText>
        }
        testID="diary-price"
      />
      {memoTab?.media === false ? null : <MediaField value={common.media} onChange={(next) => set('media', next)} />}
    </>
  );
  const memoContent = (
    <Animated.View key="memo" entering={FadeIn} style={styles.tab}>
      {memoField}
      {memoExtras}
    </Animated.View>
  );

  const head = (
    <>
        <View style={styles.head}>
          <View style={styles.sentence}>
            {showTime ? (
              <>
                <HighlightButton text={formatRecordDate(common.recordedAt)} onPress={openDate} accessibilityLabel={`기록 날짜, ${formatRecordDate(common.recordedAt)}`} testID="diary-date" />
                <View style={styles.sentenceRow}>
                  <View style={styles.withParticle}>
                    <HighlightButton text={formatRecordTime(common.recordedAt)} onPress={openTime} accessibilityLabel={`기록 시각, ${formatRecordTime(common.recordedAt)}`} testID="diary-time" />
                    {particle}
                  </View>
                  <ZSText variant="subtitle1" testID="diary-sentence">
                    {sentence}
                  </ZSText>
                </View>
              </>
            ) : (
              <>
                <View style={styles.withParticle}>
                  <HighlightButton text={formatRecordDate(common.recordedAt)} onPress={openDate} accessibilityLabel={`기록 날짜, ${formatRecordDate(common.recordedAt)}`} testID="diary-date" />
                  {particle}
                </View>
                <ZSText variant="subtitle1" testID="diary-sentence">
                  {sentence}
                </ZSText>
              </>
            )}
          </View>
          <ZSPressable onPress={openSticker} radius="lg" backgroundColor="surface2" accessibilityRole="button" accessibilityLabel="스티커를 선택해주세요." testID="diary-sticker" style={styles.sticker}>
            <StickerView value={common.sticker} size={STICKER - 12} />
          </ZSPressable>
        </View>

    </>
  );

  return (
    <>
      <RecipeHeader title={`${category.label} 기록`} action={{ title: '저장', onPress: save, disabled: saving }} />
      <ZSScreen backgroundColor="background" keyboardScrollExtraOffset={GAP['3xl'] * 2} style={[styles.container, { paddingHorizontal: inset }]}>
        {head}
        {body ? (
          <>
            <ZSSegmentedControl options={tabs} value={tab} onValueChange={setTab} testID="diary-tab" />
            {tab === 'record' ? (
              <Animated.View key="record" entering={FadeIn} style={styles.tab}>
                {body}
              </Animated.View>
            ) : (
              memoContent
            )}
          </>
        ) : (
          memoContent
        )}
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP['2xl'] },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: GAP.lg },
  sentence: { flexGrow: 1, flexShrink: 1, alignItems: 'flex-start', gap: GAP.sm },
  sentenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: GAP.xs, rowGap: GAP.sm },
  withParticle: { flexDirection: 'row', alignItems: 'center' },
  particle: { marginStart: GAP.xxs },
  highlight: { paddingHorizontal: GAP.sm, paddingVertical: GAP.xxs },
  sticker: { width: STICKER, height: STICKER, alignItems: 'center', justifyContent: 'center' },
  tab: { gap: GAP.xl },
});
