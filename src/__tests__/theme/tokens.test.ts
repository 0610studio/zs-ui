import { Platform } from 'react-native';
import { radiusStyle } from '../../theme/radius';
import { ANDROID_SPRING, DURATION, IOS_SPRING_DURATION, springConfig, timingConfig } from '../../theme/motion';

const platform = Platform as { OS: string };

afterEach(() => {
  platform.OS = 'ios';
});

describe('radiusStyle()', () => {
  it('iOS 는 둥근 모서리에 연속 곡률(continuous)을 붙인다', () => {
    expect(radiusStyle('md')).toEqual({ borderRadius: 12, borderCurve: 'continuous' });
    expect(radiusStyle('3xl')).toEqual({ borderRadius: 32, borderCurve: 'continuous' });
  });

  it('iOS 도 none·full(캡슐)은 곡률을 붙이지 않는다', () => {
    expect(radiusStyle('none')).toEqual({ borderRadius: 0 });
    expect(radiusStyle('full')).toEqual({ borderRadius: 9999 });
  });

  it('Android 는 반지름만 준다', () => {
    platform.OS = 'android';
    expect(radiusStyle('md')).toEqual({ borderRadius: 12 });
  });
});

describe('springConfig()', () => {
  it('Android 는 M3 Expressive spring(감쇠비·강성)을 Reanimated damping 으로 바꾼다', () => {
    platform.OS = 'android';
    const { dampingRatio, stiffness } = ANDROID_SPRING.move.normal;
    expect(springConfig('move')).toEqual({ mass: 1, stiffness, damping: dampingRatio * 2 * Math.sqrt(stiffness), reduceMotion: 'system' });
    const fast = springConfig('fade', 'fast');
    expect(fast.damping).toBeCloseTo(2 * Math.sqrt(3800));
    expect(springConfig('move', 'slow').stiffness).toBe(200);
  });

  it('iOS 는 bounce 0 spring 을 길이로 정한다 — fade 는 항상 빠르다', () => {
    expect(springConfig('move')).toEqual({ duration: IOS_SPRING_DURATION.normal, dampingRatio: 1, reduceMotion: 'system' });
    expect(springConfig('move', 'slow').duration).toBe(700);
    expect(springConfig('fade', 'slow').duration).toBe(IOS_SPRING_DURATION.fast);
  });
});

describe('timingConfig()', () => {
  it('페이드 등 시간 기반 효과 길이에 시스템 동작 줄이기를 붙인다', () => {
    expect(timingConfig()).toEqual({ duration: DURATION.normal, reduceMotion: 'system' });
    expect(timingConfig('fast')).toEqual({ duration: 150, reduceMotion: 'system' });
    expect(timingConfig('slow').duration).toBe(300);
  });
});
