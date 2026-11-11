import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ZSButton, ZSChip, ZSText, ZSTextField, useOverlay, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';
import { sanitizeDecimal, sanitizeDigits } from '../../model/diary/common';
import {
  COUNT_NAME,
  MEASURE_CONDITIONS,
  MEASURE_CONDITION_LABEL,
  MEASURE_KIND_LABEL,
  MEASURE_SECONDS,
  MEASURE_TEXT,
  MEASURE_UNIT,
  perMinute,
  validateMeasureSheet,
  type MeasureCondition,
  type MeasureForm,
  type MeasureKind,
} from '../../model/diary/measure';

type Draft = Pick<MeasureForm, 'label' | 'value' | 'secondValue' | 'unit' | 'condition'>;

function ConditionChips({ kind, value, onChange }: { kind: MeasureKind; value: MeasureCondition | null; onChange: (next: MeasureCondition | null) => void }) {
  const conditions = MEASURE_CONDITIONS[kind];
  if (conditions.length === 0) return null;
  return (
    <View style={styles.chips}>
      <ZSText variant="caption" emphasized color="textSecondary">
        {MEASURE_TEXT.condition}
      </ZSText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} keyboardShouldPersistTaps="handled">
        {conditions.map((condition) => (
          <ZSChip
            key={condition}
            label={MEASURE_CONDITION_LABEL[condition]}
            selected={value === condition}
            onSelectedChange={(selected) => onChange(selected ? condition : null)}
            testID={`measure-condition-${condition}`}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Unit({ text }: { text: string }) {
  return (
    <ZSText variant="body1" color="textSecondary">
      {text}
    </ZSText>
  );
}

export function MeasureValueSheet({ kind, initial, onConfirm }: { kind: MeasureKind; initial: Draft; onConfirm: (draft: Draft) => void }) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };
  const confirm = () => {
    const message = validateMeasureSheet(kind, draft);
    setError(message);
    if (!message) onConfirm({ ...draft, label: draft.label.trim(), unit: draft.unit.trim() });
  };

  return (
    <View style={styles.root}>
      {kind === 'OTHER' ? (
        <>
          <ZSTextField label={MEASURE_TEXT.otherName} placeholder={MEASURE_TEXT.otherNamePlaceholder} value={draft.label} onChangeText={(text) => set('label', text)} maxLength={30} autoFocus testID="measure-other-name" />
          <View style={styles.pair}>
            <View style={styles.grow}>
              <ZSTextField label={MEASURE_TEXT.value} value={draft.value} onChangeText={(text) => set('value', sanitizeDecimal(text))} keyboardType="decimal-pad" maxLength={7} testID="measure-value" />
            </View>
            <View style={styles.unitField}>
              <ZSTextField label="단위" placeholder={MEASURE_TEXT.otherUnitPlaceholder} value={draft.unit} onChangeText={(text) => set('unit', text)} maxLength={10} testID="measure-other-unit" />
            </View>
          </View>
        </>
      ) : kind === 'BP' ? (
        <>
          <ZSTextField
            label={MEASURE_TEXT.systolic}
            value={draft.value}
            onChangeText={(text) => set('value', sanitizeDigits(text))}
            keyboardType="number-pad"
            maxLength={3}
            autoFocus
            endAdornment={<Unit text={MEASURE_UNIT.BP} />}
            testID="measure-systolic"
          />
          <ZSTextField
            label={MEASURE_TEXT.diastolic}
            value={draft.secondValue}
            onChangeText={(text) => set('secondValue', sanitizeDigits(text))}
            keyboardType="number-pad"
            maxLength={3}
            endAdornment={<Unit text={MEASURE_UNIT.BP} />}
            testID="measure-diastolic"
          />
        </>
      ) : (
        <ZSTextField
          label={MEASURE_TEXT.value}
          value={draft.value}
          onChangeText={(text) => set('value', sanitizeDecimal(text))}
          keyboardType="decimal-pad"
          maxLength={7}
          autoFocus
          endAdornment={<Unit text={MEASURE_UNIT[kind]} />}
          testID="measure-value"
        />
      )}
      <ConditionChips kind={kind} value={draft.condition} onChange={(next) => set('condition', next)} />
      {error ? (
        <ZSText variant="body2" color="error" accessibilityLiveRegion="polite" testID="measure-error">
          {error}
        </ZSText>
      ) : null}
      <ZSButton title={MEASURE_TEXT.confirm} size="large" fullWidth onPress={confirm} testID="measure-confirm" />
    </View>
  );
}

/**
 * 측정 시작 시트 헤더 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다).
 * 글자는 accessible={false} — Android 에서 포커스 가능한 Text 는 터치를 가져가 시트 끌기를 막는다. 머리글은 감싼 View 가 읽는다.
 */
export function MeasureStartHeader({ kind }: { kind: 'HR' | 'RR' }) {
  const label = `${COUNT_NAME[kind]} 측정을 시작할게요.`;
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={label}>
      <ZSText variant="h4" emphasized accessible={false}>
        <ZSText variant="h4" emphasized color="primaryMark">
          {`${COUNT_NAME[kind]} `}
        </ZSText>
        측정을 시작할게요.
      </ZSText>
    </View>
  );
}

export function MeasureStartSheet({ kind, onPick, onDirect }: { kind: 'HR' | 'RR'; onPick: (seconds: number) => void; onDirect: () => void }) {
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <ZSText variant="body1" color="textSecondary">
          {MEASURE_TEXT.startQuestion}
        </ZSText>
      </View>
      <View style={styles.secondsRow}>
        {MEASURE_SECONDS.map((seconds) => (
          <ZSButton key={seconds} title={`${seconds}초`} size="large" variant="tonal" color="neutral" onPress={() => onPick(seconds)} style={styles.secondsButton} testID={`measure-seconds-${seconds}`} />
        ))}
      </View>
      <ZSButton title={MEASURE_TEXT.directInput} variant="text" onPress={onDirect} style={styles.center} testID="measure-direct" />
    </View>
  );
}

