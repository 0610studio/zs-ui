import {
  isSameDevicePosture,
  isSameDisplayFeatures,
  NO_DISPLAY_FEATURES,
  resolveDevicePosture,
  resolveDisplayFeatures,
} from '../../layout/displayFeatures';
import type { DisplayFeatureObservation } from '../../layout/types';

const fold = (overrides: Partial<DisplayFeatureObservation> = {}): DisplayFeatureObservation => ({
  type: 'fold',
  x: 374.86,
  y: 0,
  width: 0,
  height: 832,
  orientation: 'vertical',
  state: 'flat',
  active: false,
  ...overrides,
});

describe('displayFeatures', () => {
  it('관찰값이 없거나 비면 접힘선 없음', () => {
    expect(resolveDisplayFeatures(undefined)).toBe(NO_DISPLAY_FEATURES);
    expect(resolveDisplayFeatures([])).toBe(NO_DISPLAY_FEATURES);
  });

  it('접힘선은 rect 로 묶고, 가림 영역은 따로 모은다', () => {
    const features = resolveDisplayFeatures([
      fold(),
      { type: 'occlusion', x: 180, y: 0, width: 40, height: 30, orientation: 'horizontal', state: 'unknown', active: true },
    ]);
    expect(features.fold).toEqual({
      type: 'fold',
      rect: { x: 374.86, y: 0, width: 0, height: 832 },
      orientation: 'vertical',
      active: false,
      state: 'flat',
    });
    expect(features.occlusions).toHaveLength(1);
    expect(features.occlusions[0]?.rect).toEqual({ x: 180, y: 0, width: 40, height: 30 });
  });

  it.each([
    ['flat', 'vertical', 'flat'],
    ['halfOpened', 'vertical', 'book'],
    ['halfOpened', 'horizontal', 'tabletop'],
    ['unknown', 'vertical', 'unknown'],
  ] as const)('접힘선 %s·%s → 자세 %s', (state, orientation, posture) => {
    expect(resolveDevicePosture(resolveDisplayFeatures([fold({ state, orientation })]))).toEqual({ posture, hingeAngle: null });
  });

  it('접힘선이 없으면(커버 화면·일반 기기) 자세를 알 수 없다', () => {
    expect(resolveDevicePosture(NO_DISPLAY_FEATURES)).toEqual({ posture: 'unknown', hingeAngle: null });
  });

  describe('아이폰 듀오 힌지 (expo-hinge)', () => {
    it.each([
      ['closed', 2, 'closed'],
      ['fullyOpen', 180, 'flat'],
      ['unknown', 45, 'unknown'],
    ] as const)('힌지 %s(%i°) → 자세 %s, 각도는 그대로', (status, angle, posture) => {
      expect(resolveDevicePosture(NO_DISPLAY_FEATURES, { status, angle })).toEqual({ posture, hingeAngle: angle });
    });

    it.each([
      ['vertical', 'book'],
      ['horizontal', 'tabletop'],
    ] as const)('반쯤 열림 + %s 접힘선 → %s', (orientation, posture) => {
      const features = resolveDisplayFeatures([fold({ orientation, state: 'unknown' })]);
      expect(resolveDevicePosture(features, { status: 'partiallyOpen', angle: 95 })).toEqual({ posture, hingeAngle: 95 });
    });

    it('반쯤 열림인데 접힘선 방향을 모르면 기기 형태를 추측하지 않는다', () => {
      expect(resolveDevicePosture(NO_DISPLAY_FEATURES, { status: 'partiallyOpen', angle: 95 })).toEqual({ posture: 'unknown', hingeAngle: 95 });
    });

    it('힌지 상태가 접힘선 상태보다 우선한다 — 듀오의 접힘선에는 상태가 없다', () => {
      const flatFold = resolveDisplayFeatures([fold({ state: 'flat' })]);
      expect(resolveDevicePosture(flatFold, { status: 'closed', angle: 0 }).posture).toBe('closed');
    });

    it('힌지가 없으면(null) 접힘선으로 정한다 — 힌지 각도 센서가 없는 Android 기기', () => {
      const halfOpened = resolveDisplayFeatures([fold({ state: 'halfOpened' })]);
      expect(resolveDevicePosture(halfOpened, null)).toEqual({ posture: 'book', hingeAngle: null });
    });
  });

  describe('Android 힌지 (expo-hinge 58.0.1 — 각도 센서 + FoldingFeature 상태)', () => {
    it('펼침은 FoldingFeature FLAT → fullyOpen → flat, 각도는 센서 값', () => {
      const flatFold = resolveDisplayFeatures([fold({ state: 'flat' })]);
      expect(resolveDevicePosture(flatFold, { status: 'fullyOpen', angle: 180 })).toEqual({ posture: 'flat', hingeAngle: 180 });
    });

    it('반쯤 접힘은 접힘선 방향으로 book·tabletop', () => {
      const halfOpened = resolveDisplayFeatures([fold({ orientation: 'horizontal', state: 'halfOpened' })]);
      expect(resolveDevicePosture(halfOpened, { status: 'partiallyOpen', angle: 100 })).toEqual({ posture: 'tabletop', hingeAngle: 100 });
    });

    it('접힌 커버 화면은 closed 를 보내지 않는다 — 각도로 추측하지 않고 unknown, 각도는 그대로', () => {
      expect(resolveDevicePosture(NO_DISPLAY_FEATURES, { status: 'unknown', angle: 0 })).toEqual({ posture: 'unknown', hingeAngle: 0 });
    });

    it('힌지 상태를 모르면 접힘선 상태로 정한다 — 두 신호가 엇갈려 도착해도 자세가 unknown 으로 튀지 않는다', () => {
      const halfOpened = resolveDisplayFeatures([fold({ state: 'halfOpened' })]);
      expect(resolveDevicePosture(halfOpened, { status: 'unknown', angle: 92 })).toEqual({ posture: 'book', hingeAngle: 92 });
    });
  });

  it('같은 값 비교 — rect·상태·가림 영역까지', () => {
    const a = resolveDisplayFeatures([fold()]);
    expect(isSameDisplayFeatures(a, resolveDisplayFeatures([fold()]))).toBe(true);
    expect(isSameDisplayFeatures(a, resolveDisplayFeatures([fold({ state: 'halfOpened', active: true })]))).toBe(false);
    expect(isSameDisplayFeatures(a, resolveDisplayFeatures([fold({ x: 375 })]))).toBe(false);
    expect(isSameDisplayFeatures(a, NO_DISPLAY_FEATURES)).toBe(false);
    expect(isSameDisplayFeatures(NO_DISPLAY_FEATURES, { fold: null, occlusions: [] })).toBe(true);
    expect(isSameDevicePosture({ posture: 'book', hingeAngle: null }, { posture: 'book', hingeAngle: null })).toBe(true);
    expect(isSameDevicePosture({ posture: 'book', hingeAngle: 90 }, { posture: 'book', hingeAngle: 91 })).toBe(false);
  });
});
