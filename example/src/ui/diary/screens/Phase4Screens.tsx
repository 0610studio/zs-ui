import { useRef, useState } from 'react';
import { Image, Keyboard, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ZSBox, ZSPressable, ZSRadioGroup, ZSSwitch, ZSText, ZSTextField, radiusStyle, useOverlay } from '@0610studio/zs-ui';
import Section from '../../kit/Section';
import { GAP, ROW_HEIGHT, ROW_INSET } from '../../kit/layout';
import { getCategory } from '../../../model/diary/categories';
import { END_BEFORE_START_MESSAGE, formatRecordTime, sanitizeDecimal } from '../../../model/diary/common';
import { requestPick } from '../../../model/diary/pickBridge';
import {
  DEFAULT_FASTING,
  FASTING_REASONS,
  FASTING_WATER,
  FEED_TEXT,
  FOODS,
  TARGET_WEIGHT_KG,
  dailyKcalRange,
  entryKcal,
  feedSummary,
  formatFastingEnd,
  type FastingForm,
  type FeedEntry,
} from '../../../model/diary/feed';
import {
  BEHAVIOR_TEXT,
  CAT_SEVERAL_COUNTS,
  CAT_SEVERAL_LEVEL,
  COUNT_LEVELS,
  EMPTY_BEHAVIOR,
  MAX_ALSO_OPTIONS,
  METHODS,
  MINUTE_OPTIONS,
  PLACES,
  RECENT_BEHAVIORS,
  RESPONSES,
  SITUATIONS,
  TRAINING_RESULTS,
  adviceFor,
  behaviorLabel,
  changeKind,
  intensityLevelsFor,
  isBarkMinutesBehavior,
  isCatFrequencyBehavior,
  isDailyRecordBehavior,
  isEliminationBehavior,
  pickBehavior,
  situationsFor,
  toggleCode,
  validateBehavior,
  type BehaviorForm,
  type BehaviorKind,
} from '../../../model/diary/behavior';
import AdviceCards from '../AdviceCards';
import ChoiceChips from '../ChoiceChips';
import DateTimePickerSheet, { DATETIME_SHEET_TITLE } from '../DateTimePickerSheet';
import DiaryWriteShell, { useDiaryCommon } from '../DiaryWriteShell';
import { AddRow, ValueRow } from '../ListRows';
import PetBubble from '../PetBubble';
import PickRow from '../PickRow';
import TimePickerSheet, { TIME_SHEET_TITLE } from '../TimePickerSheet';

const FOOD_IMAGE = require('../../../../assets/barabom/feed/default_food.png');
const THUMB = 40;
let nextKey = 0;
const newKey = () => `f${(nextKey += 1)}`;

const toOptions = (dict: Record<string, string>) => Object.keys(dict).map((code) => ({ code, label: dict[code] }));

function Help({ children, testID }: { children: string; testID?: string }) {
  return (
    <ZSText variant="caption" color="textSecondary" style={styles.help} testID={testID}>
      {children}
    </ZSText>
  );
}

function FastingSwitchRow({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <ZSPressable onPress={onToggle} accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={`${FEED_TEXT.switchLabel}, ${FEED_TEXT.switchHint}`} testID="feed-fasting" style={styles.pressable}>
      <View style={styles.switchRow}>
        <View style={styles.flex}>
          <ZSText variant="subtitle1">{FEED_TEXT.switchLabel}</ZSText>
          <ZSText variant="body2" color="textSecondary">
            {FEED_TEXT.switchHint}
          </ZSText>
        </View>
        <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <ZSSwitch value={value} accessibilityLabel={FEED_TEXT.switchLabel} />
        </View>
      </View>
    </ZSPressable>
  );
}

