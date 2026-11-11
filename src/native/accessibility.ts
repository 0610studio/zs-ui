import { useEffect } from 'react';
import { accessibilityHint, accessibilityLabel } from '@expo/ui/swift-ui/modifiers';

export function overridesLabel(name: string | undefined, label: string | undefined): name is string {
  return name !== undefined && name !== label;
}

export function swiftUIAccessibility(label: string | undefined, name: string | undefined, hint: string | undefined) {
  return [...(overridesLabel(name, label) ? [accessibilityLabel(name)] : []), ...(hint ? [accessibilityHint(hint)] : [])];
}

const warnedComponents = new Set<string>();

export function useUnnamedControlWarning(component: string, label: string | undefined, name: string | undefined) {
  const unnamed = !label && !name;
  useEffect(() => {
    if (!__DEV__ || !unnamed || warnedComponents.has(component)) return;
    warnedComponents.add(component);
    console.warn(`[zs-ui] ${component}: label 도 accessibilityLabel 도 없어 스크린 리더가 이름 없이 읽습니다 — 옆에 보이는 라벨 문구를 accessibilityLabel 로 넘겨 주세요.`);
  }, [component, unnamed]);
}
