import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import type { TestInstance } from 'test-renderer';
import AlertDialog, { ALERT_ENTER_SCALE, ALERT_EXIT_SCALE, ALERT_MAX_WIDTH, ALERT_STACK_FONT_SCALE } from '../../overlay/AlertDialog';
import type { ShowAlertProps } from '../../model/types';
import ZSButton from '../../ui/ZSButton';
import { withOpacity } from '../../theme/color';
import { DURATION, springConfig, timingConfig } from '../../theme/motion';
import { RADIUS } from '../../theme/radius';
import { SPACE } from '../../theme/spacing';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };
const modal = () => getByHostType('Modal');
const backdrop = () => screen.getByTestId('zs-alert-backdrop', { includeHiddenElements: true });
const bg = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style).backgroundColor;
const styleOf = (node: TestInstance) => StyleSheet.flatten(node.props.style) ?? {};
const cardStyle = () => styleOf(screen.getByTestId('zs-alert'));
const buttonRow = () => {
  let node: TestInstance | null = screen.getByTestId('zs-alert-confirm');
  while (node && !(typeof node.props.onLayout === 'function' && styleOf(node).marginTop === SPACE['3xl'])) node = node.parent;
  if (!node) throw new Error('버튼 줄이 없다');
  return node;
};
const scrim = () => backdrop().parent!;
const scrimFill = () => scrim().children.filter((child): child is TestInstance => typeof child !== 'string').flatMap((child) => child.queryAll((node) => typeof styleOf(node).backgroundColor === 'string')).map(styleOf)[0];
const buttonOrder = () => screen.getAllByTestId(/^zs-alert-(cancel|confirm)$/).map((node) => node.props.testID);
const measureLayer = () => {
  const layer = buttonRow().children.find((child): child is TestInstance => typeof child !== 'string' && child.props.accessibilityElementsHidden === true);
  if (!layer) throw new Error('폭 재기 사본이 없다');
  return layer;
};
const measureCopies = () => measureLayer().children as TestInstance[];
const layoutWidth = (node: TestInstance, width: number) => fireEvent(node, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: 44 } } });

