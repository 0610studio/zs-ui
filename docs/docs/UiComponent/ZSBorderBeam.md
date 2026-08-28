---
sidebar_position: 17
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSBorderBeam

테두리를 따라 광선(혜성)이 회전하는 장식 컴포넌트입니다. 신규 기능 강조·프리미엄 카드·AI 응답 영역처럼 시선을 끌어야 하는 곳에 사용합니다.

:::info
`@shopify/react-native-skia` 가 peer 의존성으로 필요합니다.
:::

:::warning 웹 미지원
광선 효과는 iOS·Android 전용입니다. 웹에서는 효과 없이 콘텐츠만 렌더링됩니다. 색상, 회전, glow, pulse 애니메이션은 `example`의 실제 iOS·Android 앱에서 확인하세요.
:::

<LocalPlayground example="ZSBorderBeam" />

## 기본 사용법

```tsx
import { ZSBorderBeam, ZSText } from '@0610studio/zs-ui';

<ZSBorderBeam style={{ padding: 20 }}>
  <ZSText typo="body.2">강조하고 싶은 콘텐츠</ZSText>
</ZSBorderBeam>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | `undefined` | 테두리 안에 표시할 콘텐츠 |
| `colors` | `string[]` | `undefined` | sweep gradient 색상 배열 (꼬리 → 머리 순). **지정 시 `colorFrom`·`colorTo` 는 무시됩니다** |
| `colorFrom` | `string` | 테마 `primary.main` | 광선 시작(꼬리) 색상 |
| `colorTo` | `string` | 테마 `secondary.main` | 광선 끝(머리) 색상 |
| `beamLength` | `number` | `0.35` | 광선이 둘레에서 차지하는 비율 (0~1). `1`이면 둘레 전체가 그라디언트 링이 됩니다 |
| `trackColor` | `string` | `colorFrom` 의 12% 알파 | 광선이 지나지 않는 구간의 얇은 기본 테두리. `'none'` 이면 표시하지 않습니다 |
| `glow` | `boolean \| number \| ZSBorderBeamGlowConfig` | `true` | 글로우 강도 (아래 참조) |
| `duration` | `number` | `5000` | 광선이 한 바퀴 도는 시간(ms) |
| `delay` | `number` | `0` | 애니메이션 시작 지연(ms) |
| `reverse` | `boolean` | `false` | 회전 방향 반전 |
| `active` | `boolean` | `true` | `false`면 효과를 숨기고 애니메이션을 정지합니다 |
| `borderWidth` | `number` | `2` | 테두리(광선) 두께 |
| `borderRadius` | `number` | `14` | 테두리 곡률 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## glow 설정

세 가지 형태로 줄 수 있습니다.

| 값 | 동작 |
|----|------|
| `false` 또는 `0` | 글로우 없음 — 선명한 광선만 |
| `0`~`1` 숫자 | 폭·blur·불투명도를 한 번에 스케일 (기본 강도 `0.5`) |
| `ZSBorderBeamGlowConfig` | 항목별 세밀 제어 |

```typescript
interface ZSBorderBeamGlowConfig {
  width?: number;         // 글로우가 stroke 바깥으로 퍼지는 폭(px)
  blur?: number;          // blur 강도
  pulseDuration?: number; // 숨쉬는 한 사이클(ms)
  minOpacity?: number;
  maxOpacity?: number;
}
```

```tsx
{/* 글로우 없이 선명하게 */}
<ZSBorderBeam glow={false}>...</ZSBorderBeam>

{/* 은은하게 */}
<ZSBorderBeam glow={0.2}>...</ZSBorderBeam>

{/* 강하고 느리게 숨쉬도록 */}
<ZSBorderBeam glow={{ width: 12, blur: 8, pulseDuration: 3200, minOpacity: 0.2, maxOpacity: 0.9 }}>
  ...
</ZSBorderBeam>
```

## 특징

- **Skia 렌더링**: sweep gradient 를 Skia 캔버스에 그려 부드러운 광선을 만듭니다
- **숨쉬는 글로우**: 글로우 불투명도가 `pulseDuration` 주기로 오르내립니다
- **레이아웃 자동 추적**: `onLayout` 으로 크기를 측정해 테두리 경로를 다시 계산하므로 콘텐츠 크기가 바뀌어도 따라갑니다
- **정지 시 리소스 해제**: `active={false}` 면 애니메이션을 취소합니다

## 예제

### 색상 지정

```tsx
{/* 두 색 그라디언트 */}
<ZSBorderBeam colorFrom="#6366F1" colorTo="#EC4899" style={{ padding: 20 }}>
  <ZSText typo="body.2">보라 → 분홍</ZSText>
</ZSBorderBeam>

{/* 여러 색 */}
<ZSBorderBeam colors={['#22D3EE', '#6366F1', '#EC4899']} style={{ padding: 20 }}>
  <ZSText typo="body.2">3색 광선</ZSText>
</ZSBorderBeam>
```

### 광선 길이와 속도

```tsx
{/* 짧고 빠른 혜성 */}
<ZSBorderBeam beamLength={0.15} duration={2500}>...</ZSBorderBeam>

{/* 둘레 전체가 회전하는 그라디언트 링 */}
<ZSBorderBeam beamLength={1} duration={8000}>...</ZSBorderBeam>
```

### 조건부 활성화

로딩 중에만 효과를 주고 싶을 때 `active` 로 제어합니다.

```tsx
<ZSBorderBeam active={isGenerating} style={{ padding: 16 }}>
  <ZSText typo="body.3">{isGenerating ? '생성 중…' : answer}</ZSText>
</ZSBorderBeam>
```

### 기본 테두리 숨기기

광선이 지나지 않는 구간까지 완전히 비우려면 `trackColor="none"` 을 줍니다.

```tsx
<ZSBorderBeam trackColor="none" beamLength={0.25}>...</ZSBorderBeam>
```

### 여러 개를 시차 두고 배치

`delay` 로 시작 시점을 어긋나게 하면 리스트가 단조롭지 않습니다.

```tsx
{items.map((item, index) => (
  <ZSBorderBeam key={item.id} delay={index * 400} style={{ padding: 16 }}>
    <ZSText typo="body.2">{item.title}</ZSText>
  </ZSBorderBeam>
))}
```

### 카드 형태

`borderRadius` 는 콘텐츠 컨테이너와 맞춰야 광선 경로가 어긋나지 않습니다.

```tsx
<ZSBorderBeam borderRadius={20} borderWidth={3} style={{ padding: 24, borderRadius: 20 }}>
  <ZSText typo="subTitle.2">프리미엄 플랜</ZSText>
  <ZSText typo="caption.1" color="secondary">모든 기능을 제한 없이</ZSText>
</ZSBorderBeam>
```
