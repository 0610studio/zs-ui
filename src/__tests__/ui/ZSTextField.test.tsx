import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Dimensions, PixelRatio, Platform, StyleSheet, Text } from 'react-native';
import ZSTextField from '../../ui/ZSTextField';
import { adornmentTranslateY, FIELD_SPEC, fieldGeometry, floatTranslateY, labelOverhangReserve, labelSlot } from '../../ui/ZSTextField/geometry';
import { placeholderColor } from '../../ui/ZSTextField/placeholderColor';
import { InputFocusContext } from '../../ui/ZSScreen/InputFocusContext';
import { withOpacity } from '../../theme/color';
import { MIN_TOUCH_TARGET, OPACITY } from '../../theme/state';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { contrastRatio } from '../utils/contrast';
import { getByHostType, nth, queryAllByHostProps, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());
jest.mock('react-native-reanimated', () => {
  const mock = jest.requireActual('react-native-reanimated');
  return { ...mock, interpolateColor: (value: number, input: number[], output: string[]) => (value >= input[input.length - 1]! ? output[output.length - 1] : output[0]) };
});

const platform = Platform as { OS: string };
const input = () => getByHostType('TextInput');
const inputStyle = () => StyleSheet.flatten(input().props.style);
const textOf = (text: string) => screen.getByText(text, { includeHiddenElements: true });
const colorOf = (text: string) => StyleSheet.flatten(textOf(text).props.style).color;
const frames = () => queryAllByHostType('View').filter((node) => StyleSheet.flatten(node.props.style)?.borderWidth !== undefined);
const restFrames = () => frames().filter((node) => StyleSheet.flatten(node.props.style).opacity === undefined);
const activeFrames = () => frames().filter((node) => StyleSheet.flatten(node.props.style).opacity !== undefined);
const focusInput = () => fireEvent(input(), 'focus', { nativeEvent: {} });
const bodyLine = () => getTestTheme().typography.body1.lineHeight!;
const captionLine = () => getTestTheme().typography.caption.lineHeight!;
const labelRatio = () => getTestTheme().typography.caption.fontSize! / getTestTheme().typography.body1.fontSize!;

