import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import ZSChip from '../../ui/ZSChip';
import { withOpacity } from '../../theme/color';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { nth, queryAllByHostProps } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };
const CHECK_PATH = 'M6 12L10.2426 16.2426L18.727 7.75732';

const checkIcons = () => queryAllByHostProps({ d: CHECK_PATH });
const chipStyle = () => StyleSheet.flatten(screen.getByTestId('chip').props.style);
const checkBox = () => nth(checkIcons(), 0).parent!.parent!;
const checkBoxStyle = () => StyleSheet.flatten(checkBox().props.style);
// 아이콘 없는 칩: 체크를 감싼 뷰가 왼쪽 여백(paddingLeft)과 체크 자리를 함께 가진다
const checkSlotStyle = () => StyleSheet.flatten(checkBox().parent!.props.style);
const leadingEdge = () => (checkIcons().length > 0 ? checkSlotStyle().paddingLeft : chipStyle().paddingLeft);
const checkRoom = () => (checkIcons().length > 0 ? checkSlotStyle().width - checkSlotStyle().paddingLeft : 0);
const labelStart = () => chipStyle().paddingLeft + (checkIcons().length > 0 ? checkSlotStyle().width : 0);

describe('ZSChip', () => {
  const { colors } = getTestTheme();
  let now = 0;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    platform.OS = 'ios';
  });

  it('라벨을 그리고 체크박스 역할로 선택 상태를 알린다', async () => {
    await render(<ZSChip testID="chip" label="강아지" />);
    expect(screen.getByText('강아지')).toBeTruthy();
    expect(screen.getByTestId('chip').props).toMatchObject({
      accessibilityRole: 'checkbox',
      accessibilityLabel: '강아지',
      accessibilityState: { checked: false, disabled: false, busy: false },
    });
  });

  it('라벨 글자 확대는 1.6배까지 — 앱 상한(ThemeProvider)이 더 낮으면 그것을 따른다', async () => {
    await render(<ZSChip label="상한" />);
    expect(screen.getByText('상한').props.maxFontSizeMultiplier).toBe(1.6);
    setTestTheme({ maxFontSizeMultiplier: 1.3 });
    await render(<ZSChip label="앱 상한" />);
    expect(screen.getByText('앱 상한').props.maxFontSizeMultiplier).toBe(1.3);
    setTestTheme();
  });

  it('비제어: 누를 때마다 토글하고 onSelectedChange 로 다음 상태를 알린다', async () => {
    const onSelectedChange = jest.fn();
    await render(<ZSChip testID="chip" label="강아지" onSelectedChange={onSelectedChange} />);
    await fireEvent.press(screen.getByTestId('chip'));
    expect(onSelectedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByTestId('chip').props.accessibilityState.checked).toBe(true);
    now += 300;
    await fireEvent.press(screen.getByTestId('chip'));
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByTestId('chip').props.accessibilityState.checked).toBe(false);
  });

  it('defaultSelected 로 선택된 채 시작한다', async () => {
    await render(<ZSChip testID="chip" label="고양이" defaultSelected />);
    expect(screen.getByTestId('chip').props.accessibilityState.checked).toBe(true);
  });

  it('제어: selected 를 바꾸지 않으면 눌러도 상태가 그대로다', async () => {
    const onSelectedChange = jest.fn();
    await render(<ZSChip testID="chip" label="제어" selected={false} onSelectedChange={onSelectedChange} />);
    await fireEvent.press(screen.getByTestId('chip'));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('chip').props.accessibilityState.checked).toBe(false);
  });

  it('선택 안 됨: 회색 면(surface2) + 1px border 테두리, 먹(text) 글자 — 체크 자리는 닫혀 있고 보이지 않는 체크는 아직 만들지 않는다, 라벨은 16 에서 시작', async () => {
    await render(<ZSChip testID="chip" label="필터" />);
    expect(chipStyle()).toMatchObject({ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, paddingLeft: 16 });
    expect(StyleSheet.flatten(screen.getByText('필터').props.style).color).toBe(colors.text);
    expect(checkIcons()).toHaveLength(0);
    expect(checkRoom()).toBe(0);
    expect(labelStart()).toBe(16);
  });

  it('처음 선택되는 렌더에서 체크를 만들고, 해제해도 남겨 둬 접히는 애니메이션을 그린다 — 자리는 0~26, 라벨은 16~34', async () => {
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((toValue) => toValue as never);
    await render(<ZSChip testID="chip" label="필터" />);
    await fireEvent.press(screen.getByTestId('chip'));
    await screen.rerender(<ZSChip testID="chip" label="필터" style={{ marginTop: 1 }} />);
    expect(checkIcons()).toHaveLength(1);
    expect(checkSlotStyle()).toMatchObject({ overflow: 'hidden' });
    expect(checkBoxStyle()).toMatchObject({ width: 18, height: 18, opacity: 1, transform: [{ scale: 1 }] });
    expect(leadingEdge()).toBe(8);
    expect(checkRoom()).toBe(26);
    expect(labelStart()).toBe(34);
    now += 300;
    await fireEvent.press(screen.getByTestId('chip'));
    await screen.rerender(<ZSChip testID="chip" label="필터" style={{ marginTop: 2 }} />);
    expect(checkIcons()).toHaveLength(1);
    expect(checkBoxStyle()).toMatchObject({ opacity: 0, transform: [{ scale: 0.55 }] });
    expect(leadingEdge()).toBe(16);
    expect(checkRoom()).toBe(0);
    expect(labelStart()).toBe(16);
  });

  it('선택됨: 기본 color(primary) 면에 onPrimary(먹) 글자·체크를 앞에 둔다 — 왼쪽 8 + 체크 18 + 간격 8, 라벨은 34 에서 시작', async () => {
    await render(<ZSChip testID="chip" label="필터" selected />);
    expect(chipStyle()).toMatchObject({ backgroundColor: colors.primary });
    expect(leadingEdge()).toBe(8);
    expect(StyleSheet.flatten(screen.getByText('필터').props.style).color).toBe(colors.onPrimary);
    expect(checkIcons()).toHaveLength(1);
    expect(checkIcons()[0]?.props.stroke).toBe(colors.onPrimary);
    expect(checkRoom()).toBe(18 + 8);
    expect(checkBoxStyle()).toMatchObject({ opacity: 1, transform: [{ scale: 1 }] });
    expect(labelStart()).toBe(34);
  });

  it('선택돼도 테두리 두께 1 은 그대로 두고 색만 지운다 — 두께가 바뀌어 칩 크기가 튀지 않는다', async () => {
    await render(<ZSChip testID="chip" label="필터" selected />);
    expect(chipStyle()).toMatchObject({ borderWidth: 1, borderColor: 'transparent' });
  });

  it('spring 이 목표를 넘어가도(Android move 오버슈트) 체크 자리 폭은 0 밑으로, 불투명도는 0~1 밖으로 가지 않는다', async () => {
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((toValue) => (toValue === 0 ? -0.1 : 1.1) as never);
    await render(<ZSChip testID="chip" label="필터" />);
    await fireEvent.press(screen.getByTestId('chip'));
    await screen.rerender(<ZSChip testID="chip" label="필터" style={{ marginTop: 1 }} />);
    expect(checkBoxStyle().opacity).toBe(1);
    now += 300;
    await fireEvent.press(screen.getByTestId('chip'));
    await screen.rerender(<ZSChip testID="chip" label="필터" style={{ marginTop: 2 }} />);
    expect(checkRoom()).toBe(0);
    expect(checkBoxStyle().opacity).toBe(0);
  });

  it('color 로 선택 면 색을 바꾼다 — 그 색 main·onMain', async () => {
    await render(<ZSChip testID="chip" label="보조" color="secondary" selected />);
    expect(chipStyle().backgroundColor).toBe(colors.secondary);
    expect(StyleSheet.flatten(screen.getByText('보조').props.style).color).toBe(colors.onSecondary);
  });

  it('checkIcon=false 면 선택돼도 체크 대신 icon 을 둔다 — 왼쪽 8, 아이콘 뒤 간격 8', async () => {
    await render(<ZSChip testID="chip" label="아이콘" selected checkIcon={false} icon={<Text>●</Text>} />);
    expect(checkIcons()).toHaveLength(0);
    expect(screen.getByText('●')).toBeTruthy();
    expect(chipStyle().paddingLeft).toBe(8);
    expect(StyleSheet.flatten(screen.getByText('●').parent!.props.style).marginEnd).toBe(8);
  });

  it('icon={false} 는 아이콘 없음과 같다 — 선택되면 체크 자리가 열리고 라벨은 34 에서 시작', async () => {
    await render(<ZSChip testID="chip" label="조건부" selected icon={false} />);
    expect(checkIcons()).toHaveLength(1);
    expect(checkRoom()).toBe(18 + 8);
    expect(labelStart()).toBe(34);
  });

  it('앞 요소가 없고 checkIcon=false 면 체크 자리 없이 왼쪽 16 이다', async () => {
    await render(<ZSChip testID="chip" label="없음" selected checkIcon={false} />);
    expect(checkIcons()).toHaveLength(0);
    expect(chipStyle().paddingLeft).toBe(16);
  });

  it('icon 이 있으면 자리는 그대로 두고 선택되면 체크가 icon 을 대신한다(맞바꾸는 페이드)', async () => {
    const iconOpacity = () => StyleSheet.flatten(screen.getByText('●').parent!.props.style).opacity ?? 1;
    await render(<ZSChip testID="chip" label="아이콘" icon={<Text>●</Text>} />);
    expect(chipStyle().paddingLeft).toBe(8);
    expect(iconOpacity()).toBe(1);
    expect(checkIcons()).toHaveLength(0);
    await render(<ZSChip testID="chip" label="아이콘" selected icon={<Text>●</Text>} />);
    expect(chipStyle().paddingLeft).toBe(8);
    expect(iconOpacity()).toBe(0);
    expect(checkIcons()).toHaveLength(1);
    expect(checkBoxStyle()).toMatchObject({ opacity: 1, transform: [{ scale: 1 }] });
    expect(StyleSheet.flatten(checkBox().parent!.props.style).marginEnd).toBe(8);
  });

  it('비활성은 누를 수 없고 M3 비활성 색을 직접 칠한다', async () => {
    const onSelectedChange = jest.fn();
    await render(<ZSChip testID="chip" label="비활성" disabled onSelectedChange={onSelectedChange} />);
    await fireEvent.press(screen.getByTestId('chip'));
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(chipStyle()).toMatchObject({ backgroundColor: colors.surface2, borderColor: withOpacity(colors.text, 0.12), opacity: 1 });
    expect(StyleSheet.flatten(screen.getByText('비활성').props.style).color).toBe(withOpacity(colors.text, 0.38));
  });

  it('비활성이면서 선택됨은 컨테이너를 text 12% 로 칠한다', async () => {
    await render(<ZSChip testID="chip" label="비활성" disabled selected />);
    expect(chipStyle().backgroundColor).toBe(withOpacity(colors.text, 0.12));
  });

  it.each(['ios', 'android'] as const)('%s 도 캡슐 모양이고 선택되면 강조 굵기다(색 외 단서)', async (os) => {
    platform.OS = os;
    const { typography } = setTestTheme({ platform: os });
    await render(<ZSChip testID="chip" label="칩" selected />);
    expect(chipStyle().borderRadius).toBe(9999);
    expect(StyleSheet.flatten(screen.getByText('칩').props.style).fontWeight).toBe(typography.emphasized.subtitle2.fontWeight);
    await render(<ZSChip testID="chip" label="칩" />);
    expect(StyleSheet.flatten(screen.getByText('칩').props.style).fontWeight).toBe(typography.subtitle2.fontWeight);
    setTestTheme();
  });
});
