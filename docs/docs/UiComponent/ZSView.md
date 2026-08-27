---
sidebar_position: 0
---

# ZSView

기본 `View` 컴포넌트에 그림자와 애니메이션 효과를 손쉽게 적용할 수 있는 래퍼 컴포넌트입니다. 내부적으로 `AnimatedWrapper`를 사용해 `boxShadow` 기반 그림자를 처리하므로 iOS·Android 가 동일하게 렌더됩니다.

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

`elevationLevel` 값에 따라 적절한 그림자 스타일이 적용됩니다. 레벨별 오프셋·블러와 테마의 `elevationShadow` 색상을 합쳐 **단일 `boxShadow`** 로 렌더하므로, `elevation` 을 쓰던 방식과 달리 Android 에서도 그림자 색상이 그대로 반영됩니다.

| Level | boxShadow | 용도 |
|-------|-----------|------|
| 0 | 없음 | 그림자 없는 평면 |
| 1-3 | 얕음 (offsetY 1, blur 1~2.2) | 카드·리스트 행 |
| 4-6 | 중간 (offsetY 2~3, blur 2.6~4.7) | 떠 있는 카드 |
| 7-9 | 깊음 (offsetY 4~8, blur 4.7~5.8) | 다이얼로그·시트 |

그림자 색상은 테마 모드에 따라 바뀝니다 — 라이트는 검정 계열, 다크는 흰색 계열입니다.

임의의 오프셋·블러가 필요하면 `createShadow` 헬퍼로 직접 만들 수 있습니다.

```tsx
import { createShadow, useTheme } from '@0610studio/zs-ui';

const { palette } = useTheme();
const shadow = createShadow(
  { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  palette.grey[100],
);

<View style={{ boxShadow: shadow }} />
```

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

<ZSView color="primary.50" elevationLevel={2}>
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
