// 네이티브 진입점 — 웹은 index.web.tsx가 대체한다 (웹 번들에서 skia 제외).
// 구현을 ZSBorderBeam.tsx로 분리한 이유: jest(jest-expo node preset)가 web.tsx를
// tsx보다 먼저 해석하므로, 네이티브 테스트가 구현 파일을 명시적으로 import할 수 있어야 한다.
export { default } from "./ZSBorderBeam";
export type { ZSBorderBeamProps, ZSBorderBeamGlowConfig } from "./ZSBorderBeam";
