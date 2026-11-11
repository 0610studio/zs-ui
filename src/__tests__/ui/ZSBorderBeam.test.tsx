import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import { getTestTheme } from '../utils/theme';
import { nth } from '../utils/hostQueries';
import ZSBorderBeam from '../../ui/ZSBorderBeam/ZSBorderBeam';
import { continuousRoundedRectPath } from '../../ui/ZSBorderBeam/continuousCorner';
import { RADIUS } from '../../theme/radius';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const contentLayout = (width: number, height: number) => ({
  nativeEvent: { layout: { x: 0, y: 0, width, height } },
});

const fireContentLayout = async (getByText: any, text: string, width = 200, height = 100) => {
  const content = getByText(text).parent;
  await fireEvent(content, 'layout', contentLayout(width, height));
};

const frames = () => [...screen.queryAllByTestId('skia-path'), ...screen.queryAllByTestId('skia-rounded-rect')];

describe('ZSBorderBeam', () => {
  afterEach(() => {
    platform.OS = 'ios';
  });

  it('children을 렌더한다', async () => {
    const { getByText } = await render(
      <ZSBorderBeam>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    expect(getByText('Beam Content')).toBeTruthy();
  });

  it('레이아웃 측정 후 Skia Canvas(글로우 + stroke 레이어)를 렌더한다', async () => {
    const { getByText, queryByTestId, getByTestId } = await render(
      <ZSBorderBeam>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    expect(queryByTestId('skia-canvas')).toBeNull();

    await fireContentLayout(getByText, 'Beam Content');

    expect(getByTestId('skia-canvas')).toBeTruthy();
    expect(frames()).toHaveLength(3);
    frames().forEach((frame) => expect(frame.props.style).toBe('stroke'));
    expect(getByTestId('skia-blur')).toBeTruthy();
  });

  it('active=false면 Canvas를 렌더하지 않는다', async () => {
    const { getByText, queryByTestId } = await render(
      <ZSBorderBeam active={false}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    await fireContentLayout(getByText, 'Beam Content');

    expect(queryByTestId('skia-canvas')).toBeNull();
  });

  it('beamLength=1이면 colors 배열을 그대로 전달한다', async () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];
    const { getByText, getAllByTestId } = await render(
      <ZSBorderBeam colors={customColors} beamLength={1}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    await fireContentLayout(getByText, 'Beam Content');

    const gradients = getAllByTestId('skia-sweep-gradient');
    gradients.forEach((gradient) => {
      expect(gradient.props.colors).toEqual(customColors);
      expect(gradient.props.positions).toBeUndefined();
    });
  });

  it('기본값은 혜성 형태 — 광선을 beamLength 구간에 압축하고 나머지는 투명 처리한다', async () => {
    const { getByText, getAllByTestId } = await render(
      <ZSBorderBeam colorFrom="#FF0000" colorTo="#0000FF" beamLength={0.35}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    await fireContentLayout(getByText, 'Beam Content');

    const gradient = nth(getAllByTestId('skia-sweep-gradient'), 0);
    expect(gradient.props.colors).toEqual([
      '#FF000000',
      '#FF000066',
      '#FF0000',
      '#0000FF',
      '#0000FF00',
      '#0000FF00',
    ]);
    const positions = gradient.props.positions;
    expect(positions).toHaveLength(6);
    expect(positions[0]).toBe(0);
    expect(positions[positions.length - 1]).toBe(1);
    expect(positions[3]).toBeCloseTo(0.35);
  });

  it('glow=false면 blur 글로우 레이어를 그리지 않는다', async () => {
    const { getByText, queryByTestId } = await render(
      <ZSBorderBeam glow={false}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    await fireContentLayout(getByText, 'Beam Content');

    expect(frames()).toHaveLength(2);
    expect(queryByTestId('skia-blur')).toBeNull();
  });

  it('glow 객체로 blur 값을 세밀 제어할 수 있다', async () => {
    const { getByText, getByTestId } = await render(
      <ZSBorderBeam glow={{ blur: 20 }}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    await fireContentLayout(getByText, 'Beam Content');

    expect(getByTestId('skia-blur').props.blur).toBe(20);
  });

  it('trackColor="none"이면 기본 테두리 레이어를 그리지 않는다', async () => {
    const { getByText } = await render(
      <ZSBorderBeam trackColor="none">
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    await fireContentLayout(getByText, 'Beam Content');

    expect(frames()).toHaveLength(2);
  });

  it('색을 주지 않으면 브랜드 시드 색(primary)에서 tertiary 로 흐른다', async () => {
    const { colors } = getTestTheme();
    const { getByText, getAllByTestId } = await render(
      <ZSBorderBeam>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    await fireContentLayout(getByText, 'Beam Content');

    const gradient = nth(getAllByTestId('skia-sweep-gradient'), 0);
    expect(gradient.props.colors.slice(0, 4)).toEqual([
      `${colors.primary}00`,
      `${colors.primary}66`,
      colors.primary,
      colors.tertiary,
    ]);
    const track = nth(frames(), 0);
    expect(track.props.color).toBe(`${colors.primary}1F`);
  });

  describe('모서리 — 기본 RADIUS.lg, iOS 연속 곡률', () => {
    const GLOW_PADDING = 18;

    it('iOS: 기본 반경은 토큰 lg(16) — 내용은 borderCurve continuous, 광선 세 겹은 같은 연속 곡률 경로', async () => {
      const { getByText } = await render(
        <ZSBorderBeam>
          <Text>Beam Content</Text>
        </ZSBorderBeam>
      );
      expect(StyleSheet.flatten(getByText('Beam Content').parent?.props.style)).toMatchObject({ borderRadius: RADIUS.lg, borderCurve: 'continuous', overflow: 'hidden' });

      await fireContentLayout(getByText, 'Beam Content');
      const expected = continuousRoundedRectPath(GLOW_PADDING + 1, GLOW_PADDING + 1, 198, 98, RADIUS.lg - 1);
      expect(expected).not.toBeNull();
      const paths = screen.getAllByTestId('skia-path');
      expect(paths).toHaveLength(3);
      paths.forEach((path) => expect(path.props.path).toBe(expected));
      expect(screen.queryAllByTestId('skia-rounded-rect')).toHaveLength(0);
    });

    it('Android: 연속 곡률 없이 RADIUS.lg 원호 둥근 사각형', async () => {
      platform.OS = 'android';
      const { getByText } = await render(
        <ZSBorderBeam>
          <Text>Beam Content</Text>
        </ZSBorderBeam>
      );
      const content = StyleSheet.flatten(getByText('Beam Content').parent?.props.style);
      expect(content.borderRadius).toBe(RADIUS.lg);
      expect(content.borderCurve).toBeUndefined();

      await fireContentLayout(getByText, 'Beam Content');
      expect(screen.queryAllByTestId('skia-path')).toHaveLength(0);
      const rects = screen.getAllByTestId('skia-rounded-rect');
      expect(rects).toHaveLength(3);
      rects.forEach((rect) => expect(rect.props).toMatchObject({ x: GLOW_PADDING + 1, y: GLOW_PADDING + 1, width: 198, height: 98, r: RADIUS.lg - 1 }));
    });

    it('iOS 라도 연속 모서리를 펼칠 자리가 없으면(알약) 원호로 돌아간다', async () => {
      const { getByText } = await render(
        <ZSBorderBeam borderRadius={999} glow={false}>
          <Text>Beam Content</Text>
        </ZSBorderBeam>
      );
      await fireContentLayout(getByText, 'Beam Content', 200, 40);
      expect(screen.queryAllByTestId('skia-path')).toHaveLength(0);
      screen.getAllByTestId('skia-rounded-rect').forEach((rect) => expect(rect.props.r).toBe(19));
    });

    it('borderRadius 를 주면 그 값을 쓴다', async () => {
      const { getByText } = await render(
        <ZSBorderBeam borderRadius={RADIUS.xl} glow={false}>
          <Text>Beam Content</Text>
        </ZSBorderBeam>
      );
      expect(StyleSheet.flatten(getByText('Beam Content').parent?.props.style).borderRadius).toBe(RADIUS.xl);
      await fireContentLayout(getByText, 'Beam Content');
      expect(nth(screen.getAllByTestId('skia-path'), 0).props.path).toBe(continuousRoundedRectPath(1, 1, 198, 98, RADIUS.xl - 1));
    });
  });

  describe('동작 줄이기', () => {
    afterEach(() => jest.restoreAllMocks());

    it('회전·글로우 맥동을 반복하고 사라지면 멈춘다', async () => {
      const repeat = jest.spyOn(Reanimated, 'withRepeat');
      const cancel = jest.spyOn(Reanimated, 'cancelAnimation');
      const { unmount } = await render(
        <ZSBorderBeam>
          <Text>Beam Content</Text>
        </ZSBorderBeam>
      );
      expect(repeat).toHaveBeenCalledTimes(2);
      await unmount();
      expect(cancel).toHaveBeenCalledTimes(2);
    });

    it('시스템 동작 줄이기가 켜져 있으면 반복 애니메이션을 걸지 않는다(HIG)', async () => {
      jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true);
      const repeat = jest.spyOn(Reanimated, 'withRepeat');
      const { getByText, getByTestId } = await render(
        <ZSBorderBeam>
          <Text>Beam Content</Text>
        </ZSBorderBeam>
      );
      await fireContentLayout(getByText, 'Beam Content');
      expect(repeat).not.toHaveBeenCalled();
      expect(getByTestId('skia-canvas')).toBeTruthy();
    });
  });
});

describe('continuousRoundedRectPath — iOS 연속 곡률 경로', () => {
  type Point = [number, number];
  const pointsOf = (path: string): Point[] =>
    (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number).reduce<Point[]>((acc, value, index, all) => {
      if (index % 2 === 0) acc.push([value, all[index + 1] as number]);
      return acc;
    }, []);

  it('모든 점이 사각형 안에 있고, 위·아래와 왼쪽·오른쪽이 대칭이다', () => {
    const [x, y, width, height] = [10, 20, 200, 100];
    const points = pointsOf(continuousRoundedRectPath(x, y, width, height, 16) as string);
    points.forEach(([px, py]) => {
      expect(px).toBeGreaterThanOrEqual(x);
      expect(px).toBeLessThanOrEqual(x + width);
      expect(py).toBeGreaterThanOrEqual(y);
      expect(py).toBeLessThanOrEqual(y + height);
    });
    const has = ([qx, qy]: Point) => points.some(([px, py]) => Math.abs(px - qx) <= 0.002 && Math.abs(py - qy) <= 0.002);
    points.forEach(([px, py]) => {
      expect(has([2 * x + width - px, py])).toBe(true);
      expect(has([px, 2 * y + height - py])).toBe(true);
    });
  });

  it('모서리 대각선 점은 같은 반경의 원호와 거의 같다 — 휘기 시작하는 곳만 다르다', () => {
    const r = 100;
    const points = pointsOf(continuousRoundedRectPath(0, 0, 1000, 1000, r) as string);
    const [p0, p1, p2, p3] = [nth(points, 5), nth(points, 6), nth(points, 7), nth(points, 8)];
    const mid = (i: 0 | 1) => 0.125 * p0[i] + 0.375 * p1[i] + 0.375 * p2[i] + 0.125 * p3[i];
    expect(1000 - mid(0)).toBeCloseTo(r * (1 - Math.SQRT1_2), 0);
    expect(mid(1)).toBeCloseTo(r * (1 - Math.SQRT1_2), 0);
  });

  it('반경 0·빈 사각형·연속 모서리를 펼칠 자리가 없으면 null', () => {
    expect(continuousRoundedRectPath(0, 0, 100, 100, 0)).toBeNull();
    expect(continuousRoundedRectPath(0, 0, 0, 100, 16)).toBeNull();
    expect(continuousRoundedRectPath(0, 0, 200, 40, 16)).toBeNull();
    expect(continuousRoundedRectPath(0, 0, 200, 49, 16)).not.toBeNull();
  });
});
