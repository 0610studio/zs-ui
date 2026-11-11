import type { Hinge } from 'expo-hinge';
import type { DevicePosture, DevicePostureName, DisplayFeature, DisplayFeatureObservation, DisplayFeatures } from './types';

export const NO_DISPLAY_FEATURES: DisplayFeatures = { fold: null, occlusions: [] };

function toFeature({ type, x, y, width, height, orientation, active, state }: DisplayFeatureObservation): DisplayFeature {
  return { type, rect: { x, y, width, height }, orientation, active, state };
}

export function resolveDisplayFeatures(observations: DisplayFeatureObservation[] | undefined): DisplayFeatures {
  if (!observations?.length) return NO_DISPLAY_FEATURES;
  const features = observations.map(toFeature);
  return {
    fold: features.find((feature) => feature.type === 'fold') ?? null,
    occlusions: features.filter((feature) => feature.type === 'occlusion'),
  };
}

const halfOpenedPosture = (fold: DisplayFeature): DevicePostureName => (fold.orientation === 'horizontal' ? 'tabletop' : 'book');

function foldPosture(fold: DisplayFeature | null): DevicePostureName {
  if (!fold || fold.state === 'unknown') return 'unknown';
  return fold.state === 'flat' ? 'flat' : halfOpenedPosture(fold);
}

export function resolveDevicePosture({ fold }: DisplayFeatures, hinge: Hinge | null = null): DevicePosture {
  if (!hinge) return { posture: foldPosture(fold), hingeAngle: null };
  const hingeAngle = hinge.angle;
  switch (hinge.status) {
    case 'closed':
      return { posture: 'closed', hingeAngle };
    case 'fullyOpen':
      return { posture: 'flat', hingeAngle };
    case 'partiallyOpen':
      return { posture: fold ? halfOpenedPosture(fold) : 'unknown', hingeAngle };
    default:
      return { posture: foldPosture(fold), hingeAngle };
  }
}

const sameRect = (a: DisplayFeature['rect'], b: DisplayFeature['rect']) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

const sameFeature = (a: DisplayFeature | null, b: DisplayFeature | null): boolean =>
  a === b ||
  (!!a &&
    !!b &&
    a.type === b.type &&
    a.orientation === b.orientation &&
    a.active === b.active &&
    a.state === b.state &&
    sameRect(a.rect, b.rect));

export function isSameDisplayFeatures(a: DisplayFeatures, b: DisplayFeatures): boolean {
  return (
    sameFeature(a.fold, b.fold) &&
    a.occlusions.length === b.occlusions.length &&
    a.occlusions.every((feature, index) => sameFeature(feature, b.occlusions[index] ?? null))
  );
}

export function isSameDevicePosture(a: DevicePosture, b: DevicePosture): boolean {
  return a.posture === b.posture && a.hingeAngle === b.hingeAngle;
}