export function FeedScreen() {
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [common, setCommon] = useDiaryCommon();
  const [fasting, setFasting] = useState(false);
  const [water, setWater] = useState('');
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [fastingForm, setFastingForm] = useState<FastingForm>(DEFAULT_FASTING);
  const feedDraft = useRef<{ water: string; entries: FeedEntry[] } | null>(null);
  const start = common.recordedAt;
  const summary = feedSummary(entries);

  const toggleFasting = () => {
    if (!fasting) {
      feedDraft.current = { water, entries };
      setWater('');
      setEntries([]);
      setFastingForm(DEFAULT_FASTING);
    } else if (feedDraft.current) {
      setWater(feedDraft.current.water);
      setEntries(feedDraft.current.entries);
    }
    setFasting(!fasting);
  };

  const addFood = () => {
    requestPick((value) => {
      const { uid, gram } = JSON.parse(value) as { uid: number; gram: number };
      const food = FOODS.find((item) => item.uid === uid);
      if (food) setEntries((prev) => [...prev, { key: newKey(), food, gram, kcal: entryKcal(food, gram) }]);
    });
    Keyboard.dismiss();
    router.push('/diary/feed-food');
  };

  const openStart = () =>
    showBottomSheet({
      header: TIME_SHEET_TITLE,
      component: (
        <TimePickerSheet
          initialTime={start}
          onConfirm={(time) => {
            const next = new Date(start);
            next.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setCommon((prev) => ({ ...prev, recordedAt: next }));
            hideBottomSheet();
          }}
        />
      ),
    });

  const openEnd = () =>
    showBottomSheet({
      header: DATETIME_SHEET_TITLE,
      component: (
        <DateTimePickerSheet
          initial={fastingForm.end ?? new Date()}
          minimumDate={start}
          validate={(value) => (value.getTime() < start.getTime() ? END_BEFORE_START_MESSAGE : null)}
          onConfirm={(value) => {
            setFastingForm((prev) => ({ ...prev, end: value }));
            hideBottomSheet();
          }}
        />
      ),
    });

  const reference = dailyKcalRange(TARGET_WEIGHT_KG);

  return (
    <DiaryWriteShell
      category={getCategory('feed')}
      common={common}
      setCommon={setCommon}
      targetLabel={fasting ? FEED_TEXT.fastingTarget : undefined}
      body={
        <>
          <Section surface="list">
            <FastingSwitchRow value={fasting} onToggle={toggleFasting} />
          </Section>
          {fasting ? (
            <>
              <Section surface="list">
                <PickRow title={FEED_TEXT.startTime} value={formatRecordTime(start)} placeholder="" onPress={openStart} testID="fasting-start" />
                <PickRow
                  title={FEED_TEXT.endTime}
                  value={fastingForm.end ? formatFastingEnd(fastingForm.end, start) : undefined}
                  placeholder={FEED_TEXT.addTime}
                  onPress={openEnd}
                  onClear={() => setFastingForm((prev) => ({ ...prev, end: null }))}
                  testID="fasting-end"
                />
              </Section>
              <Section label={FEED_TEXT.fastingWater} surface="plain">
                <ChoiceChips options={FASTING_WATER} selected={[fastingForm.water]} onPress={(code) => setFastingForm((prev) => ({ ...prev, water: code as FastingForm['water'] }))} testID="fasting-water" />
              </Section>
              <Section label={FEED_TEXT.fastingReason} surface="plain">
                <ChoiceChips options={FASTING_REASONS} selected={[fastingForm.reason]} onPress={(code) => setFastingForm((prev) => ({ ...prev, reason: code as FastingForm['reason'] }))} testID="fasting-reason" />
              </Section>
            </>
          ) : (
            <>
              <ZSTextField
                label={FEED_TEXT.water}
                placeholder={FEED_TEXT.waterPlaceholder}
                value={water}
                onChangeText={(text) => setWater(sanitizeDecimal(text))}
                keyboardType="decimal-pad"
                maxLength={8}
                endAdornment={
                  <ZSText variant="body1" color="textSecondary">
                    ml
                  </ZSText>
                }
                testID="feed-water"
              />
              <Section label={FEED_TEXT.feed} surface="list" ruleInset={ROW_INSET + THUMB + GAP.md}>
                {entries.map((entry) => (
                  <ValueRow key={entry.key} removeLabel={`${entry.food.name} 지우기`} onRemove={() => setEntries((prev) => prev.filter((item) => item.key !== entry.key))} testID={`feed-entry-${entry.food.uid}`}>
                    <View style={styles.entry}>
                      <ZSBox backgroundColor="background" style={[styles.thumb, radiusStyle('sm')]}>
                        <Image source={FOOD_IMAGE} style={styles.thumbImage} resizeMode="contain" />
                      </ZSBox>
                      <View style={styles.flex}>
                        <ZSText variant="subtitle1">{entry.food.name}</ZSText>
                        {entry.gram > 0 ? (
                          <ZSText variant="body2" color="textSecondary">
                            {`${entry.gram}g`}
                          </ZSText>
                        ) : null}
                      </View>
                    </View>
                  </ValueRow>
                ))}
                <AddRow label={FEED_TEXT.feedAdd} onPress={addFood} testID="feed-add" />
              </Section>
              {entries.length > 0 ? (
                <PetBubble testID="feed-kcal">
                  {summary.kcal !== 0 ? (
                    <>
                      <ZSText variant="body2">{FEED_TEXT.caloriesTotal(summary.kcal)}</ZSText>
                      <ZSText variant="body2" color="primary">
                        {FEED_TEXT.caloriesReference(TARGET_WEIGHT_KG, reference)}
                      </ZSText>
                    </>
                  ) : (
                    <ZSText variant="body2">{FEED_TEXT.caloriesUnavailable}</ZSText>
                  )}
                </PetBubble>
              ) : null}
            </>
          )}
        </>
      }
    />
  );
}

