import { Platform } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import type { LayoutAnimationsValues } from 'react-native-reanimated';
import { enterTransition, exitTransition, layoutTransition } from '../../overlay/transitions';
import { springConfig, timingConfig } from '../../theme/motion';

const platform = Platform as { OS: string };

const values = {
  currentOriginX: 0, currentOriginY: 80, currentWidth: 300, currentHeight: 40,
  targetOriginX: 10, targetOriginY: 20, targetWidth: 320, targetHeight: 60,
  windowWidth: 390, windowHeight: 844,
} as LayoutAnimationsValues;

describe('overlay transitions — motion 토큰으로 만든 진입·퇴장·레이아웃 전환', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    platform.OS = 'ios';
  });

  describe.each(['ios', 'android'])('%s', (os) => {
    beforeEach(() => {
      platform.OS = os;
    });

    it('진입 — 투명도는 fade spring, 위치는 move spring(같은 빠르기)으로 제자리에 온다', () => {
      const spring = jest.spyOn(Reanimated, 'withSpring');
      const enter = enterTransition({ translateY: -16, speed: 'fast' });
      const { initialValues, animations } = (enter as () => Reanimated.LayoutAnimation)();
      expect(initialValues).toEqual({ opacity: 0, transform: [{ translateY: -16 }] });
      expect(animations).toEqual({ opacity: 1, transform: [{ translateY: 0 }] });
      expect(spring).toHaveBeenCalledWith(1, springConfig('fade', 'fast'));
      expect(spring).toHaveBeenCalledWith(0, springConfig('move', 'fast'));
    });

    it('진입 기본값 — 제자리에서 normal 빠르기로 나타난다', () => {
      const spring = jest.spyOn(Reanimated, 'withSpring');
      const { initialValues } = (enterTransition() as () => Reanimated.LayoutAnimation)();
      expect(initialValues).toEqual({ opacity: 0, transform: [{ translateY: 0 }] });
      expect(spring).toHaveBeenCalledWith(1, springConfig('fade', 'normal'));
      expect(spring).toHaveBeenCalledWith(0, springConfig('move', 'normal'));
    });

    it('퇴장 — timing fast 로 흐려지며 비켜 간다', () => {
      const timing = jest.spyOn(Reanimated, 'withTiming');
      const { initialValues, animations } = (exitTransition({ translateY: 4 }) as () => Reanimated.LayoutAnimation)();
      expect(initialValues).toEqual({ opacity: 1, transform: [{ translateY: 0 }] });
      expect(animations).toEqual({ opacity: 0, transform: [{ translateY: 4 }] });
      expect(timing).toHaveBeenCalledWith(0, timingConfig('fast'));
      expect(timing).toHaveBeenCalledWith(4, timingConfig('fast'));
    });

    it('퇴장 기본값 — 제자리에서 흐려지기만 한다', () => {
      const { animations } = (exitTransition() as () => Reanimated.LayoutAnimation)();
      expect(animations).toEqual({ opacity: 0, transform: [{ translateY: 0 }] });
    });

    it('레이아웃 — 위치만 move spring 으로 옮기고 크기는 처음부터 새 값이다', () => {
      const spring = jest.spyOn(Reanimated, 'withSpring');
      const { initialValues, animations } = layoutTransition()(values);
      expect(initialValues).toEqual({ originX: 0, originY: 80, width: 320, height: 60 });
      expect(animations).toEqual({ originX: 10, originY: 20 });
      expect(spring).toHaveBeenCalledWith(10, springConfig('move', 'normal'));
      expect(spring).toHaveBeenCalledWith(20, springConfig('move', 'normal'));
    });

    it('레이아웃 — 넘겨준 spring 설정(예: 오버슈트 막기)을 그대로 쓴다', () => {
      const spring = jest.spyOn(Reanimated, 'withSpring');
      const config = { ...springConfig('move', 'normal'), overshootClamping: true };
      layoutTransition(config)(values);
      expect(spring).toHaveBeenCalledWith(20, config);
    });
  });
});
