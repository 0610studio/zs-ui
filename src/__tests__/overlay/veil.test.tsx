import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, PixelRatio, Platform, StyleSheet, Text, type HostInstance } from 'react-native';
import type { RefObject } from 'react';
import {
  VEIL_ANDROID_MIN_API,
  VEIL_BLUR,
  VEIL_FALLBACK_OPACITY,
  VEIL_OPACITY,
  Veil,
  VeilScreen,
  VeilTargetContext,
  veilBlur,
  veilColor,
} from '../../overlay/veil';
import { withOpacity } from '../../theme/color';
import { RADIUS } from '../../theme/radius';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string; Version?: number | string };
const a11y = AccessibilityInfo as unknown as {
  isReduceTransparencyEnabled?: jest.Mock;
  mockEmit: (event: string, enabled: boolean) => void;
};
const styleOf = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) ?? {};
const fillLayer = () => queryAllByHostType('View').find((node) => typeof styleOf(node).backgroundColor === 'string' && styleOf(node).borderWidth === undefined)!;
const edgeLayer = () => queryAllByHostType('View').find((node) => styleOf(node).borderWidth !== undefined);
const shadowLayers = () => queryAllByHostType('View').filter((node) => styleOf(node).boxShadow !== undefined);

const target = { current: {} } as unknown as RefObject<HostInstance | null>;

