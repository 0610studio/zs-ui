import React from 'react';
import { render, renderHook, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useHeaderInset } from '../../navigation/useHeaderInset';
import { ZSHeaderBackground } from '../../navigation/ZSHeaderBackground';
import { HeaderFillContext } from '../../navigation/headerFill';
import { withOpacity } from '../../theme/color';
import { mixHex } from '../../ui/hexColor';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };
const withHeader = (height: number) => ({ children }: { children: React.ReactNode }) => (
  <HeaderHeightContext.Provider value={height}>{children}</HeaderHeightContext.Provider>
);
const scrims = () => queryAllByHostType('View');
const scrimStyle = () => StyleSheet.flatten(nth(scrims(), 0).props.style);

describe('투명 헤더 상단 여백·바탕 (Android)', () => {
  afterEach(() => {
    platform.OS = 'ios';
    jest.restoreAllMocks();
  });

  describe('useHeaderInset', () => {
    it('Android 는 네이티브 Stack 헤더 높이(상태바 포함)를 돌려준다', async () => {
      platform.OS = 'android';
      const { result } = await renderHook(() => useHeaderInset(), { wrapper: withHeader(80) });
      expect(result.current).toBe(80);
    });

    it('iOS 는 0 — UIKit 이 스크롤 inset·safe area 로 내비게이션 바를 비켜 준다', async () => {
      const { result } = await renderHook(() => useHeaderInset(), { wrapper: withHeader(100) });
      expect(result.current).toBe(0);
    });

    it('Stack 화면 밖이면 0', async () => {
      platform.OS = 'android';
      const { result } = await renderHook(() => useHeaderInset());
      expect(result.current).toBe(0);
    });
  });

  describe('ZSHeaderBackground — 멈추면 투명, 스크롤되면 흐림 막(zs-ui)', () => {
    const { colors } = getTestTheme();
    const styleOf = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) ?? {};
    const veilFill = () => scrims().map(styleOf).find((style) => typeof style.backgroundColor === 'string' && style.height === undefined);
    const bottomLine = () => scrims().map(styleOf).find((style) => style.height === StyleSheet.hairlineWidth);

    beforeEach(() => {
      platform.OS = 'android';
      jest
        .spyOn(Reanimated, 'interpolateColor')
        .mockImplementation(((value: number, _input: readonly number[], output: readonly string[]) => (value >= 1 ? output[1] : output[0])) as typeof Reanimated.interpolateColor);
    });
    afterEach(() => {
      (Platform as { Version?: number }).Version = undefined;
      setTestTheme();
    });

    const renderScrim = (props: React.ComponentProps<typeof ZSHeaderBackground>) => render(<ZSHeaderBackground {...props} />, { wrapper: withHeader(80) });
    const settle = (props: React.ComponentProps<typeof ZSHeaderBackground>) => screen.rerender(<ZSHeaderBackground {...props} />);

    it('헤더 높이(상태바 포함)만큼 터치를 막지 않는 덮개를 깔고, 스크롤 전에는 투명하다(막 0)', async () => {
      await renderScrim({});
      expect(scrims()[0]?.props.pointerEvents).toBe('none');
      expect(scrimStyle()).toEqual({ position: 'absolute', top: 0, left: 0, right: 0, height: 80 });
      expect(veilFill()?.opacity).toBe(0);
      expect(bottomLine()?.opacity).toBe(0);
    });

    it('스크롤되면 막(흰 면) + 아래 0.5px 선이 나타나고, 맨 위로 오면 사라진다 — 흐릴 대상이 없으면 96% 대체 막', async () => {
      await renderScrim({ scrolled: true });
      await settle({ scrolled: true });
      expect(veilFill()).toMatchObject({ backgroundColor: withOpacity(colors.surface1, 0.96), opacity: 1 });
      expect(bottomLine()).toMatchObject({ bottom: 0, backgroundColor: withOpacity(colors.text, 0.08), opacity: 1 });
      expect(scrims().some((node) => styleOf(node).boxShadow !== undefined)).toBe(false);
      await settle({ scrolled: false });
      await settle({ scrolled: false });
      expect(veilFill()?.opacity).toBe(0);
    });

    it('다크는 떠 있는 면(surface3) 막에 흰(글자색) 10% 선이다', async () => {
      const { colors: dark } = setTestTheme({ mode: 'dark' });
      await renderScrim({ scrolled: true });
      expect(veilFill()?.backgroundColor).toBe(withOpacity(dark.surface3, 0.96));
      expect(bottomLine()?.backgroundColor).toBe(withOpacity(dark.text, 0.1));
    });

    it('scrolledColor 를 주면 막 대신 그 단색으로 채우고, height 를 직접 줄 수 있다', async () => {
      await renderScrim({ color: '#ffffff', scrolledColor: '#000000', scrolled: true, height: 60 });
      expect(scrimStyle()).toMatchObject({ height: 60, backgroundColor: '#000000' });
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
      await renderScrim({ color: '#ffffff', scrolledColor: '#000000', scrolled: false });
      expect(scrimStyle().backgroundColor).toBe('#ffffff');
    });

    it('iOS 는 그리지 않는다 — 시스템 스크롤 가장자리 효과가 맡는다', async () => {
      platform.OS = 'ios';
      await renderScrim({ height: 100 });
      expect(scrims()).toHaveLength(0);
    });

    it('Stack 화면 밖(헤더 없음)이면 그리지 않는다', async () => {
      await render(<ZSHeaderBackground />);
      expect(scrims()).toHaveLength(0);
    });

    describe('탭 레일 위 칸 알림(HeaderFillContext)', () => {
      const withSink = (report: jest.Mock, height = 80) => ({ children }: { children: React.ReactNode }) => (
        <HeaderHeightContext.Provider value={height}>
          <HeaderFillContext.Provider value={report}>{children}</HeaderFillContext.Provider>
        </HeaderHeightContext.Provider>
      );

      it('그리는 동안 진행 값과 양 끝 색(막을 화면 바탕 위에 얹은 단색)을 알리고, 사라지면 null 을 알린다', async () => {
        const report = jest.fn();
        const { colors: dark } = setTestTheme({ mode: 'dark' });
        await render(<ZSHeaderBackground color={dark.background} />, { wrapper: withSink(report) });
        expect(report).toHaveBeenLastCalledWith({ progress: expect.objectContaining({ value: 0 }), from: dark.background, to: mixHex(dark.surface3, dark.background, 0.96) });
        await screen.unmount();
        expect(report).toHaveBeenLastCalledWith(null);
      });

      it('라이트 흰 화면 위 흰 막은 색이 그대로다(from = to), scrolledColor 면 그 색을 알린다', async () => {
        const report = jest.fn();
        await render(<ZSHeaderBackground color={colors.surface1} />, { wrapper: withSink(report) });
        expect(report).toHaveBeenLastCalledWith(expect.objectContaining({ from: colors.surface1, to: colors.surface1 }));
        await render(<ZSHeaderBackground color={colors.surface1} scrolledColor="#123456" />, { wrapper: withSink(report) });
        expect(report).toHaveBeenLastCalledWith(expect.objectContaining({ to: '#123456' }));
      });

      it('그리지 않으면(iOS·헤더 없음) 알리지 않는다', async () => {
        const report = jest.fn();
        platform.OS = 'ios';
        await render(<ZSHeaderBackground />, { wrapper: withSink(report) });
        platform.OS = 'android';
        await render(<ZSHeaderBackground />, { wrapper: withSink(report, 0) });
        expect(report).not.toHaveBeenCalled();
      });
    });

    describe('blurTarget — 그 콘텐츠를 흐려 막 아래에 깐다', () => {
      const target = { current: null };

      it('dimezis(API 31+)로 흐리고 막은 흰 80% — 흐림이 있어 대체(96%)보다 옅다', async () => {
        await renderScrim({ color: colors.surface1, blurTarget: target, scrolled: true });
        expect(getByHostType('BlurView').props).toMatchObject({ blurTarget: target, blurMethod: 'dimezisBlurViewSdk31Plus', tint: 'light' });
        expect(veilFill()?.backgroundColor).toBe(withOpacity(colors.surface1, 0.8));
        expect(nth(scrims(), 0).props.pointerEvents).toBe('none');
        expect(scrimStyle()).toMatchObject({ position: 'absolute', top: 0, height: 80 });
      });

      it('스크롤 전에는 흐림 intensity는 안전 하한 1·막은 0 이고 스크롤되면 짙어진다 — 뷰 투명도는 쓰지 않는다', async () => {
        await renderScrim({ blurTarget: target });
        expect(getByHostType('BlurView').props.intensity).toBe(1);
        expect(veilFill()?.opacity).toBe(0);
        expect(scrimStyle().opacity).toBeUndefined();
        await settle({ blurTarget: target, scrolled: true });
        await settle({ blurTarget: target, scrolled: true });
        expect(getByHostType('BlurView').props.intensity).toBeGreaterThan(0);
        expect(veilFill()?.opacity).toBe(1);
      });

      it('다크 모드는 dark tint 다', async () => {
        setTestTheme({ mode: 'dark' });
        await renderScrim({ blurTarget: target });
        expect(getByHostType('BlurView').props.tint).toBe('dark');
      });

      it('Android 11 이하는 대상이 있어도 대체 막(96%)이다', async () => {
        (Platform as { Version?: number }).Version = 30;
        await renderScrim({ blurTarget: target, scrolled: true });
        expect(queryAllByHostType('BlurView')).toHaveLength(0);
        expect(veilFill()?.backgroundColor).toBe(withOpacity(colors.surface1, 0.96));
      });

      it('iOS 는 blurTarget 이 있어도 그리지 않는다', async () => {
        platform.OS = 'ios';
        await renderScrim({ blurTarget: target });
        expect(scrims()).toHaveLength(0);
        expect(queryAllByHostType('BlurView')).toHaveLength(0);
      });
    });
  });
});
