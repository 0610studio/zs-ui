import { act, render } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import ZSTopBar from '../../ui/ZSTopBar';
import { isSameTopBarRegion, resolveTopBarRegion, type TopBarMeasurement, type ZSTopBarRegion } from '../../ui/ZSTopBar/topBarRegion';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 62, left: 0, right: 0, bottom: 34 }),
}));

const UNFOLDED: TopBarMeasurement = {
  width: 951,
  height: 82,
  safeAreaTop: 82,
  bar: { x: 16, y: 24, width: 791, height: 48 },
  margins: { left: 36, right: 36 },
};
const INSETS = { top: 62, left: 0, right: 0 };
const options = (overrides: Partial<Parameters<typeof resolveTopBarRegion>[1]> = {}) => ({
  safeArea: true,
  height: 48,
  insets: INSETS,
  measured: true,
  ...overrides,
});

describe('resolveTopBarRegion', () => {
  it('bar region 이 위 safe area 안에 있고 좁으면 상태바 옆 칸 — 왼쪽은 시스템 여백, 오른쪽은 bar 끝', () => {
    expect(resolveTopBarRegion(UNFOLDED, options())).toEqual({
      placement: 'besideStatusBar',
      measured: true,
      height: 82,
      contentInsets: { top: 24, left: 36, right: 144, bottom: 10 },
      systemBar: UNFOLDED.bar,
      systemMargins: { left: 36, right: 36 },
    });
  });

  it('왼쪽은 bar region 보다 안쪽으로 줄지 않고, 여백 값이 없으면 bar region 을 쓴다', () => {
    const folded: TopBarMeasurement = { width: 466, height: 82, safeAreaTop: 82, bar: { x: 2.33, y: 24, width: 263.67, height: 48 }, margins: { left: 0, right: 0 } };
    expect(resolveTopBarRegion(folded, options()).contentInsets.left).toBe(2.33);
    const withoutMargins = resolveTopBarRegion({ ...UNFOLDED, margins: undefined }, options());
    expect(withoutMargins.contentInsets.left).toBe(16);
    expect(withoutMargins.systemMargins).toBeNull();
  });

  it('safeArea false 면 상태바 밑을 포함한 컴포넌트 전체를 쓴다', () => {
    const region = resolveTopBarRegion(UNFOLDED, options({ safeArea: false }));
    expect(region).toMatchObject({ placement: 'besideStatusBar', height: 82, contentInsets: { top: 0, left: 0, right: 0, bottom: 0 } });
  });

  it.each([
    ['bar region 이 safe area 아래', { ...UNFOLDED, safeAreaTop: 62, bar: { x: 0, y: 62, width: 951, height: 48 } }],
    ['bar region 이 컴포넌트 전폭', { ...UNFOLDED, bar: { x: 0, y: 24, width: 951, height: 48 } }],
    ['bar region 이 비어 있음', { ...UNFOLDED, bar: { x: 16, y: 24, width: 0, height: 48 } }],
    ['bar region 없음(iOS 27.1 미만)', { width: 393, height: 110, safeAreaTop: 62 }],
  ])('%s 이면 상태바 아래 — safe area 안에 높이만큼', (_label, measurement) => {
    expect(resolveTopBarRegion(measurement, options())).toEqual({
      placement: 'belowStatusBar',
      measured: true,
      height: 110,
      contentInsets: { top: 62, left: 0, right: 0, bottom: 0 },
      systemBar: null,
      systemMargins: null,
    });
  });

  it('측정 전에는 상태바 아래 추정값이고, safeArea false 면 inset 이 없다', () => {
    expect(resolveTopBarRegion(null, options({ measured: false, safeArea: false, insets: { top: 59, left: 4, right: 4 } }))).toEqual({
      placement: 'belowStatusBar',
      measured: false,
      height: 107,
      contentInsets: { top: 0, left: 0, right: 0, bottom: 0 },
      systemBar: null,
      systemMargins: null,
    });
  });

  it('isSameTopBarRegion 은 값을 비교한다', () => {
    const a = resolveTopBarRegion(UNFOLDED, options());
    expect(isSameTopBarRegion(a, resolveTopBarRegion({ ...UNFOLDED }, options()))).toBe(true);
    expect(isSameTopBarRegion(a, resolveTopBarRegion(UNFOLDED, options({ safeArea: false })))).toBe(false);
    expect(isSameTopBarRegion(a, { ...a, systemBar: { ...UNFOLDED.bar!, y: 26 } })).toBe(false);
    expect(isSameTopBarRegion(a, { ...a, measured: false })).toBe(false);
    expect(isSameTopBarRegion(a, { ...a, systemMargins: { left: 20, right: 36 } })).toBe(false);
  });
});

