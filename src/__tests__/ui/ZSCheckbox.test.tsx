import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import ZSCheckbox, { CHECKBOX_SIZE } from '../../ui/ZSCheckbox';
import { withOpacity } from '../../theme/color';
import { OPACITY } from '../../theme/state';
import { getTestTheme } from '../utils/theme';
import { queryAllByHostType } from '../utils/hostQueries';
import { PRESS_HALO, ROW_PRESS_DELAY } from '../../ui/ZSRadioGroup/markParts';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };
const { colors } = getTestTheme();
const row = () => screen.getByTestId('check');
const rects = () => queryAllByHostType('View', row()).filter((node) => node.props.rx !== undefined);
const checkPath = () => queryAllByHostType('View', row()).find((node) => typeof node.props.d === 'string');

afterEach(() => {
  platform.OS = 'ios';
});

describe.each(['ios', 'android'] as const)('ZSCheckbox — %s 도 같은 SVG 네모 체크박스', (os) => {
  beforeEach(() => {
    platform.OS = os;
  });

  it('라벨 줄은 role checkbox 에 체크 상태를 싣고, 누를 때마다 바뀌어 onValueChange 로 알린다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSCheckbox label="약관 동의" onValueChange={onValueChange} testID="check" />);
    expect(row().props.accessibilityRole).toBe('checkbox');
    expect(row().props.accessibilityState).toMatchObject({ checked: false, disabled: false });
    expect(row().props.accessibilityLabel).toBe('약관 동의');
    await fireEvent.press(row());
    expect(onValueChange).toHaveBeenLastCalledWith(true);
    expect(row().props.accessibilityState.checked).toBe(true);
  });

  it('꺼짐은 보조색 테두리 2 의 20 네모, 켜짐은 primary 칸 + 흰 체크', async () => {
    await render(<ZSCheckbox label="꺼짐" testID="check" />);
    expect(CHECKBOX_SIZE).toBe(20);
    expect(rects()).toHaveLength(1);
    expect(rects()[0]?.props).toMatchObject({ stroke: colors.textSecondary, strokeWidth: 2, fill: 'none' });
    expect(checkPath()).toBeUndefined();
    await render(<ZSCheckbox label="켜짐" defaultValue testID="check" />);
    expect(rects()[0]?.props).toMatchObject({ fill: colors.primary, width: 20, height: 20 });
    expect(checkPath()?.props).toMatchObject({ stroke: '#ffffff', fill: 'none' });
  });

  it(`라벨 줄은 부모 폭을 채우는 ${os === 'ios' ? 44 : 56} 줄(체크박스 → 라벨 12 간격)`, async () => {
    await render(<ZSCheckbox label="줄" testID="check" />);
    expect(StyleSheet.flatten(row().props.style)).toMatchObject({ alignSelf: 'stretch', flexDirection: 'row', gap: 12, minHeight: os === 'ios' ? 44 : 56 });
  });

  it(`라벨이 없으면 칸만 두고 터치 영역을 플랫폼 최소(${os === 'ios' ? '44pt' : '48dp'})로 넓힌다 — 이름은 accessibilityLabel`, async () => {
    await render(<ZSCheckbox accessibilityLabel="전체 선택" testID="check" />);
    expect(row().props.hitSlop).toBe(os === 'ios' ? 12 : 14);
    expect(row().props.accessibilityLabel).toBe('전체 선택');
    expect(screen.queryByText('전체 선택')).toBeNull();
  });

  it('제어: value 를 바꾸지 않으면 눌러도 그대로다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSCheckbox label="제어" value={false} onValueChange={onValueChange} testID="check" />);
    await fireEvent.press(row());
    expect(onValueChange).toHaveBeenCalledWith(true);
    expect(row().props.accessibilityState.checked).toBe(false);
  });

  it('비활성은 누를 수 없고 흐린 먹(text 38%)으로 그린다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSCheckbox label="비활성" defaultValue disabled onValueChange={onValueChange} testID="check" />);
    expect(row().props.accessibilityState).toMatchObject({ checked: true, disabled: true });
    await fireEvent.press(row());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(rects()[0]?.props.fill).toBe(withOpacity(colors.text, OPACITY.disabled));
  });

  it('누르면 줄이 아니라 체크박스 둘레 원(40)이 켜진다 — 켠 상태는 primary 결, 누름은 ROW_PRESS_DELAY 늦춘다', async () => {
    await render(<ZSCheckbox label="알림" defaultValue testID="check" />);
    const halo = () => queryAllByHostType('View', row()).find((node) => StyleSheet.flatten(node.props.style)?.width === PRESS_HALO);
    expect(row().props.unstable_pressDelay).toBe(ROW_PRESS_DELAY);
    expect(halo()).toBeUndefined();
    await fireEvent(row(), 'pressIn');
    expect(StyleSheet.flatten(halo()?.props.style)).toMatchObject({ width: 40, borderRadius: 20, top: -10, left: -10, backgroundColor: withOpacity(colors.primary, OPACITY.pressed) });
    expect(StyleSheet.flatten(row().props.style).backgroundColor).toBeUndefined();
  });

  it('힌트는 줄에 싣는다', async () => {
    await render(<ZSCheckbox label="알림" accessibilityHint="끄면 알림이 오지 않아요" testID="check" />);
    expect(row().props.accessibilityHint).toBe('끄면 알림이 오지 않아요');
  });
});