const CIRCLE = 220;
const RING = 9;

export function MeasureCounterSheet({ kind, seconds, onDone, onCancel }: { kind: 'HR' | 'RR'; seconds: number; onDone: (value: number) => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const { showAlert } = useOverlay();
  const total = seconds * 1000;
  const [phase, setPhase] = useState<'ready' | 'running' | 'paused'>('ready');
  const [count, setCount] = useState(0);
  const [remaining, setRemaining] = useState(total);
  const startedAt = useRef(0);
  const elapsedBefore = useRef(0);
  const countRef = useRef(0);
  const scale = useSharedValue(1);
  const bounce = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const timer = setInterval(() => {
      const elapsed = elapsedBefore.current + (Date.now() - startedAt.current);
      const left = Math.max(0, total - elapsed);
      setRemaining(left);
      if (left === 0) {
        clearInterval(timer);
        onDone(perMinute(countRef.current, seconds));
      }
    }, 100);
    return () => clearInterval(timer);
  }, [phase, total, seconds, onDone]);

  const tap = () => {
    if (phase === 'ready') {
      startedAt.current = Date.now();
      setPhase('running');
      return;
    }
    if (phase !== 'running') return;
    countRef.current += 1;
    setCount(countRef.current);
    Haptics.selectionAsync();
    scale.value = withSequence(withTiming(1.07, { duration: 70 }), withSpring(1));
  };

  const stop = () => {
    if (phase === 'ready') {
      onCancel();
      return;
    }
    elapsedBefore.current += Date.now() - startedAt.current;
    setPhase('paused');
    showAlert({
      title: MEASURE_TEXT.stopTitle,
      message: MEASURE_TEXT.stopMessage,
      confirm: { label: '확인', onPress: () => onDone(perMinute(countRef.current, Math.max(1, Math.round(elapsedBefore.current / 1000)))) },
      cancel: {
        label: '취소',
        onPress: () => {
          startedAt.current = Date.now();
          setPhase('running');
        },
      },
    });
  };

  const name = COUNT_NAME[kind];
  const radius = (CIRCLE - RING) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;

  return (
    <View style={[styles.root, styles.counter]}>
      <View style={styles.head}>
        <ZSText variant="h4" emphasized accessibilityRole="header" style={styles.centerText}>
          {phase === 'ready' ? MEASURE_TEXT.touchToStart : MEASURE_TEXT.measuring(name)}
        </ZSText>
        <ZSText variant="body1" color="textSecondary" style={styles.centerText} testID="measure-remaining">
          {phase === 'ready' ? ' ' : MEASURE_TEXT.remaining(Math.ceil(remaining / 1000))}
        </ZSText>
      </View>
      <View style={styles.circleWrap}>
        <Svg width={CIRCLE} height={CIRCLE} style={StyleSheet.absoluteFill}>
          <Circle cx={CIRCLE / 2} cy={CIRCLE / 2} r={radius} stroke={colors.surface3} strokeWidth={RING} fill="none" />
          <Circle
            cx={CIRCLE / 2}
            cy={CIRCLE / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={RING}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - progress)}
            transform={`rotate(-90 ${CIRCLE / 2} ${CIRCLE / 2})`}
          />
        </Svg>
        <Animated.View style={bounce}>
          <Pressable
            onPress={tap}
            accessibilityRole="button"
            accessibilityLabel={phase === 'ready' ? MEASURE_TEXT.circleStart : `${name} ${count}회, 누를 때마다 하나씩 셉니다`}
            testID="measure-circle"
            style={[styles.circle, { backgroundColor: colors.surface2 }]}
          >
            <ZSText variant={phase === 'ready' ? 'subtitle1' : 'h1'} emphasized testID="measure-count">
              {phase === 'ready' ? MEASURE_TEXT.circleStart : String(count)}
            </ZSText>
          </Pressable>
        </Animated.View>
      </View>
      <ZSButton title={MEASURE_TEXT.stop} size="large" variant="tonal" color="neutral" fullWidth onPress={stop} testID="measure-stop" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.lg },
  head: { gap: GAP.xs },
  pair: { flexDirection: 'row', alignItems: 'flex-start', gap: GAP.sm },
  grow: { flexGrow: 1, flexShrink: 1 },
  unitField: { width: 110 },
  chips: { gap: GAP.sm },
  chipRow: { gap: GAP.sm },
  secondsRow: { flexDirection: 'row', gap: GAP.sm },
  secondsButton: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  center: { alignSelf: 'center' },
  counter: { alignItems: 'stretch' },
  centerText: { textAlign: 'center' },
  circleWrap: { width: CIRCLE, height: CIRCLE, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  circle: { width: CIRCLE - RING * 4, height: CIRCLE - RING * 4, borderRadius: (CIRCLE - RING * 4) / 2, alignItems: 'center', justifyContent: 'center' },
});