describe('ZSTopBar', () => {
  const platform = Platform as { OS: string };
  const nativeView = () => getByHostType('ZSTopBarView');
  const frameHeight = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never)?.height;
  const contentStyle = () => StyleSheet.flatten(getByHostType('View', nativeView()).props.style);

  afterEach(() => {
    platform.OS = 'ios';
  });

  it('iOS 는 네이티브 뷰가 잰 bar region 으로 상태바 옆 칸에 children 을 둔다', async () => {
    const onRegionChange = jest.fn();
    const { getByText } = await render(
      <ZSTopBar onRegionChange={onRegionChange} style={{ position: 'absolute', height: 999 }} testID="bar">
        <Text>검색</Text>
      </ZSTopBar>,
    );
    expect(nativeView().props.extent).toBe(48);
    expect(frameHeight(nativeView())).toBe(110);
    expect(onRegionChange).toHaveBeenLastCalledWith(expect.objectContaining({ placement: 'belowStatusBar', measured: false }));

    await act(() => nativeView().props.onBarLayoutChange({ nativeEvent: { ...UNFOLDED, target: 7 } }));
    expect(frameHeight(nativeView())).toBe(82);
    expect(StyleSheet.flatten(nativeView().props.style).position).toBe('absolute');
    expect(contentStyle()).toMatchObject({ position: 'absolute', flexDirection: 'row', alignItems: 'center', top: 24, left: 36, right: 144, bottom: 10 });
    expect(getByText('검색')).toBeTruthy();
    const region: ZSTopBarRegion = onRegionChange.mock.lastCall[0];
    expect(region).toMatchObject({ placement: 'besideStatusBar', measured: true, systemBar: UNFOLDED.bar });
  });

  it('같은 영역이면 onRegionChange 를 다시 부르지 않는다', async () => {
    const onRegionChange = jest.fn();
    await render(<ZSTopBar onRegionChange={onRegionChange} />);
    await act(() => nativeView().props.onBarLayoutChange({ nativeEvent: UNFOLDED }));
    const calls = onRegionChange.mock.calls.length;
    await act(() => nativeView().props.onBarLayoutChange({ nativeEvent: { ...UNFOLDED } }));
    expect(onRegionChange).toHaveBeenCalledTimes(calls);
  });

  it('height 를 네이티브 측정 높이로 넘기고, safeArea false 면 children 이 전체를 쓴다', async () => {
    await render(<ZSTopBar height={44} safeArea={false} contentStyle={{ gap: 8 }} />);
    expect(nativeView().props.extent).toBe(44);
    expect(frameHeight(nativeView())).toBe(106);
    expect(contentStyle()).toMatchObject({ top: 0, left: 0, right: 0, bottom: 0, gap: 8 });
  });

  it('Android 는 네이티브 측정 없이 상태바 아래 safe area 안에 둔다', async () => {
    platform.OS = 'android';
    const onRegionChange = jest.fn();
    const { getByTestId } = await render(<ZSTopBar onRegionChange={onRegionChange} testID="bar" />);
    expect(queryAllByHostType('ZSTopBarView')).toHaveLength(0);
    expect(frameHeight(getByTestId('bar'))).toBe(110);
    expect(StyleSheet.flatten(getByTestId('bar-content').props.style)).toMatchObject({ top: 62, left: 0, right: 0, bottom: 0 });
    expect(onRegionChange).toHaveBeenCalledWith(expect.objectContaining({ placement: 'belowStatusBar', measured: true, systemBar: null }));
  });
});
