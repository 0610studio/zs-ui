---
sidebar_position: 0
---

# ZSView

기본 `View` 컴포넌트에 그림자와 애니메이션 효과를 손쉽게 적용할 수 있는 래퍼 컴포넌트입니다. 내부적으로 `AnimatedWrapper`를 사용하여 플랫폼별 그림자를 처리합니다.

## 기본 사용법

```tsx
import { ZSView } from '@0610studio/zs-ui';

<ZSView elevationLevel={2} style={{ padding: 20 }}>
  <Text>내용</Text>
</ZSView>
```

## Props

| 이름 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `isAnimation` | `boolean` | `false` | 마운트 시 페이드 애니메이션 적용 여부 |
| `elevationLevel` | `ShadowLevel` | `0` | 그림자 단계 (0~9) |
| `...rest` | `ViewProps` | - | React Native `View`의 기본 속성 |

`elevationLevel` 값에 따라 적절한 그림자 스타일이 적용되며, 필요에 따라 애니메이션 효과도 함께 사용할 수 있습니다.
