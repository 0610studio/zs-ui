import { useState } from 'react';
import { router } from 'expo-router';
import { ZSText, useOverlay } from '@0610studio/zs-ui';
import Section from '../../kit/Section';
import { getCategory } from '../../../model/diary/categories';
import { requestPick } from '../../../model/diary/pickBridge';
import { MEDICAL_TEXT, type MedicalSubject, type MedicalTest } from '../../../model/diary/medical';
import {
  EMPTY_MEASURE,
  MEASURE_CONDITION_LABEL,
  MEASURE_KINDS,
  MEASURE_KIND_LABEL,
  MEASURE_TEXT,
  measureKindText,
  measureValueText,
  validateMeasure,
  type MeasureForm,
  type MeasureKind,
} from '../../../model/diary/measure';
import DiaryWriteShell, { useDiaryCommon } from '../DiaryWriteShell';
import CheckupCard from '../CheckupCard';
import { AddRow, ValueRow } from '../ListRows';
import { MeasureCounterSheet, MeasureStartHeader, MeasureStartSheet, MeasureValueSheet } from '../MeasureSheets';
import OptionCardSheet from '../OptionCardSheet';
import PickRow from '../PickRow';

const AFTER_SHEET = 300;
let nextKey = 0;
const newKey = () => `k${(nextKey += 1)}`;

export function MedicalScreen() {
  const [common, setCommon] = useDiaryCommon();
  const [subjects, setSubjects] = useState<MedicalSubject[]>([]);
  const [tests, setTests] = useState<MedicalTest[]>([]);

  const addSubject = () => {
    requestPick((value) => {
      const picked = JSON.parse(value) as { code: string; name: string };
      setSubjects((prev) => [...prev, { key: newKey(), code: picked.code, name: picked.name }]);
    });
    router.push({ pathname: '/diary/search', params: { kind: 'medical' } });
  };

  const addTest = () => {
    requestPick((value) => setTests((prev) => [...prev, { key: newKey(), ...(JSON.parse(value) as Omit<MedicalTest, 'key'>) }]));
    router.push('/diary/medical-test');
  };

  return (
    <DiaryWriteShell
      category={getCategory('medical')}
      common={common}
      setCommon={setCommon}
      body={
        <>
          <Section label={MEDICAL_TEXT.subject} surface="list">
            {subjects.map((subject) => (
              <ValueRow key={subject.key} removeLabel={`${subject.name} 지우기`} onRemove={() => setSubjects((prev) => prev.filter((item) => item.key !== subject.key))} testID={`medical-subject-${subject.code}`}>
                <ZSText variant="subtitle1">{subject.name}</ZSText>
              </ValueRow>
            ))}
            <AddRow label={MEDICAL_TEXT.subjectAdd} onPress={addSubject} testID="medical-subject-add" />
          </Section>
          <Section label={MEDICAL_TEXT.test} surface="list">
            {tests.map((test) => (
              <ValueRow key={test.key} alignTop removeLabel={`${test.name} 검사 지우기`} onRemove={() => setTests((prev) => prev.filter((item) => item.key !== test.key))} testID={`medical-test-${test.key}`}>
                <CheckupCard test={test} />
              </ValueRow>
            ))}
            <AddRow label={MEDICAL_TEXT.testAdd} onPress={addTest} testID="medical-test-add" />
          </Section>
        </>
      }
    />
  );
}

export function MeasureScreen() {
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [common, setCommon] = useDiaryCommon();
  const [form, setForm] = useState<MeasureForm>(EMPTY_MEASURE);

  const openValue = (kind: MeasureKind, current: MeasureForm) =>
    showBottomSheet({
      header: MEASURE_KIND_LABEL[kind],
      component: (
        <MeasureValueSheet
          kind={kind}
          initial={current}
          onConfirm={(draft) => {
            setForm({ ...current, ...draft, kind });
            hideBottomSheet();
          }}
        />
      ),
    });

  const openCounter = (kind: 'HR' | 'RR', seconds: number, current: MeasureForm) =>
    showBottomSheet({
      options: { dismissible: false },
      component: (
        <MeasureCounterSheet
          kind={kind}
          seconds={seconds}
          onCancel={hideBottomSheet}
          onDone={(value) => {
            hideBottomSheet();
            setTimeout(() => openValue(kind, { ...current, value: String(value) }), AFTER_SHEET);
          }}
        />
      ),
    });

  const openValueFlow = (kind: MeasureKind, current: MeasureForm) => {
    if (kind !== 'HR' && kind !== 'RR') {
      openValue(kind, current);
      return;
    }
    showBottomSheet({
      header: <MeasureStartHeader kind={kind} />,
      component: (
        <MeasureStartSheet
          kind={kind}
          onPick={(seconds) => {
            hideBottomSheet();
            setTimeout(() => openCounter(kind, seconds, current), AFTER_SHEET);
          }}
          onDirect={() => {
            hideBottomSheet();
            setTimeout(() => openValue(kind, current), AFTER_SHEET);
          }}
        />
      ),
    });
  };

  const openKind = () =>
    showBottomSheet({
      header: MEASURE_TEXT.kind,
      component: (
        <OptionCardSheet
          options={MEASURE_KINDS.map((kind) => ({ code: kind, label: MEASURE_KIND_LABEL[kind] }))}
          value={form.kind}
          onSelect={(code) => {
            hideBottomSheet();
            const kind = code as MeasureKind;
            const next = kind === form.kind ? form : { ...EMPTY_MEASURE, kind };
            setForm(next);
            setTimeout(() => openValueFlow(kind, next), AFTER_SHEET);
          }}
          testID="measure-kind-option"
        />
      ),
    });

  const kind = form.kind;
  return (
    <DiaryWriteShell
      category={getCategory('measure')}
      common={common}
      setCommon={setCommon}
      validate={() => validateMeasure(form)}
      body={
        <Section surface="list">
          <PickRow title={MEASURE_TEXT.kind} value={measureKindText(form)} placeholder={MEASURE_TEXT.kindPlaceholder} onPress={openKind} onClear={() => setForm(EMPTY_MEASURE)} testID="measure-kind" />
          <PickRow
            title={MEASURE_TEXT.value}
            value={measureValueText(form)}
            placeholder={kind ? MEASURE_TEXT.valuePlaceholder : MEASURE_TEXT.kindFirst}
            enabled={kind !== null}
            onPress={() => kind && openValueFlow(kind, form)}
            testID="measure-value-row"
          />
          {form.condition && kind ? (
            <PickRow title={MEASURE_TEXT.condition} value={MEASURE_CONDITION_LABEL[form.condition]} placeholder="" onPress={() => openValue(kind, form)} testID="measure-condition-row" />
          ) : null}
        </Section>
      }
    />
  );
}
