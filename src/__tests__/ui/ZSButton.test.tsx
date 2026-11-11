import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import ZSButton from '../../ui/ZSButton';
import { withOpacity } from '../../theme/color';
import { mixHex } from '../../ui/hexColor';
import { springConfig } from '../../theme/motion';
import { RADIUS } from '../../theme/radius';
import { OPACITY } from '../../theme/state';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { contrastRatio } from '../utils/contrast';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const container = () => StyleSheet.flatten(getByHostType('Pressable').props.style);
const label = (title: string) => StyleSheet.flatten(screen.getByText(title).props.style);

describe('ZSButton', () => {
  const { colors } = getTestTheme();

  afterEach(() => {
    jest.restoreAllMocks();
    platform.OS = 'ios';
  });

  it('제목을 그리고 누르면 onPress 를 호출한다', async () => {
    const onPress = jest.fn();
    await render(<ZSButton title="저장" onPress={onPress} />);
    await fireEvent.press(screen.getByText('저장'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByHostType('Pressable').props.accessibilityLabel).toBe('저장');
  });

  it('onPress 는 생략할 수 있다 — 누름 핸들러 없이 같은 버튼으로 그린다(ZSMenu 트리거)', async () => {
    await render(<ZSButton title="더보기" />);
    expect(getByHostType('Pressable').props).toMatchObject({ onPress: undefined, onLongPress: undefined, accessibilityRole: 'button', accessibilityLabel: '더보기' });
  });

  it('onLongPress 를 길게 누름에 잇는다', async () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    await render(<ZSButton title="더보기" onPress={onPress} onLongPress={onLongPress} />);
    expect(getByHostType('Pressable').props.onLongPress).toEqual(expect.any(Function));
    await fireEvent(getByHostType('Pressable'), 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('onLongPress 가 없으면 길게 누름을 받지 않는다', async () => {
    await render(<ZSButton title="저장" onPress={jest.fn()} />);
    expect(getByHostType('Pressable').props.onLongPress).toBeUndefined();
  });

  it('accessibilityLabel 을 따로 줄 수 있다', async () => {
    await render(<ZSButton title="+" accessibilityLabel="추가" onPress={jest.fn()} />);
    expect(getByHostType('Pressable').props.accessibilityLabel).toBe('추가');
  });

  describe('variant 별 색 — primary 는 채움 면으로만, 글자·선은 먹', () => {
    const outline = () => mixHex(colors.text, colors.border, 0.12);

    it('filled 는 primary 면에 onPrimary(먹) 글자·강조 굵기, 테두리 없음 — 두 플랫폼 같다', async () => {
      for (const os of ['ios', 'android']) {
        platform.OS = os;
        const { typography } = setTestTheme({ platform: os as 'ios' | 'android' });
        await render(<ZSButton title="filled" onPress={jest.fn()} />);
        expect(container()).toMatchObject({ backgroundColor: colors.primary, borderWidth: 0 });
        expect(label('filled')).toMatchObject({ ...typography.emphasized.subtitle2, color: colors.onPrimary });
      }
      setTestTheme();
    });

    it('filled 의 다른 색은 그 색 main·onMain 이다 — 위험 동작은 error 채움', async () => {
      await render(<ZSButton title="삭제" color="error" onPress={jest.fn()} />);
      expect(container().backgroundColor).toBe(colors.error);
      expect(label('삭제').color).toBe(colors.onError);
    });

    it.each(['primary', 'secondary', 'neutral', 'error'] as const)('tonal 은 %s 의 파스텔 면(container)과 그 위 글자(onContainer)다 — 회색은 color="neutral"', async (color) => {
      await render(<ZSButton title="tonal" variant="tonal" color={color} onPress={jest.fn()} />);
      const cap = (color.charAt(0).toUpperCase() + color.slice(1)) as Capitalize<typeof color>;
      expect(container().backgroundColor).toBe(colors[`${color}Container`]);
      expect(label('tonal').color).toBe(colors[`on${cap}Container`]);
      expect(container().borderWidth ?? 0).toBe(0);
    });

    it('primary tonal 은 회색이 아니라 primary 파스텔이다 — 회색 면은 neutral 이 맡는다', async () => {
      await render(<ZSButton title="tonal" variant="tonal" onPress={jest.fn()} />);
      expect(container().backgroundColor).toBe(colors.primaryContainer);
      expect(container().backgroundColor).not.toBe(colors.neutralContainer);
    });

    it('다른 색 tonal 은 그 색 container·onContainer 다', async () => {
      await render(<ZSButton title="tonal" variant="tonal" color="error" onPress={jest.fn()} />);
      expect(container().backgroundColor).toBe(colors.errorContainer);
      expect(label('tonal').color).toBe(colors.onErrorContainer);
    });

    it('outlined 는 배경 없이 border 를 글자 쪽으로 12% 옮긴 1px 테두리 — primary 면 글자는 먹, 상태 색이면 그 색', async () => {
      await render(<ZSButton title="outlined" variant="outlined" onPress={jest.fn()} />);
      expect(container()).toMatchObject({ backgroundColor: undefined, borderWidth: 1, borderColor: outline() });
      expect(label('outlined').color).toBe(colors.text);
      await render(<ZSButton title="outlined" variant="outlined" color="error" onPress={jest.fn()} />);
      expect(container().borderColor).toBe(outline());
      expect(label('outlined').color).toBe(colors.error);
    });

    it.each(['light', 'dark'] as const)('outlined 테두리(%s)는 묶음 구분선(border)보다 또렷하고 입력 칸 경계(borderStrong)보다 옅다', async (mode) => {
      const theme = setTestTheme({ mode });
      const edge = mixHex(theme.colors.text, theme.colors.border, 0.12)!;
      expect(contrastRatio(edge, theme.colors.background)).toBeGreaterThan(contrastRatio(theme.colors.border, theme.colors.background));
      expect(contrastRatio(edge, theme.colors.background)).toBeLessThan(contrastRatio(theme.colors.borderStrong, theme.colors.background));
      setTestTheme();
    });

    it('text 는 배경·테두리 없이 좌우 여백을 줄이고 글자는 먹이다', async () => {
      await render(<ZSButton title="text" variant="text" onPress={jest.fn()} />);
      expect(container()).toMatchObject({ backgroundColor: undefined, borderWidth: 0, paddingHorizontal: 12 });
      expect(label('text').color).toBe(colors.text);
    });
  });

  describe('비활성(M3 disabled)', () => {
    it('컨테이너는 text 12%, 글자는 38% 로 직접 칠하고 전체 흐림은 되돌린다', async () => {
      const onPress = jest.fn();
      await render(<ZSButton title="비활성" disabled onPress={onPress} />);
      await fireEvent.press(screen.getByText('비활성'));
      expect(onPress).not.toHaveBeenCalled();
      expect(container()).toMatchObject({ backgroundColor: withOpacity(colors.text, 0.12), opacity: 1 });
      expect(label('비활성').color).toBe(withOpacity(colors.text, 0.38));
    });

    it('outlined 는 컨테이너를 칠하지 않고 테두리만 text 12% 다(M3)', async () => {
      await render(<ZSButton title="외곽" variant="outlined" disabled onPress={jest.fn()} />);
      expect(container()).toMatchObject({ backgroundColor: undefined, borderWidth: 1, borderColor: withOpacity(colors.text, 0.12) });
      expect(label('외곽').color).toBe(withOpacity(colors.text, 0.38));
    });

    it('text 는 컨테이너를 칠하지 않는다', async () => {
      await render(<ZSButton title="글자" variant="text" disabled onPress={jest.fn()} />);
      expect(container().backgroundColor).toBeUndefined();
    });
  });

  describe('loading', () => {
    const spinner = () => screen.getByTestId('activity-indicator');
    const contentOf = (text: string) => screen.getByText(text).parent!;

    it('누를 수 없고 busy 다 — 버튼은 흐리지 않는다(불투명도 1, 색 그대로)', async () => {
      const onPress = jest.fn();
      await render(<ZSButton title="전송" loading onPress={onPress} />);
      await fireEvent.press(screen.getByText('전송'));
      expect(onPress).not.toHaveBeenCalled();
      expect(getByHostType('Pressable').props.accessibilityState).toMatchObject({ disabled: true, busy: true });
      expect(container()).toMatchObject({ opacity: 1, backgroundColor: colors.primary });
      expect(label('전송').color).toBe(colors.onPrimary);
      expect(spinner().props).toMatchObject({ size: 'small', color: colors.onPrimary });
    });

    it('라벨·아이콘은 자리를 지킨 채 투명해지고 진행 표시가 버튼 가운데에 겹친다 — 폭이 그대로다', async () => {
      await render(<ZSButton title="전송" icon={<Text>아이콘</Text>} onPress={jest.fn()} />);
      const idle = container();
      await render(<ZSButton title="전송" loading icon={<Text>아이콘</Text>} onPress={jest.fn()} />);
      expect(container()).toEqual({ ...idle, opacity: 1 });
      expect(screen.getByText('아이콘')).toBeTruthy();
      expect(contentOf('전송')).toBe(contentOf('아이콘').parent);
      expect(StyleSheet.flatten(contentOf('전송').props.style).opacity).toBe(0);
      const overlay = spinner().parent!;
      expect(StyleSheet.flatten(overlay.props.style)).toEqual({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' });
      expect(overlay.props.pointerEvents).toBe('none');
    });

    it('비활성이면서 처리 중이면 M3 비활성 색이다', async () => {
      await render(<ZSButton title="전송" loading disabled onPress={jest.fn()} />);
      expect(container()).toMatchObject({ opacity: 1, backgroundColor: withOpacity(colors.text, OPACITY.disabledBackground) });
      expect(spinner().props.color).toBe(withOpacity(colors.text, OPACITY.disabled));
    });
  });

  describe('누름 반응', () => {
    it('iOS 는 누르는 순간 move spring 으로 0.97 까지 줄고, 손을 떼면 fade spring 으로 돌아온다', async () => {
      const withSpring = jest.spyOn(Reanimated, 'withSpring');
      const button = () => <ZSButton title="저장" onPress={jest.fn()} />;
      await render(button());
      expect(container().transform).toEqual([{ scale: 1 }]);
      await fireEvent(getByHostType('Pressable'), 'pressIn');
      expect(withSpring).toHaveBeenCalledWith(1, springConfig('move', 'fast'));
      await screen.rerender(button());
      expect(container().transform[0].scale).toBeCloseTo(0.97);
      await fireEvent(getByHostType('Pressable'), 'pressOut');
      expect(withSpring).toHaveBeenLastCalledWith(0, springConfig('fade', 'fast'));
      await screen.rerender(button());
      expect(container().transform).toEqual([{ scale: 1 }]);
    });

    it('Android 는 누르는 동안에도 크기·모양을 바꾸지 않는다 — 캡슐(full) 그대로, 누름 표시는 버튼 모양 안의 ripple', async () => {
      platform.OS = 'android';
      const withSpring = jest.spyOn(Reanimated, 'withSpring');
      const buttons = () => (
        <>
          <ZSButton title="s" size="small" onPress={jest.fn()} />
          <ZSButton title="m" onPress={jest.fn()} />
          <ZSButton title="l" size="large" onPress={jest.fn()} />
        </>
      );
      const pressables = () => queryAllByHostType('Pressable');
      await render(buttons());
      for (const node of pressables()) await fireEvent(node, 'pressIn');
      await screen.rerender(buttons());
      expect(withSpring).not.toHaveBeenCalled();
      const pressed = pressables().map((node) => StyleSheet.flatten(node.props.style));
      expect(pressed.map((style) => style.borderRadius)).toEqual([RADIUS.full, RADIUS.full, RADIUS.full]);
      expect(pressed.map((style) => style.transform)).toEqual([undefined, undefined, undefined]);
      for (const node of pressables()) await fireEvent(node, 'pressOut');
      await screen.rerender(buttons());
      expect(pressables().map((node) => StyleSheet.flatten(node.props.style).borderRadius)).toEqual([RADIUS.full, RADIUS.full, RADIUS.full]);
    });

    it('Android ripple 은 캡슐 뷰가 그린다 — overflow hidden 으로 버튼 모양 안에 잘린다', async () => {
      platform.OS = 'android';
      await render(<ZSButton title="저장" onPress={jest.fn()} />);
      await fireEvent(getByHostType('Pressable'), 'pressIn');
      await screen.rerender(<ZSButton title="저장" onPress={jest.fn()} />);
      const pressable = getByHostType('Pressable');
      expect(pressable.props.android_ripple).toEqual({ color: withOpacity(colors.onPrimary, OPACITY.pressed), foreground: true });
      expect(StyleSheet.flatten(pressable.props.style)).toMatchObject({ overflow: 'hidden', borderRadius: RADIUS.full });
    });
  });

  it('이미지 아이콘은 글자색으로 칠하고 크기별 아이콘 크기를 쓴다', async () => {
    await render(<ZSButton title="사진" size="large" icon={{ uri: 'file:///icon.png' }} onPress={jest.fn()} />);
    const image = getByHostType('Image');
    expect(image.props.tintColor).toBe(colors.onPrimary);
    expect(image.props.style).toEqual({ width: 22, height: 22 });
    await render(<ZSButton title="사진" size="small" variant="outlined" icon={{ uri: 'file:///icon.png' }} onPress={jest.fn()} />);
    expect(getByHostType('Image').props).toMatchObject({ tintColor: colors.text, style: { width: 18, height: 18 } });
  });

  it('숫자 이미지 소스도 이미지 아이콘이다', async () => {
    await render(<ZSButton title="사진" icon={7} onPress={jest.fn()} />);
    expect(getByHostType('Image').props.source).toBe(7);
  });

  it('ReactNode 아이콘은 그대로 그린다', async () => {
    await render(<ZSButton title="별" icon={<Text>★</Text>} onPress={jest.fn()} />);
    expect(screen.getByText('★')).toBeTruthy();
    expect(queryAllByHostType('Image')).toHaveLength(0);
  });

  it('fullWidth 면 부모 폭에 맞춘다', async () => {
    await render(<ZSButton title="전체" fullWidth onPress={jest.fn()} />);
    expect(container().alignSelf).toBe('stretch');
  });

  describe('크기·모양', () => {
    it.each(['ios', 'android'])('%s 도 small 36·medium 48·large 56 캡슐이다 — 좌우 여백 16·20·24, 글자 subtitle2·subtitle2·subtitle1', async (os) => {
      platform.OS = os;
      const { typography } = setTestTheme({ platform: os as 'ios' | 'android' });
      await render(
        <>
          <ZSButton title="s" size="small" onPress={jest.fn()} />
          <ZSButton title="m" onPress={jest.fn()} />
          <ZSButton title="l" size="large" onPress={jest.fn()} />
        </>,
      );
      const styles = queryAllByHostType('Pressable').map((node) => StyleSheet.flatten(node.props.style));
      expect(styles.map((style) => style.minHeight)).toEqual([36, 48, 56]);
      expect(styles.map((style) => style.paddingHorizontal)).toEqual([16, 20, 24]);
      expect(styles.map((style) => style.borderRadius)).toEqual([9999, 9999, 9999]);
      expect(label('s').fontSize).toBe(typography.subtitle2.fontSize);
      expect(label('m').fontSize).toBe(typography.subtitle2.fontSize);
      expect(label('l').fontSize).toBe(typography.subtitle1.fontSize);
      setTestTheme();
    });

    it('기본 글자에서 높이를 채우는 위아래 여백을 둔다 — 큰 글자에서 높이가 늘어도 글자가 테두리에 붙지 않는다', async () => {
      const { typography } = getTestTheme();
      await render(
        <>
          <ZSButton title="s" size="small" onPress={jest.fn()} />
          <ZSButton title="m" onPress={jest.fn()} />
          <ZSButton title="o" variant="outlined" size="large" onPress={jest.fn()} />
        </>,
      );
      const styles = queryAllByHostType('Pressable').map((node) => StyleSheet.flatten(node.props.style));
      expect(styles[0].paddingVertical * 2 + typography.subtitle2.lineHeight!).toBe(36);
      expect(styles[1].paddingVertical * 2 + typography.subtitle2.lineHeight!).toBe(48);
      expect(styles[2].paddingVertical * 2 + 2 + typography.subtitle1.lineHeight!).toBe(56);
    });
  });

  it('maxFontSizeMultiplier 를 라벨에 넘긴다 — 주지 않으면 앱 상한(ThemeProvider, 기본 2배)', async () => {
    await render(
      <>
        <ZSButton title="바" maxFontSizeMultiplier={1.3} onPress={jest.fn()} />
        <ZSButton title="기본" onPress={jest.fn()} />
      </>,
    );
    expect(screen.getByText('바').props.maxFontSizeMultiplier).toBe(1.3);
    expect(screen.getByText('기본').props.maxFontSizeMultiplier).toBe(2);
  });

  it('style 을 마지막에 합친다', async () => {
    await render(<ZSButton title="스타일" style={{ marginTop: 8 }} testID="btn" onPress={jest.fn()} />);
    expect(StyleSheet.flatten(screen.getByTestId('btn').props.style).marginTop).toBe(8);
  });
});