describe('fieldGeometry()', () => {
  const ios = { lineHeight: 22, labelScale: 13 / 17, labelLineHeight: 18 };
  const android = { lineHeight: 24, labelScale: 12 / 16, labelLineHeight: 16 };
  const androidLarge = { lineHeight: 48, labelScale: 0.75, labelLineHeight: 32 };

  it('outlined 는 입력 줄을 최소 높이 가운데에 두고, 떠오른 라벨은 위 테두리 중심에 맞춘다', () => {
    const g = fieldGeometry('outlined', 'android', android, false);
    expect(g).toMatchObject({ paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16, restTop: 16, centerOnBorder: true });
    expect(g.paddingTop + android.lineHeight + g.paddingBottom).toBe(FIELD_SPEC.android.minHeight.outlined);
    expect(floatTranslateY(g, g.restTop, 24, 0.75)).toBe(-9 - 16);
    expect(fieldGeometry('outlined', 'ios', ios, false).paddingTop).toBe(15);
  });

  it('inbox 는 칸 안 위쪽(8)에 라벨이 떠오르고 입력 줄을 그 아래에 둔다 — 한 줄이면 쉬는 라벨은 가운데', () => {
    const g = fieldGeometry('inbox', 'android', android, false);
    expect(g.paddingTop).toBe(8 + 16);
    expect(g.paddingTop + 24 + g.paddingBottom).toBe(FIELD_SPEC.android.minHeight.inbox);
    expect(g.floatTop).toBe(8);
    const height = g.paddingTop + 24 + g.paddingBottom;
    expect(g.restTop).toBe((height - 24) / 2);
    expect(floatTranslateY(g, g.restTop, 24, 0.75)).toBe(8 - g.restTop);
    expect(fieldGeometry('inbox', 'android', android, true).restTop).toBe(g.paddingTop);
    const iosInbox = fieldGeometry('inbox', 'ios', ios, false);
    expect(iosInbox.paddingTop + 22 + iosInbox.paddingBottom).toBe(FIELD_SPEC.ios.minHeight.inbox);
  });

  it('underline 은 좌우 여백 없이 입력 줄 위로 라벨이 떠오른다', () => {
    const g = fieldGeometry('underline', 'ios', ios, false);
    expect(g).toMatchObject({ paddingHorizontal: 0, floatTop: 0, centerOnBorder: false });
    expect(g.paddingTop).toBe(18 + 4);
    expect(g.restTop).toBe(g.paddingTop);
    const a = fieldGeometry('underline', 'android', android, false);
    expect(a.paddingTop + 24 + a.paddingBottom).toBe(FIELD_SPEC.android.minHeight.underline);
  });

  it('쉬는 라벨 틀 — 한 줄은 입력 줄(inbox 는 칸 전체) 가운데, 여러 줄은 첫 줄 자리', () => {
    const outlined = fieldGeometry('outlined', 'android', android, false);
    expect(labelSlot('outlined', outlined, false)).toEqual({ top: 16, bottom: 16, center: true });
    expect(labelSlot('inbox', fieldGeometry('inbox', 'android', android, false), false)).toEqual({ top: 0, bottom: 0, center: true });
    const underline = fieldGeometry('underline', 'android', android, false);
    expect(labelSlot('underline', underline, false)).toEqual({ top: underline.paddingTop, bottom: underline.paddingBottom, center: true });
    expect(labelSlot('outlined', fieldGeometry('outlined', 'android', android, true), true)).toEqual({ top: 16, center: false });
  });

  it('떠오르는 거리는 실제로 그려진 쉬는 자리(restTop)에서 잰다 — 비선형 글자 확대로 줄 높이가 달라도 맞다', () => {
    const g = fieldGeometry('outlined', 'android', androidLarge, false);
    expect(floatTranslateY(g, g.paddingTop + 6, 36, 0.75)).toBe(-(36 * 0.75) / 2 - (g.paddingTop + 6));
  });

  it('글자 크기 설정이 커지면(줄 높이↑) 여백은 줄고 최소 8 을 지킨다 — outlined 여백은 떠오른 라벨 아래 절반보다 크고 위·아래가 같다', () => {
    const big = fieldGeometry('outlined', 'android', androidLarge, false);
    expect(big.paddingTop).toBe(20);
    expect(big.paddingBottom).toBe(20);
    expect(fieldGeometry('outlined', 'ios', { lineHeight: 78.6, labelScale: 13 / 17, labelLineHeight: 64.3 }, false).paddingTop).toBeCloseTo((78.6 * 13) / 17 / 2 + 2);
    expect(fieldGeometry('inbox', 'android', androidLarge, false)).toMatchObject({ paddingTop: 8 + 32, paddingBottom: 8 });
    expect(fieldGeometry('underline', 'android', androidLarge, false)).toMatchObject({ paddingTop: 32 + 4, paddingBottom: 8 });
  });

  it('outlined 는 떠오른 라벨이 칸 위로 기본 크기보다 더 나온 만큼만 위에 자리를 둔다 — 기본·작은 글자는 0', () => {
    expect(labelOverhangReserve('outlined', ios, 22)).toBe(0);
    expect(labelOverhangReserve('outlined', android, 24)).toBe(0);
    expect(labelOverhangReserve('outlined', { ...ios, lineHeight: 22 * 0.82 }, 22)).toBe(0);
    expect(labelOverhangReserve('outlined', androidLarge, 24)).toBe(9);
    expect(labelOverhangReserve('outlined', { lineHeight: 78.6, labelScale: 13 / 17, labelLineHeight: 64.3 }, 22)).toBeCloseTo(((78.6 - 22) * 13) / 17 / 2);
    expect(labelOverhangReserve('inbox', androidLarge, 24)).toBe(0);
    expect(labelOverhangReserve('underline', androidLarge, 24)).toBe(0);
  });

  it('한 줄 입력의 앞·뒤 요소는 떠 있으면 입력 줄 가운데, 쉬면 쉬는 라벨 가운데로 옮긴다 — inbox 만 둘이 다르다', () => {
    const inbox = fieldGeometry('inbox', 'android', android, false);
    const inboxSlot = labelSlot('inbox', inbox, false);
    expect(adornmentTranslateY(inbox, inboxSlot, 0)).toBe(0);
    expect(adornmentTranslateY(inbox, inboxSlot, 1)).toBe((24 - 8) / 2);
    expect(adornmentTranslateY(inbox, inboxSlot, 0.5)).toBe(4);
    const underline = fieldGeometry('underline', 'android', android, false);
    const underlineSlot = labelSlot('underline', underline, false);
    expect(adornmentTranslateY(underline, underlineSlot, 0)).toBe((20 - 8) / 2);
    expect(adornmentTranslateY(underline, underlineSlot, 1)).toBe((20 - 8) / 2);
    const outlined = fieldGeometry('outlined', 'android', android, false);
    expect(adornmentTranslateY(outlined, labelSlot('outlined', outlined, false), 0)).toBe(0);
    expect(adornmentTranslateY(outlined, labelSlot('outlined', outlined, false), 1)).toBe(0);
    expect(adornmentTranslateY(inbox, labelSlot('inbox', inbox, true), 0)).toBe((24 - 8) / 2);
  });
});

