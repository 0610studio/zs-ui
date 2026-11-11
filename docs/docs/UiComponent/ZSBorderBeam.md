# ZSBorderBeam

테두리를 따라 광선(혜성)이 회전하는 장식 컴포넌트입니다. 신규 기능 강조·프리미엄 카드·AI 응답 영역처럼 시선을 끌어야 하는 곳에 씁니다.

## 기본 사용법

```tsx
import { View } from 'react-native';
import { ZSBorderBeam, ZSText } from '@0610studio/zs-ui';

<ZSBorderBeam>
  <View style={{ padding: 20 }}>
    <ZSText>강조하고 싶은 콘텐츠</ZSText>
  </View>
</ZSBorderBeam>
```

광선은 `children`을 감싼 영역의 테두리를 따라 돕니다. 안쪽 여백은 `style`이 아니라 `children` 쪽 뷰에 줍니다 — `style`에 `padding`을 주면 광선 경로가 콘텐츠와 어긋납니다.

## Props — `ZSBorderBeamProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `React.ReactNode` | `undefined` | 테두리 안에 표시할 콘텐츠 |
| `colors` | `string[]` | `undefined` | sweep gradient 색 배열(꼬리 → 머리 순). 두 개 이상 주면 `colorFrom`·`colorTo`는 무시합니다 |
| `colorFrom` | `string` | `colors.primary` | 광선 시작(꼬리) 색 |
| `colorTo` | `string` | `colors.tertiary` | 광선 끝(머리) 색 |
| `beamLength` | `number` | `0.35` | 광선이 둘레에서 차지하는 비율(0~1). `1`이면 둘레 전체가 그라디언트 링이 됩니다 |
| `trackColor` | `string` | `colorFrom`의 12% 알파 | 광선이 지나지 않는 구간의 얇은 기본 테두리. `'none'`이면 그리지 않습니다 |
| `glow` | `boolean \| number \| ZSBorderBeamGlowConfig` | `true` | 글로우 — [글로우](#글로우--glow) |
| `duration` | `number` | `5000` | 광선이 한 바퀴 도는 시간(ms) |
| `delay` | `number` | `0` | 애니메이션 시작 지연(ms) |
| `reverse` | `boolean` | `false` | 회전 방향 반전 |
| `active` | `boolean` | `true` | `false`면 효과를 숨기고 애니메이션을 멈춥니다 |
| `borderWidth` | `number` | `2` | 테두리(광선) 두께 |
| `borderRadius` | `number` | `16`(`RADIUS.lg`) | 모서리 반경. iOS는 내용과 광선을 모두 연속 곡률(`borderCurve: 'continuous'`)로 그립니다. `style`에 `borderRadius`를 주면 같은 값으로 맞춰야 광선 경로가 어긋나지 않습니다 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `...props` | `ViewProps` | `undefined` | React Native `View` 기본 속성 |

`ZSBorderBeamProps`·`ZSBorderBeamGlowConfig` 타입을 내보냅니다.

## 글로우 — `glow`

| 값 | 동작 |
|----|------|
| `false` 또는 `0` | 글로우 없음 — 선명한 광선만 |
| `0`~`1` 숫자 | 폭·blur·불투명도를 한 번에 조절(`true`는 `0.5`) |
| `ZSBorderBeamGlowConfig` | 항목별로 조절 |

```tsx
interface ZSBorderBeamGlowConfig {
  width?: number;
  blur?: number;
  pulseDuration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}
```

```tsx
<ZSBorderBeam glow={false}>...</ZSBorderBeam>
<ZSBorderBeam glow={0.2}>...</ZSBorderBeam>
<ZSBorderBeam glow={{ width: 12, blur: 8, pulseDuration: 3200, minOpacity: 0.2, maxOpacity: 0.9 }}>...</ZSBorderBeam>
```

## 접근성

시스템 '동작 줄이기'가 켜져 있으면 회전과 글로우 맥동을 멈춥니다(HIG Accessibility).

## 관련 문서

- [ZSSkeleton](./ZSSkeleton) — 같은 Skia 기반 효과
- [색 역할](../Theme/colors)
