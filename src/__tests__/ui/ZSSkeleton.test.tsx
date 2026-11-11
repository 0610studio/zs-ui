import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import ZSSkeleton from '../../ui/ZSSkeleton';
import ZSText from '../../ui/ZSText';
import { lineShapes } from '../../ui/ZSSkeleton/SkeletonShapes';
import { mixHex } from '../../ui/hexColor';
import { withOpacity } from '../../theme/color';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { nth, queryAllByHostProps } from '../utils/hostQueries';
import { contrastRatio, luminance, over } from '../utils/contrast';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const shimmerLayers = () => queryAllByHostProps({ pointerEvents: 'none' });
const shimmerLayer = () => shimmerLayers()[0];
const layoutShimmer = (width: number, height: number) =>
  fireEvent(nth(shimmerLayers(), 0), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });
const gradient = () => screen.getByTestId('skia-linear-gradient').props;
const bandPeak = (): string => gradient().colors[2];

describe('ZSSkeleton', () => {
  const { colors } = getTestTheme();

  afterEach(() => jest.restoreAllMocks());

  it('loading 이면 children 을 흐리게 두고 busy 로 알린다', async () => {
    await render(
      <ZSSkeleton testID="skeleton" style={{ margin: 2 }}>
        <Text>내용</Text>
      </ZSSkeleton>,
    );
    expect(screen.getByTestId('skeleton').props.accessibilityState).toEqual({ busy: true });
    expect(StyleSheet.flatten(screen.getByTestId('skeleton').props.style)).toEqual({ margin: 2, overflow: 'hidden' });
    expect(screen.getByText('내용')).toBeTruthy();
    expect(shimmerLayer()).toBeTruthy();
  });

  it('loading=false 면 children 만 그린다', async () => {
    await render(
      <ZSSkeleton loading={false} testID="skeleton">
        <Text>내용</Text>
      </ZSSkeleton>,
    );
    expect(screen.queryByTestId('skeleton')).toBeNull();
    expect(screen.getByText('내용')).toBeTruthy();
    expect(shimmerLayer()).toBeUndefined();
  });

  it('크기를 재기 전에는 캔버스를 그리지 않고, 재면 surface 색 종 모양 광택을 그린다', async () => {
    await render(<ZSSkeleton />);
    expect(screen.queryByTestId('skia-canvas')).toBeNull();
    await layoutShimmer(200, 40);
    expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    expect(gradient().colors).toEqual([`${colors.background}00`, `${colors.background}3d`, `${colors.background}99`, `${colors.background}3d`, `${colors.background}00`]);
    expect(gradient().positions).toEqual([0, 0.3, 0.5, 0.7, 1]);
  });

  it('같은 크기가 다시 와도 다시 그리지 않는다', async () => {
    const repeat = jest.spyOn(Reanimated, 'withRepeat');
    await render(<ZSSkeleton duration={800} />);
    await layoutShimmer(200, 40);
    await layoutShimmer(200, 40);
    expect(repeat).toHaveBeenCalledTimes(1);
  });

  it('광택 색·불투명도를 바꾸고, #rrggbbaa 는 알파를 바꿔 쓴다', async () => {
    await render(<ZSSkeleton shimmerColor="#ff000080" shimmerOpacity={2} />);
    await layoutShimmer(100, 20);
    expect(gradient().colors[2]).toBe('#ff0000ff');
  });

  it('hex 가 아닌 광택 색은 알파 없이 가운데에만 둔다', async () => {
    await render(<ZSSkeleton shimmerColor="white" />);
    await layoutShimmer(100, 20);
    expect(gradient().colors).toEqual(['transparent', 'white', 'transparent']);
  });

  describe('시스템 동작 줄이기 — 띠 대신 느린 불투명도 맥박', () => {
    beforeEach(() => {
      jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true);
    });

    it('움직이는 띠(그라디언트)를 그리지 않고 자리 전체를 광택 색 한 장으로 덮는다', async () => {
      await render(<ZSSkeleton />);
      await layoutShimmer(100, 20);
      expect(screen.queryByTestId('skia-linear-gradient')).toBeNull();
      const pulse = screen.getByTestId('skia-rect').props;
      expect(pulse).toMatchObject({ x: 0, y: 0, width: 100, height: 20, color: colors.background });
    });

    it('duration 동안 밝아졌다 같은 시간에 되돌아오는 왕복을 끝없이 반복한다 — 동작 줄이기에도 멈추지 않게 Never', async () => {
      const repeat = jest.spyOn(Reanimated, 'withRepeat');
      const timing = jest.spyOn(Reanimated, 'withTiming');
      await render(<ZSSkeleton duration={1200} />);
      await layoutShimmer(100, 20);
      expect(repeat).toHaveBeenCalledTimes(1);
      expect(repeat).toHaveBeenCalledWith(expect.anything(), -1, true, undefined, Reanimated.ReduceMotion.Never);
      expect(timing).toHaveBeenCalledWith(1, expect.objectContaining({ duration: 1200, reduceMotion: Reanimated.ReduceMotion.Never }));
    });

    it('Android 는 애니메이션 삭제 설정이라 맥박을 돌리지 않는다 — 띠도 맥박도 없는 정지 화면', async () => {
      const platform = Platform as { OS: string };
      const repeat = jest.spyOn(Reanimated, 'withRepeat');
      platform.OS = 'android';
      try {
        await render(<ZSSkeleton duration={1200} />);
        await layoutShimmer(100, 20);
        expect(repeat).not.toHaveBeenCalled();
        expect(screen.queryByTestId('skia-linear-gradient')).toBeNull();
        expect(screen.getByTestId('skia-rect').props.opacity.value).toBe(0);
      } finally {
        platform.OS = 'ios';
        repeat.mockRestore();
      }
    });

    it('#rrggbbaa 광택 색은 알파를 떼고, hex 가 아닌 색은 그대로 칠한다', async () => {
      await render(<ZSSkeleton shimmerColor="#ff000080" />);
      await layoutShimmer(100, 20);
      expect(screen.getByTestId('skia-rect').props.color).toBe('#ff0000');
      await screen.rerender(<ZSSkeleton shimmerColor="white" />);
      expect(screen.getByTestId('skia-rect').props.color).toBe('white');
    });

    it('글자 줄 모양으로 자르는 것은 그대로다', async () => {
      await render(<ZSSkeleton><ZSText>제목</ZSText></ZSSkeleton>);
      await layoutShimmer(300, 40);
      const measureLayout = (_relativeTo: unknown, onSuccess: (left: number, top: number) => void) => onSuccess(0, 0);
      await fireEvent(screen.getByText('제목'), 'textLayout', {
        currentTarget: { measureLayout },
        nativeEvent: { lines: [{ x: 0, y: 0, width: 50, height: 20, ascender: 0, capHeight: 0, descender: 0, text: '', xHeight: 0 }] },
      });
      const groups = screen.getAllByTestId('skia-group');
      expect(groups).toHaveLength(1);
      expect(within(nth(groups, 0)).getByTestId('skia-rect').props.color).toBe(colors.background);
    });

    it('사라지면 맥박을 멈춘다', async () => {
      const cancel = jest.spyOn(Reanimated, 'cancelAnimation');
      await render(<ZSSkeleton />);
      await layoutShimmer(100, 20);
      await act(() => screen.unmount());
      expect(cancel).toHaveBeenCalled();
    });
  });

  it('사라지면 반복 애니메이션을 멈춘다', async () => {
    const cancel = jest.spyOn(Reanimated, 'cancelAnimation');
    await render(<ZSSkeleton />);
    await layoutShimmer(100, 20);
    await act(() => screen.unmount());
    expect(cancel).toHaveBeenCalled();
  });

  describe('광택 모양 — 안의 ZSText 글자 줄로 자른다', () => {
    type MeasureLayout = (relativeTo: unknown, onSuccess: (left: number, top: number, width: number, height: number) => void, onFail: () => void) => void;
    let textOffset = { left: 12, top: 30 };
    const measureLayout: MeasureLayout = (_relativeTo, onSuccess) => onSuccess(textOffset.left, textOffset.top, 300, 82);
    const line = (x: number, y: number, width: number, height: number) => ({ x, y, width, height, ascender: 0, capHeight: 0, descender: 0, text: '', xHeight: 0 });
    const layoutText = (text: string, lines: ReturnType<typeof line>[]) =>
      fireEvent(screen.getByText(text), 'textLayout', { currentTarget: { measureLayout }, nativeEvent: { lines } });
    const clips = () => screen.queryAllByTestId('skia-group').map((group) => group.props.clip);

    beforeEach(() => {
      textOffset = { left: 12, top: 30 };
    });

    it('ZSText 가 없으면 상자 전체에 칠한다', async () => {
      await render(<ZSSkeleton><Text>내용</Text></ZSSkeleton>);
      await layoutShimmer(300, 40);
      expect(clips()).toEqual([]);
      expect(screen.getAllByTestId('skia-rect')).toHaveLength(1);
    });

    it('글자 줄마다 둥근 사각형(반경 xs 4)으로 띠를 잘라 그린다 — 줄 끝 너머 빈 자리는 칠하지 않는다', async () => {
      await render(<ZSSkeleton><ZSText variant="h1">두 줄 제목</ZSText></ZSSkeleton>);
      await layoutShimmer(300, 82);
      await layoutText('두 줄 제목', [line(0, 0, 180, 41), line(0, 41, 96, 41)]);
      expect(clips()).toEqual([
        { rect: { x: 12, y: 30, width: 180, height: 41 }, rx: 4, ry: 4 },
        { rect: { x: 12, y: 71, width: 96, height: 41 }, rx: 4, ry: 4 },
      ]);
      const bands = screen.getAllByTestId('skia-group').map((group) => within(group).getByTestId('skia-linear-gradient').props);
      expect(bands).toHaveLength(2);
      expect(bands[0]?.start).toBe(bands[1]?.start);
      expect(bands[0]?.colors).toEqual(bands[1]?.colors);
    });

    it('앱이 준 onTextLayout·onLayout 도 그대로 부른다', async () => {
      const onTextLayout = jest.fn();
      const onLayout = jest.fn();
      await render(<ZSSkeleton testID="skeleton" onLayout={onLayout}><ZSText onTextLayout={onTextLayout}>제목</ZSText></ZSSkeleton>);
      await layoutText('제목', [line(0, 0, 50, 20)]);
      expect(onTextLayout).toHaveBeenCalledTimes(1);
      await fireEvent(screen.getByTestId('skeleton'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 20 } } });
      expect(onLayout).toHaveBeenCalledTimes(1);
    });

    it('상자 크기가 바뀌면 줄 위치를 다시 잰다', async () => {
      await render(<ZSSkeleton testID="skeleton"><ZSText>제목</ZSText></ZSSkeleton>);
      await layoutShimmer(300, 40);
      await layoutText('제목', [line(0, 0, 50, 20)]);
      textOffset = { left: 40, top: 10 };
      await fireEvent(screen.getByTestId('skeleton'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 500, height: 40 } } });
      expect(clips()).toEqual([{ rect: { x: 40, y: 10, width: 50, height: 20 }, rx: 4, ry: 4 }]);
    });

    it('ZSText 가 사라지면 그 줄을 빼고, 줄이 하나도 없으면 다시 상자 전체에 칠한다', async () => {
      const ui = (withText: boolean) => <ZSSkeleton>{withText ? <ZSText>제목</ZSText> : <Text>다른 내용</Text>}</ZSSkeleton>;
      await render(ui(true));
      await layoutShimmer(300, 40);
      await layoutText('제목', [line(0, 0, 50, 20)]);
      expect(clips()).toHaveLength(1);
      await screen.rerender(ui(false));
      expect(clips()).toEqual([]);
      expect(screen.getAllByTestId('skia-rect')).toHaveLength(1);
    });

    it('loading=false 면 ZSText 는 줄을 알리지 않는다 — 받은 onTextLayout 을 그대로 쓴다', async () => {
      const onTextLayout = jest.fn();
      await render(<ZSSkeleton loading={false}><ZSText onTextLayout={onTextLayout}>제목</ZSText></ZSSkeleton>);
      expect(screen.getByText('제목').props.onTextLayout).toBe(onTextLayout);
    });

    it('빈 줄은 빼고, 낮은 줄은 반경을 높이의 절반으로 줄인다', () => {
      expect(lineShapes([line(0, 0, 0, 20), line(4, 20, 30, 6)], 10, 5, 4)).toEqual([{ x: 14, y: 25, width: 30, height: 6, radius: 3 }]);
    });
  });

  describe('ZSSkeleton.Box', () => {
    it('surface4 자리 표시 상자에 surface2 광택을 덮는다', async () => {
      await render(<ZSSkeleton.Box height={48} testID="box" />);
      expect(StyleSheet.flatten(screen.getByTestId('box').props.style)).toEqual({
        width: '100%',
        borderRadius: 8,
        borderCurve: 'continuous',
        height: 48,
        overflow: 'hidden',
        backgroundColor: colors.surface4,
      });
      await layoutShimmer(300, 48);
      expect(gradient().colors[2]).toBe(`${colors.surface2}b3`);
    });

    it('원 자리(radius full, 폭 = 높이 — 아이콘·아바타)는 빛줄기 없이 면만 그린다', async () => {
      await render(<ZSSkeleton.Box height={24} radius="full" style={{ width: 24 }} testID="dot" />);
      expect(StyleSheet.flatten(screen.getByTestId('dot').props.style)).toMatchObject({ width: 24, height: 24, borderRadius: 9999, backgroundColor: colors.surface4 });
      expect(screen.getByTestId('dot').children).toHaveLength(0);
      await render(<ZSSkeleton.Box height={24} radius="full" style={{ width: 120 }} testID="pill" />);
      expect(screen.getByTestId('pill').children).toHaveLength(1);
      await render(<ZSSkeleton.Box height={24} style={{ width: 24 }} testID="square" />);
      expect(screen.getByTestId('square').children).toHaveLength(1);
    });

    it('배경색·반경·광택을 바꾼다', async () => {
      await render(<ZSSkeleton.Box height={20} backgroundColor="primaryContainer" radius="full" shimmerColor="#123456" shimmerOpacity={1} testID="box" style={{ width: 80 }} />);
      expect(StyleSheet.flatten(screen.getByTestId('box').props.style)).toMatchObject({ width: 80, borderRadius: 9999, backgroundColor: colors.primaryContainer });
      await layoutShimmer(80, 20);
      expect(gradient().colors[2]).toBe('#123456ff');
    });
  });

  describe('기본 광택은 두 모드 모두 자리보다 밝은 띠다', () => {
    afterEach(() => setTestTheme());

    const dimmedText = (text: string, background: string) => over(withOpacity(text, 0.5), background);

    it.each(['light', 'dark'] as const)('%s: 글자 덮개 광택은 흐린 글자보다 밝다 — 라이트 background, 다크 text', async (mode) => {
      const theme = setTestTheme({ mode });
      await render(<ZSSkeleton />);
      await layoutShimmer(200, 40);
      const expected = mode === 'dark' ? theme.colors.text : theme.colors.background;
      expect(bandPeak()).toBe(`${expected}99`);
      const base = dimmedText(theme.colors.text, theme.colors.background);
      expect(luminance(over(bandPeak(), base))).toBeGreaterThan(luminance(base));
    });

    it.each([0, 0.5, 1])('다크(대비 %s): Box 광택은 surface4 를 text 쪽으로 12%% 밝힌 색 — 자리보다 밝고 은은하다', async (contrastLevel) => {
      const { colors } = setTestTheme({ mode: 'dark', contrastLevel });
      await render(<ZSSkeleton.Box height={48} />);
      await layoutShimmer(300, 48);
      expect(bandPeak()).toBe(`${mixHex(colors.text, colors.surface4, 0.12)}b3`);
      const peak = over(bandPeak(), colors.surface4);
      expect(luminance(peak)).toBeGreaterThan(luminance(colors.surface4));
      expect(contrastRatio(peak, colors.surface4)).toBeGreaterThan(1.15);
      expect(contrastRatio(peak, colors.surface4)).toBeLessThan(1.5);
    });

    it('다크 Box 의 자리 색을 바꾸면 그 색을 밝힌다 — hex 가 아니면 surface4 기준', async () => {
      const { colors } = setTestTheme({ mode: 'dark' });
      await render(<ZSSkeleton.Box height={20} backgroundColor="primaryContainer" />);
      await layoutShimmer(80, 20);
      expect(bandPeak()).toBe(`${mixHex(colors.text, colors.primaryContainer, 0.12)}b3`);
      expect(luminance(over(bandPeak(), colors.primaryContainer))).toBeGreaterThan(luminance(colors.primaryContainer));
      await screen.rerender(<ZSSkeleton.Box height={20} backgroundColor="transparent" />);
      expect(bandPeak()).toBe(`${mixHex(colors.text, colors.surface4, 0.12)}b3`);
    });

    it('다크에서도 shimmerColor 를 주면 그 색을 쓴다', async () => {
      setTestTheme({ mode: 'dark' });
      await render(<ZSSkeleton shimmerColor="#123456" />);
      await layoutShimmer(100, 20);
      expect(bandPeak()).toBe('#12345699');
      await screen.rerender(<ZSSkeleton.Box height={20} shimmerColor="#654321" />);
      await layoutShimmer(100, 20);
      expect(bandPeak()).toBe('#654321b3');
    });
  });
});
