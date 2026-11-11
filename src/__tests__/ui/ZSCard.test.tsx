import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import ZSButton from '../../ui/ZSButton';
import ZSCard from '../../ui/ZSCard';
import { SurfaceContext } from '../../context/SurfaceContext';
import { RADIUS } from '../../theme/radius';
import { SHADOW } from '../../theme/shadow';
import { OPACITY } from '../../theme/state';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { contrastRatio, luminance } from '../utils/contrast';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string; Version?: number | string };

const frameStyle = () => StyleSheet.flatten(screen.getByTestId('card').props.style);
const contentStyle = () => StyleSheet.flatten(screen.getByText('내용').parent?.props.style);

describe('ZSCard', () => {
  let now = 0;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    platform.OS = 'ios';
    delete platform.Version;
    setTestTheme();
  });

  it('기본은 elevated — 라이트에서 surface1 면에 sm 그림자, 모서리 lg 로 안쪽을 자른다', async () => {
    const { colors, shadows } = getTestTheme();
    await render(
      <ZSCard testID="card">
        <Text>내용</Text>
      </ZSCard>,
    );
    expect(frameStyle()).toMatchObject({
      backgroundColor: colors.surface1,
      boxShadow: shadows.sm.boxShadow,
      borderRadius: RADIUS.lg,
      borderCurve: 'continuous',
      overflow: 'hidden',
    });
    expect(frameStyle().borderWidth).toBeUndefined();
  });

  it('다크의 elevated 는 떠 있는 면 층(surface3) — 그림자가 잘 안 보이는 바탕에서 밝기로 높이를 말한다', async () => {
    const { colors } = setTestTheme({ mode: 'dark' });
    await render(<ZSCard testID="card" />);
    expect(frameStyle().backgroundColor).toBe(colors.surface3);
  });

  it('filled 는 묶음 목록·칩과 같은 회색 면(surface2)이고 그림자가 없다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSCard testID="card" variant="filled" />);
    expect(frameStyle().backgroundColor).toBe(colors.surface2);
    expect(frameStyle().boxShadow).toBeUndefined();
  });

  describe.each([
    ['light', 0], ['light', 1], ['dark', 0], ['dark', 1],
  ] as const)('filled 는 바탕 면(SurfaceContext) 위에서도 갈린다 — %s 대비 %s', (mode, contrastLevel) => {
    const renderOn = async (ground: string, node = <ZSCard testID="card" variant="filled" />) => {
      await render(<SurfaceContext.Provider value={ground}>{node}</SurfaceContext.Provider>);
      return frameStyle().backgroundColor as string;
    };

    it.each(['surface2', 'surface3', 'surface4'] as const)('%s 바탕 위에서는 바탕보다 윗단계 면이고, 페이지 위 surface2 만큼 갈린다', async (tier) => {
      const { colors } = setTestTheme({ mode, contrastLevel });
      const filled = await renderOn(colors[tier]);
      const tiers = ['surface2', 'surface3', 'surface4', 'surface5'] as const;
      expect(tiers.indexOf(tiers.find((t) => colors[t] === filled) ?? 'surface2')).toBeGreaterThan(tiers.indexOf(tier));
      expect(contrastRatio(filled, colors[tier])).toBeGreaterThanOrEqual(contrastRatio(colors.background, colors.surface2));
    });

    it('페이지 배경 위는 그대로 surface2', async () => {
      const { colors } = setTestTheme({ mode, contrastLevel });
      expect(await renderOn(colors.background)).toBe(colors.surface2);
    });

    it('filled 안의 filled 도 바깥 카드 면과 갈린다 — 카드가 자기 면을 안쪽에 내려준다', async () => {
      const { colors } = setTestTheme({ mode, contrastLevel });
      await render(
        <ZSCard variant="filled">
          <ZSCard testID="card" variant="filled" />
        </ZSCard>,
      );
      expect(contrastRatio(frameStyle().backgroundColor as string, colors.surface2)).toBeGreaterThanOrEqual(contrastRatio(colors.background, colors.surface2));
    });
  });

  it.each([0, 1])('다크(대비 %s)에서 filled 와 elevated 는 다른 면이고, elevated 가 더 밝다 — 둘 다 바탕과도 갈린다', async (contrastLevel) => {
    const { colors } = setTestTheme({ mode: 'dark', contrastLevel });
    await render(<ZSCard testID="card" variant="filled" />);
    const filled = frameStyle().backgroundColor as string;
    await render(<ZSCard testID="card" />);
    const elevated = frameStyle().backgroundColor as string;
    expect(filled).not.toBe(elevated);
    expect(luminance(elevated)).toBeGreaterThan(luminance(filled));
    expect(contrastRatio(elevated, filled)).toBeGreaterThan(1.1);
    expect(contrastRatio(filled, colors.background)).toBeGreaterThan(1.1);
  });

  it('outlined 는 background 면에 border 테두리 1 이고 그림자가 없다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSCard testID="card" variant="outlined" />);
    expect(frameStyle()).toMatchObject({ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border });
    expect(frameStyle().boxShadow).toBeUndefined();
  });

  it('누를 수 없으면 역할 없이 안쪽 요소를 그대로 둔다', async () => {
    await render(
      <ZSCard testID="card">
        <Text>내용</Text>
      </ZSCard>,
    );
    expect(queryAllByHostType('Pressable')).toHaveLength(0);
    expect(screen.getByTestId('card').props.accessibilityRole).toBeUndefined();
  });

  it('안쪽 기본 padding 은 16 이고 contentStyle 이 덮는다', async () => {
    await render(
      <ZSCard>
        <Text>내용</Text>
      </ZSCard>,
    );
    expect(contentStyle()).toMatchObject({ padding: 16, flexGrow: 1 });
    await render(
      <ZSCard contentStyle={{ padding: 0, flexDirection: 'row', gap: 12 }}>
        <Text>내용</Text>
      </ZSCard>,
    );
    expect(contentStyle()).toMatchObject({ padding: 0, flexDirection: 'row', gap: 12 });
  });

  it('onPress 가 있으면 카드 전체가 버튼 하나다', async () => {
    const onPress = jest.fn();
    await render(
      <ZSCard testID="card" onPress={onPress} accessibilityLabel="고양이 보기" accessibilityHint="상세로 이동합니다">
        <Text>내용</Text>
      </ZSCard>,
    );
    const button = getByHostType('Pressable');
    expect(button.props).toMatchObject({ accessibilityRole: 'button', accessibilityLabel: '고양이 보기', accessibilityHint: '상세로 이동합니다' });
    await fireEvent.press(screen.getByText('내용'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ padding: 16, flexGrow: 1 });
  });

  it('onLongPress 만 있어도 누를 수 있다', async () => {
    const onLongPress = jest.fn();
    await render(
      <ZSCard onLongPress={onLongPress}>
        <Text>내용</Text>
      </ZSCard>,
    );
    await fireEvent(screen.getByText('내용'), 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('disabled 면 그림자까지 카드 전체를 흐리게 하고 누르지 않는다', async () => {
    const onPress = jest.fn();
    await render(
      <ZSCard testID="card" onPress={onPress} disabled>
        <Text>내용</Text>
      </ZSCard>,
    );
    expect(frameStyle().opacity).toBe(OPACITY.disabledView);
    const button = getByHostType('Pressable');
    expect(StyleSheet.flatten(button.props.style).opacity).toBe(1);
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(screen.getByText('내용'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('actions·cornerAction 은 누름 영역 밖에 그려 카드 누름과 겹치지 않는다', async () => {
    const onPress = jest.fn();
    const onApply = jest.fn();
    const onFavorite = jest.fn();
    await render(
      <ZSCard
        testID="card"
        onPress={onPress}
        actions={<ZSButton title="신청하기" onPress={onApply} />}
        cornerAction={<ZSButton title="즐겨찾기" variant="text" onPress={onFavorite} />}
      >
        <Text>내용</Text>
      </ZSCard>,
    );
    const textsIn = (node: Parameters<typeof queryAllByHostType>[1]) => queryAllByHostType('Text', node).map((text) => text.props.children);
    const cardButton = queryAllByHostType('Pressable').find((node) => textsIn(node).includes('내용'));
    expect(cardButton?.props.accessibilityRole).toBe('button');
    expect(textsIn(cardButton)).toEqual(['내용']);

    await fireEvent.press(screen.getByText('신청하기'));
    now += 300;
    await fireEvent.press(screen.getByText('즐겨찾기'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onFavorite).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();

    expect(StyleSheet.flatten(screen.getByTestId('card-actions').props.style)).toMatchObject({ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 16, paddingBottom: 16 });
    expect(screen.getByTestId('card-corner').props.pointerEvents).toBe('box-none');
    expect(StyleSheet.flatten(screen.getByTestId('card-corner').props.style)).toMatchObject({ position: 'absolute', top: 8, end: 8 });
  });

  it('누를 수 없는 카드도 actions 를 내용 아래에 그린다', async () => {
    await render(
      <ZSCard testID="card" actions={<Text>동작</Text>}>
        <Text>내용</Text>
      </ZSCard>,
    );
    const frame = screen.getByTestId('card');
    expect(frame.children).toHaveLength(2);
    expect(screen.getByText('동작')).toBeTruthy();
  });

  it('disabled 면 actions·cornerAction 도 터치를 받지 않는다', async () => {
    await render(
      <ZSCard testID="card" disabled actions={<Text>동작</Text>} cornerAction={<Text>모서리</Text>}>
        <Text>내용</Text>
      </ZSCard>,
    );
    expect(screen.getByTestId('card-actions').props.pointerEvents).toBe('none');
    expect(screen.getByTestId('card-corner').props.pointerEvents).toBe('none');
  });

  it('actions·cornerAction 이 없으면 그 자리를 그리지 않는다', async () => {
    await render(<ZSCard testID="card" />);
    expect(screen.queryByTestId('card-actions')).toBeNull();
    expect(screen.queryByTestId('card-corner')).toBeNull();
  });

  it('backgroundColor·radius·style 로 겉을 바꾼다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSCard testID="card" backgroundColor="primaryContainer" radius="2xl" style={{ marginTop: 8, width: 200 }} />);
    expect(frameStyle()).toMatchObject({ backgroundColor: colors.primaryContainer, borderRadius: RADIUS['2xl'], marginTop: 8, width: 200 });
    await render(<ZSCard testID="card" backgroundColor="#abcdef" />);
    expect(frameStyle().backgroundColor).toBe('#abcdef');
  });

  it('Android 8.1(API 27) 이하는 boxShadow 를 그리지 않으므로 같은 높이의 elevation 으로 대신한다', async () => {
    platform.OS = 'android';
    platform.Version = 27;
    await render(<ZSCard testID="card" />);
    expect(frameStyle().elevation).toBe(SHADOW.sm);
    expect(frameStyle().boxShadow).toBeUndefined();
    expect(frameStyle().borderCurve).toBeUndefined();
  });
});
