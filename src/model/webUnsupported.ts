import { Platform } from "react-native";

export const IS_WEB = Platform.OS === "web";

const warned = new Set<string>();

/** 웹 미지원 효과가 웹에서 렌더링될 때 개발 모드에서 컴포넌트당 1회만 경고 */
export function warnWebUnsupported(componentName: string): void {
  if (!__DEV__ || warned.has(componentName)) return;
  warned.add(componentName);
  console.warn(
    `[zs-ui] ${componentName}의 Skia 기반 효과는 웹을 지원하지 않습니다. 효과 없이 렌더링됩니다.`
  );
}
