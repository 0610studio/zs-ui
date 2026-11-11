import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSBanner, ZSBox, ZSPressable, ZSText, radiusStyle, useTheme } from '@0610studio/zs-ui';
import ContentIcon from '../../kit/ContentIcon';
import Section from '../../kit/Section';
import { GAP, ROW_HEIGHT, ROW_INSET } from '../../kit/layout';
import {
  BEHAVIOR_ISSUES,
  BEHAVIOR_TEXT,
  COUNT_LEVELS,
  METHODS,
  PLACES,
  RESPONSES,
  SITUATIONS,
  TRAINING_RESULTS,
  adviceFor,
  behaviorLabel,
  intensityLevelsFor,
  isEliminationBehavior,
  type IssueId,
} from '../../../model/diary/behavior';
import { BARK_SURVEY, MAX_ISSUES, SURVEY_TEXT, compareFromText, matchedIssues, surveyAnswerRows, windowTitle } from '../../../model/diary/behaviorSurvey';
import { findRecord, type DiaryRecord, type RecordSurvey } from '../../../model/diary/records';
import AdviceCards from '../AdviceCards';
import InfoRow from './InfoRow';

type Behavior = NonNullable<DiaryRecord['behavior']>;

function ChipRow({ label, codes, names, testID }: { label: string; codes: string[]; names: (code: string) => string; testID: string }) {
  if (codes.length === 0) return null;
  return (
    <InfoRow
      label={label}
      value={
        <View style={styles.chips}>
          {codes.map((code) => (
            <ZSBox key={code} backgroundColor="background" style={[styles.chip, radiusStyle('full')]}>
              <ZSText variant="body2">{names(code)}</ZSText>
            </ZSBox>
          ))}
        </View>
      }
      testID={testID}
    />
  );
}

function ValueWithHelp({ value, help }: { value: string; help: string | null }) {
  return (
    <View style={styles.valueHelp}>
      <ZSText variant="subtitle1">{value}</ZSText>
      {help ? (
        <ZSText variant="body2" color="textSecondary">
          {help}
        </ZSText>
      ) : null}
    </View>
  );
}

function EventViewer({ behavior }: { behavior: Behavior }) {
  const { code, level, minutes, catCount } = behavior;
  const levels = intensityLevelsFor(code);
  const step = level ? levels[Number(level)] : undefined;
  return (
    <>
      <Section surface="list">
        <InfoRow label={BEHAVIOR_TEXT.behavior} value={behaviorLabel(code) || '기타'} testID="record-behavior-code" />
        {step ? <InfoRow label={isEliminationBehavior(code) ? BEHAVIOR_TEXT.count : BEHAVIOR_TEXT.intensity} value={<ValueWithHelp value={step.label} help={step.help} />} testID="record-behavior-level" /> : null}
        {catCount ? <InfoRow label={BEHAVIOR_TEXT.count} value={COUNT_LEVELS[Number(catCount)]?.label ?? ''} testID="record-behavior-cat-count" /> : null}
        {code === 'd01' && minutes ? <InfoRow label={BEHAVIOR_TEXT.barkMinutes} value={BEHAVIOR_TEXT.minutesUnit(minutes)} testID="record-behavior-bark" /> : null}
        <ChipRow label="장소" codes={behavior.places ?? []} names={(id) => PLACES[id]} testID="record-behavior-places" />
        <ChipRow label="상황" codes={behavior.situations ?? []} names={(id) => SITUATIONS[id]} testID="record-behavior-situations" />
        <ChipRow label="내 반응" codes={behavior.responses ?? []} names={(id) => RESPONSES[id]} testID="record-behavior-responses" />
      </Section>
      <Section label={BEHAVIOR_TEXT.tipsTitle} surface="plain">
        <AdviceCards advice={adviceFor(code, behavior.responses ?? [])} testID="record-advice" />
      </Section>
    </>
  );
}

function TrainingViewer({ behavior }: { behavior: Behavior }) {
  const { code, level, minutes } = behavior;
  const result = level ? TRAINING_RESULTS[level] : undefined;
  return (
    <>
      <Section surface="list">
        <InfoRow label={BEHAVIOR_TEXT.behavior} value={behaviorLabel(code) || '기타'} testID="record-behavior-code" />
        <ChipRow label="같이 연습한 행동" codes={(behavior.also ?? []).filter((other) => other !== code)} names={behaviorLabel} testID="record-behavior-also" />
        <ChipRow label="연습 방법" codes={behavior.methods ?? []} names={(id) => METHODS[id]} testID="record-behavior-methods" />
        {result ? <InfoRow label={BEHAVIOR_TEXT.result} value={result} testID="record-behavior-result" /> : null}
        {minutes ? <InfoRow label={BEHAVIOR_TEXT.minutes} value={BEHAVIOR_TEXT.minutesUnit(minutes)} testID="record-behavior-minutes" /> : null}
      </Section>
      <Section label={BEHAVIOR_TEXT.tipsTitle} surface="plain">
        <AdviceCards advice={adviceFor(code)} testID="record-advice" />
      </Section>
    </>
  );
}

function NoneViewer({ behavior }: { behavior: Behavior }) {
  return (
    <>
      <Section surface="list">
        <InfoRow label={BEHAVIOR_TEXT.behavior} value={behaviorLabel(behavior.code) || '기타'} testID="record-behavior-code" />
        <InfoRow label={isEliminationBehavior(behavior.code) ? BEHAVIOR_TEXT.count : BEHAVIOR_TEXT.intensity} value="없었어요" testID="record-behavior-level" />
      </Section>
      <Section label={BEHAVIOR_TEXT.tipsTitle} surface="plain">
        <AdviceCards advice={adviceFor(behavior.code)} testID="record-advice" />
      </Section>
    </>
  );
}

function KeyRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.keyRow}>
      <ZSText variant="body2" color="textSecondary" style={styles.key}>
        {label}
      </ZSText>
      <ZSText variant={strong ? 'subtitle2' : 'body2'} emphasized={strong} style={styles.keyValue}>
        {value}
      </ZSText>
    </View>
  );
}

function ProgressBox({ survey, at }: { survey: RecordSurvey; at: Date }) {
  const { colors } = useTheme();
  return (
    <ZSBox backgroundColor="surface2" style={[styles.progress, radiusStyle('xl')]} testID="record-survey-progress">
      {survey.summary ? (
        <View style={styles.summary}>
          {survey.summary.map((row) => (
            <KeyRow key={row.key} label={row.key} value={row.value} strong />
          ))}
        </View>
      ) : (
        <ZSText variant="body2" color="textSecondary">
          {compareFromText(at)}
        </ZSText>
      )}
      {survey.windows.map((window, index) => (
        <View key={index} style={styles.window}>
          <View style={[styles.rule, { backgroundColor: colors.border }]} />
          <ZSText variant="subtitle2" emphasized>
            {windowTitle(at, index)}
          </ZSText>
          <KeyRow label={SURVEY_TEXT.pet} value={window.pet} />
          {window.bark ? <KeyRow label={SURVEY_TEXT.bark} value={window.bark} /> : null}
          <KeyRow label={SURVEY_TEXT.owner} value={window.owner} />
        </View>
      ))}
    </ZSBox>
  );
}

function AnswersToggle({ open, count, onPress }: { open: boolean; count: number; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityState={{ expanded: open }} testID="record-survey-answers-toggle" style={styles.togglePressable}>
      <View style={styles.toggleRow}>
        <ZSText variant="body1" style={styles.toggleText}>
          {open ? SURVEY_TEXT.answersHide : SURVEY_TEXT.answersShow(count)}
        </ZSText>
        <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}>
          <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} />
        </View>
      </View>
    </ZSPressable>
  );
}

function SurveyViewer({ survey, at }: { survey: RecordSurvey; at: Date }) {
  const [open, setOpen] = useState(false);
  const issues = matchedIssues(survey.answers);
  const shown = issues.slice(0, MAX_ISSUES);
  const hidden = issues.length - shown.length;
  const previous = survey.previousId ? findRecord(survey.previousId)?.behavior?.survey : undefined;
  const resolved: IssueId[] = previous ? matchedIssues(previous.answers).filter((id) => !issues.includes(id)) : [];
  const answers = surveyAnswerRows(survey.answers);
  return (
    <>
      <Section surface="list">
        <InfoRow label={SURVEY_TEXT.target} value={BARK_SURVEY.name} testID="record-survey-target" />
      </Section>
      <Section label={SURVEY_TEXT.issues} surface="plain" gap={GAP.md}>
        {hidden > 0 ? (
          <ZSText variant="body2" color="textSecondary" testID="record-survey-hidden">
            {SURVEY_TEXT.hidden(hidden)}
          </ZSText>
        ) : null}
        {shown.length > 0 ? (
          <AdviceCards advice={shown.map((id) => ({ key: id, ...BEHAVIOR_ISSUES[id] }))} testID="record-issue" />
        ) : (
          <ZSText variant="body2" color="textSecondary">
            {SURVEY_TEXT.noIssues}
          </ZSText>
        )}
      </Section>
      {resolved.length > 0 ? (
        <ZSBanner status="success" title={SURVEY_TEXT.resolved} message={resolved.map((id) => BEHAVIOR_ISSUES[id].title).join('\n')} fullWidth testID="record-survey-resolved" />
      ) : null}
      <Section label={SURVEY_TEXT.progress} surface="plain">
        <ProgressBox survey={survey} at={at} />
      </Section>
      {survey.worse ? <ZSBanner status="warning" message={SURVEY_TEXT.worse} fullWidth testID="record-survey-worse" /> : null}
      {survey.recheck ? <ZSBanner status="info" message={SURVEY_TEXT.recheck} fullWidth testID="record-survey-recheck" /> : null}
      <Section label={SURVEY_TEXT.answers} surface="list">
        {open ? answers.map((row) => <InfoRow key={row.question} label={row.question} value={row.answer} testID="record-survey-answer" />) : null}
        <AnswersToggle open={open} count={answers.length} onPress={() => setOpen((prev) => !prev)} />
      </Section>
    </>
  );
}

export default function BehaviorViewer({ record, behavior }: { record: DiaryRecord; behavior: Behavior }) {
  if (behavior.kind === 'SURVEY') return behavior.survey ? <SurveyViewer survey={behavior.survey} at={record.at} /> : null;
  if (behavior.kind === 'TRAINING') return <TrainingViewer behavior={behavior} />;
  if (behavior.kind === 'NONE') return <NoneViewer behavior={behavior} />;
  return <EventViewer behavior={behavior} />;
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP.xs + 2, paddingTop: GAP.xxs },
  chip: { paddingHorizontal: GAP.md, paddingVertical: GAP.xs + 2 },
  valueHelp: { gap: GAP.xxs },
  progress: { padding: GAP.lg, gap: GAP.md },
  summary: { gap: GAP.xs },
  window: { gap: GAP.xs },
  rule: { height: StyleSheet.hairlineWidth, marginBottom: GAP.sm },
  keyRow: { flexDirection: 'row', gap: GAP.md },
  key: { width: 72 },
  keyValue: { flexGrow: 1, flexShrink: 1 },
  togglePressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  toggleRow: { width: '100%', minHeight: ROW_HEIGHT.single, flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  toggleText: { flexGrow: 1, flexShrink: 1 },
});
