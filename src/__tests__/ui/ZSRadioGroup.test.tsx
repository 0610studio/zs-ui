import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import ZSRadioGroup, { RADIO_ROW_HEIGHT, RADIO_SIZE, type ZSRadioOption } from '../../ui/ZSRadioGroup';
import { withOpacity } from '../../theme/color';
import { OPACITY } from '../../theme/state';
import { getTestTheme } from '../utils/theme';
import { queryAllByHostType } from '../utils/hostQueries';
import { PRESS_HALO, ROW_PRESS_DELAY } from '../../ui/ZSRadioGroup/markParts';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const OPTIONS: ZSRadioOption[] = [
  { value: 'card', label: '카드' },
  { value: 'bank', label: '계좌이체' },
  { value: 'phone', label: '휴대폰', disabled: true },
];

const { colors } = getTestTheme();
const row = (value: string | number) => screen.getByTestId(`pay-${value}`);
const rowStyle = (value: string | number) => StyleSheet.flatten(row(value).props.style);
const circles = (value: string | number) => queryAllByHostType('View', row(value)).filter((node) => node.props.r !== undefined);
const ring = (value: string | number) => circles(value).find((node) => node.props.stroke !== undefined);
const filled = (value: string | number) => circles(value).filter((node) => node.props.stroke === undefined);

afterEach(() => {
  platform.OS = 'ios';
});

