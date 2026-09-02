import themeFactory from '../../../theme/palette';
import { resolveCalendarTheme } from '../../../ui/ZSCalendar/core/theme';
import { defaultMonthTitle } from '../../../ui/ZSCalendar/core/locale';

const lightPalette = themeFactory({ mode: 'light' });
const darkPalette = themeFactory({ mode: 'dark' });

describe('ZSCalendar core/theme', () => {
  it('기본값을 전부 팔레트에서 파생한다', () => {
    const theme = resolveCalendarTheme(lightPalette);
    expect(theme.dayText).toBe(lightPalette.text.base);
    expect(theme.dotColor).toBe(lightPalette.primary.main);
    expect(theme.sundayText).toBe(lightPalette.danger[50]);
    // 선택 카드는 base 위에 떠 보여야 하고, 오늘 배경은 글자색을 옅게 깐 것이다
    expect(theme.selectedBackground).toBe(lightPalette.background.base);
    expect(theme.selectedText).toBe(lightPalette.primary.main);
    expect(theme.todayRing).toBe(`${lightPalette.text.base}0A`);
  });

  it('다크 모드는 캘린더가 따로 처리하지 않고 팔레트만 갈아끼우면 된다', () => {
    const light = resolveCalendarTheme(lightPalette);
    const dark = resolveCalendarTheme(darkPalette);
    expect(dark.dayText).toBe(darkPalette.text.base);
    expect(dark.dayText).not.toBe(light.dayText);
    // 다크에서 카드가 검정 배경에 묻히지 않도록 회색으로 띄운다
    expect(light.selectedBackground).toBe(lightPalette.background.base);
    expect(dark.selectedBackground).toBe(darkPalette.grey[20]);
  });

  it('override 가 항상 이긴다', () => {
    const theme = resolveCalendarTheme(lightPalette, { selectedBackground: '#123456', dotColor: '#abcdef' });
    expect(theme.selectedBackground).toBe('#123456');
    expect(theme.dotColor).toBe('#abcdef');
    expect(theme.dayText).toBe(lightPalette.text.base);
  });

  it('부분 override 는 나머지 토큰을 건드리지 않는다', () => {
    const base = resolveCalendarTheme(lightPalette);
    const overridden = resolveCalendarTheme(lightPalette, { todayText: '#fff' });
    expect(Object.keys(overridden)).toEqual(Object.keys(base));
    (Object.keys(base) as Array<keyof typeof base>).forEach((key) => {
      if (key !== 'todayText') expect(overridden[key]).toBe(base[key]);
    });
  });

  it('defaultMonthTitle', () => {
    expect(defaultMonthTitle(2025, 9)).toBe('2025년 9월');
  });
});
