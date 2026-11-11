import { render } from '@testing-library/react-native';
import { overridesLabel, swiftUIAccessibility } from '../../native/accessibility';
import ZSCheckbox from '../../ui/ZSCheckbox';
import ZSSwitch from '../../ui/ZSSwitch';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

describe('overridesLabel', () => {
  it('보이는 라벨과 다른 이름을 줬을 때만 true 다', () => {
    expect(overridesLabel(undefined, '알림')).toBe(false);
    expect(overridesLabel('알림', '알림')).toBe(false);
    expect(overridesLabel('푸시 알림', '알림')).toBe(true);
    expect(overridesLabel('알림', undefined)).toBe(true);
  });
});

describe('swiftUIAccessibility', () => {
  it('라벨과 다른 이름은 accessibilityLabel, 힌트는 accessibilityHint 수식자다', () => {
    expect(swiftUIAccessibility('알림', '푸시 알림', '끄면 소리 없이 받습니다')).toEqual([
      { $type: 'accessibilityLabel', args: ['푸시 알림'] },
      { $type: 'accessibilityHint', args: ['끄면 소리 없이 받습니다'] },
    ]);
  });

  it('같은 이름·빈 힌트는 수식자를 만들지 않는다', () => {
    expect(swiftUIAccessibility('알림', '알림', '')).toEqual([]);
    expect(swiftUIAccessibility('알림', undefined, undefined)).toEqual([]);
  });
});

describe('이름 없는 컨트롤 경고(개발 모드)', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it('label 이나 accessibilityLabel 이 있으면 경고하지 않는다', async () => {
    await render(<ZSSwitch label="알림" />);
    await render(<ZSSwitch accessibilityLabel="Wi-Fi" />);
    await render(<ZSCheckbox label="약관 동의" />);
    await render(<ZSCheckbox accessibilityLabel="전체 선택" />);
    expect(warn).not.toHaveBeenCalled();
  });

  it('둘 다 없으면 컴포넌트마다 한 번만 경고한다', async () => {
    await render(<ZSSwitch />);
    await render(<ZSSwitch />);
    await render(<ZSCheckbox />);
    await render(<ZSCheckbox label="" />);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain('[zs-ui] ZSSwitch: label 도 accessibilityLabel 도 없어');
    expect(warn.mock.calls[1]?.[0]).toContain('[zs-ui] ZSCheckbox: label 도 accessibilityLabel 도 없어');
  });
});
