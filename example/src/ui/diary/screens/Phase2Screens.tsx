import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { ZSButton, ZSCheckbox, ZSPressable, ZSText, ZSTextField, useOverlay, useTheme } from '@0610studio/zs-ui';
import Section from '../../kit/Section';
import { GAP, ROW_HEIGHT, ROW_INSET } from '../../kit/layout';
import { getCategory } from '../../../model/diary/categories';
import { END_BEFORE_START_MESSAGE, NOT_IN_EXAMPLE_MESSAGE, formatRecordTime, sanitizeDecimal, trimDecimal } from '../../../model/diary/common';
import { ABNORMAL_DETAILS, ABNORMAL_SYMPTOMS, ABNORMAL_TEXT, EMPTY_ABNORMAL, validateAbnormal, type AbnormalValues } from '../../../model/diary/abnormal';
import { requestPick } from '../../../model/diary/pickBridge';
import { TODO_TEXT, fetchTodos, todoSubline, validateTodo, type TodoItem } from '../../../model/diary/todo';
import { WALK_TEXT, validateWalk, walkDefaultTimes } from '../../../model/diary/walk';
import DiaryWriteShell, { useDiaryCommon } from '../DiaryWriteShell';
import CountStepper from '../CountStepper';
import FootprintField from '../FootprintField';
import OptionCardSheet from '../OptionCardSheet';
import PickRow from '../PickRow';
import TimePickerSheet, { TIME_SHEET_TITLE } from '../TimePickerSheet';

const AVATAR = 24;

function TodoRow({ item, checked, onToggle }: { item: TodoItem; checked: boolean; onToggle: () => void }) {
  const { colors } = useTheme();
  const subline = todoSubline(item);
  return (
    <ZSPressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={[item.name, subline, item.assignee ? `담당 ${item.assignee}` : null].filter(Boolean).join(', ')}
      testID={`todo-${item.uid}`}
      style={styles.todoPressable}
    >
      <View style={styles.todoRow}>
        <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <ZSCheckbox value={checked} accessibilityLabel={item.name} />
        </View>
        <View style={styles.todoText}>
          <ZSText variant="subtitle1">{item.name}</ZSText>
          <ZSText variant="caption" color="textSecondary">
            {subline}
          </ZSText>
        </View>
        {item.assignee ? (
          <View style={styles.assignee}>
            <View style={[styles.avatar, { backgroundColor: colors.surface4 }]}>
              <ZSText variant="caption" emphasized>
                {item.assignee.slice(0, 1)}
              </ZSText>
            </View>
            <ZSText variant="caption" color="textSecondary" numberOfLines={1}>
              {item.assignee}
            </ZSText>
          </View>
        ) : null}
      </View>
    </ZSPressable>
  );
}

export function TodoScreen() {
  const { colors } = useTheme();
  const { showSnackbar } = useOverlay();
  const [common, setCommon] = useDiaryCommon();
  const [todos, setTodos] = useState<TodoItem[] | null>(null);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    fetchTodos().then((list) => {
      if (alive) setTodos(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (uid: string) => setChecked((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]));

  return (
    <DiaryWriteShell
      category={getCategory('todo')}
      common={common}
      setCommon={setCommon}
      validate={() => validateTodo(checked)}
      body={
        <>
          {todos === null ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.textSecondary} />
            </View>
          ) : todos.length === 0 ? (
            <View style={styles.status}>
              <ZSText variant="subtitle1" emphasized>
                {TODO_TEXT.emptyTitle}
              </ZSText>
              <ZSText variant="body2" color="textSecondary">
                {TODO_TEXT.emptyDescription}
              </ZSText>
            </View>
          ) : (
            <Section surface="list">
              {todos.map((item) => (
                <TodoRow key={item.uid} item={item} checked={checked.includes(item.uid)} onToggle={() => toggle(item.uid)} />
              ))}
            </Section>
          )}
          <ZSButton
            title={TODO_TEXT.manage}
            variant="tonal"
            color="neutral"
            size="small"
            onPress={() => showSnackbar({ message: NOT_IN_EXAMPLE_MESSAGE })}
            style={styles.manage}
            testID="todo-manage"
          />
        </>
      }
    />
  );
}