describe('AlertDialog', () => {
  const { colors } = getTestTheme();
  const calls: string[] = [];
  const onClose = jest.fn(() => calls.push('close'));

  const renderAlert = (alert: Partial<ShowAlertProps> = {}) =>
    render(<AlertDialog alert={{ title: '저장할까요?', confirm: { label: '저장' }, ...alert }} onClose={onClose} />);

  const finishClosing = () => act(() => jest.advanceTimersByTime(DURATION.fast));

  beforeEach(() => {
    calls.length = 0;
    onClose.mockClear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    platform.OS = 'ios';
    setTestTheme();
  });

  it('iOS 는 창에 직접 붙는 FullWindowOverlay 에 제목·본문을 그린다 — 열린 SwiftUI 시트 위에도 뜬다', async () => {
    await renderAlert({ message: '저장하지 않으면 사라집니다.' });
    expect(queryAllByHostType('FullWindowOverlay')).toHaveLength(1);
    expect(queryAllByHostType('Modal')).toHaveLength(0);
    expect(screen.getByText('저장할까요?').props.accessibilityRole).toBe('header');
    expect(screen.getByText('저장하지 않으면 사라집니다.')).toBeTruthy();
    expect(screen.getByTestId('zs-alert').props.accessibilityViewIsModal).toBe(true);
  });

  it('카드는 흰 면(surface1)·모서리 32·그림자 없음, 폭은 창 − 64, 최대 360, 안쪽 26/24/24 다', async () => {
    await renderAlert();
    expect(cardStyle()).toMatchObject({ width: 390 - 64, backgroundColor: colors.surface1, borderRadius: RADIUS['3xl'], paddingTop: 26, paddingHorizontal: 24, paddingBottom: 24 });
    expect(cardStyle().boxShadow).toBeUndefined();
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 800, height: 600, scale: 2, fontScale: 1 });
    await renderAlert();
    expect(cardStyle()).toMatchObject({ width: ALERT_MAX_WIDTH, maxHeight: 600 - 64 });
    expect(ALERT_MAX_WIDTH).toBe(360);
  });

  it('다크 카드는 떠 있는 면(surface3)에 위 1px 흰 7% 안선 + 0.5px 흰 6% 테두리(안쪽 그림자)다', async () => {
    const { colors: dark } = setTestTheme({ mode: 'dark' });
    await renderAlert();
    expect(cardStyle().backgroundColor).toBe(dark.surface3);
    expect(cardStyle().boxShadow).toEqual([
      { offsetX: 0, offsetY: 1, blurRadius: 0, color: withOpacity('#ffffff', 0.07), inset: true },
      { offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: StyleSheet.hairlineWidth, color: withOpacity('#ffffff', 0.06), inset: true },
    ]);
  });

  it('취소는 회색 tonal(neutral), 확인은 filled — 파괴 동작이면 확인을 error 로 채운다. 버튼은 48(medium)', async () => {
    await render(<ZSButton title="견본" variant="tonal" color="neutral" testID="tonal-sample" />);
    const tonal = bg('tonal-sample');
    await renderAlert({ cancel: { label: '취소' } });
    expect(bg('zs-alert-cancel')).toBe(tonal);
    expect(bg('zs-alert-confirm')).toBe(colors.primary);
    expect(styleOf(screen.getByTestId('zs-alert-confirm')).minHeight).toBe(48);
    expect(styleOf(screen.getByTestId('zs-alert-cancel')).minHeight).toBe(48);
    await renderAlert({ confirm: { label: '삭제', destructive: true } });
    expect(bg('zs-alert-confirm')).toBe(colors.error);
    expect(screen.queryByTestId('zs-alert-cancel')).toBeNull();
  });

  describe('뒤 막(scrim) — 흐림 10 + 검정 32%(다크 52%)', () => {
    it('iOS 는 뒤를 흐리고 검정 32% 를 깐다 — 흐림은 안전 하한 1·막은 투명도 0 에서 짙어진다(뷰 투명도는 쓰지 않는다)', async () => {
      await renderAlert();
      expect(getByHostType('BlurView').props.intensity).toBe(1);
      expect(scrimFill()).toMatchObject({ backgroundColor: withOpacity(colors.backdrop, 0.32), opacity: 0 });
      expect(styleOf(scrim()).opacity).toBeUndefined();
    });

    it('Android 는 Modal 창이라 앱 화면을 흐리지 않고 대체 scrim(48%)이다', async () => {
      platform.OS = 'android';
      await renderAlert();
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
      expect(scrimFill()?.backgroundColor).toBe(withOpacity(colors.backdrop, 0.48));
    });
  });

  it('Android 는 투명 Modal 창에 그린다', async () => {
    platform.OS = 'android';
    await renderAlert();
    expect(modal().props).toMatchObject({ visible: true, transparent: true, animationType: 'none', statusBarTranslucent: true, navigationBarTranslucent: true });
    expect(queryAllByHostType('FullWindowOverlay')).toHaveLength(0);
  });

  it.each(['ios', 'android'])('%s — 버튼을 누르면 닫힘 전환이 끝난 뒤 onPress 를 부르고, 여러 번 눌러도 한 번이다', async (os) => {
    platform.OS = os;
    const onPress = jest.fn(() => calls.push('press'));
    await renderAlert({ confirm: { label: '저장', onPress } });
    await fireEvent.press(screen.getByTestId('zs-alert-confirm'));
    await fireEvent.press(screen.getByTestId('zs-alert-confirm'));
    expect(onPress).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    await finishClosing();
    expect(calls).toEqual(['close', 'press']);
  });

  describe('모션 — 크기와 투명도(위아래로 미끄러지지 않는다)', () => {
    it.each(['ios', 'android'])('%s — 0.96 에서 1 로 자라며 나타나고 배경막도 함께 짙어진다', async (os) => {
      platform.OS = os;
      const spring = jest.spyOn(Reanimated, 'withSpring');
      await renderAlert();
      expect(ALERT_ENTER_SCALE).toBe(0.96);
      expect(cardStyle()).toMatchObject({ opacity: 0, transform: [{ scale: ALERT_ENTER_SCALE }] });
      expect(scrimFill()?.opacity).toBe(0);
      expect(spring).toHaveBeenCalledWith(1, os === 'ios' ? springConfig('fade', 'normal') : springConfig('move', 'normal'));
      expect(spring).toHaveBeenCalledWith(1, springConfig('fade', 'normal'));
    });

    it('나갈 때는 0.98 로 살짝 줄며 빠른 timing 으로 흐려진다', async () => {
      await renderAlert();
      const timing = jest.spyOn(Reanimated, 'withTiming');
      await fireEvent.press(screen.getByTestId('zs-alert-confirm'));
      expect(ALERT_EXIT_SCALE).toBe(0.98);
      expect(timing).toHaveBeenCalledWith(ALERT_EXIT_SCALE, timingConfig('fast'));
      expect(timing).toHaveBeenCalledWith(0, timingConfig('fast'), expect.any(Function));
      await finishClosing();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('제목', () => {
    it.each(['ios', 'android'] as const)('%s — 두 플랫폼 같은 h4 왼쪽 정렬, 본문은 8 아래 body2 보조색', async (os) => {
      platform.OS = os;
      const { typography, colors: themed } = setTestTheme({ platform: os });
      await renderAlert({ message: '본문' });
      const title = StyleSheet.flatten(screen.getByText('저장할까요?').props.style);
      expect(title).toMatchObject(typography.h4);
      expect(title.textAlign).toBeUndefined();
      expect(StyleSheet.flatten(screen.getByText('본문').props.style)).toMatchObject({ ...typography.body2, color: themed.textSecondary });
      expect(title.fontSize).toBeGreaterThan(StyleSheet.flatten(screen.getByText('본문').props.style).fontSize);
      expect(screen.getByText('저장할까요?').props.accessibilityRole).toBe('header');
      const content = screen.getByText('저장할까요?').parent!;
      expect(StyleSheet.flatten(content.props.contentContainerStyle ?? content.parent?.props.contentContainerStyle)).toMatchObject({ gap: SPACE.sm });
    });
  });

  describe('버튼 배치 — 나란히, 안 들어가면 세로로', () => {
    const withFontScale = (fontScale: number) => jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale });

    it('기본은 취소·확인을 같은 폭으로 나란히 둔다', async () => {
      await renderAlert({ cancel: { label: '취소' } });
      expect(styleOf(buttonRow())).toMatchObject({ flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE['3xl'] });
      expect(buttonOrder()).toEqual(['zs-alert-cancel', 'zs-alert-confirm']);
      expect(styleOf(screen.getByTestId('zs-alert-cancel')).flex).toBe(1);
      expect(styleOf(screen.getByTestId('zs-alert-confirm')).flex).toBe(1);
    });

    it(`글자 배율 ${ALERT_STACK_FONT_SCALE} 이상이면 세로로 쌓는다 — 확인이 위, 취소가 아래, 둘 다 줄 폭`, async () => {
      withFontScale(1.3);
      await renderAlert({ cancel: { label: '취소' } });
      expect(styleOf(buttonRow()).flexDirection).toBe('column');
      expect(buttonOrder()).toEqual(['zs-alert-confirm', 'zs-alert-cancel']);
      for (const id of ['zs-alert-confirm', 'zs-alert-cancel']) {
        expect(styleOf(screen.getByTestId(id))).toMatchObject({ alignSelf: 'stretch' });
        expect(styleOf(screen.getByTestId(id)).flex).toBeUndefined();
      }
      expect(() => measureLayer()).toThrow();
    });

    it('앱이 글자 확대 상한을 1.3 아래로 두면 그 배율로 판단한다', async () => {
      withFontScale(1.5);
      setTestTheme({ maxFontSizeMultiplier: 1.2 });
      await renderAlert({ cancel: { label: '취소' } });
      expect(styleOf(buttonRow()).flexDirection).toBe('row');
    });

    it('라벨이 반 폭((줄 − 간격) / 2)에 안 들어가면 말줄임 대신 세로로 쌓는다', async () => {
      await renderAlert({ cancel: { label: '취소' }, confirm: { label: '변경 사항을 저장하고 나가기' } });
      const [cancelCopy, confirmCopy] = measureCopies();
      await layoutWidth(buttonRow(), 290);
      await layoutWidth(cancelCopy!, 80);
      await layoutWidth(confirmCopy!, (290 - SPACE.sm) / 2);
      expect(styleOf(buttonRow()).flexDirection).toBe('row');
      await layoutWidth(confirmCopy!, (290 - SPACE.sm) / 2 + 1);
      expect(styleOf(buttonRow()).flexDirection).toBe('column');
      expect(buttonOrder()).toEqual(['zs-alert-confirm', 'zs-alert-cancel']);
    });

    it('폭 재기용 사본은 보이지 않고 스크린 리더·터치에서 빠지며 testID 가 없다', async () => {
      await renderAlert({ cancel: { label: '취소' } });
      const copies = measureLayer();
      expect(copies.props).toMatchObject({ pointerEvents: 'none', importantForAccessibility: 'no-hide-descendants' });
      expect(styleOf(copies)).toMatchObject({ position: 'absolute', opacity: 0 });
      expect(measureCopies()).toHaveLength(2);
      expect(screen.getAllByText('취소')).toHaveLength(1);
      expect(screen.getAllByText('취소', { includeHiddenElements: true })).toHaveLength(2);
      expect(screen.getAllByTestId(/^zs-alert-(cancel|confirm)$/)).toHaveLength(2);
    });

    it('버튼이 하나면 재지 않고 줄 폭을 다 쓴다', async () => {
      await renderAlert();
      expect(screen.getAllByText('저장', { includeHiddenElements: true })).toHaveLength(1);
      expect(() => measureLayer()).toThrow();
      expect(styleOf(screen.getByTestId('zs-alert-confirm')).flex).toBe(1);
    });
  });

  describe('바깥 탭 — dismissible', () => {
    it('기본은 바깥 탭으로 닫히지 않는다', async () => {
      await renderAlert({ cancel: { label: '취소' } });
      expect(backdrop().props.onPress).toBeUndefined();
    });

    it('dismissible 이면 바깥 탭이 취소와 같다', async () => {
      const onCancel = jest.fn(() => calls.push('cancel'));
      await renderAlert({ cancel: { label: '취소', onPress: onCancel }, dismissible: true });
      await fireEvent.press(backdrop());
      await finishClosing();
      expect(calls).toEqual(['close', 'cancel']);
    });
  });

  describe('Android 뒤로가기 — onRequestClose', () => {
    beforeEach(() => {
      platform.OS = 'android';
    });

    it('취소가 있으면 취소로 닫는다', async () => {
      const onCancel = jest.fn(() => calls.push('cancel'));
      await renderAlert({ cancel: { label: '취소', onPress: onCancel } });
      await act(() => modal().props.onRequestClose());
      await finishClosing();
      expect(calls).toEqual(['close', 'cancel']);
    });

    it('취소가 없고 dismissible 도 아니면 막는다 — 강제 업데이트 같은 대화상자', async () => {
      await renderAlert();
      await act(() => modal().props.onRequestClose());
      await finishClosing();
      expect(onClose).not.toHaveBeenCalled();
      expect(queryAllByHostType('Modal')[0]?.props.visible).toBe(true);
    });

    it('취소가 없어도 dismissible 이면 닫는다', async () => {
      await renderAlert({ dismissible: true });
      await act(() => modal().props.onRequestClose());
      await finishClosing();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
