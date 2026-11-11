import * as zsUi from '../index';

const EXPORTS = {
  provider: ['ThemeProvider', 'useTheme', 'OverlayProvider', 'useOverlay', 'GlobalOverlay', 'LayoutProvider'],
  layout: ['useWindowLayout', 'useDisplayFeatures', 'useDevicePosture', 'usePaneLayout', 'useBarAxis'],
  navigation: ['ZSTabNavigator', 'useStackTheme', 'useNavigationTheme', 'useHeaderInset', 'useTabBarInset', 'ZSHeaderBackground', 'useHeaderButtonColors'],
  tokens: [
    'createThemeColors', 'DEFAULT_COLORS', 'getPaletteColors', 'resolveColor', 'withOpacity',
    'TYPE_SCALE', 'TEXT_VARIANTS', 'createTypography', 'fontFamilyFor',
    'RADIUS', 'radiusStyle',
    'ANDROID_SPRING', 'IOS_SPRING_DURATION', 'DURATION', 'springConfig', 'timingConfig',
    'OPACITY', 'MIN_TOUCH_TARGET',
    'SHADOW', 'createShadows', 'shadowFor',
  ],
  components: [
    'ZSText', 'ZSBox', 'ZSCard', 'ZSPressable', 'ZSButton', 'ZSTextField', 'ZSSelect', 'ZSSwitch', 'ZSCheckbox', 'ZSRadioGroup',
    'ZSSegmentedControl', 'ZSSegmentedPages', 'ZSChip', 'ZSMenu', 'ZSBanner', 'ZSTooltip', 'ZSSkeleton', 'ZSBorderBeam', 'ZSScreen', 'useScreenBottomInset',
    'ZSPaneLayout', 'ZSTopBar', 'ZSKeyboardStickyView', 'ZSPortal',
  ],
  calendar: [
    'ZSCalendar', 'useCalendarAgenda', 'CALENDAR_LOCALES', 'buildEventIndex', 'eventsInRange', 'getEventsOn',
    'addDays', 'addMonths', 'compareDate', 'isValidDateString', 'startOfMonth', 'todayDateString',
  ],
  utils: ['usePreventDoublePress', 'PREVENT_DOUBLE_PRESS_INTERVAL', 'useStyles'],
};

describe('index exports', () => {
  it('공개 API 를 빠짐없이, 그 밖의 것은 내보내지 않는다', () => {
    expect(Object.keys(zsUi).sort()).toEqual(Object.values(EXPORTS).flat().sort());
  });

  it.each(Object.entries(EXPORTS))('%s 심볼이 모두 정의돼 있다', (_group, names) => {
    names.forEach((name) => expect(zsUi[name as keyof typeof zsUi]).toBeDefined());
  });

  it('ZSSkeleton.Box 로 자리 표시 상자를 함께 낸다', () => {
    expect(zsUi.ZSSkeleton.Box).toBeDefined();
  });
});
