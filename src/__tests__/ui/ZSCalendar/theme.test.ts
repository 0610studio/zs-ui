import { createThemeColors, DEFAULT_COLORS, withOpacity, type ColorMode } from '../../../theme/color';
import { contrastRatio as calendarContrast, readableChipTextColor, resolveCalendarTheme, weekdayHeaderColor } from '../../../ui/ZSCalendar/core/theme';
import { CALENDAR_LOCALES } from '../../../ui/ZSCalendar/core/locale';
import { contrastRatio, over } from '../../utils/contrast';

const light = createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 });
const dark = createThemeColors(DEFAULT_COLORS, { mode: 'dark', contrastLevel: 0 });

const MODES: ColorMode[] = ['light', 'dark'];
const CONTRAST_LEVELS = [0, 0.5, 1];

describe('ZSCalendar core/theme', () => {
  it('기본값을 전부 테마 색 역할에서 파생한다 — 하드코딩 색 없음', () => {
    const theme = resolveCalendarTheme(light, 'light');
    expect(theme).toEqual({
      background: 'transparent',
      dayText: light.text,
      outsideDayText: withOpacity(light.text, 0.38),
      sundayText: light.error,
      saturdayText: light.text,
      selectedBackground: light.surface1,
      selectedText: light.primaryMark,
      todayBackground: light.surface4,
      todayText: light.text,
      weekdayText: light.textSecondary,
      dotColor: light.textSecondary,
      chipTextDark: light.text,
      chipTextLight: light.textInverse,
    });
  });

  it('색 규칙 — 선택일은 떠 있는 카드 + 주색 표시색 숫자(3:1 이상), 오늘은 탭 선택 캡슐과 같은 회색(surface4) 면 + 본문색 숫자, 일정 점은 보조색, 강조색은 일요일 하나', () => {
    MODES.forEach((mode) => {
      const colors = mode === 'dark' ? dark : light;
      const theme = resolveCalendarTheme(colors, mode);
      expect(theme.selectedBackground).toBe(mode === 'dark' ? colors.surface5 : colors.surface1);
      expect(theme.selectedText).toBe(colors.primaryMark);
      expect(contrastRatio(theme.selectedText, theme.selectedBackground)).toBeGreaterThanOrEqual(3);
      expect(theme.todayBackground).toBe(colors.surface4);
      expect(contrastRatio(theme.todayText, theme.todayBackground)).toBeGreaterThanOrEqual(4.5);
      expect(theme.dotColor).toBe(colors.textSecondary);
      expect(theme.saturdayText).toBe(theme.dayText);
      expect(theme.sundayText).toBe(colors.error);
    });
  });

  it('다크 모드는 다크 역할을 쓰고, 그림자가 안 보이는 선택 카드는 한 단 밝은 surface5 로 띄운다 — 오늘 원(surface4)보다 밝다', () => {
    const lightTheme = resolveCalendarTheme(light, 'light');
    const darkTheme = resolveCalendarTheme(dark, 'dark');
    expect(darkTheme.dayText).toBe(dark.text);
    expect(darkTheme.dayText).not.toBe(lightTheme.dayText);
    expect(darkTheme.selectedBackground).toBe(dark.surface5);
    expect(darkTheme.todayBackground).toBe(dark.surface4);
    expect(contrastRatio(darkTheme.selectedBackground, dark.background)).toBeGreaterThan(contrastRatio(darkTheme.todayBackground, dark.background));
  });

  it('토요일은 본문색이라 dayText 를 덮어쓰면 따라가고, 따로 주면 그 색을 쓴다', () => {
    expect(resolveCalendarTheme(light, 'light', { dayText: '#123456' }).saturdayText).toBe('#123456');
    expect(resolveCalendarTheme(light, 'light', { dayText: '#123456', saturdayText: '#3366ff' }).saturdayText).toBe('#3366ff');
    expect(resolveCalendarTheme(light, 'light', { todayText: '#fff' }).saturdayText).toBe(light.text);
  });

  it('요일 머리: 일요일은 sundayText, 본문색 토요일은 평일 머리와 같은 weekdayText, 따로 준 토요일 색은 그대로', () => {
    const theme = resolveCalendarTheme(light, 'light');
    expect(weekdayHeaderColor(0, theme)).toBe(light.error);
    expect(weekdayHeaderColor(6, theme)).toBe(light.textSecondary);
    expect(weekdayHeaderColor(3, theme)).toBe(light.textSecondary);
    const blueSaturday = resolveCalendarTheme(light, 'light', { saturdayText: '#3366ff' });
    expect(weekdayHeaderColor(6, blueSaturday)).toBe('#3366ff');
    const plainSunday = resolveCalendarTheme(light, 'light', { sundayText: light.text });
    expect(weekdayHeaderColor(0, plainSunday)).toBe(light.textSecondary);
  });

  it('칩 글자 후보는 테마의 글자·반전 글자 — 다크에서는 어두운 쪽이 textInverse 다', () => {
    const darkTheme = resolveCalendarTheme(dark, 'dark');
    expect(darkTheme.chipTextDark).toBe(dark.textInverse);
    expect(darkTheme.chipTextLight).toBe(dark.text);
    MODES.forEach((mode) => {
      const theme = resolveCalendarTheme(mode === 'dark' ? dark : light, mode);
      expect(contrastRatio(theme.chipTextDark, '#000000')).toBeLessThan(contrastRatio(theme.chipTextLight, '#000000'));
    });
  });

  it('override 가 항상 이긴다', () => {
    const theme = resolveCalendarTheme(light, 'light', { dayText: '#123456', dotColor: '#abcdef' });
    expect(theme.dayText).toBe('#123456');
    expect(theme.dotColor).toBe('#abcdef');
    expect(theme.selectedText).toBe(light.primaryMark);
  });

  it('부분 override 는 나머지 토큰을 건드리지 않는다', () => {
    const base = resolveCalendarTheme(light, 'light');
    const overridden = resolveCalendarTheme(light, 'light', { todayText: '#fff' });
    expect(Object.keys(overridden)).toEqual(Object.keys(base));
    (Object.keys(base) as (keyof typeof base)[]).forEach((key) => {
      if (key !== 'todayText') expect(overridden[key]).toBe(base[key]);
    });
  });

  it('한국어 기본 월 제목', () => {
    expect(CALENDAR_LOCALES.ko.monthTitle(2025, 9)).toBe('2025년 9월');
  });
});

