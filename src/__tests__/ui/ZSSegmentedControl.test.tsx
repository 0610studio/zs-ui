import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import ZSSegmentedControl from '../../ui/ZSSegmentedControl';
import { withOpacity } from '../../theme/color';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { contrastRatio } from '../utils/contrast';
import { queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const OPTIONS = [
  { label: '일', value: 'day' },
  { label: '주', value: 'week' },
  { label: '월', value: 'month' },
];
const LABELS = OPTIONS.map((option) => option.label);
const PLATFORMS = ['ios', 'android'] as const;

const platform = Platform as { OS: string };
const segment = (index: number) => screen.getByTestId(`zs-segment-${index}`);
const labelStyle = (label: string) => StyleSheet.flatten(screen.getByText(label).props.style);
const measuringLabel = (label: string) => {
  const found = screen.getAllByText(label, { includeHiddenElements: true }).filter((node) => typeof node.props.onLayout === 'function');
  expect(found).toHaveLength(1);
  return found[0]!;
};
const measure = async () => {
  for (let index = 0; index < OPTIONS.length; index += 1) {
    await fireEvent(segment(index), 'layout', { nativeEvent: { layout: { x: 3 + index * 100, y: 3, width: 100, height: 34 } } });
  }
};
const thumb = () => StyleSheet.flatten(screen.getByTestId('zs-segment-thumb').props.style);
const segmentStyle = (index: number) => StyleSheet.flatten(segment(index).props.style);
const trackEdge = () => queryAllByHostType('View').find((node) => StyleSheet.flatten(node.props.style)?.borderColor === getTestTheme().colors.border);
const redraw = (props: Partial<React.ComponentProps<typeof ZSSegmentedControl>> = {}) => screen.rerender(<ZSSegmentedControl options={[...OPTIONS]} {...props} />);

afterEach(() => {
  platform.OS = 'ios';
  setTestTheme();
  jest.restoreAllMocks();
});

describe.each(PLATFORMS)('ZSSegmentedControl (%s — 두 플랫폼 같은 JS 트랙과 썸)', (os) => {
  beforeEach(() => {
    platform.OS = os;
  });

  it('회색 트랙(surface2) 위에 1px border 테두리를 따로 덮고, 칸에는 라벨만 있다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSSegmentedControl options={OPTIONS} testID="seg" style={{ margin: 2 }} />);
    const track = screen.getByTestId('seg');
    expect(StyleSheet.flatten(track.props.style)).toMatchObject({ backgroundColor: colors.surface2, minHeight: 40, padding: 3, borderRadius: 9999 });
    expect(StyleSheet.flatten(track.props.style).borderWidth).toBeUndefined();
    expect(StyleSheet.flatten(trackEdge()!.props.style)).toMatchObject({ borderWidth: 1, borderRadius: 9999 });
    expect(trackEdge()!.props.pointerEvents).toBe('none');
    expect(StyleSheet.flatten(track.parent!.props.style)).toMatchObject({ alignSelf: 'stretch', margin: 2 });
    expect(OPTIONS.map((_, index) => segment(index).props.accessibilityLabel)).toEqual(LABELS);
    expect(OPTIONS.map((_, index) => queryAllByHostType('Text', segment(index)).length)).toEqual([1, 1, 1]);
    expect(segmentStyle(0)).toMatchObject({ minHeight: 34, paddingHorizontal: 12, borderRadius: 9999 });
  });

  it('측정 전에는 썸이 없고, 측정하면 선택 칸 위치·폭을 따른다 — 라이트는 흰 면(surface1) + 0.5 선 + 옅은 그림자', async () => {
    const { colors } = getTestTheme();
    await render(<ZSSegmentedControl options={OPTIONS} defaultValue="week" />);
    expect(screen.queryByTestId('zs-segment-thumb')).toBeNull();
    await measure();
    await redraw();
    expect(thumb()).toMatchObject({
      width: 100,
      transform: [{ translateX: 103 }],
      top: 3,
      bottom: 3,
      backgroundColor: colors.surface1,
      borderWidth: 2 / 3,
      borderColor: withOpacity(colors.text, 0.08),
      boxShadow: [{ offsetX: 0, offsetY: 1, blurRadius: 3, color: withOpacity(colors.shadow, 0.08) }],
    });
  });

  it.each([0, 1])('다크(대비 %s)는 트랙(surface2)보다 밝은 surface4 썸 — 그림자 없이 밝기로 띄우고, 라벨은 4.5:1 이상', async (contrastLevel) => {
    const { colors } = setTestTheme({ mode: 'dark', contrastLevel });
    await render(<ZSSegmentedControl options={OPTIONS} testID="seg" />);
    await measure();
    await redraw({ testID: 'seg' });
    expect(StyleSheet.flatten(screen.getByTestId('seg').props.style).backgroundColor).toBe(colors.surface2);
    expect(thumb().backgroundColor).toBe(colors.surface4);
    expect(thumb().boxShadow).toBeUndefined();
    expect(contrastRatio(colors.surface4, colors.surface2)).toBeGreaterThan(1.1);
    expect(contrastRatio(colors.text, colors.surface4)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.textSecondary, colors.surface2)).toBeGreaterThanOrEqual(4.5);
  });

  it('비제어: 누른 칸이 선택되고 썸이 옮겨 가며, 이미 선택된 칸은 무시한다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSSegmentedControl options={OPTIONS} onValueChange={onValueChange} />);
    await measure();
    await fireEvent.press(screen.getByText('일'));
    expect(onValueChange).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('월'));
    expect(onValueChange).toHaveBeenCalledWith('month', 2);
    await redraw({ onValueChange });
    expect(thumb().transform).toEqual([{ translateX: 203 }]);
  });

  it('제어: value 를 바꾸지 않으면 선택이 그대로다', async () => {
    const { colors } = getTestTheme();
    const onValueChange = jest.fn();
    await render(<ZSSegmentedControl options={OPTIONS} value="day" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByText('월'));
    expect(onValueChange).toHaveBeenCalledWith('month', 2);
    expect(labelStyle('일').color).toBe(colors.text);
    expect(labelStyle('월').color).toBe(colors.textSecondary);
  });

  it('제어: 부모가 선택을 받으면 그 값에 머문다', async () => {
    function Parent() {
      const [value, setValue] = React.useState('day');
      return <ZSSegmentedControl options={OPTIONS} value={value} onValueChange={setValue} />;
    }
    await render(<Parent />);
    await fireEvent.press(screen.getByText('월'));
    expect(labelStyle('월').color).toBe(getTestTheme().colors.text);
  });

  it('숫자 value 도 쓴다 — 고른 숫자와 index 를 알린다', async () => {
    const onValueChange = jest.fn<void, [number, number]>();
    await render(<ZSSegmentedControl options={[{ label: '1x', value: 1 }, { label: '2x', value: 2 }]} defaultValue={2} onValueChange={onValueChange} />);
    expect(labelStyle('2x').color).toBe(getTestTheme().colors.text);
    await fireEvent.press(screen.getByText('1x'));
    expect(onValueChange).toHaveBeenCalledWith(1, 0);
  });

  it('disabled 면 누를 수 없고 라벨은 text 38% 다 — 트랙은 흐리지 않고 썸 그림자만 뺀다(0.5 선은 남긴다)', async () => {
    const { colors } = getTestTheme();
    const onValueChange = jest.fn();
    await render(<ZSSegmentedControl options={OPTIONS} disabled onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByText('주'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(segment(1).props.accessibilityState.disabled).toBe(true);
    expect(labelStyle('주').color).toBe(withOpacity(colors.text, 0.38));
    expect(segmentStyle(0).opacity).toBe(1);
    await measure();
    await redraw({ disabled: true });
    expect(thumb().boxShadow).toBeUndefined();
    expect(thumb().borderColor).toBe(withOpacity(colors.text, 0.08));
  });

  it('fullWidth 기본은 칸을 고르게 나누고, false 면 칸 폭을 가장 긴 라벨에 맞춘다', async () => {
    await render(<ZSSegmentedControl options={OPTIONS} testID="seg" />);
    expect(segmentStyle(0).flex).toBe(1);

    await render(<ZSSegmentedControl options={OPTIONS} fullWidth={false} testID="seg" />);
    expect(StyleSheet.flatten(screen.getByTestId('seg').parent!.props.style).alignSelf).toBeUndefined();
    expect(segmentStyle(0)).not.toHaveProperty('flex');
    expect(segmentStyle(0).minWidth).toBeUndefined();
    for (const [label, width] of [['일', 14], ['주', 30], ['월', 20]] as const) {
      await fireEvent(measuringLabel(label), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: 20 } } });
    }
    expect(OPTIONS.map((_, index) => segmentStyle(index).minWidth)).toEqual([54, 54, 54]);
  });

  it('fullWidth=false 의 폭 재기 라벨은 모두 강조 굵기 — 선택이 옮겨 가도 칸 폭이 그대로다. 보이지 않고 스크린 리더에서 빠진다', async () => {
    const { typography } = setTestTheme({ platform: os });
    await render(<ZSSegmentedControl options={OPTIONS} fullWidth={false} />);
    for (const label of LABELS) {
      const node = measuringLabel(label);
      expect(StyleSheet.flatten(node.props.style)).toMatchObject(typography.emphasized.subtitle2);
      expect(node.props.numberOfLines).toBe(1);
    }
    const layer = measuringLabel('일').parent!;
    expect(layer.props).toMatchObject({ pointerEvents: 'none', accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' });
    expect(StyleSheet.flatten(layer.props.style)).toMatchObject({ position: 'absolute', opacity: 0 });
    expect(screen.getAllByText('일')).toHaveLength(1);
  });

  it('fullWidth 면 폭 재기 라벨이 없다', async () => {
    await render(<ZSSegmentedControl options={OPTIONS} />);
    expect(screen.getAllByText('일', { includeHiddenElements: true })).toHaveLength(1);
  });

  it('선택 칸 라벨은 먹·강조 굵기, 나머지는 보조 글자색 기본 굵기 — 썸 면 대비 말고도 알 수 있다(색 외 단서)', async () => {
    const { typography, colors } = setTestTheme({ platform: os });
    await render(<ZSSegmentedControl options={OPTIONS} defaultValue="week" />);
    expect(labelStyle('주')).toMatchObject({ ...typography.emphasized.subtitle2, color: colors.text });
    expect(labelStyle('일')).toMatchObject({ ...typography.subtitle2, color: colors.textSecondary });
    expect(Number(labelStyle('주').fontWeight)).toBeGreaterThan(Number(labelStyle('일').fontWeight));
    await fireEvent.press(screen.getByText('월'));
    expect(labelStyle('월').fontWeight).toBe(typography.emphasized.subtitle2.fontWeight);
    expect(labelStyle('주').fontWeight).toBe(typography.subtitle2.fontWeight);
  });

  it('처음 자리를 잡을 때는 애니메이션 없이 바로 놓는다', async () => {
    const spring = jest.spyOn(Reanimated, 'withSpring');
    await render(<ZSSegmentedControl options={OPTIONS} defaultValue="month" />);
    await measure();
    await redraw();
    expect(thumb().transform).toEqual([{ translateX: 203 }]);
    expect(spring).not.toHaveBeenCalledWith(203, expect.anything());
  });

  it('spring 이 끝 칸을 넘쳐도 썸은 첫 칸 왼쪽 ~ 마지막 칸 오른쪽 안에서만 그린다 — 넘친 만큼 폭이 준다', async () => {
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((toValue) => (toValue === 203 ? 230 : toValue) as never);
    await render(<ZSSegmentedControl options={OPTIONS} />);
    await measure();
    await redraw();
    await fireEvent.press(screen.getByText('월'));
    await redraw();
    expect(thumb()).toMatchObject({ width: 73, transform: [{ translateX: 230 }] });
  });

  it('선택지 accessibilityLabel 이 있으면 칸 이름이 된다 — 기본은 라벨', async () => {
    await render(<ZSSegmentedControl options={[{ label: '≡', value: 'list', accessibilityLabel: '목록' }, { label: '격자', value: 'grid' }]} />);
    expect([segment(0), segment(1)].map((node) => node.props.accessibilityLabel)).toEqual(['목록', '격자']);
    expect(screen.getByText('≡')).toBeTruthy();
  });
});

