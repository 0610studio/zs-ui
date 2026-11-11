import { Image, StyleSheet, View } from 'react-native';
import { ZSBox, ZSCheckbox, ZSText, radiusStyle } from '@0610studio/zs-ui';
import Section from '../../kit/Section';
import { GAP, ROW_INSET } from '../../kit/layout';
import { ABNORMAL_DETAILS, ABNORMAL_SYMPTOMS } from '../../../model/diary/abnormal';
import { DETAIL_TEXT, certificateMinutesLeft, measureRows, walkDistanceText, walkTimeText, weatherInfo } from '../../../model/diary/detail';
import { FASTING_REASONS, FASTING_WATER, formatFastingEnd } from '../../../model/diary/feed';
import { POOPEE, POOPEE_KINDS, findPoopeeOption } from '../../../model/diary/poopee';
import { findRecord, type DiaryRecord } from '../../../model/diary/records';
import CheckupCard from '../CheckupCard';
import { poopeeImage } from '../poopee/poopeeImages';
import BehaviorViewer from './BehaviorViewer';
import InfoRow from './InfoRow';
import RecordListRow, { RECORD_ICON } from './RecordListRow';
import { CertificateCard, WalkRouteMap, WeatherValue } from './Walk';

const FOOD_IMAGE = require('../../../../assets/barabom/feed/default_food.png');
const THUMB = 40;
const POOPEE_IMAGE = 30;

function TodoViewer({ items }: { items: string[] }) {
  return (
    <Section label={DETAIL_TEXT.todo} surface="list" ruleInset={ROW_INSET + 24 + GAP.md}>
      {items.map((item) => (
        <InfoRow
          key={item}
          leading={
            <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <ZSCheckbox value accessibilityLabel={item} />
            </View>
          }
          value={item}
          testID={`record-todo-${item}`}
        />
      ))}
    </Section>
  );
}

function PoopeeViewer({ values }: { values: NonNullable<DiaryRecord['poopee']> }) {
  const kinds = POOPEE_KINDS.filter((kind) => values[kind]);
  return (
    <Section surface="list" ruleInset={ROW_INSET + POOPEE_IMAGE + GAP.md}>
      {kinds.map((kind) => {
        const option = findPoopeeOption(kind, values[kind] ?? null);
        const image = option ? poopeeImage(kind, option.code) : undefined;
        return (
          <InfoRow
            key={kind}
            leading={image ? <Image source={image} style={styles.poopeeImage} resizeMode="contain" /> : null}
            label={POOPEE[kind].title}
            value={option?.label ?? values[kind] ?? ''}
            testID={`record-poopee-${kind}`}
          />
        );
      })}
    </Section>
  );
}

function AbnormalViewer({ value }: { value: NonNullable<DiaryRecord['abnormal']> }) {
  const symptom = ABNORMAL_SYMPTOMS.find((item) => item.code === value.symptom);
  const detail = ABNORMAL_DETAILS[value.symptom];
  const detailOption = detail?.options.find((option) => option.code === value.detail);
  return (
    <Section surface="list">
      <InfoRow label={DETAIL_TEXT.abnormal} value={symptom?.label ?? value.symptom} trailing={value.count ? `${value.count}회` : undefined} testID="record-abnormal" />
      {detail && detailOption ? <InfoRow label={detail.title} value={detailOption.label} testID="record-abnormal-detail" /> : null}
    </Section>
  );
}

function MedicalViewer({ value }: { value: NonNullable<DiaryRecord['medical']> }) {
  return (
    <>
      {value.subjects.length > 0 ? (
        <Section label={DETAIL_TEXT.medicalSubjects} surface="list">
          {value.subjects.map((subject) => (
            <InfoRow key={subject} value={subject} />
          ))}
        </Section>
      ) : null}
      {value.tests.length > 0 ? (
        <Section label={DETAIL_TEXT.medicalTests} surface="list">
          {value.tests.map((test) => (
            <View key={test.name} style={styles.test} testID={`record-test-${test.name}`}>
              <CheckupCard test={{ key: test.name, ...test }} />
            </View>
          ))}
        </Section>
      ) : null}
    </>
  );
}