describe('ZSCalendar core/theme — 오늘 숫자·일정 점 대비(WCAG 1.4.3·1.4.11)', () => {
  const cases = MODES.flatMap((mode) => CONTRAST_LEVELS.map((contrastLevel) => [mode, contrastLevel] as const));

  it.each(cases)('%s(대비 %s): 오늘 숫자는 회색 원 위에서 4.5:1 이상이다 — 오늘은 원과 굵은 숫자 둘로 알린다', (mode, contrastLevel) => {
    const colors = createThemeColors(DEFAULT_COLORS, { mode, contrastLevel });
    const { todayText, todayBackground } = resolveCalendarTheme(colors, mode);
    expect(contrastRatio(todayText, todayBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(cases)('%s(대비 %s): 일정 점(기본 dotColor)도 배경·면과 3:1 이상이다 — 점 하나가 상태를 말한다', (mode, contrastLevel) => {
    const colors = createThemeColors(DEFAULT_COLORS, { mode, contrastLevel });
    const { dotColor } = resolveCalendarTheme(colors, mode);
    [colors.background, colors.surface1, colors.surface2].forEach((surface) => {
      expect(contrastRatio(dotColor, surface)).toBeGreaterThanOrEqual(3);
    });
  });

  it('회색 원(surface4)은 1.0 의 채운 원(text 6%)보다 배경에서 또렷하다', () => {
    MODES.forEach((mode) => {
      const colors = mode === 'dark' ? dark : light;
      const before = contrastRatio(over(withOpacity(colors.text, 0.06), colors.background), colors.background);
      const after = contrastRatio(resolveCalendarTheme(colors, mode).todayBackground, colors.background);
      expect(before).toBeLessThan(1.2);
      expect(after).toBeGreaterThan(before);
    });
  });
});

describe('ZSCalendar core/theme — readableChipTextColor', () => {
  const lightTheme = resolveCalendarTheme(light, 'light');
  const darkTheme = resolveCalendarTheme(dark, 'dark');
  const pick = (theme: typeof lightTheme, background: string) => readableChipTextColor(background, theme.chipTextDark, theme.chipTextLight);

  it('밝은 칩(바라봄 산책 #D7B8FF·급여 #A7DBD1)은 테마의 어두운 글자', () => {
    expect(pick(lightTheme, '#D7B8FF')).toBe(light.text);
    expect(pick(lightTheme, '#A7DBD1')).toBe(light.text);
    expect(pick(lightTheme, '#fff')).toBe(light.text);
    expect(pick(darkTheme, '#D7B8FF')).toBe(dark.textInverse);
  });

  it('어두운 칩은 밝은 쪽 글자 — 테마 밝은 글자로 4.5:1 이 안 되는 중간 톤(#637381)은 흰색까지 민다', () => {
    expect(pick(lightTheme, '#000000ff')).toBe(light.textInverse);
    expect(pick(lightTheme, '#637381')).toBe('#ffffff');
    expect(pick(darkTheme, '#637381')).toBe('#ffffff');
  });

  it.each(['#637381', '#3366FF', '#D7B8FF', '#A7DBD1', '#FF9761', '#AFF581'])('%s: 표준 대비에서도 칩 글자 대비가 4.5:1 이상이다', (chip) => {
    MODES.forEach((mode) => {
      const theme = resolveCalendarTheme(mode === 'dark' ? dark : light, mode);
      expect(contrastRatio(pick(theme, chip), chip)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it.each(['#637381', '#D7B8FF', '#A7DBD1', '#FF9761', '#AFF581', '#3366FF'])('%s: 두 후보 중 대비가 큰 쪽을 고른다', (chip) => {
    MODES.forEach((mode) => {
      const theme = resolveCalendarTheme(mode === 'dark' ? dark : light, mode);
      const chosen = pick(theme, chip);
      const other = chosen === theme.chipTextDark ? theme.chipTextLight : theme.chipTextDark;
      expect(contrastRatio(chosen, chip)).toBeGreaterThanOrEqual(contrastRatio(other, chip));
    });
  });

  it('고대비(contrastLevel 1)면 중간 톤 칩에서도 글자 대비 4.5:1 이상이다', () => {
    MODES.forEach((mode) => {
      const colors = createThemeColors(DEFAULT_COLORS, { mode, contrastLevel: 1 });
      const theme = resolveCalendarTheme(colors, mode);
      expect(contrastRatio(pick(theme, '#637381'), '#637381')).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('해석할 수 없는 색은 어두운 글자', () => {
    expect(pick(lightTheme, 'rgb(0, 0, 0)')).toBe(light.text);
  });

  it('대비 계산은 WCAG 식과 같고, 해석할 수 없으면 0 이다', () => {
    expect(calendarContrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(calendarContrast('#637381', '#fff')).toBeCloseTo(contrastRatio('#637381', '#ffffff'), 5);
    expect(calendarContrast('red', '#ffffff')).toBe(0);
  });
});
