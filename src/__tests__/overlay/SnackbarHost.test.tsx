import React from 'react';
import * as Expo from 'expo';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, StyleSheet } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import type { LayoutAnimationFunction, LayoutAnimationsValues } from 'react-native-reanimated';
import type { TestInstance } from 'test-renderer';
import SnackbarHost, {
  SNACKBAR_ACTION_HEIGHT,
  SNACKBAR_DURATION,
  SNACKBAR_ENTER_OFFSET,
  SNACKBAR_MIN_HEIGHT,
  SNACKBAR_SWIPE_DISTANCE,
  SNACKBAR_SWIPE_VELOCITY,
  SNACKBAR_BOTTOM_GAP,
  SNACKBAR_TOP_OFFSET,
  snackbarBottom,
  snackbarTop,
  type SnackbarEntry,
} from '../../overlay/SnackbarHost';
import { createBottomBarStore } from '../../context/BottomBarContext';
import * as GestureHandler from 'react-native-gesture-handler';
import type { MockGesture } from '../__mocks__/react-native-gesture-handler';
import { MATERIAL_READABLE_MAX_WIDTH } from '../../layout/windowClass';
import { withOpacity } from '../../theme/color';
import { springConfig } from '../../theme/motion';
import { RADIUS } from '../../theme/radius';
import { SPACE } from '../../theme/spacing';
import { DEFAULT_ACCESSIBILITY_LABELS } from '../../theme/accessibilityLabels';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 84 }),
}));
const mockTextRender = jest.fn();
jest.mock('../../ui/ZSText', () => {
  const React = require('react');
  const { default: ZSText } = jest.requireActual('../../ui/ZSText');
  return {
    __esModule: true,
    default: (props: { children?: React.ReactNode }) => {
      mockTextRender(props.children);
      return React.createElement(ZSText, props);
    },
  };
});

const styleOf = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) ?? {};
const surface = (id: number) => styleOf(screen.getByTestId(`zs-snackbar-${id}`));
const textColor = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style).color;
const slotOf = (node: TestInstance | null): TestInstance | null => {
  let current = node;
  while (current && current.props.layout === undefined) current = current.parent;
  return current;
};
const veilFill = (id: number) =>
  screen
    .getByTestId(`zs-snackbar-${id}`, { includeHiddenElements: true })
    .queryAll((node) => typeof node.type === 'string' && typeof styleOf(node).backgroundColor === 'string')
    .map(styleOf)[0];
const lastSwipe = (spy: jest.SpyInstance) => (spy.mock.results.at(-1)?.value as MockGesture).__config;

