// 네이티브 진입점 — 웹은 index.web.tsx 가 대체한다.
// 구현을 ZSBorderBeam.tsx 로 분리한 건 jest 가 web.tsx 를 먼저 해석해서다 (테스트가 명시 import 해야 한다).
export { default } from "./ZSBorderBeam";
export type { ZSBorderBeamProps, ZSBorderBeamGlowConfig } from "./ZSBorderBeam";
