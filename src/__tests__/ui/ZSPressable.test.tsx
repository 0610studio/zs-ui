import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import ZSPressable, { AnimatedZSPressable } from '../../ui/ZSPressable';
import { withOpacity } from '../../theme/color';
import { springConfig } from '../../theme/motion';
import { OPACITY } from '../../theme/state';
import { getTestTheme } from '../utils/theme';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const pressable = () => getByHostType('Pressable');
const layout = (width: number, height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height } } });

describe('ZSPressable', () => {
  let now = 0;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    platform.OS = 'ios';
  });

  it('children 을 그리고 기본 접근성 역할은 button 이다', async () => {
    await render(
      <ZSPressable>
        <Text>버튼</Text>
      </ZSPressable>,
    );
    expect(screen.getByText('버튼')).toBeTruthy();
    expect(pressable().props.accessibilityRole).toBe('button');
    expect(pressable().props.accessibilityState).toEqual({ disabled: false, busy: false });
  });

  it('onPress·onLongPress 를 호출한다', async () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    await render(
      <ZSPressable onPress={onPress} onLongPress={onLongPress}>
        <Text>버튼</Text>
      </ZSPressable>,
    );
    await fireEvent.press(screen.getByText('버튼'));
    now += 300;
    await fireEvent(screen.getByText('버튼'), 'longPress');
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('핸들러가 없으면 Pressable 에도 넘기지 않는다', async () => {
    await render(<ZSPressable />);
    expect(pressable().props.onPress).toBeUndefined();
    expect(pressable().props.onLongPress).toBeUndefined();
  });

  it('기본 쓰로틀(300ms): 처음 누름은 바로 실행하고 300ms 안의 연타는 버리며, 지나면 다시 눌린다', async () => {
    const onPress = jest.fn();
    await render(
      <ZSPressable onPress={onPress}>
        <Text>버튼</Text>
      </ZSPressable>,
    );
    await fireEvent.press(screen.getByText('버튼'));
    now += 299;
    await fireEvent.press(screen.getByText('버튼'));
    expect(onPress).toHaveBeenCalledTimes(1);
    now += 1;
    await fireEvent.press(screen.getByText('버튼'));
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('press 와 longPress 는 잠금 하나를 공유한다', async () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    await render(<ZSPressable onPress={onPress} onLongPress={onLongPress} />);
    await fireEvent(pressable(), 'longPress');
    await fireEvent.press(pressable());
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('preventDoublePress 면 2초 동안 다시 실행하지 않는다', async () => {
    const onPress = jest.fn();
    await render(<ZSPressable onPress={onPress} preventDoublePress />);
    await fireEvent.press(pressable());
    now += 1999;
    await fireEvent.press(pressable());
    expect(onPress).toHaveBeenCalledTimes(1);
    now += 1;
    await fireEvent.press(pressable());
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['disabled', { disabled: true }, { disabled: true, busy: false }],
    ['loading', { loading: true }, { disabled: true, busy: true }],
  ])('%s 면 누를 수 없고 전체를 흐리게 그린다', async (_name, props, state) => {
    const onPress = jest.fn();
    await render(<ZSPressable onPress={onPress} {...props} />);
    await fireEvent.press(pressable());
    expect(onPress).not.toHaveBeenCalled();
    expect(pressable().props.disabled).toBe(true);
    expect(pressable().props.accessibilityState).toEqual(state);
    expect(pressable().props.android_ripple).toBeUndefined();
    expect(StyleSheet.flatten(pressable().props.style).opacity).toBe(0.5);
  });

  it('accessibilityState 를 덧붙일 수 있다', async () => {
    await render(<ZSPressable accessibilityRole="tab" accessibilityState={{ selected: true }} />);
    expect(pressable().props.accessibilityRole).toBe('tab');
    expect(pressable().props.accessibilityState).toEqual({ disabled: false, busy: false, selected: true });
  });

  it('color·shape 로 배경과 모서리를 칠하고 누름 표시가 모양 밖으로 나가지 않게 자른다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSPressable backgroundColor="primaryContainer" radius="lg" style={{ padding: 8 }} />);
    expect(StyleSheet.flatten(pressable().props.style)).toEqual({
      borderRadius: 16,
      borderCurve: 'continuous',
      overflow: 'hidden',
      backgroundColor: colors.primaryContainer,
      padding: 8,
    });
  });

  describe('iOS 하이라이트', () => {
    const highlights = () => queryAllByHostType('View', pressable());
    const highlightStyle = () => StyleSheet.flatten(nth(highlights(), 0).props.style);
    const button = () => (
      <ZSPressable onPress={jest.fn()}>
        <Text>버튼</Text>
      </ZSPressable>
    );

    it('text 10% 덮개를 내용 위에 늘 깔아 두고 쉴 때는 투명하다 — 누를 때 React 렌더 없이 불투명도만 바꾼다', async () => {
      const { colors } = getTestTheme();
      await render(button());
      expect(highlights()).toHaveLength(1);
      expect(highlightStyle()).toEqual({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: withOpacity(colors.text, OPACITY.pressed), opacity: 0 });
      expect(nth(highlights(), 0).props.pointerEvents).toBe('none');
    });

    it('누르는 순간 애니메이션 없이 바로 켜고, 손을 떼면 fade spring(fast)으로 끈다', async () => {
      const withSpring = jest.spyOn(Reanimated, 'withSpring');
      await render(button());
      await fireEvent(pressable(), 'pressIn');
      expect(withSpring).not.toHaveBeenCalled();
      await screen.rerender(button());
      expect(highlightStyle().opacity).toBe(1);

      await fireEvent(pressable(), 'pressOut');
      expect(withSpring).toHaveBeenCalledTimes(1);
      expect(withSpring).toHaveBeenCalledWith(0, springConfig('fade', 'fast'));
      await screen.rerender(button());
      expect(highlightStyle().opacity).toBe(0);
    });

    it('하이라이트는 onPress 를 늦추지 않는다 — 누름이 끝나기 전(pressOut 전)에도 press 가 바로 실행된다', async () => {
      const onPress = jest.fn();
      await render(<ZSPressable onPress={onPress} />);
      await fireEvent(pressable(), 'pressIn');
      await fireEvent.press(pressable());
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  it('onPressIn·onPressOut 을 덮지 않고 함께 부른다(ZSButton 누름 반응이 쓴다)', async () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    await render(<ZSPressable onPressIn={onPressIn} onPressOut={onPressOut} />);
    await fireEvent(pressable(), 'pressIn', { nativeEvent: {} });
    await fireEvent(pressable(), 'pressOut', { nativeEvent: {} });
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it('내부 AnimatedZSPressable 은 같은 컴포넌트다 — ZSMenu 트리거 판별·ZSCard 동작이 그대로다', () => {
    expect(AnimatedZSPressable).toBe(ZSPressable);
  });

  it('pressedColor 로 누름 표시 색을 바꾼다', async () => {
    await render(<ZSPressable pressedColor="#112233" />);
    expect(pressable().props.android_ripple).toEqual({ color: '#1122331a', foreground: true });
  });

  it('pressedColor 는 테마 색 이름도 받는다 — 색으로 바꾼 뒤 10% 를 붙인다', async () => {
    const { colors } = getTestTheme();
    await render(
      <ZSPressable pressedColor="primary" onPress={jest.fn()}>
        <Text>버튼</Text>
      </ZSPressable>,
    );
    expect(pressable().props.android_ripple).toEqual({ color: withOpacity(colors.primary, 0.1), foreground: true });
    await fireEvent(pressable(), 'pressIn');
    expect(StyleSheet.flatten(nth(queryAllByHostType('View', pressable()), 0).props.style).backgroundColor).toBe(withOpacity(colors.primary, 0.1));
  });

  it('hex 가 아닌 직접 지정 색(rgba)은 불투명도를 붙이지 않고 그대로 쓴다', async () => {
    await render(<ZSPressable pressedColor="rgba(0, 0, 0, 0.2)" />);
    expect(pressable().props.android_ripple).toEqual({ color: 'rgba(0, 0, 0, 0.2)', foreground: true });
  });

  it('Android 는 하이라이트 대신 ripple 을 쓴다 — 덮개를 그리지 않고 누름 애니메이션도 없다', async () => {
    platform.OS = 'android';
    const withSpring = jest.spyOn(Reanimated, 'withSpring');
    const { colors } = getTestTheme();
    await render(<ZSPressable onPress={jest.fn()} />);
    expect(pressable().props.android_ripple).toEqual({ color: withOpacity(colors.text, 0.1), foreground: true });
    await fireEvent(pressable(), 'pressIn');
    await fireEvent(pressable(), 'pressOut');
    expect(queryAllByHostType('View', pressable())).toHaveLength(0);
    expect(withSpring).not.toHaveBeenCalled();
  });

  describe('최소 터치 영역', () => {
    it('iOS 는 작은 영역을 44pt 까지 hitSlop 으로 넓힌다', async () => {
      const onLayout = jest.fn();
      await render(<ZSPressable onLayout={onLayout} />);
      await fireEvent(pressable(), 'layout', layout(20, 31));
      expect(onLayout).toHaveBeenCalledTimes(1);
      expect(pressable().props.hitSlop).toEqual({ left: 12, right: 12, top: 7, bottom: 7 });
    });

    it('Android 는 48dp 까지 넓힌다', async () => {
      platform.OS = 'android';
      await render(<ZSPressable />);
      await fireEvent(pressable(), 'layout', layout(40, 48));
      expect(pressable().props.hitSlop).toEqual({ left: 4, right: 4, top: 0, bottom: 0 });
    });

    it('이미 충분히 크면 hitSlop 을 두지 않는다', async () => {
      await render(<ZSPressable />);
      await fireEvent(pressable(), 'layout', layout(100, 44));
      expect(pressable().props.hitSlop).toBeUndefined();
    });

    it('hitSlop 을 직접 주면 그 값을 쓴다', async () => {
      await render(<ZSPressable hitSlop={4} />);
      await fireEvent(pressable(), 'layout', layout(10, 10));
      expect(pressable().props.hitSlop).toBe(4);
    });
  });
});