describe('ZSSegmentedControl 접근성 — 역할만 플랫폼 관례', () => {
  const stateOf = (key: 'checked' | 'selected') => OPTIONS.map((_, index) => segment(index).props.accessibilityState[key]);

  it('Android 는 radiogroup 트랙 안 radio 칸(checked) — 컨트롤 이름은 트랙에', async () => {
    platform.OS = 'android';
    await render(<ZSSegmentedControl options={OPTIONS} accessibilityLabel="기간" testID="seg" />);
    expect(screen.getByTestId('seg').props).toMatchObject({ accessibilityRole: 'radiogroup', accessibilityLabel: '기간' });
    expect(OPTIONS.map((_, index) => segment(index).props.accessibilityRole)).toEqual(['radio', 'radio', 'radio']);
    expect(stateOf('checked')).toEqual([true, false, false]);
    expect(segment(0).props.accessibilityHint).toBeUndefined();
    await fireEvent.press(screen.getByText('월'));
    expect(stateOf('checked')).toEqual([false, false, true]);
  });

  it('iOS 는 시스템 세그먼트처럼 칸마다 button(selected) — 그릇 역할이 없어 컨트롤 이름을 칸 힌트로 붙인다', async () => {
    await render(<ZSSegmentedControl options={OPTIONS} accessibilityLabel="기간" testID="seg" />);
    expect(screen.getByTestId('seg').props.accessibilityRole).toBeUndefined();
    expect(OPTIONS.map((_, index) => segment(index).props.accessibilityRole)).toEqual(['button', 'button', 'button']);
    expect(stateOf('selected')).toEqual([true, false, false]);
    expect(stateOf('checked')).toEqual([undefined, undefined, undefined]);
    expect(OPTIONS.map((_, index) => segment(index).props.accessibilityHint)).toEqual(['기간', '기간', '기간']);
    await fireEvent.press(screen.getByText('월'));
    expect(stateOf('selected')).toEqual([false, false, true]);
  });

  it('accessibilityLabel 이 없으면 트랙에 이름이 없고 iOS 칸 힌트도 없다', async () => {
    await render(<ZSSegmentedControl options={OPTIONS} testID="seg" />);
    expect(screen.getByTestId('seg').props.accessibilityLabel).toBeUndefined();
    expect(segment(0).props.accessibilityHint).toBeUndefined();
  });

  it('disabled 는 두 플랫폼 모두 칸 상태에 싣는다', async () => {
    for (const os of PLATFORMS) {
      platform.OS = os;
      await render(<ZSSegmentedControl options={OPTIONS} disabled />);
      expect(segment(0).props.accessibilityState.disabled).toBe(true);
    }
  });
});