export function BehaviorScreen() {
  const [common, setCommon] = useDiaryCommon();
  const [form, setForm] = useState<BehaviorForm>(EMPTY_BEHAVIOR);
  const set = (patch: Partial<BehaviorForm>) => setForm((prev) => ({ ...prev, ...patch }));
  const { behavior, kind } = form;

  const openSearch = () => {
    requestPick((code) => setForm((prev) => pickBehavior(prev, code)));
    router.push({ pathname: '/diary/search', params: { kind: 'behavior' } });
  };

  const elimination = isEliminationBehavior(behavior);
  const levels = intensityLevelsFor(behavior);
  const levelOptions = levels.map((level, index) => ({ code: String(index), label: level.label })).filter((option) => option.code !== '0');
  const help = kind === 'EVENT' && form.level ? levels[Number(form.level)]?.help : null;
  const catSeveral = kind === 'EVENT' && isCatFrequencyBehavior(behavior) && form.level === CAT_SEVERAL_LEVEL;
  const alsoOptions = RECENT_BEHAVIORS.filter((code) => code !== behavior)
    .slice(0, MAX_ALSO_OPTIONS)
    .map((code) => ({ code, label: behaviorLabel(code) }));
  const minuteOptions = MINUTE_OPTIONS.map((code) => ({ code, label: BEHAVIOR_TEXT.minutesUnit(code) }));
  const minuteChips = <ChoiceChips options={minuteOptions} selected={form.minutes ? [form.minutes] : []} onPress={(code) => set({ minutes: form.minutes === code ? null : code })} testID="behavior-minutes" />;

  return (
    <DiaryWriteShell
      category={getCategory('behavior')}
      common={common}
      setCommon={setCommon}
      validate={() => validateBehavior(form)}
      body={
        <>
          <Section surface="list">
            <PickRow title={BEHAVIOR_TEXT.behavior} value={behavior ? behaviorLabel(behavior) : undefined} placeholder={BEHAVIOR_TEXT.pickBehavior} required onPress={openSearch} onClear={() => setForm(EMPTY_BEHAVIOR)} testID="behavior-kind" />
          </Section>
          {behavior ? (
            <Section label={BEHAVIOR_TEXT.kind} surface="plain" gap={GAP.sm}>
              <ZSRadioGroup<BehaviorKind>
                options={[
                  { value: 'EVENT', label: BEHAVIOR_TEXT.kindEvent },
                  { value: 'TRAINING', label: BEHAVIOR_TEXT.kindTraining },
                ]}
                value={kind}
                onValueChange={(next) => setForm((prev) => changeKind(prev, next))}
                columns={2}
                accessibilityLabel={BEHAVIOR_TEXT.kind}
                testID="behavior-record-kind"
              />
              {kind === 'EVENT' ? <Help>{isDailyRecordBehavior(behavior) ? BEHAVIOR_TEXT.unitDaily : BEHAVIOR_TEXT.unitEach}</Help> : null}
            </Section>
          ) : null}
          {behavior && kind === 'EVENT' ? (
            <>
              <Section label={elimination ? BEHAVIOR_TEXT.count : BEHAVIOR_TEXT.intensity} required surface="plain" gap={GAP.sm}>
                <ChoiceChips
                  options={levelOptions}
                  selected={form.level ? [form.level] : []}
                  onPress={(code) => set({ level: code, catCount: code === CAT_SEVERAL_LEVEL ? form.catCount : null })}
                  testID="behavior-level"
                />
                {help ? <Help testID="behavior-level-help">{help}</Help> : null}
              </Section>
              {catSeveral ? (
                <Section label={BEHAVIOR_TEXT.count} surface="plain" gap={GAP.sm}>
                  <ChoiceChips
                    options={CAT_SEVERAL_COUNTS.map((code) => ({ code, label: COUNT_LEVELS[Number(code)].label }))}
                    selected={form.catCount ? [form.catCount] : []}
                    onPress={(code) => set({ catCount: form.catCount === code ? null : code })}
                    testID="behavior-cat-count"
                  />
                  <Help>{BEHAVIOR_TEXT.catCountHelp}</Help>
                </Section>
              ) : null}
              {isBarkMinutesBehavior(behavior) ? (
                <Section label={BEHAVIOR_TEXT.barkMinutes} surface="plain">
                  {minuteChips}
                </Section>
              ) : null}
              {elimination ? (
                <Section label={BEHAVIOR_TEXT.place} surface="plain">
                  <ChoiceChips options={toOptions(PLACES)} selected={form.places} onPress={(code) => set({ places: toggleCode(form.places, code) })} testID="behavior-place" />
                </Section>
              ) : null}
              <Section label={BEHAVIOR_TEXT.situation} surface="plain">
                <ChoiceChips
                  options={situationsFor(behavior).map((code) => ({ code, label: SITUATIONS[code] }))}
                  selected={form.situations}
                  onPress={(code) => set({ situations: toggleCode(form.situations, code) })}
                  testID="behavior-situation"
                />
              </Section>
              <Section label={BEHAVIOR_TEXT.response} surface="plain">
                <ChoiceChips options={toOptions(RESPONSES)} selected={form.responses} onPress={(code) => set({ responses: toggleCode(form.responses, code) })} testID="behavior-response" />
              </Section>
              <Section label={BEHAVIOR_TEXT.tipsTitle} surface="plain">
                <AdviceCards advice={adviceFor(behavior, form.responses)} testID="behavior-advice" />
              </Section>
            </>
          ) : null}
          {behavior && kind === 'TRAINING' ? (
            <>
              {alsoOptions.length > 0 ? (
                <Section label={BEHAVIOR_TEXT.trainingAlso} surface="plain" gap={GAP.sm}>
                  <ChoiceChips options={alsoOptions} selected={form.also} onPress={(code) => set({ also: toggleCode(form.also, code) })} testID="behavior-also" />
                  <Help>{BEHAVIOR_TEXT.trainingAlsoHelp}</Help>
                </Section>
              ) : null}
              <Section label={BEHAVIOR_TEXT.method} required surface="plain">
                <ChoiceChips options={toOptions(METHODS)} selected={form.methods} onPress={(code) => set({ methods: toggleCode(form.methods, code) })} testID="behavior-method" />
              </Section>
              <Section label={BEHAVIOR_TEXT.result} required surface="plain">
                <ChoiceChips options={toOptions(TRAINING_RESULTS)} selected={form.level ? [form.level] : []} onPress={(code) => set({ level: code })} testID="behavior-result" />
              </Section>
              <Section label={BEHAVIOR_TEXT.minutes} surface="plain">
                {minuteChips}
              </Section>
              <Section label={BEHAVIOR_TEXT.tipsTitle} surface="plain">
                <AdviceCards advice={adviceFor(behavior)} testID="behavior-advice" />
              </Section>
            </>
          ) : null}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  pressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  switchRow: { width: '100%', minHeight: ROW_HEIGHT.double, flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  flex: { flexGrow: 1, flexShrink: 1 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: GAP.md },
  thumb: { width: THUMB, height: THUMB, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: THUMB * 0.8, height: THUMB * 0.8 },
  help: { paddingHorizontal: GAP.xs },
});