export function AbnormalScreen() {
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [common, setCommon] = useDiaryCommon();
  const [values, setValues] = useState<AbnormalValues>(EMPTY_ABNORMAL);
  const symptom = ABNORMAL_SYMPTOMS.find((item) => item.code === values.symptom);
  const detail = values.symptom ? ABNORMAL_DETAILS[values.symptom] : undefined;
  const detailOption = detail?.options.find((option) => option.code === values.detail);

  const openSearch = () => {
    requestPick((code) => setValues({ symptom: code, count: 1, detail: null }));
    router.push({ pathname: '/diary/search', params: { kind: 'symptom' } });
  };

  const openDetail = () => {
    if (!detail) return;
    showBottomSheet({
      header: detail.title,
      component: (
        <OptionCardSheet
          options={detail.options}
          value={values.detail}
          onSelect={(code) => {
            setValues((prev) => ({ ...prev, detail: code }));
            hideBottomSheet();
          }}
          testID="abnormal-detail-option"
        />
      ),
    });
  };

  return (
    <DiaryWriteShell
      category={getCategory('abnormal')}
      common={common}
      setCommon={setCommon}
      validate={() => validateAbnormal(values)}
      body={
        <>
          <Section surface="list">
            <PickRow title={ABNORMAL_TEXT.title} value={symptom?.label} placeholder={ABNORMAL_TEXT.add} onPress={openSearch} onClear={() => setValues(EMPTY_ABNORMAL)} testID="abnormal-symptom" />
            {symptom ? <CountStepper title="횟수" value={values.count} onChange={(count) => setValues((prev) => ({ ...prev, count }))} unit="회" testID="abnormal-count" /> : null}
          </Section>
          {detail ? (
            <Section surface="list">
              <PickRow
                title={detail.title}
                value={detailOption?.label}
                placeholder={`${detail.title} 추가`}
                onPress={openDetail}
                onClear={() => setValues((prev) => ({ ...prev, detail: null }))}
                testID="abnormal-detail"
              />
            </Section>
          ) : null}
        </>
      }
    />
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M12 7.5V12l3 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function WalkScreen() {
  const { colors } = useTheme();
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [defaults] = useState(() => walkDefaultTimes());
  const [common, setCommon] = useDiaryCommon({ recordedAt: defaults.start });
  const [end, setEnd] = useState<Date | null>(defaults.end);
  const [distance, setDistance] = useState('');
  const start = common.recordedAt;

  const onDay = (base: Date, time: Date) => {
    const next = new Date(base);
    next.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return next;
  };

  const openStart = () =>
    showBottomSheet({
      header: TIME_SHEET_TITLE,
      component: (
        <TimePickerSheet
          initialTime={start}
          validate={(time) => (end && onDay(start, time).getTime() > end.getTime() ? END_BEFORE_START_MESSAGE : null)}
          onConfirm={(time) => {
            setCommon((prev) => ({ ...prev, recordedAt: onDay(prev.recordedAt, time) }));
            hideBottomSheet();
          }}
        />
      ),
    });

  const openEnd = () =>
    showBottomSheet({
      header: TIME_SHEET_TITLE,
      component: (
        <TimePickerSheet
          initialTime={end ?? start}
          validate={(time) => (onDay(start, time).getTime() < start.getTime() ? END_BEFORE_START_MESSAGE : null)}
          onConfirm={(time) => {
            setEnd(onDay(start, time));
            hideBottomSheet();
          }}
        />
      ),
    });

  return (
    <DiaryWriteShell
      category={getCategory('walk')}
      common={common}
      setCommon={setCommon}
      showTime={false}
      memoTab={{ footprint: false }}
      onDateChange={(next) => setEnd((prev) => (prev ? onDay(next, prev) : prev))}
      validate={() => validateWalk(start, end, trimDecimal(distance))}
      body={
        <>
          <ZSTextField
            label="거리"
            placeholder={WALK_TEXT.distance}
            value={distance}
            onChangeText={(text) => setDistance(sanitizeDecimal(text))}
            keyboardType="decimal-pad"
            maxLength={7}
            endAdornment={
              <ZSText variant="body1" color="textSecondary">
                {WALK_TEXT.unit}
              </ZSText>
            }
            testID="walk-distance"
          />
          <Section surface="list">
            <PickRow title={WALK_TEXT.start} value={formatRecordTime(start)} placeholder="시간 추가" leading={<ClockIcon color={colors.textSecondary} />} onPress={openStart} testID="walk-start" />
            <PickRow
              title={WALK_TEXT.end}
              required
              value={end ? formatRecordTime(end) : undefined}
              placeholder="시간 추가"
              leading={<ClockIcon color={colors.textSecondary} />}
              onPress={openEnd}
              testID="walk-end"
            />
          </Section>
          <FootprintField value={common.footprint} onChange={(footprint) => setCommon((prev) => ({ ...prev, footprint }))} />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  status: { alignItems: 'center', justifyContent: 'center', gap: GAP.sm, paddingVertical: GAP['3xl'] },
  manage: { alignSelf: 'flex-end' },
  todoPressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  todoRow: { width: '100%', minHeight: ROW_HEIGHT.double, flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  todoText: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
  assignee: { alignItems: 'center', gap: GAP.xxs, width: 56 },
  avatar: { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, alignItems: 'center', justifyContent: 'center' },
});