describe('SnackbarHost', () => {
  const { colors } = getTestTheme();
  const onHide = jest.fn();
  const renderHost = (items: SnackbarEntry[]) => render(<SnackbarHost items={items} onHide={onHide} />);
  const slot = (id: number) => slotOf(screen.getByTestId(`zs-snackbar-${id}`, { includeHiddenElements: true }));

  const slotStyle = (id: number) => StyleSheet.flatten(slot(id)?.props.style);
  const layoutSlot = (id: number, layout: { x: number; y: number; width: number; height: number }) =>
    fireEvent(slot(id)!, 'layout', { nativeEvent: { layout } });

  beforeEach(() => {
    onHide.mockClear();
    (AccessibilityInfo.announceForAccessibility as jest.Mock).mockClear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    (Platform as { OS: string }).OS = 'ios';
    delete (Platform as { Version?: string }).Version;
  });

  it('스낵바가 없으면 아무것도 그리지 않는다', async () => {
    await renderHost([]);
    expect(screen.queryByTestId('zs-snackbar-host')).toBeNull();
    expect(queryAllByHostType('FullWindowOverlay')).toHaveLength(0);
  });

  it('iOS 는 창에 직접 붙는 FullWindowOverlay 에 그려 열린 SwiftUI 시트 위에도 뜬다 — VoiceOver 는 가두지 않는다', async () => {
    await renderHost([{ id: 1, message: '저장했습니다' }]);
    expect(getByHostType('FullWindowOverlay').props.unstable_accessibilityContainerViewIsModal).toBe(false);
  });

  it('Android 는 앱 화면 안에 그린다 — 화면 터치·포커스를 가져가는 Modal 창을 쓰지 않는다', async () => {
    (Platform as { OS: string }).OS = 'android';
    await renderHost([{ id: 1, message: '저장했습니다' }]);
    (Platform as { OS: string }).OS = 'ios';
    expect(queryAllByHostType('FullWindowOverlay')).toHaveLength(0);
    expect(queryAllByHostType('Modal')).toHaveLength(0);
    expect(screen.getByTestId('zs-snackbar-host')).toBeTruthy();
  });

  const hostStyle = () => StyleSheet.flatten(screen.getByTestId('zs-snackbar-host').props.style);

  it('기본은 위 — 기기 상태바 아래(safe area 47 + 8)에 서고, 좌우 inset 12 안, 넓은 창에서는 가독 폭 가운데다', async () => {
    await renderHost([{ id: 1, message: '저장했습니다' }]);
    expect(SNACKBAR_TOP_OFFSET).toBe(8);
    expect(hostStyle()).toMatchObject({ position: 'absolute', top: 47 + 8, left: 0, right: 0, alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 84 + 12 });
    expect(hostStyle().bottom).toBeUndefined();
    expect(slotStyle(1)).toMatchObject({ width: '100%', maxWidth: MATERIAL_READABLE_MAX_WIDTH });
    expect(screen.queryByTestId('zs-snackbar-window-probe')).toBeNull();
  });

  it("position='bottom' 이면 아래 — 창 아래 safe area 34 위 8 에 선다", async () => {
    await render(<SnackbarHost items={[{ id: 1, message: '저장했습니다' }]} onHide={onHide} position="bottom" />);
    expect(SNACKBAR_BOTTOM_GAP).toBe(8);
    expect(hostStyle()).toMatchObject({ position: 'absolute', bottom: 34 + 8, left: 0, right: 0, paddingLeft: 12, paddingRight: 84 + 12 });
    expect(hostStyle().top).toBeUndefined();
  });

  it.each(['top', 'bottom'] as const)('%s — 호스트는 스낵바 자리만 차지한다(위쪽 여백·높이 없음) — Android 제스처 루트가 상단 바·고정 버튼 터치를 잡지 않는다', async (position) => {
    (Platform as { OS: string }).OS = 'android';
    await render(<SnackbarHost items={[{ id: 1, message: '저장했습니다' }]} onHide={onHide} position={position} />);
    for (const key of ['paddingTop', 'paddingBottom', 'height', 'flex']) expect(hostStyle()).not.toHaveProperty(key);
    expect(position === 'top' ? hostStyle().bottom : hostStyle().top).toBeUndefined();
  });

  it('아래 자리의 창 아래 끝을 재는 점은 크기도 터치도 없다', async () => {
    await render(<SnackbarHost items={[{ id: 1, message: '저장했습니다' }]} onHide={onHide} position="bottom" />);
    const probe = screen.getByTestId('zs-snackbar-window-probe');
    expect(probe.props).toMatchObject({ pointerEvents: 'none' });
    expect(StyleSheet.flatten(probe.props.style)).toMatchObject({ position: 'absolute', bottom: 0, width: 0, height: 0 });
  });

  it.each(['ios', 'android'] as const)('위 자리 — %s 도 상단 바와 상관없이 상태바(safe area 47) 아래 8 에 선다', async (os) => {
    (Platform as { OS: string }).OS = os;
    await renderHost([{ id: 1, message: '저장했습니다' }]);
    expect(hostStyle().top).toBe(47 + SNACKBAR_TOP_OFFSET);
  });

  describe('위 자리 — iOS 는 상태바 프레임 바로 아래', () => {
    it.each([
      ['Dynamic Island — 상태바(54)가 safe area(62)보다 낮으면 상태바 아래', { safeTop: 62, statusBar: { x: 0, y: 0, width: 402, height: 54 } }, 62],
      ['상태바를 아직 못 읽었거나 Android 는 safe area 아래', { safeTop: 62, statusBar: null }, 70],
      ['상태바가 숨었으면(0) safe area 아래 — 섬·노치를 덮지 않는다', { safeTop: 62, statusBar: { x: 0, y: 0, width: 0, height: 0 } }, 70],
      ['옆 레일 상태바(iPhone Duo 접힘)는 safe area 아래', { safeTop: 0, statusBar: { x: 382, y: 0, width: 84, height: 678 } }, 8],
      ['헤더 줄 상태바(위 safe area 0)는 safe area 아래', { safeTop: 0, statusBar: { x: 780, y: 0, width: 160, height: 48 } }, 8],
    ] as const)('%s', (_case, input, expected) => {
      expect(snackbarTop(input)).toBe(expected);
    });

    const nativeFrame = (frame: { x: number; y: number; width: number; height: number } | null) => {
      const getStatusBarFrame = jest.fn(async () => frame);
      jest.spyOn(Expo, 'requireOptionalNativeModule').mockReturnValue({ getStatusBarFrame } as never);
      return getStatusBarFrame;
    };

    it('iOS 는 네이티브가 알려 준 상태바(40) 아래 8 에 선다', async () => {
      nativeFrame({ x: 0, y: 0, width: 402, height: 40 });
      await renderHost([{ id: 1, message: '저장했습니다' }]);
      expect(hostStyle().top).toBe(40 + SNACKBAR_TOP_OFFSET);
    });

    it("Android·position='bottom' 은 상태바 프레임을 읽지 않는다", async () => {
      const getStatusBarFrame = nativeFrame({ x: 0, y: 0, width: 402, height: 40 });
      (Platform as { OS: string }).OS = 'android';
      await renderHost([{ id: 1, message: '저장했습니다' }]);
      expect(hostStyle().top).toBe(47 + SNACKBAR_TOP_OFFSET);
      (Platform as { OS: string }).OS = 'ios';
      await render(<SnackbarHost items={[{ id: 1, message: '저장했습니다' }]} onHide={onHide} position="bottom" />);
      expect(getStatusBarFrame).not.toHaveBeenCalled();
    });
  });

  describe("아래 자리 바닥 — 아래 가림(아래 고정 영역·탭 바)·키보드 위", () => {
    it.each([
      ['잰 적 없으면 safe area 위', { safeBottom: 34, windowBottom: null, barTop: 700, keyboardTop: 500 }, 42],
      ['알린 화면이 없으면 safe area 위', { safeBottom: 34, windowBottom: 844, barTop: null, keyboardTop: null }, 42],
      ['아래 고정 버튼(윗변 744) 위', { safeBottom: 34, windowBottom: 844, barTop: 744, keyboardTop: null }, 108],
      ['키보드(윗변 508)가 더 높으면 키보드 위', { safeBottom: 34, windowBottom: 844, barTop: 744, keyboardTop: 508 }, 344],
      ['알린 윗변이 safe area 보다 낮으면 safe area 위', { safeBottom: 34, windowBottom: 844, barTop: 830, keyboardTop: null }, 42],
    ] as const)('%s', (_case, input, expected) => {
      expect(snackbarBottom(input)).toBe(expected);
    });

    it('창 아래 끝을 재기 전에는 알린 윗변이 있어도 safe area 위다 — 좌표를 견줄 기준이 없다(잰 뒤 규칙은 snackbarBottom)', async () => {
      const bottomBar = createBottomBarStore();
      bottomBar.set({ owner: 1, top: 744 });
      await render(<SnackbarHost items={[{ id: 1, message: '저장했습니다' }]} onHide={onHide} position="bottom" bottomBar={bottomBar} />);
      const hostBottom = () => StyleSheet.flatten(screen.getByTestId('zs-snackbar-host').props.style).bottom;
      expect(hostBottom()).toBe(34 + 8);
      await act(() => bottomBar.set(null));
      expect(hostBottom()).toBe(34 + 8);
    });
  });

  it('밀어 닫기 제스처가 앱 루트 없이도 동작하도록 GestureHandlerRootView 가 호스트다 — 빈 곳 터치는 지나간다', async () => {
    await renderHost([{ id: 1, message: '저장했습니다' }]);
    expect(screen.getByTestId('zs-snackbar-host').props.pointerEvents).toBe('box-none');
    expect(screen.getAllByTestId('gesture-detector')).toHaveLength(1);
  });

  describe('모션 — 높이는 애니메이션하지 않는다', () => {
    it.each([
      ['ios', 'top', -SNACKBAR_ENTER_OFFSET],
      ['android', 'top', -SNACKBAR_ENTER_OFFSET],
      ['ios', 'bottom', SNACKBAR_ENTER_OFFSET],
      ['android', 'bottom', SNACKBAR_ENTER_OFFSET],
    ] as const)('%s %s — 바깥 쪽에서 16 다가오며(move spring) 나타난다(fade spring) — 위 자리는 위에서, 아래 자리는 아래에서', async (os, position, from) => {
      (Platform as { OS: string }).OS = os;
      const spring = jest.spyOn(Reanimated, 'withSpring');
      await render(<SnackbarHost items={[{ id: 1, message: '저장했습니다' }]} onHide={onHide} position={position} />);
      expect(SNACKBAR_ENTER_OFFSET).toBe(16);
      expect(slotStyle(1)).toMatchObject({ transform: [{ translateX: 0 }, { translateY: from }] });
      expect(slotStyle(1)).not.toHaveProperty('opacity');
      for (const key of ['height', 'minHeight', 'maxHeight', 'overflow']) expect(slotStyle(1)).not.toHaveProperty(key);
      expect(spring).toHaveBeenCalledWith(0, springConfig('move', 'normal'));
      expect(spring).toHaveBeenCalledWith(1, springConfig('fade', 'normal'));
    });

    it.each(['ios', 'android'])('%s — 나갈 때는 빠른 fade spring 으로 흐려지기만 한다', async (os) => {
      (Platform as { OS: string }).OS = os;
      const one = { id: 1, message: '하나' };
      const { rerender } = await renderHost([one]);
      const spring = jest.spyOn(Reanimated, 'withSpring');
      await rerender(<SnackbarHost items={[]} onHide={onHide} />);
      expect(spring).toHaveBeenCalledWith(0, springConfig('fade', 'fast'), expect.any(Function));
      expect(spring).not.toHaveBeenCalledWith(expect.anything(), springConfig('move', 'normal'));
      expect(slotStyle(1)).not.toHaveProperty('height');
    });

    it.each(['ios', 'android'])('%s — 자리가 바뀌면 위치만 옮기고 크기는 바로 맞춘다 — 오버슈트 없음', async (os) => {
      (Platform as { OS: string }).OS = os;
      await renderHost([{ id: 1, message: '하나' }]);
      const layout = slot(1)?.props.layout as LayoutAnimationFunction;
      const spring = jest.spyOn(Reanimated, 'withSpring');
      const values = {
        currentOriginX: 12, currentOriginY: 111, currentWidth: 366, currentHeight: 64,
        targetOriginX: 12, targetOriginY: 47, targetWidth: 366, targetHeight: 72,
        windowWidth: 390, windowHeight: 844,
      } as LayoutAnimationsValues;
      const { initialValues, animations } = layout(values);
      expect(initialValues).toEqual({ originX: 12, originY: 111, width: 366, height: 72 });
      expect(Object.keys(animations).sort()).toEqual(['originX', 'originY']);
      const glide = { ...springConfig('move', 'normal'), overshootClamping: true };
      expect(spring).toHaveBeenCalledWith(47, glide);
      expect(spring).toHaveBeenCalledWith(12, glide);
    });
  });

  it('빠진 스낵바는 흐려지는 동안 마지막 자리에 떠 있고(절대 위치) 흐름 속 자리는 바로 비운다 — 스크린 리더·터치에서도 빠진다', async () => {
    const one = { id: 1, message: '하나' };
    const two = { id: 2, message: '둘' };
    const three = { id: 3, message: '셋' };
    const { rerender } = await renderHost([one, two, three]);
    await layoutSlot(1, { x: 12, y: 47, width: 366, height: 64 });
    await rerender(<SnackbarHost items={[two, three]} onHide={onHide} />);
    expect(screen.queryByText('하나')).toBeNull();
    expect(screen.getByText('하나', { includeHiddenElements: true })).toBeTruthy();
    expect(slot(1)?.props).toMatchObject({ pointerEvents: 'none', accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' });
    expect(slotStyle(1)).toMatchObject({ position: 'absolute', top: 47, left: 12, width: 366 });
    expect(slot(2)?.props).toMatchObject({ pointerEvents: 'box-none', accessibilityElementsHidden: false });
    expect(slotStyle(2).position).toBeUndefined();
    const order = screen.getAllByTestId(/^zs-snackbar-\d+$/, { includeHiddenElements: true }).map((node) => node.props.testID);
    expect(order).toEqual(['zs-snackbar-1', 'zs-snackbar-2', 'zs-snackbar-3']);
    await act(() => jest.advanceTimersByTime(0));
    expect(screen.queryByText('하나', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByText('둘')).toBeTruthy();
  });

  it('자리를 재기 전에 빠지면 흐름 속 자리에 남아 흐려진다', async () => {
    const one = { id: 1, message: '하나' };
    const { rerender } = await renderHost([one, { id: 2, message: '둘' }]);
    await rerender(<SnackbarHost items={[{ id: 2, message: '둘' }]} onHide={onHide} />);
    expect(slot(1)?.props.accessibilityElementsHidden).toBe(true);
    expect(slotStyle(1).position).toBeUndefined();
  });

  it('스낵바가 들고 날 때 남은 스낵바는 다시 그리지 않는다', async () => {
    const one = { id: 1, message: '하나' };
    const two = { id: 2, message: '둘' };
    const { rerender } = await renderHost([one]);
    mockTextRender.mockClear();
    await rerender(<SnackbarHost items={[one, two]} onHide={onHide} />);
    expect(mockTextRender.mock.calls.map(([text]) => text)).toEqual(['둘']);
    mockTextRender.mockClear();
    await rerender(<SnackbarHost items={[two]} onHide={onHide} />);
    expect(mockTextRender.mock.calls.map(([text]) => text)).toEqual(['하나']);
  });

  it('모든 스낵바는 같은 막(흐림 + 흰 80%) 60 캡슐에 먹 글자 — 상태는 앞 아이콘(성공 체크·오류 느낌표)이 말한다', async () => {
    await renderHost([
      { id: 1, message: '기본' },
      { id: 2, message: '성공', type: 'success' },
      { id: 3, message: '실패', type: 'error' },
    ]);
    for (const id of [1, 2, 3]) {
      expect(surface(id)).toMatchObject({ minHeight: SNACKBAR_MIN_HEIGHT, borderRadius: RADIUS.full });
      expect(veilFill(id)?.backgroundColor).toBe(withOpacity(colors.surface1, 0.8));
    }
    expect(queryAllByHostType('BlurView')).toHaveLength(3);
    for (const text of ['기본', '성공', '실패']) expect(textColor(text)).toBe(colors.text);
    expect(StyleSheet.flatten(screen.getByText('기본').props.style)).toMatchObject({ fontSize: 15 });
    expect(screen.queryByTestId('zs-snackbar-icon-success', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId('zs-snackbar-icon-error', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getAllByTestId(/^zs-snackbar-icon-/, { includeHiddenElements: true })).toHaveLength(2);
  });

  it('상태 아이콘은 상태 색 원 안의 on 색 획이고 스크린 리더에서 빠진다 — 문구가 상태를 말한다', async () => {
    await renderHost([{ id: 2, message: '성공', type: 'success' }]);
    const icon = screen.getByTestId('zs-snackbar-icon-success', { includeHiddenElements: true });
    expect(icon.props).toMatchObject({ accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' });
    const fills = icon.queryAll((node) => node.props.fill !== undefined && node.props.fill !== 'none').map((node) => node.props.fill);
    expect(fills).toContain(colors.success);
    const strokes = icon.queryAll((node) => node.props.stroke !== undefined).map((node) => node.props.stroke);
    expect(strokes).toEqual([colors.onSuccess]);
  });

  it('실행 취소는 44 호박 채움 캡슐 + 먹 굵은 글자(상태와 상관없이)', async () => {
    await renderHost([{ id: 3, message: '실패', type: 'error', action: { label: '다시', onPress: jest.fn() } }]);
    const action = styleOf(screen.getByTestId('zs-snackbar-3-action'));
    expect(action).toMatchObject({ height: SNACKBAR_ACTION_HEIGHT, backgroundColor: colors.primary, borderRadius: RADIUS.full });
    expect(textColor('다시')).toBe(colors.onPrimary);
    expect(StyleSheet.flatten(screen.getByText('다시').props.style).fontWeight).toBe('700');
  });

  it('다크도 같은 막(surface3 80%) 위 먹 글자다', async () => {
    const { colors: dark } = setTestTheme({ mode: 'dark' });
    await renderHost([{ id: 1, message: '기본' }]);
    expect(veilFill(1)?.backgroundColor).toBe(withOpacity(dark.surface3, 0.8));
    expect(textColor('기본')).toBe(dark.text);
    setTestTheme();
  });

  it('Android 는 OverlayProvider 가 준 앱 화면 대상이 없으면 흐림 없이 96% 대체 막이다', async () => {
    (Platform as { OS: string }).OS = 'android';
    await renderHost([{ id: 1, message: '기본' }]);
    expect(queryAllByHostType('BlurView')).toHaveLength(0);
    expect(veilFill(1)?.backgroundColor).toBe(withOpacity(colors.surface1, 0.96));
  });

  describe('옆으로 밀어 닫기 — 거리 64 · 속도 500, 양쪽', () => {
    const offsetXOf = (id: number) => (slotStyle(id).transform as { translateX?: number }[])[0]!.translateX;
    let pan: jest.SpyInstance;
    beforeEach(() => {
      pan = jest.spyOn(GestureHandler, 'usePanGesture');
    });

    it('옆으로만 시작하고(8 넘게 밀 때) 세로로 움직이면 실패한다 — 그 전 탭은 문구·실행 취소로 간다', async () => {
      await renderHost([{ id: 1, message: '하나' }]);
      expect(lastSwipe(pan)).toMatchObject({ enabled: true, activeOffsetX: [-SPACE.sm, SPACE.sm], failOffsetY: [-SPACE.lg, SPACE.lg] });
    });

    it('끄는 동안 손가락을 따라 양쪽으로 움직인다', async () => {
      await renderHost([{ id: 1, message: '하나' }]);
      const { onUpdate } = lastSwipe(pan);
      await act(() => onUpdate({ translationX: -30 }));
      await screen.rerender(<SnackbarHost items={[{ id: 1, message: '하나' }]} onHide={onHide} />);
      expect(offsetXOf(1)).toBe(-30);
      await act(() => onUpdate({ translationX: 40 }));
      await screen.rerender(<SnackbarHost items={[{ id: 1, message: '하나' }]} onHide={onHide} />);
      expect(offsetXOf(1)).toBe(40);
    });

    it.each([
      ['오른쪽 거리', { translationX: SNACKBAR_SWIPE_DISTANCE, velocityX: 0 }],
      ['왼쪽 거리', { translationX: -SNACKBAR_SWIPE_DISTANCE, velocityX: 0 }],
      ['속도', { translationX: 10, velocityX: SNACKBAR_SWIPE_VELOCITY }],
    ])('%s 기준을 넘기면 닫는다', async (_label, event) => {
      await renderHost([{ id: 4, message: '닫힘' }]);
      await act(() => lastSwipe(pan).onDeactivate(event));
      await act(() => jest.advanceTimersByTime(0));
      expect(onHide).toHaveBeenCalledWith(4);
    });

    it('덜 밀거나 반대로 튕기면 제자리로 돌아오고 닫지 않는다', async () => {
      const spring = jest.spyOn(Reanimated, 'withSpring');
      await renderHost([{ id: 5, message: '남음' }]);
      await act(() => lastSwipe(pan).onDeactivate({ translationX: SNACKBAR_SWIPE_DISTANCE - 1, velocityX: SNACKBAR_SWIPE_VELOCITY - 1 }));
      await act(() => lastSwipe(pan).onDeactivate({ translationX: 20, velocityX: -SNACKBAR_SWIPE_VELOCITY }));
      await act(() => jest.advanceTimersByTime(0));
      expect(onHide).not.toHaveBeenCalled();
      expect(spring).toHaveBeenLastCalledWith(0, springConfig('move', 'normal'));
    });

    it('나가는 중에는 밀 수 없다', async () => {
      const { rerender } = await renderHost([{ id: 6, message: '나감' }]);
      await rerender(<SnackbarHost items={[]} onHide={onHide} />);
      expect(lastSwipe(pan).enabled).toBe(false);
    });
  });

  it('뜰 때 스크린 리더에 문구를 읽히고, 문구는 누르면 닫히는 버튼이다', async () => {
    await renderHost([{ id: 7, message: '저장했습니다' }]);
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('저장했습니다');
    expect(screen.getByTestId('zs-snackbar-7-message').props).toMatchObject({
      accessibilityRole: 'button',
      accessibilityLabel: '저장했습니다',
      accessibilityHint: DEFAULT_ACCESSIBILITY_LABELS.closeMessage,
    });
  });

  it('동작이 없으면 short 4초·long 10초 뒤 닫는다', async () => {
    await renderHost([{ id: 1, message: '짧게' }, { id: 2, message: '길게', duration: 'long' }]);
    await act(() => jest.advanceTimersByTime(SNACKBAR_DURATION.short - 1));
    expect(onHide).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTime(1));
    expect(onHide).toHaveBeenCalledWith(1);
    await act(() => jest.advanceTimersByTime(SNACKBAR_DURATION.long - SNACKBAR_DURATION.short));
    expect(onHide).toHaveBeenLastCalledWith(2);
    expect(onHide).toHaveBeenCalledTimes(2);
  });

  it('동작이 있으면 시간이 지나도 남고, 동작을 누르면 닫고 onPress 를 부른다', async () => {
    const onPress = jest.fn();
    await renderHost([{ id: 3, message: '보관했습니다', action: { label: '실행 취소', onPress } }]);
    await act(() => jest.advanceTimersByTime(SNACKBAR_DURATION.long * 2));
    expect(onHide).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('zs-snackbar-3-action'));
    expect(onHide).toHaveBeenCalledWith(3);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('문구를 누르면 바로 닫고 동작은 부르지 않는다', async () => {
    const onPress = jest.fn();
    await renderHost([{ id: 4, message: '보관했습니다', action: { label: '실행 취소', onPress } }]);
    await fireEvent.press(screen.getByTestId('zs-snackbar-4-message'));
    expect(onHide).toHaveBeenCalledWith(4);
    expect(onPress).not.toHaveBeenCalled();
  });
});