function FeedViewer({ record }: { record: DiaryRecord }) {
  const { feed, fasting } = record;
  if (fasting) {
    return (
      <Section surface="list">
        <InfoRow label={DETAIL_TEXT.fastingReason} value={FASTING_REASONS.find((reason) => reason.code === fasting.reason)?.label ?? ''} testID="record-fasting-reason" />
        <InfoRow label={DETAIL_TEXT.fastingEnd} value={fasting.end ? formatFastingEnd(fasting.end, record.at) : DETAIL_TEXT.fastingEndEmpty} testID="record-fasting-end" />
        <InfoRow label={DETAIL_TEXT.fastingWater} value={FASTING_WATER.find((water) => water.code === fasting.water)?.label ?? ''} testID="record-fasting-water" />
      </Section>
    );
  }
  if (!feed) return null;
  return (
    <>
      {feed.water || feed.kcal ? (
        <Section surface="list">
          {feed.water ? <InfoRow label={DETAIL_TEXT.water} value={`${feed.water} ml`} testID="record-feed-water" /> : null}
          {feed.kcal ? <InfoRow label={DETAIL_TEXT.kcal} value={`${feed.kcal} kcal`} testID="record-feed-kcal" /> : null}
        </Section>
      ) : null}
      {feed.foods.length > 0 ? (
        <Section label={DETAIL_TEXT.foods} surface="list" ruleInset={ROW_INSET + THUMB + GAP.md}>
          {feed.foods.map((food) => (
            <InfoRow
              key={food.name}
              leading={
                <ZSBox backgroundColor="background" style={[styles.thumb, radiusStyle('sm')]}>
                  <Image source={FOOD_IMAGE} style={styles.thumbImage} resizeMode="contain" />
                </ZSBox>
              }
              value={
                <View>
                  <ZSText variant="subtitle1">{food.name}</ZSText>
                  {food.gram > 0 ? (
                    <ZSText variant="body2" emphasized color="primary">
                      {`${food.gram}g`}
                    </ZSText>
                  ) : null}
                </View>
              }
              testID={`record-food-${food.name}`}
            />
          ))}
        </Section>
      ) : null}
    </>
  );
}

function MeasureViewer({ measure }: { measure: NonNullable<DiaryRecord['measure']> }) {
  const rows = measureRows(measure).filter((row) => row.label === DETAIL_TEXT.measureCondition);
  if (rows.length === 0) return null;
  return (
    <Section surface="list">
      {rows.map((row) => (
        <InfoRow key={row.label} label={row.label} value={row.value} testID={`record-measure-${row.label}`} />
      ))}
    </Section>
  );
}

type Actions = {
  onOpenRecord: (id: string) => void;
  onNotInExample: () => void;
};

function WalkViewer({ record, walk, onOpenRecord, onNotInExample }: { record: DiaryRecord; walk: NonNullable<DiaryRecord['walk']> } & Actions) {
  const stops = walk.subRecordIds.map((id) => findRecord(id)).filter((item): item is DiaryRecord => !!item);
  const minutesLeft = certificateMinutesLeft(walk);
  return (
    <>
      <Section surface="list">
        <InfoRow label={DETAIL_TEXT.walkTime} value={walkTimeText(record.at, walk.end)} testID="record-walk-time" />
        {walk.km ? <InfoRow label={DETAIL_TEXT.walkDistance} value={walkDistanceText(walk.km, record.at, walk.end)} testID="record-walk-distance" /> : null}
        {walk.weather && weatherInfo(walk.weather) ? <InfoRow label={DETAIL_TEXT.weather} value={<WeatherValue weather={walk.weather} />} testID="record-weather" /> : null}
      </Section>
      {stops.length > 0 ? (
        // 건강수첩 '지난 기록'과 같은 줄 — 분류 아이콘 · 이름 · 시각과 대표 값 → 그 기록 상세
        <Section label={DETAIL_TEXT.walkDiary} surface="list" ruleInset={ROW_INSET + RECORD_ICON + GAP.md}>
          {stops.map((stop) => (
            <RecordListRow key={stop.id} record={stop} onPress={() => onOpenRecord(stop.id)} />
          ))}
        </Section>
      ) : null}
      {walk.route.length >= 3 ? (
        <Section label={DETAIL_TEXT.walkRoute} surface="plain">
          <WalkRouteMap route={walk.route} stops={stops} onPress={onNotInExample} />
        </Section>
      ) : null}
      {minutesLeft !== null ? <CertificateCard minutesLeft={minutesLeft} onPress={onNotInExample} /> : null}
    </>
  );
}

export function hasViewer(record: DiaryRecord): boolean {
  return !!(record.behavior || record.walk || record.measure || record.todo || record.poopee || record.abnormal || record.medical || record.category === 'feed');
}

export default function RecordViewer({ record, onOpenRecord, onNotInExample }: { record: DiaryRecord } & Actions) {
  if (record.behavior) return <BehaviorViewer record={record} behavior={record.behavior} />;
  if (record.walk) return <WalkViewer record={record} walk={record.walk} onOpenRecord={onOpenRecord} onNotInExample={onNotInExample} />;
  if (record.measure) return <MeasureViewer measure={record.measure} />;
  if (record.todo) return <TodoViewer items={record.todo} />;
  if (record.poopee) return <PoopeeViewer values={record.poopee} />;
  if (record.abnormal) return <AbnormalViewer value={record.abnormal} />;
  if (record.medical) return <MedicalViewer value={record.medical} />;
  if (record.category === 'feed') return <FeedViewer record={record} />;
  return null;
}

const styles = StyleSheet.create({
  poopeeImage: { width: POOPEE_IMAGE, height: POOPEE_IMAGE },
  test: { paddingVertical: GAP.lg },
  thumb: { width: THUMB, height: THUMB, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: THUMB * 0.8, height: THUMB * 0.8 },
});