describe.each(['ios', 'android'] as const)('ZSRadioGroup — %s 도 같은 SVG 라디오 → 라벨 줄', (os) => {
  beforeEach(() => {
    platform.OS = os;
  });

  it('radiogroup 안에 선택지마다 radio 줄을 그린다 — 고른 줄만 checked', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value="bank" onValueChange={jest.fn()} />);
    expect(screen.getByTestId('pay').props.accessibilityRole).toBe('radiogroup');
    expect(row('card').props).toMatchObject({ accessibilityRole: 'radio', accessibilityLabel: '카드' });
    expect(row('bank').props.accessibilityState).toMatchObject({ checked: true, disabled: false });
    expect(row('card').props.accessibilityState).toMatchObject({ checked: false, disabled: false });
  });

  it('라디오는 지름 20 — 체크박스처럼 고른 줄은 primary 채운 원 + 흰 점(지름 8), 안 고른 줄은 보조색 링 2', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value="bank" onValueChange={jest.fn()} />);
    expect(RADIO_SIZE).toBe(20);
    const [face, dot] = filled('bank');
    expect(face?.props).toMatchObject({ r: 10, fill: colors.primary });
    expect(dot?.props).toMatchObject({ r: 4, fill: '#ffffff' });
    expect(ring('bank')).toBeUndefined();
    expect(ring('card')?.props).toMatchObject({ r: 9, strokeWidth: 2, stroke: colors.textSecondary, fill: 'none' });
    expect(filled('card')).toHaveLength(0);
  });

  it('라디오가 라벨 앞에 온다 — 고른 줄 라벨은 강조 굵기', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value="bank" onValueChange={jest.fn()} />);
    const children = queryAllByHostType('View', row('bank'));
    const label = screen.getByText('계좌이체');
    expect(row('bank').children.indexOf(children[0]!)).toBeLessThan(row('bank').children.length);
    expect(StyleSheet.flatten(label.props.style).fontWeight).toBeDefined();
    expect(StyleSheet.flatten(screen.getByText('카드').props.style).fontWeight).not.toBe(StyleSheet.flatten(label.props.style).fontWeight);
  });

  it(`줄 최소 높이는 플랫폼 목록 줄(${os === 'ios' ? 44 : 56}) — 라디오 → 라벨 12 간격`, async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} onValueChange={jest.fn()} />);
    expect(rowStyle('card')).toMatchObject({ minHeight: RADIO_ROW_HEIGHT[os], flexDirection: 'row', alignItems: 'center', gap: 12 });
  });

  it('누르면 그 value·index 로 onValueChange 를 호출하고, 제어 모드는 value 를 바꾸지 않으면 그대로다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value="card" onValueChange={onValueChange} />);
    await fireEvent.press(row('bank'));
    expect(onValueChange).toHaveBeenCalledWith('bank', 1);
    expect(row('card').props.accessibilityState.checked).toBe(true);
  });

  it('비제어: 기본은 첫 선택지, defaultValue 로 시작해 누른 줄로 옮긴다', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} />);
    expect(row('card').props.accessibilityState.checked).toBe(true);
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} defaultValue="bank" />);
    expect(row('bank').props.accessibilityState.checked).toBe(true);
    await fireEvent.press(row('card'));
    expect(row('card').props.accessibilityState.checked).toBe(true);
    expect(row('bank').props.accessibilityState.checked).toBe(false);
  });

  it('defaultValue·value 가 null 이면 아무것도 고르지 않은 채다 — 필수 선택을 따로 검증할 때', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} defaultValue={null} />);
    OPTIONS.forEach((option) => expect(row(option.value).props.accessibilityState.checked).toBe(false));
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value={null} onValueChange={jest.fn()} />);
    expect(filled('card')).toHaveLength(0);
  });

  it('숫자 value 도 쓴다 — 줄 testID 에 숫자가 붙고 숫자 그대로 돌려준다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSRadioGroup testID="pay" options={[{ value: 1, label: '하나' }, { value: 2, label: '둘' }]} onValueChange={onValueChange} />);
    await fireEvent.press(row(2));
    expect(onValueChange).toHaveBeenCalledWith(2, 1);
  });

  it('비활성 선택지·그룹은 눌리지 않고 흐린 먹(text 38%)으로 그린다', async () => {
    const onValueChange = jest.fn();
    const muted = withOpacity(colors.text, OPACITY.disabled);
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value="card" onValueChange={onValueChange} />);
    expect(row('phone').props.accessibilityState).toMatchObject({ checked: false, disabled: true });
    await fireEvent.press(row('phone'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(ring('phone')?.props.stroke).toBe(muted);
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value="card" disabled onValueChange={onValueChange} />);
    OPTIONS.forEach((option) => expect(row(option.value).props.accessibilityState.disabled).toBe(true));
  });

  it('누르면 줄이 아니라 라디오 둘레 원(40)이 켜진다 — 스크롤하려고 닿은 손에는 켜지지 않게 누름을 ROW_PRESS_DELAY 늦춘다', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} value="bank" onValueChange={jest.fn()} />);
    const halo = (value: string) => queryAllByHostType('View', row(value)).find((node) => StyleSheet.flatten(node.props.style)?.width === PRESS_HALO);
    expect(row('card').props.unstable_pressDelay).toBe(ROW_PRESS_DELAY);
    expect(halo('card')).toBeUndefined();
    await fireEvent(row('card'), 'pressIn');
    expect(StyleSheet.flatten(halo('card')?.props.style)).toMatchObject({
      width: 40,
      height: 40,
      borderRadius: 20,
      top: -10,
      left: -10,
      backgroundColor: withOpacity(colors.text, OPACITY.pressed),
    });
    expect(rowStyle('card').backgroundColor).toBeUndefined();
    await fireEvent(row('card'), 'pressOut');
    expect(halo('card')).toBeUndefined();
    await fireEvent(row('bank'), 'pressIn');
    expect(StyleSheet.flatten(halo('bank')?.props.style).backgroundColor).toBe(withOpacity(colors.primary, OPACITY.pressed));
  });

  it('한 칸 줄은 첫 줄 빼고 위에 hairline 구분선(border)이다', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} onValueChange={jest.fn()} />);
    expect(rowStyle('card').borderTopWidth).toBeUndefined();
    expect(rowStyle('bank')).toMatchObject({ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border });
  });

  it('columns 2 면 같은 폭 칸의 가로 격자 — 줄을 감싸 넘기고 구분선이 없다', async () => {
    await render(<ZSRadioGroup testID="pay" options={OPTIONS} columns={2} onValueChange={jest.fn()} />);
    expect(StyleSheet.flatten(screen.getByTestId('pay').props.style)).toMatchObject({ flexDirection: 'row', flexWrap: 'wrap' });
    OPTIONS.forEach((option) => {
      expect(rowStyle(option.value).width).toBe('50%');
      expect(rowStyle(option.value).borderTopWidth).toBeUndefined();
    });
  });

  it('접근성: 그룹 이름은 radiogroup 에, 선택지 이름·힌트는 줄에 — 이름 기본은 라벨이다', async () => {
    await render(
      <ZSRadioGroup
        testID="pay"
        accessibilityLabel="결제 수단"
        options={[{ value: 'card', label: '카드', accessibilityLabel: '신용카드', accessibilityHint: '할부 가능' }, { value: 'bank', label: '계좌이체' }]}
        onValueChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId('pay').props.accessibilityLabel).toBe('결제 수단');
    expect(row('card').props).toMatchObject({ accessibilityLabel: '신용카드', accessibilityHint: '할부 가능' });
    expect(row('bank').props.accessibilityLabel).toBe('계좌이체');
  });

  it('testID 가 없으면 줄 testID 도 없다', async () => {
    await render(<ZSRadioGroup options={OPTIONS} onValueChange={jest.fn()} />);
    expect(screen.queryByTestId('undefined-card')).toBeNull();
  });
});