describe('Veil', () => {
  beforeEach(() => {
    a11y.isReduceTransparencyEnabled = jest.fn(() => Promise.resolve(false));
  });
  afterEach(async () => {
    await act(() => a11y.mockEmit('reduceTransparencyChanged', false));
    platform.OS = 'ios';
    platform.Version = undefined;
    setTestTheme();
  });

  describe('흐림 반경 → expo-blur props', () => {
    it('iOS 는 intensity 하나 — veil 22pt → 73, scrim 10pt → 33', () => {
      expect(VEIL_BLUR).toEqual({ veil: 22, inv: 22, scrim: 10 });
      expect(veilBlur('veil', 3)).toEqual({ intensity: 73 });
      expect(veilBlur('scrim', 3)).toEqual({ intensity: 33 });
    });

    it('Android 는 tint 세기를 iOS 와 같은 intensity 로 두고, 반경(px)은 blurReductionFactor 로 dp 표준편차에 맞춘다', () => {
      platform.OS = 'android';
      const { intensity, blurReductionFactor } = veilBlur('veil', 2.625);
      expect(intensity).toBe(73);
      const radiusPx = (intensity / blurReductionFactor!) * 4;
      expect(0.57735 * radiusPx + 0.5).toBeCloseTo(22 * 2.625, 5);
    });
  });

  describe('막 색', () => {
    it('veil 라이트 흰 면(surface1), 다크 떠 있는 면(surface3) · inv 반전 면 · scrim 검정', () => {
      const light = getTestTheme().colors;
      expect(veilColor(light, 'veil', false)).toBe(light.surface1);
      expect(veilColor(light, 'veil', true)).toBe(light.surface3);
      expect(veilColor(light, 'inv', false)).toBe(light.backgroundInverse);
      expect(veilColor(light, 'scrim', true)).toBe(light.backdrop);
    });

    it('불투명도 — veil 80%, inv 88%·다크 92%, scrim 32%·다크 52%. 대체는 막 96%, scrim 48%·다크 60%', () => {
      expect(VEIL_OPACITY).toEqual({ veil: [0.8, 0.8], inv: [0.88, 0.92], scrim: [0.32, 0.52] });
      expect(VEIL_FALLBACK_OPACITY).toEqual({ veil: [0.96, 0.96], inv: [0.96, 0.96], scrim: [0.48, 0.6] });
    });
  });

  describe('iOS', () => {
    it('흐림(light tint) 위에 흰 80% 막, 0.5px 먹 8% 테두리, 떠 있는 그림자(md) 한 겹 — 그림자 층은 면을 칠하지 않는다', async () => {
      const { colors, shadows } = getTestTheme();
      await render(<Veil radius="full" testID="veil" />);
      expect(getByHostType('BlurView').props).toMatchObject({ tint: 'light', intensity: 73 });
      expect(styleOf(getByHostType('BlurView'))).toMatchObject({ borderRadius: RADIUS.full });
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(colors.surface1, 0.8));
      expect(styleOf(edgeLayer()!)).toMatchObject({ borderWidth: StyleSheet.hairlineWidth, borderColor: withOpacity(colors.text, 0.08), borderRadius: RADIUS.full });
      const casters = shadowLayers();
      expect(casters).toHaveLength(1);
      expect(styleOf(casters[0]!)).toMatchObject({ boxShadow: shadows.md.boxShadow, borderRadius: RADIUS.full });
      expect(styleOf(casters[0]!).backgroundColor).toBeUndefined();
      expect(casters[0]!.props.pointerEvents).toBe('none');
    });

    it('다크는 dark tint, surface3 80% 막, 흰(글자색) 10% 테두리', async () => {
      const { colors } = setTestTheme({ mode: 'dark' });
      await render(<Veil />);
      expect(getByHostType('BlurView').props.tint).toBe('dark');
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(colors.surface3, 0.8));
      expect(styleOf(edgeLayer()!).borderColor).toBe(withOpacity(colors.text, 0.1));
    });

    it('scrim 은 테두리·그림자 없이 흐림 10 + 검정 32%(다크 52%)', async () => {
      const { colors } = getTestTheme();
      await render(<Veil kind="scrim" />);
      expect(getByHostType('BlurView').props.intensity).toBe(33);
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(colors.backdrop, 0.32));
      expect(edgeLayer()).toBeUndefined();
      expect(shadowLayers()).toHaveLength(0);
      const dark = setTestTheme({ mode: 'dark' }).colors;
      await render(<Veil kind="scrim" />);
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(dark.backdrop, 0.52));
    });

    it('inv(툴팁) 은 반전 면 88% — 테두리 없이 그림자만', async () => {
      const { colors } = getTestTheme();
      await render(<Veil kind="inv" />);
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(colors.backgroundInverse, 0.88));
      expect(edgeLayer()).toBeUndefined();
      expect(shadowLayers()).toHaveLength(1);
    });

    it("edge='bottom' 은 아래 0.5px 선만, floating={false} 는 그림자를 빼고, 내용(children)은 막 위에 그린다", async () => {
      await render(
        <Veil edge="bottom" floating={false}>
          <Text>내용</Text>
        </Veil>,
      );
      expect(edgeLayer()).toBeUndefined();
      const line = queryAllByHostType('View').find((node) => styleOf(node).height === StyleSheet.hairlineWidth);
      expect(styleOf(line!)).toMatchObject({ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: withOpacity(getTestTheme().colors.text, 0.08) });
      expect(shadowLayers()).toHaveLength(0);
      expect(screen.getByText('내용')).toBeTruthy();
    });

    it('progress 가 있으면 뷰 투명도 대신 막·테두리·그림자 불투명도와 흐림 intensity 를 함께 짙게 한다', async () => {
      const progress = { value: 0.5 } as never;
      await render(<Veil progress={progress} />);
      expect(getByHostType('BlurView').props.intensity).toBeCloseTo(73 * 0.5);
      expect(styleOf(fillLayer()).opacity).toBe(0.5);
      expect(styleOf(edgeLayer()!).opacity).toBe(0.5);
      expect(styleOf(shadowLayers()[0]!).opacity).toBe(0.5);
    });

    it('투명도 줄이기가 켜져 있으면 흐림 없이 96% 대체 막이고, 꺼지면 다시 흐린다', async () => {
      a11y.isReduceTransparencyEnabled = jest.fn(() => Promise.resolve(true));
      const { colors } = getTestTheme();
      await render(<Veil />);
      await act(async () => {});
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(colors.surface1, 0.96));
      await act(() => a11y.mockEmit('reduceTransparencyChanged', false));
      expect(queryAllByHostType('BlurView')).toHaveLength(1);
    });

    it('투명도 줄이기를 한 번 읽으면 새로 뜨는 막은 처음부터 대체 막이다(깜빡이지 않는다)', async () => {
      await render(<Veil />);
      await act(() => a11y.mockEmit('reduceTransparencyChanged', true));
      a11y.isReduceTransparencyEnabled = jest.fn(() => new Promise<boolean>(() => {}));
      await render(<Veil />);
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
    });

    it('투명도 줄이기를 읽는 함수가 없어도(오래된 RN·목업) 흐림으로 그린다', async () => {
      a11y.isReduceTransparencyEnabled = undefined;
      await render(<Veil />);
      expect(queryAllByHostType('BlurView')).toHaveLength(1);
    });

    it('iOS 는 흐릴 대상이 없어도(null) 뒤를 흐린다 — UIVisualEffectView', async () => {
      await render(<Veil blurTarget={null} />);
      expect(getByHostType('BlurView').props.blurTarget).toBeUndefined();
    });
  });

  describe('Android', () => {
    beforeEach(() => {
      platform.OS = 'android';
    });

    it('흐릴 대상이 없으면(화면 안·Modal) 흐림 없이 96% 대체 막이다 — 투명도 줄이기는 읽지 않는다', async () => {
      const { colors } = getTestTheme();
      await render(<Veil />);
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(colors.surface1, 0.96));
      expect(a11y.isReduceTransparencyEnabled).not.toHaveBeenCalled();
    });

    it('대상(BlurTargetView)이 있으면 dimezis(API 31+)로 그 화면을 흐린다', async () => {
      platform.Version = 34;
      await render(<Veil blurTarget={target} />);
      expect(getByHostType('BlurView').props).toMatchObject({
        blurTarget: target,
        blurMethod: 'dimezisBlurViewSdk31Plus',
        intensity: 73,
        blurReductionFactor: veilBlur('veil', PixelRatio.get()).blurReductionFactor,
      });
    });

    it(`API ${VEIL_ANDROID_MIN_API} 아래(Android 11 이하)는 대상이 있어도 대체 막 — scrim 은 48%(다크 60%)`, async () => {
      platform.Version = 30;
      const { colors } = getTestTheme();
      await render(<Veil kind="scrim" blurTarget={target} />);
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(colors.backdrop, 0.48));
      const dark = setTestTheme({ mode: 'dark' }).colors;
      await render(<Veil kind="scrim" blurTarget={target} />);
      expect(styleOf(fillLayer()).backgroundColor).toBe(withOpacity(dark.backdrop, 0.6));
    });

    it('대상을 생략하면 VeilTargetContext(OverlayProvider 의 앱 화면)를 쓰고, null 을 주면 쓰지 않는다', async () => {
      await render(
        <VeilTargetContext.Provider value={target}>
          <Veil testID="from-context" />
        </VeilTargetContext.Provider>,
      );
      expect(getByHostType('BlurView').props.blurTarget).toBe(target);
      await render(
        <VeilTargetContext.Provider value={target}>
          <Veil blurTarget={null} />
        </VeilTargetContext.Provider>,
      );
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
    });

    it('VeilScreen 은 앱 화면을 BlurTargetView 로 감싸고, 그 안 막에는 대상을 주지 않는다 — 자기를 담은 대상을 흐리지 않게', async () => {
      const screenTarget = { current: null } as RefObject<HostInstance | null>;
      await render(
        <VeilTargetContext.Provider value={target}>
          <VeilScreen target={screenTarget}>
            <Veil />
          </VeilScreen>
        </VeilTargetContext.Provider>,
      );
      const wrapper = getByHostType('BlurTargetView');
      expect(styleOf(wrapper)).toEqual({ flex: 1 });
      expect(wrapper.props.forwardedRef).toBe(screenTarget);
      expect(queryAllByHostType('BlurView')).toHaveLength(0);
    });
  });

  it('iOS VeilScreen 은 감싸지 않는다', async () => {
    await render(
      <VeilScreen target={{ current: null }}>
        <Text>화면</Text>
      </VeilScreen>,
    );
    expect(queryAllByHostType('BlurTargetView')).toHaveLength(0);
    expect(screen.getByText('화면')).toBeTruthy();
  });
});
