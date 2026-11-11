import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import {
  OPACITY,
  ZSButton,
  ZSRadioGroup,
  ZSScreen,
  ZSSegmentedControl,
  ZSText,
  ZSTextField,
  todayDateString,
  useOverlay,
  radiusStyle,
  useTheme,
  withOpacity,
  type DateString,
} from '@0610studio/zs-ui';
import RecipeHeader from '../../src/ui/recipe/RecipeHeader';
import Section from '../../src/ui/kit/Section';
import SplitColumns, { DockColumn, usePageInset, useWideLayout } from '../../src/ui/kit/SplitColumns';
import { GAP, PAGE_INSET } from '../../src/ui/kit/layout';
import DatePickerSheet, { DATE_SHEET_TITLE } from '../../src/ui/barabom/DatePickerSheet';
import StepProgress from '../../src/ui/register/StepProgress';
import PetAvatar from '../../src/ui/register/PetAvatar';
import PhotoSheet, { PHOTO_SHEET_TITLE } from '../../src/ui/register/PhotoSheet';
import CareConditionSheet, { CARE_CONDITION_SHEET_TITLE } from '../../src/ui/register/CareConditionSheet';
import {
  EMPTY_FORM,
  GENDER_OPTIONS,
  HAIR_OPTIONS,
  NEUTER_OPTIONS,
  STEPS,
  TYPE_OPTIONS,
  VALIDATION,
  careConditionsText,
  hasBreed,
  isValidWeightKg,
  registerPet,
  toDisplayWeight,
  toKgWeight,
  validateName,
  type PetRegisterForm,
  type WeightUnit,
} from '../../src/model/petRegister';

type Step = 1 | 2 | 3;
type Errors = Partial<Record<'name' | 'type' | 'gender' | 'weight', string>>;

const WEIGHT_UNITS: { label: string; value: WeightUnit }[] = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
];