describe('ZSTextField', () => {
  afterEach(() => {
    platform.OS = 'ios';
    setTestTheme();
  });

  it('라벨을 접근성 라벨로 쓰고 라벨 텍스트는 스크린 리더에서 숨긴다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSTextField label="이메일" value="" onChangeText={jest.fn()} placeholder="name@example.com" testID="email" />);
    expect(input().props).toMatchObject({
      testID: 'email',
      editable: true,
      accessibilityLabel: '이메일',
      placeholderTextColor: placeholderColor(colors.textSecondary, colors.background),
      selectionColor: colors.text,
      cursorColor: colors.text,
      selectionHandleColor: colors.text,
    });
    expect(colorOf('이메일')).toBe(colors.textSecondary);
    expect(textOf('이메일').parent!.props).toMatchObject({ importantForAccessibility: 'no-hide-descendants', accessibilityElementsHidden: true });
  });

  it('커서·선택 색은 먹(text) — 호박(primary)은 얇은 표시로 쓰지 않는다. Android 선택 면만 40% 로 옅게(글자가 가려지지 않게)', async () => {
    const { colors } = getTestTheme();
    await render(<ZSTextField label="이름" value="" onChangeText={jest.fn()} />);
    expect(input().props).toMatchObject({ selectionColor: colors.text, cursorColor: colors.text, selectionHandleColor: colors.text });
    platform.OS = 'android';
    await render(<ZSTextField label="이름" value="" onChangeText={jest.fn()} />);
    expect(input().props).toMatchObject({ selectionColor: withOpacity(colors.text, 0.4), cursorColor: colors.text, selectionHandleColor: colors.text });
    await render(<ZSTextField label="이름" value="" errorText="오류" onChangeText={jest.fn()} />);
    expect(input().props).toMatchObject({ selectionColor: withOpacity(colors.error, 0.4), cursorColor: colors.error });
  });

  it.each(['ios', 'android'] as const)('%s 값·라벨은 같은 굵기(body1 강조) — 빈 값으로 바뀌어도 글자 속성을 바꾸지 않는다(한글 조합 보호)', async (os) => {
    platform.OS = os;
    const { typography } = setTestTheme({ platform: os });
    const { lineHeight: _lineHeight, ...singleLine } = typography.emphasized.body1;
    const expected = os === 'ios' ? singleLine : typography.emphasized.body1;
    await render(<ZSTextField label="이름" value="" onChangeText={jest.fn()} />);
    expect(inputStyle()).toMatchObject(expected);
    expect(StyleSheet.flatten(textOf('이름').props.style)).toMatchObject(expected);
    await render(<ZSTextField label="이름" value="보리" onChangeText={jest.fn()} />);
    expect(inputStyle()).toMatchObject(expected);
  });

  it.each(['light', 'dark'] as const)('placeholder(%s)는 값(text)보다 옅고 라벨(textSecondary)보다도 옅은 회색 — 칸 면 위 4.5:1 은 지킨다', async (mode) => {
    const { colors } = setTestTheme({ mode });
    const color = placeholderColor(colors.textSecondary, colors.background);
    expect(contrastRatio(color, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(color, colors.background)).toBeLessThanOrEqual(contrastRatio(colors.textSecondary, colors.background));
    expect(contrastRatio(color, colors.background)).toBeLessThan(contrastRatio(colors.text, colors.background));
    await render(<ZSTextField label="이메일" value="" onChangeText={jest.fn()} />);
    expect(input().props.placeholderTextColor).toBe(color);
  });

  it('라벨이 칸 안에 쉬는 동안 placeholder 를 숨기고, 포커스하면 보인다', async () => {
    await render(<ZSTextField label="이메일" value="" onChangeText={jest.fn()} placeholder="name@example.com" />);
    expect(input().props.placeholder).toBeUndefined();
    await focusInput();
    expect(input().props.placeholder).toBe('name@example.com');
  });

  it('required 면 라벨 뒤에 * 를 붙인다', async () => {
    await render(<ZSTextField label="이름" required value="" onChangeText={jest.fn()} />);
    expect(textOf('이름 *')).toBeTruthy();
  });

  it('입력하면 onChangeText 를 호출하고 포커스·블러 콜백을 부른다', async () => {
    const onChangeText = jest.fn();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await render(<ZSTextField label="이름" value="" onChangeText={onChangeText} onFocus={onFocus} onBlur={onBlur} />);
    await fireEvent.changeText(input(), '홍길동');
    expect(onChangeText).toHaveBeenCalledWith('홍길동');
    await focusInput();
    await fireEvent(input(), 'blur', { nativeEvent: {} });
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('ZSScreen 안이면 포커스를 알려 다시 스크롤하게 한다', async () => {
    const notify = jest.fn();
    await render(
      <InputFocusContext.Provider value={notify}>
        <ZSTextField label="이름" value="" onChangeText={jest.fn()} />
      </InputFocusContext.Provider>,
    );
    await focusInput();
    expect(notify).toHaveBeenCalledTimes(1);
  });

  describe('variant', () => {
    it('outlined(기본)는 노치 자리를 비우도록 테두리를 시작·노치 아래·끝 세 조각으로 그린다 — 조각마다 기본 테두리 1(borderStrong) 위에 포커스 테두리 2(먹)를 겹친다, 모서리 16', async () => {
      const { colors } = getTestTheme();
      await render(<ZSTextField label="이름" value="" onChangeText={jest.fn()} />);
      expect(restFrames()).toHaveLength(3);
      expect(activeFrames()).toHaveLength(3);
      restFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 16 }));
      activeFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ borderWidth: 2, borderColor: colors.text, borderRadius: 16, opacity: 0 }));
    });

    it('조각마다 칸 전체 모양을 같은 자리(칸 시작 0)에 그린다 — 모서리(16)가 노치 시작(12)보다 커도 시작 모서리 곡선이 조각 경계에서 끊기지 않는다', async () => {
      const left = (node: { props: Record<string, any> }) => (StyleSheet.flatten(node.props.style) as { left?: number }).left ?? 0;
      for (const field of [<ZSTextField key="rest" label="이름" value="" onChangeText={jest.fn()} />, <ZSTextField key="float" label="이름" defaultValue="값" />]) {
        await render(field);
        expect(frames()).toHaveLength(6);
        frames().forEach((frame) => expect(left(frame.parent!) + left(frame)).toBeCloseTo(0));
      }
    });

    it('포커스하면 두께는 그대로 두고 위 테두리(2)의 불투명도만 올린다 — 1 → 2 로 끊겨 바뀌지 않는다', async () => {
      const { colors } = getTestTheme();
      const field = () => <ZSTextField label="이름" value="" onChangeText={jest.fn()} />;
      await render(field());
      await focusInput();
      setTestTheme();
      await screen.rerender(field());
      restFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ borderWidth: 1, borderColor: colors.borderStrong }));
      expect(activeFrames()).toHaveLength(3);
      activeFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ borderWidth: 2, borderColor: colors.text, opacity: 1 }));
    });

    it('테두리 두께를 기기 픽셀에 맞추고, 노치 아래도 같은 테두리·모서리 틀로 그려 위·옆은 클립 밖으로 낸다 — 아래 선이 같은 픽셀 줄을 칠한다', async () => {
      const ratio = jest.spyOn(PixelRatio, 'get').mockReturnValue(2.625);
      try {
        await render(<ZSTextField label="이름" defaultValue="값" />);
        restFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style).borderWidth).toBeCloseTo(3 / 2.625));
        activeFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style).borderWidth).toBeCloseTo(5 / 2.625));
        const notches = frames().filter((node) => StyleSheet.flatten(node.props.style).top !== 0);
        expect(notches).toHaveLength(2);
        notches.forEach((notch) => expect(StyleSheet.flatten(notch.props.style)).toMatchObject({ position: 'absolute', top: -16, bottom: 0, left: -Math.round(12 * 2.625) / 2.625, width: 5000, borderRadius: 16 }));
      } finally {
        ratio.mockRestore();
      }
    });

    it('inbox 는 바탕색 면(background)과 borderStrong 테두리 한 장 위에 포커스 테두리(2, 먹)를 겹친다 — 회색 면이 아니다', async () => {
      const { colors } = getTestTheme();
      await render(<ZSTextField variant="inbox" label="이름" value="" onChangeText={jest.fn()} />);
      expect(restFrames()).toHaveLength(1);
      expect(StyleSheet.flatten(nth(restFrames(), 0).props.style)).toMatchObject({ borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background });
      expect(activeFrames()).toHaveLength(1);
      expect(StyleSheet.flatten(nth(activeFrames(), 0).props.style)).toMatchObject({ borderWidth: 2, borderColor: colors.text, opacity: 0, borderRadius: 16 });
      expect(StyleSheet.flatten(nth(activeFrames(), 0).props.style).backgroundColor).toBeUndefined();
    });

    it('underline 은 아래 선(1) 위에 포커스 선(2)을 겹치고 좌우 여백이 없다', async () => {
      const { colors } = getTestTheme();
      await render(<ZSTextField variant="underline" label="이름" value="" helperText="안내" onChangeText={jest.fn()} />);
      expect(frames()).toHaveLength(0);
      const lines = queryAllByHostType('View').filter((node) => StyleSheet.flatten(node.props.style)?.bottom === 0 && StyleSheet.flatten(node.props.style)?.height !== undefined);
      expect(lines).toHaveLength(2);
      expect(StyleSheet.flatten(nth(lines, 0).props.style)).toMatchObject({ position: 'absolute', bottom: 0, height: 1, backgroundColor: colors.borderStrong });
      expect(StyleSheet.flatten(nth(lines, 1).props.style)).toMatchObject({ position: 'absolute', bottom: 0, height: 2, backgroundColor: colors.text, opacity: 0 });
      expect(StyleSheet.flatten(screen.getByText('안내').parent!.props.style).paddingHorizontal).toBe(0);
    });
  });

  describe('지우기 버튼', () => {
    const clear = () => screen.queryByLabelText('Clear text');

    it('값이 있고 포커스일 때만 보이고, 누르면 빈 값으로 바꾼다', async () => {
      const onChangeText = jest.fn();
      await render(<ZSTextField label="검색" value="abc" onChangeText={onChangeText} />);
      expect(clear()).toBeNull();
      await focusInput();
      await fireEvent.press(clear()!);
      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it.each([
      ['ios', MIN_TOUCH_TARGET.ios],
      ['android', MIN_TOUCH_TARGET.android],
    ] as const)('%s: 터치 영역이 실제 크기로 최소 터치 영역(%dpt)이고, 음수 여백으로 자리는 원(20)만큼만 차지한다', async (os, target) => {
      platform.OS = os;
      const { colors } = getTestTheme();
      await render(<ZSTextField label="검색" value="abc" onChangeText={jest.fn()} />);
      await focusInput();
      const button = clear()!;
      expect(button.type).toBe('Pressable');
      expect(StyleSheet.flatten(button.props.style)).toMatchObject({ width: target, height: target, margin: -(target - 20) / 2, borderRadius: 9999, overflow: 'hidden' });
      expect(button.props.accessibilityRole).toBe('button');
      const circle = queryAllByHostType('View', button).find((node) => StyleSheet.flatten(node.props.style).width === 20);
      expect(StyleSheet.flatten(circle!.props.style)).toMatchObject({ width: 20, height: 20, borderRadius: 10, backgroundColor: withOpacity(colors.textSecondary, 0.4) });
    });

    it('누름 피드백 — iOS 는 하이라이트 덮개, Android 는 ripple 이 둥근 터치 상자 안에 그려진다', async () => {
      const { colors } = getTestTheme();
      await render(<ZSTextField label="검색" value="abc" onChangeText={jest.fn()} />);
      await focusInput();
      const highlight = queryAllByHostType('View', clear()!).find((node) => StyleSheet.flatten(node.props.style).position === 'absolute');
      expect(StyleSheet.flatten(highlight!.props.style).backgroundColor).toBe(withOpacity(colors.text, OPACITY.pressed));
      platform.OS = 'android';
      await render(<ZSTextField label="검색" value="abc" onChangeText={jest.fn()} />);
      await focusInput();
      expect(clear()!.props.android_ripple).toEqual({ color: withOpacity(colors.text, OPACITY.pressed), foreground: true });
    });

    it('빈 값·clearable=false·disabled 면 없다', async () => {
      await render(<ZSTextField label="검색" value="" onChangeText={jest.fn()} />);
      await focusInput();
      expect(clear()).toBeNull();
      await render(<ZSTextField label="검색" value="abc" clearable={false} onChangeText={jest.fn()} />);
      await focusInput();
      expect(clear()).toBeNull();
      await render(<ZSTextField label="검색" value="abc" disabled onChangeText={jest.fn()} />);
      await focusInput();
      expect(clear()).toBeNull();
    });

    it('ThemeProvider accessibilityLabels.clearText 를 라벨로 쓰고, clearAccessibilityLabel 이 있으면 그것이 우선한다', async () => {
      setTestTheme({ accessibilityLabels: { clearText: '지우기' } });
      await render(<ZSTextField label="검색" value="abc" onChangeText={jest.fn()} />);
      await focusInput();
      expect(screen.getByLabelText('지우기')).toBeTruthy();
      expect(clear()).toBeNull();
      await render(<ZSTextField label="검색" value="abc" clearAccessibilityLabel="입력 지우기" onChangeText={jest.fn()} />);
      await focusInput();
      expect(screen.getByLabelText('입력 지우기')).toBeTruthy();
    });
  });

  describe('비제어(defaultValue)', () => {
    it('value 없이 입력을 받아 빈 값 여부·글자 수만 따라간다', async () => {
      const onChangeText = jest.fn();
      await render(<ZSTextField label="코드" defaultValue="12" maxLength={6} showCount onChangeText={onChangeText} />);
      expect(input().props).toMatchObject({ value: undefined, defaultValue: '12' });
      expect(screen.getByText('2/6')).toBeTruthy();
      await fireEvent.changeText(input(), '1234');
      expect(onChangeText).toHaveBeenCalledWith('1234');
      expect(screen.getByText('4/6')).toBeTruthy();
    });

    it('지우기는 네이티브 입력을 비우고 onChangeText 로 빈 값을 알린다', async () => {
      const ref = createRef<any>();
      const onChangeText = jest.fn();
      await render(<ZSTextField ref={ref} label="코드" defaultValue="12" onChangeText={onChangeText} />);
      ref.current.clear = jest.fn();
      await focusInput();
      await fireEvent.press(screen.getByLabelText('Clear text'));
      expect(ref.current.clear).toHaveBeenCalledTimes(1);
      expect(onChangeText).toHaveBeenCalledWith('');
      expect(screen.queryByLabelText('Clear text')).toBeNull();
    });
  });

  it('helperText 를 아래에 두고 접근성 힌트로도 쓴다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSTextField label="비밀번호" value="" helperText="8자 이상" onChangeText={jest.fn()} />);
    expect(colorOf('8자 이상')).toBe(colors.textSecondary);
    expect(input().props.accessibilityHint).toBe('8자 이상');
  });

  it('errorText 가 있으면 오류 상태 — 안내 대신 오류를 알리고 오류 색 테두리 2·오류 아이콘', async () => {
    const { colors } = getTestTheme();
    await render(<ZSTextField label="비밀번호" value="1" helperText="8자 이상" errorText="너무 짧아요" onChangeText={jest.fn()} />);
    expect(screen.queryByText('8자 이상')).toBeNull();
    expect(colorOf('너무 짧아요')).toBe(colors.error);
    expect(colorOf('비밀번호')).toBe(colors.error);
    expect(screen.getByText('너무 짧아요').props.accessibilityLiveRegion).toBe('polite');
    expect(input().props).toMatchObject({ accessibilityHint: '너무 짧아요', selectionColor: colors.error });
    restFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style).borderWidth).toBe(1));
    expect(activeFrames()).toHaveLength(3);
    activeFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ borderWidth: 2, borderColor: colors.error, opacity: 1 }));
    expect(queryAllByHostProps({ fill: colors.error }).length).toBeGreaterThan(0);
  });

  describe('iOS 오류 알림(VoiceOver) — iOS 에는 liveRegion 이 없다', () => {
    const announce = AccessibilityInfo.announceForAccessibilityWithOptions as jest.Mock;
    const field = (errorText?: string) => <ZSTextField label="비밀번호" value="1" errorText={errorText} onChangeText={jest.fn()} />;
    beforeEach(() => announce.mockClear());

    it('오류 문구가 새로 생기거나 바뀔 때만 라벨과 함께 읽는다', async () => {
      await render(field());
      expect(announce).not.toHaveBeenCalled();
      await screen.rerender(field('너무 짧아요'));
      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenLastCalledWith('비밀번호, 너무 짧아요', { queue: true });
      await screen.rerender(field('너무 짧아요'));
      expect(announce).toHaveBeenCalledTimes(1);
      await screen.rerender(field('숫자를 넣어 주세요'));
      expect(announce).toHaveBeenCalledTimes(2);
      expect(announce).toHaveBeenLastCalledWith('비밀번호, 숫자를 넣어 주세요', { queue: true });
      await screen.rerender(field());
      expect(announce).toHaveBeenCalledTimes(2);
      await screen.rerender(field('숫자를 넣어 주세요'));
      expect(announce).toHaveBeenCalledTimes(3);
    });

    it('처음부터 오류로 그리면 읽지 않는다 — 화면에 들어올 때 여러 칸이 한꺼번에 읽히지 않게', async () => {
      await render(field('너무 짧아요'));
      expect(announce).not.toHaveBeenCalled();
    });

    it('Android 는 직접 읽지 않는다 — 오류 문구의 liveRegion 이 읽는다', async () => {
      platform.OS = 'android';
      await render(field());
      await screen.rerender(field('너무 짧아요'));
      expect(announce).not.toHaveBeenCalled();
      expect(screen.getByText('너무 짧아요').props.accessibilityLiveRegion).toBe('polite');
    });
  });

  it('오류 아이콘 느낌표는 onError 다 — 다크 error(밝은 분홍) 위에 흰 느낌표를 두지 않는다', async () => {
    const { colors } = setTestTheme({ mode: 'dark' });
    expect(colors.onError).not.toBe('#ffffff');
    await render(<ZSTextField label="비밀번호" value="1" errorText="너무 짧아요" onChangeText={jest.fn()} />);
    expect(queryAllByHostProps({ r: '10', fill: colors.error })).toHaveLength(1);
    expect(queryAllByHostProps({ stroke: colors.onError })).toHaveLength(1);
    expect(queryAllByHostProps({ r: '1.5', fill: colors.onError })).toHaveLength(1);
  });

  it('접근성 라벨·힌트를 직접 줄 수 있다', async () => {
    await render(<ZSTextField label="이름" value="" accessibilityLabel="성명" accessibilityHint="실명" helperText="안내" onChangeText={jest.fn()} />);
    expect(input().props).toMatchObject({ accessibilityLabel: '성명', accessibilityHint: '실명' });
  });

  describe('글자 수', () => {
    it('showCount 와 maxLength 가 있으면 현재/최대 를 보인다', async () => {
      await render(<ZSTextField label="소개" value="안녕" maxLength={10} showCount onChangeText={jest.fn()} />);
      expect(screen.getByText('2/10')).toBeTruthy();
      expect(input().props.maxLength).toBe(10);
    });

    it('maxLength 가 없으면 글자 수를 보이지 않는다', async () => {
      await render(<ZSTextField label="소개" value="안녕" showCount onChangeText={jest.fn()} />);
      expect(screen.queryByText(/\//)).toBeNull();
    });
  });

  it('disabled 면 편집할 수 없고 M3 비활성 색으로 그린다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSTextField label="이름" value="고정" helperText="수정 불가" disabled onChangeText={jest.fn()} />);
    const disabledContent = withOpacity(colors.text, 0.38);
    expect(input().props.editable).toBe(false);
    expect(inputStyle().color).toBe(disabledContent);
    expect(colorOf('이름')).toBe(disabledContent);
    expect(colorOf('수정 불가')).toBe(disabledContent);
    restFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style).borderColor).toBe(withOpacity(colors.text, 0.12)));
    activeFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style).opacity).toBe(0));
  });

  it('비활성이면 오류여도 포커스·오류 테두리를 그리지 않는다 — M3 처럼 비활성이 앞선다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSTextField label="이름" value="고정" errorText="오류" disabled onChangeText={jest.fn()} />);
    restFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style).borderColor).toBe(withOpacity(colors.text, 0.12)));
    expect(activeFrames()).toHaveLength(3);
    activeFrames().forEach((frame) => expect(StyleSheet.flatten(frame.props.style).opacity).toBe(0));
  });

  it('입력 줄 높이·여백을 계산한 값으로 둔다 — 한 줄은 높이를 고정해 첫 글자에 칸이 움직이지 않는다', async () => {
    const padding = (52 - bodyLine()) / 2;
    await render(<ZSTextField label="이름" value="" onChangeText={jest.fn()} />);
    expect(inputStyle()).toMatchObject({ paddingTop: padding, paddingBottom: padding, height: 52, textAlignVertical: 'center' });
  });

  it('multiline 은 minRows~maxRows 사이에서 내용에 맞춰 늘어난다(네이티브 자동 높이)', async () => {
    const padding = (52 - bodyLine()) / 2;
    await render(<ZSTextField label="메모" value="" multiline minRows={2} maxRows={5} onChangeText={jest.fn()} />);
    expect(inputStyle()).toMatchObject({ textAlignVertical: 'top', minHeight: bodyLine() * 2, maxHeight: bodyLine() * 5, paddingTop: 0, paddingBottom: 0 });
    expect(StyleSheet.flatten(input().parent!.props.style)).toMatchObject({ flex: 1, paddingTop: padding, paddingBottom: padding });
  });

  it('앞·뒤 요소를 그리고, 앞 요소가 있으면 라벨이 늘 떠 있다(placeholder 도 보인다)', async () => {
    await render(
      <ZSTextField label="검색" value="" placeholder="이름" startAdornment={<Text>S</Text>} endAdornment={<Text>kg</Text>} onChangeText={jest.fn()} />,
    );
    expect(screen.getByText('S')).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
    expect(input().props.placeholder).toBe('이름');
  });

  it('한 줄 inbox 뒤 요소는 라벨이 칸 가운데에 쉬는 동안 칸 가운데, 값이 있으면 입력 줄 가운데로 내려간다', async () => {
    const shiftOf = (text: string) => {
      const slot = screen.getByText(text).parent;
      if (!slot) throw new Error(`${text} 를 감싼 칸이 없다`);
      return StyleSheet.flatten(slot.props.style).transform;
    };
    await render(<ZSTextField variant="inbox" label="몸무게" value="" endAdornment={<Text>kg</Text>} onChangeText={jest.fn()} />);
    expect(shiftOf('kg')).toEqual([{ translateY: 0 }]);
    await render(<ZSTextField variant="inbox" label="몸무게" value="70" endAdornment={<Text>kg</Text>} onChangeText={jest.fn()} />);
    const paddingTop = 8 + captionLine();
    const paddingBottom = Math.max(8, 56 - paddingTop - bodyLine());
    expect(shiftOf('kg')).toEqual([{ translateY: (paddingTop - paddingBottom) / 2 }]);
    expect(inputStyle()).toMatchObject({ paddingTop, paddingBottom, height: paddingTop + paddingBottom + bodyLine() });
  });

  describe('큰 글자에서 쌓은 outlined 필드', () => {
    const rootStyle = () => StyleSheet.flatten(nth(queryAllByHostType('View'), 0).props.style);
    const withFontScale = (fontScale: number) => jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale });
    afterEach(() => jest.restoreAllMocks());

    it('기본 글자 크기에서는 위에 자리를 두지 않는다 — 지금 간격 그대로', async () => {
      await render(<ZSTextField label="이메일" value="a@b.c" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeUndefined();
      withFontScale(0.82);
      await render(<ZSTextField label="이메일" value="a@b.c" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeUndefined();
    });

    it('떠오른 라벨이 칸 위로 더 나온 만큼 위에 자리를 둬 위 필드의 안내 문구와 붙지 않는다', async () => {
      setTestTheme({ maxFontSizeMultiplier: 0 });
      withFontScale(3.571);
      await render(<ZSTextField label="이메일" value="a@b.c" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeCloseTo(((bodyLine() * 3.571 - bodyLine()) * labelRatio()) / 2);
      await render(<ZSTextField label="이메일" value="" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeCloseTo(((bodyLine() * 3.571 - bodyLine()) * labelRatio()) / 2);
      setTestTheme();
    });

    it('prop 이 없으면 앱 상한(기본 2배)까지만 늘고 입력·라벨 글자에도 같은 상한을 준다', async () => {
      withFontScale(3.571);
      await render(<ZSTextField label="이메일" value="a@b.c" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeCloseTo(((bodyLine() * 2 - bodyLine()) * labelRatio()) / 2);
      expect(input().props.maxFontSizeMultiplier).toBe(2);
      setTestTheme({ maxFontSizeMultiplier: 1.5 });
      await render(<ZSTextField label="이메일" value="a@b.c" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeCloseTo(((bodyLine() * 1.5 - bodyLine()) * labelRatio()) / 2);
      expect(input().props.maxFontSizeMultiplier).toBe(1.5);
      setTestTheme();
    });

    it('maxFontSizeMultiplier 로 묶은 배율까지만 늘고, inbox·underline 은 두지 않는다', async () => {
      withFontScale(3.571);
      await render(<ZSTextField label="이메일" value="" maxFontSizeMultiplier={2} onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeCloseTo((bodyLine() * labelRatio()) / 2);
      await render(<ZSTextField variant="inbox" label="이메일" value="" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeUndefined();
      await render(<ZSTextField variant="underline" label="이메일" value="" onChangeText={jest.fn()} />);
      expect(rootStyle().paddingTop).toBeUndefined();
    });

    it('앱 style 은 그 뒤에 얹힌다 — 바깥 여백은 그대로 더해진다', async () => {
      withFontScale(2);
      await render(<ZSTextField label="이메일" value="" style={{ marginTop: 3 }} onChangeText={jest.fn()} />);
      expect(rootStyle().marginTop).toBe(3);
      expect(rootStyle().paddingTop).toBeCloseTo(((bodyLine() * 2 - bodyLine()) * labelRatio()) / 2);
    });
  });

  it('style 은 바깥, inputStyle 은 TextInput 에 적용하고 ref 를 넘긴다', async () => {
    const ref = createRef<any>();
    await render(<ZSTextField ref={ref} label="이름" value="" style={{ marginTop: 3 }} inputStyle={{ fontSize: 30 }} onChangeText={jest.fn()} />);
    expect(inputStyle().fontSize).toBe(30);
    expect(StyleSheet.flatten(nth(queryAllByHostType('View'), 0).props.style)).toMatchObject({ alignSelf: 'stretch', marginTop: 3 });
    expect(ref.current).toBeTruthy();
  });
});

describe('placeholderColor', () => {
  it('팔레트에서 라이트 흰 칸 #767676 · 다크 #131313 칸 #8e8e8e — 보조 글자에서 칸 면 쪽으로 최대 13%, 4.5:1 안에서', () => {
    expect(placeholderColor('#696969', '#ffffff')).toBe('#767676');
    expect(placeholderColor('#a0a0a0', '#131313')).toBe('#8e8e8e');
    expect(contrastRatio('#767676', '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('처음부터 4.5:1 에 못 미치거나 hex 가 아니면 보조 글자색 그대로다', () => {
    expect(placeholderColor('#9a9a9a', '#ffffff')).toBe('#9a9a9a');
    expect(placeholderColor('rgba(0,0,0,0.5)', '#ffffff')).toBe('rgba(0,0,0,0.5)');
    expect(placeholderColor('#696969', 'transparent')).toBe('#696969');
  });
});
