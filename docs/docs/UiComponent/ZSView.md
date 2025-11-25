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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isAnimation` | `boolean` | `false` | 마운트 시 페이드 애니메이션 적용 여부 |
| `elevationLevel` | `ShadowLevel` | `0` | 그림자 단계 (0~9) |
| `color` | `ViewColorOptions` | `undefined` | 배경색 옵션 (테마 팔레트 기반) |
| `...rest` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 그림자 레벨 (ShadowLevel)

`elevationLevel` 값에 따라 적절한 그림자 스타일이 적용됩니다:

| Level | iOS Shadow | Android Elevation |
|-------|------------|-------------------|
| 0 | 없음 | 0 |
| 1-9 | 얕음 → 깊음 | 1-9 |

## 배경색 옵션 (ViewColorOptions)

테마 팔레트 기반의 배경색을 사용할 수 있습니다:

- `layer1`, `layer2`, `neutral`, `base`
- `primary`, `primary.5`, `primary.10`, ..., `primary.100`
- `danger`, `danger.5`, ..., `danger.100`
- `warning`, `warning.5`, ..., `warning.100`
- `success`, `success.5`, ..., `success.100`
- `information`, `information.5`, ..., `information.100`
- `grey.5`, `grey.10`, ..., `grey.100`

## 예제

### 기본 사용

```tsx
import { ZSView } from '@0610studio/zs-ui';

<ZSView style={{ padding: 20 }}>
  <Text>기본 뷰</Text>
</ZSView>
```

### 그림자 적용

```tsx
import { ZSView } from '@0610studio/zs-ui';

<ZSView elevationLevel={3} style={{ padding: 20, borderRadius: 10 }}>
  <Text>그림자가 있는 카드</Text>
</ZSView>
```

### 애니메이션 효과

```tsx
import { ZSView } from '@0610studio/zs-ui';

<ZSView isAnimation={true} elevationLevel={2}>
  <Text>페이드 인 애니메이션</Text>
</ZSView>
```

### 배경색 지정

```tsx
import { ZSView } from '@0610studio/zs-ui';

<ZSView color="layer1" elevationLevel={1}>
  <Text>레이어 배경색</Text>
</ZSView>

<ZSView color="primary.main" elevationLevel={2}>
  <Text>Primary 색상 배경</Text>
</ZSView>
```

### React Native View 속성 사용

```tsx
import { ZSView } from '@0610studio/zs-ui';

<ZSView
  elevationLevel={2}
  style={{ padding: 20, borderRadius: 10 }}
  onLayout={(event) => {
    console.log('Layout:', event.nativeEvent.layout);
  }}
>
  <Text>모든 View 속성 사용 가능</Text>
</ZSView>
```