function formatBirth(date: DateString | null): string {
  if (!date) return '';
  const [year, month, day] = date.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

const FIELD_PRESS_DELAY = 130;

function PickerField({ label, value, onPress, testID }: { label: string; value: string; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      unstable_pressDelay={FIELD_PRESS_DELAY}
      accessibilityRole="button"
      accessibilityLabel={[label, value].filter(Boolean).join(', ')}
      testID={testID}
    >
      {({ pressed }) => (
        <View pointerEvents="none">
          <ZSTextField label={label} value={value} placeholder="눌러서 고르기" />
          {pressed ? <View style={[StyleSheet.absoluteFill, radiusStyle('lg'), { backgroundColor: withOpacity(colors.text, OPACITY.pressed) }]} /> : null}
        </View>
      )}
    </Pressable>
  );
}

function ChoiceGroup({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <View style={styles.choice}>
      <Section label={label} gap={0}>
        {children}
      </Section>
      {error ? (
        <ZSText variant="caption" color="error" accessibilityLiveRegion="polite" style={styles.choiceError}>
          {error}
        </ZSText>
      ) : null}
    </View>
  );
}

export default function PetRegister() {
  const { colors } = useTheme();
  const { showBottomSheet, hideBottomSheet, showSnackbar } = useOverlay();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<PetRegisterForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [saving, setSaving] = useState(false);
  const [isFirstPet, setIsFirstPet] = useState(false);
  const name = form.name.trim();

  const set = <K extends keyof PetRegisterForm>(key: K, value: PetRegisterForm[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  usePreventRemove(step === 2, () => setStep(1));

  const requiredErrors = (next: PetRegisterForm): Errors => ({
    name: validateName(next.name),
    type: next.type ? undefined : VALIDATION.typeRequired,
    gender: next.gender ? undefined : VALIDATION.genderRequired,
  });

  const update = <K extends keyof PetRegisterForm>(key: K, value: PetRegisterForm[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (tried && step === 1) setErrors(requiredErrors(next));
    if (key === 'weightKg') setErrors((prev) => ({ ...prev, weight: isValidWeightKg(String(value)) ? undefined : VALIDATION.weightRange }));
  };

  const submit = async () => {
    Keyboard.dismiss();
    if (step === 1) {
      setTried(true);
      const found = requiredErrors(form);
      setErrors(found);
      if (!found.name && !found.type && !found.gender) setStep(2);
      return;
    }
    if (step === 2) {
      if (!isValidWeightKg(form.weightKg)) {
        setErrors({ weight: VALIDATION.weightRange });
        return;
      }
      setSaving(true);
      try {
        const result = await registerPet(form);
        setIsFirstPet(result.isFirstPet);
        setStep(3);
      } catch {
        showSnackbar({ message: '등록하지 못했어요. 다시 시도해 주세요', type: 'error' });
      } finally {
        setSaving(false);
      }
      return;
    }
    if (isFirstPet) router.replace('/ZSCalendarAdvancedExample');
    else router.back();
  };

  const openPhoto = () =>
    showBottomSheet({
      header: PHOTO_SHEET_TITLE,
      component: (
        <PhotoSheet
          selected={form.photo}
          onSelect={(photo) => {
            set('photo', photo);
            hideBottomSheet();
          }}
        />
      ),
    });

  const openBirth = () =>
    showBottomSheet({
      header: DATE_SHEET_TITLE,
      component: (
        <DatePickerSheet
          initialDate={form.birth ?? todayDateString()}
          onConfirm={(date) => {
            hideBottomSheet();
            if (date > todayDateString()) {
              showSnackbar({ message: '생일은 오늘보다 앞선 날짜로 골라 주세요', type: 'error' });
              return;
            }
            set('birth', date);
          }}
        />
      ),
    });

  const openBreed = () => {
    if (!hasBreed(form.type)) return;
    router.push({ pathname: '/friends/breed', params: { type: form.type, ...(form.breed ? { selected: String(form.breed.id) } : null) } });
  };
  const { breedId, breedName } = useLocalSearchParams<{ breedId?: string; breedName?: string }>();
  useEffect(() => {
    if (breedId && breedName) setForm((prev) => ({ ...prev, breed: { id: Number(breedId), name: breedName } }));
  }, [breedId, breedName]);

  const openCareConditions = () =>
    showBottomSheet({
      header: CARE_CONDITION_SHEET_TITLE,
      component: (
        <CareConditionSheet
          initialValue={form.careConditions}
          onConfirm={(value) => {
            set('careConditions', value);
            hideBottomSheet();
          }}
        />
      ),
    });

  const primaryTitle = step === 1 ? '다음' : step === 2 ? '완료' : isFirstPet ? '첫 기록 남기기' : '돌아가기';
  const wide = useWideLayout();
  const inset = usePageInset();
  const dockButtons = (
    <View style={styles.dockRow}>
      {step === 2 ? (
        <ZSButton title="건너뛰기" size="large" variant="tonal" color="neutral" onPress={submit} disabled={saving} style={styles.skip} testID="register-skip" />
      ) : null}
      <ZSButton title={primaryTitle} size="large" onPress={submit} loading={saving} style={styles.flex1} testID="register-primary" />
    </View>
  );

  return (
    <>
      <RecipeHeader title="반려동물 등록" />
      <ZSScreen
        key={step}
        backgroundColor="background"
        keyboardScrollExtraOffset={GAP['3xl'] * 3}
        style={[styles.container, { paddingHorizontal: inset }]}
        bottomComponent={
          <View style={[styles.dock, { backgroundColor: colors.background, paddingHorizontal: inset }]}>
            <LinearGradient pointerEvents="none" colors={[`${colors.background}00`, colors.background]} style={styles.dockFade} />
            {step === 3 ? <View style={wide ? styles.dockCenter : null}>{dockButtons}</View> : <DockColumn>{dockButtons}</DockColumn>}
          </View>
        }
      >
        <StepProgress steps={STEPS} current={step} />

        {step === 1 ? (
          <Animated.View key="required" entering={FadeIn} style={styles.step}>
            <SplitColumns
              gap={GAP.xl}
              start={
                <View style={[styles.avatar, wide ? styles.avatarWide : null]}>
                  <PetAvatar photo={form.photo} name={form.name} size={wide ? 168 : 112} badge="camera" onPress={openPhoto} testID="register-photo" />
                </View>
              }
              end={
                <>
            <ZSTextField
              label="반려동물 이름"
              value={form.name}
              onChangeText={(text) => update('name', text)}
              errorText={errors.name}
              testID="register-name"
            />
            <ChoiceGroup label="반려동물 종류" error={errors.type}>
              <ZSRadioGroup options={TYPE_OPTIONS} value={form.type} onValueChange={(value) => update('type', value)} columns={2} accessibilityLabel="반려동물 종류" testID="register-type" />
            </ChoiceGroup>
            <ChoiceGroup label="반려동물 성별" error={errors.gender}>
              <ZSRadioGroup options={GENDER_OPTIONS} value={form.gender} onValueChange={(value) => update('gender', value)} columns={2} accessibilityLabel="반려동물 성별" testID="register-gender" />
            </ChoiceGroup>
                </>
              }
            />
          </Animated.View>
        ) : null}

        {step === 2 ? (
          <Animated.View key="optional" entering={FadeInDown} style={styles.step}>
            <SplitColumns
              gap={GAP.xl}
              start={
            <View style={[styles.intro, wide ? styles.introWide : null]}>
              <PetAvatar photo={form.photo} name={form.name} size={wide ? 112 : 48} />
              <ZSText variant={wide ? 'subtitle1' : 'body1'} style={wide ? styles.introTextWide : styles.introText}>
                <ZSText variant={wide ? 'subtitle1' : 'body1'} emphasized>
                  {name}
                </ZSText>
                {'의 정보를 입력해주세요.\n더 자세한 건강 수첩 정보를 알려드릴게요!'}
              </ZSText>
            </View>
              }
              end={
                <>
            <ZSTextField
              label={`${name}의 등록번호`}
              value={form.registerNo}
              onChangeText={(text) => set('registerNo', text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={15}
              testID="register-no"
            />
            <PickerField label={`${name}의 생일`} value={formatBirth(form.birth)} onPress={openBirth} testID="register-birth" />
            <View style={styles.weightRow}>
              <View style={styles.flex1}>
                <ZSTextField
                  label={`${name}의 지금 체중`}
                  value={toDisplayWeight(form.weightKg, unit)}
                  onChangeText={(text) => update('weightKg', toKgWeight(text, unit))}
                  keyboardType="decimal-pad"
                  maxLength={7}
                  errorText={errors.weight}
                  testID="register-weight"
                />
              </View>
              <ZSSegmentedControl options={WEIGHT_UNITS} value={unit} onValueChange={setUnit} style={styles.unit} testID="register-weight-unit" />
            </View>
            {hasBreed(form.type) ? <PickerField label={`${name}의 품종`} value={form.breed?.name ?? ''} onPress={openBreed} testID="register-breed-field" /> : null}
            <PickerField label="관리 중인 질환" value={careConditionsText(form.careConditions)} onPress={openCareConditions} testID="register-care-field" />
            {hasBreed(form.type) ? (
              <>
                <ChoiceGroup label="털 길이">
                  <ZSRadioGroup options={HAIR_OPTIONS} value={form.hair} onValueChange={(value) => set('hair', value)} columns={2} accessibilityLabel="털 길이" testID="register-hair" />
                </ChoiceGroup>
                <ChoiceGroup label="중성화">
                  <ZSRadioGroup options={NEUTER_OPTIONS} value={form.neuter} onValueChange={(value) => set('neuter', value)} columns={2} accessibilityLabel="중성화" testID="register-neuter" />
                </ChoiceGroup>
              </>
            ) : null}
                </>
              }
            />
          </Animated.View>
        ) : null}

        {step === 3 ? (
          <View style={styles.complete} testID="register-complete">
            <Animated.View entering={ZoomIn.springify().damping(14)}>
              <PetAvatar photo={form.photo} name={form.name} size={168} badge="check" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(180)} style={styles.completeText}>
              <ZSText variant="h2" emphasized accessibilityRole="header">
                {name}
              </ZSText>
              <ZSText variant="body1" color="textSecondary">
                등록이 완료되었어요!
              </ZSText>
            </Animated.View>
          </View>
        ) : null}
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: PAGE_INSET, paddingTop: GAP.lg, paddingBottom: GAP['3xl'], gap: GAP['2xl'] },
  step: { gap: GAP.xl },
  avatar: { alignItems: 'center', paddingVertical: GAP.sm },
  avatarWide: { paddingTop: GAP['2xl'] },
  choice: { gap: GAP.xs },
  choiceError: { paddingHorizontal: GAP.lg },
  intro: { flexDirection: 'row', alignItems: 'center', gap: GAP.md },
  introText: { flex: 1 },
  introTextWide: { textAlign: 'center' },
  introWide: { flexDirection: 'column', alignItems: 'center', gap: GAP.lg, paddingTop: GAP['2xl'] },
  weightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: GAP.sm },
  unit: { width: 104, marginTop: GAP.sm },
  complete: { alignItems: 'center', gap: GAP.xl, paddingTop: GAP['3xl'] * 2 },
  completeText: { alignItems: 'center', gap: GAP.xs },
  dock: { width: '100%', paddingHorizontal: PAGE_INSET, paddingTop: GAP.md, paddingBottom: GAP.sm },
  dockFade: { position: 'absolute', left: 0, right: 0, top: -GAP.xl, height: GAP.xl },
  dockRow: { flexDirection: 'row', gap: GAP.sm },
  dockCenter: { width: '50%', alignSelf: 'center' },
  skip: { flex: 1 },
  flex1: { flex: 1 },
});
