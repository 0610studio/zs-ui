---
sidebar_position: 20
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# AnimatedWrapper

React Native `View`에 진입·퇴장 애니메이션, 테마 배경색, elevation 그림자를 함께 적용하는 저수준 래퍼입니다. `ZSView`가 내부에서 사용하는 기반 컴포넌트이며, 애니메이션 시간을 직접 제어해야 할 때 사용합니다.

일반적인 테마 카드와 레이아웃에는 API가 더 단순한 [ZSView](./ZSView)를 우선 사용하세요.

<LocalPlayground example="AnimatedWrapper" height={780} />

## 기본 사용법

```tsx
import { AnimatedWrapper, ZSText } from '@0610studio/zs-ui';

<AnimatedWrapper
  isAnimation
  duration={240}
  color="primary.10"
  elevationLevel={3}
  style={{ borderRadius: 16, padding: 20 }}
>
  <ZSText typo="body.2">애니메이션 카드</ZSText>
</AnimatedWrapper>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isAnimation` | `boolean` | `true` | `true`면 `FadeInDown` 진입과 `FadeOut` 퇴장 애니메이션 적용 |
| `duration` | `number` | `200` | 진입 애니메이션 시간(ms) |
| `elevationLevel` | `ShadowLevel` | `0` | 테마 그림자 단계(0~9) |
| `color` | `ViewColorOptions` | `undefined` | 테마 팔레트 기반 배경색 |
| `children` | `React.ReactNode` | `undefined` | 내부 콘텐츠 |
| `...props` | `ViewProps` | - | React Native `View` 속성 |

## 애니메이션 없이 사용

`isAnimation={false}`면 Reanimated 진입·퇴장 효과 없이 일반 `View`로 렌더링하면서 배경색과 elevation 스타일은 유지합니다.

```tsx
<AnimatedWrapper isAnimation={false} color="layer1" elevationLevel={2}>
  <Content />
</AnimatedWrapper>
```

## 선택 기준

| 요구사항 | 권장 API |
|----------|----------|
| 테마 배경과 그림자만 필요 | `ZSView` |
| 진입 애니메이션 on/off만 필요 | `ZSView isAnimation` |
| 애니메이션 시간을 직접 지정 | `AnimatedWrapper` |

