---
sidebar_position: 12
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# ZSSkeleton & ZSSkeletonBox

로딩 상태를 시각적으로 표현하기 위한 스켈레톤 UI 컴포넌트입니다. `ZSSkeleton`은 기존 컴포넌트에 shimmer 효과를 적용하는 래퍼 컴포넌트이고, `ZSSkeletonBox`는 고정 높이의 박스 형태 스켈레톤 컴포넌트입니다. React Native Reanimated를 사용하여 부드러운 애니메이션 효과를 제공합니다.

<ExpoSnack id="@studio0610/zs-ui_13_zsskeleton" />

## ZSSkeleton

기존 컴포넌트를 감싸서 로딩 상태일 때 shimmer 효과를 적용하는 래퍼 컴포넌트입니다. `isFetching` prop을 통해 로딩 상태를 제어할 수 있습니다.

### 기본 사용법

```tsx
import { ZSSkeleton, ZSText } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ZSSkeleton isFetching={true}>
      <ZSText typo="heading.1">로딩 중인 텍스트</ZSText>
    </ZSSkeleton>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isFetching` | `boolean` | `undefined` | 로딩 상태 여부. `true`일 때 shimmer 효과가 적용됩니다 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너의 추가 스타일 |
| `children` | `React.ReactNode` | `undefined` | 스켈레톤 효과를 적용할 자식 컴포넌트 |
| `overlayColor` | `string` | 테마 `background.base` | shimmer 효과의 오버레이 색상 |

### 특징

- **조건부 렌더링**: `isFetching`이 `false`일 때는 자식 컴포넌트를 그대로 렌더링합니다
- **Shimmer 애니메이션**: 로딩 중일 때 좌우로 이동하는 shimmer 효과가 적용됩니다
- **테마 통합**: 테마 시스템과 통합되어 기본 색상이 자동으로 적용됩니다
- **유연한 사용**: 어떤 컴포넌트든 감싸서 스켈레톤 효과를 적용할 수 있습니다

## ZSSkeletonBox

고정 높이의 박스 형태 스켈레톤 컴포넌트입니다. 항상 shimmer 효과가 적용되며, 다양한 크기와 스타일의 스켈레톤 박스를 만들 수 있습니다.

### 기본 사용법

```tsx
import { ZSSkeletonBox } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ZSSkeletonBox height={100} />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | Required | 스켈레톤 박스의 높이 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 박스의 추가 스타일 |
| `overlayColor` | `string` | 테마 `background.layer1` | shimmer 효과의 오버레이 색상 |
| `color` | `ViewColorOptions` | `'neutral'` | 박스의 배경색 (테마 팔레트 기반) |

### 배경색 옵션 (ViewColorOptions)

테마 팔레트 기반의 배경색을 사용할 수 있습니다:

- `layer1`, `layer2`, `neutral`, `base`
- `primary`, `primary.5`, `primary.10`, ..., `primary.100`
- `danger`, `danger.5`, ..., `danger.100`
- `warning`, `warning.5`, ..., `warning.100`
- `success`, `success.5`, ..., `success.100`
- `information`, `information.5`, ..., `information.100`
- `grey.5`, `grey.10`, ..., `grey.100`

### 특징

- **고정 높이**: `height` prop으로 정확한 높이를 지정할 수 있습니다
- **지속적인 애니메이션**: 항상 shimmer 효과가 적용되어 로딩 상태를 명확하게 표현합니다
- **테마 통합**: `ZSView`를 기반으로 하여 테마 시스템과 완전히 통합됩니다
- **다양한 형태**: `style` prop을 통해 원형, 둥근 모서리 등 다양한 형태로 커스터마이징 가능합니다

## 예제

### ZSSkeleton 기본 사용

```tsx
import { ZSSkeleton, ZSText } from '@0610studio/zs-ui';
import { useState } from 'react';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ZSSkeleton isFetching={isLoading}>
      <ZSText typo="heading.1">로딩 중인 제목</ZSText>
    </ZSSkeleton>
  );
}
```

### ZSSkeleton 다양한 타이포그래피

```tsx
<ZSSkeleton isFetching={true}>
  <ZSText typo="heading.1">큰 제목</ZSText>
</ZSSkeleton>

<ZSSkeleton isFetching={true}>
  <ZSText typo="heading.3">중간 제목</ZSText>
</ZSSkeleton>

<ZSSkeleton isFetching={true}>
  <ZSText typo="heading.6">작은 제목</ZSText>
</ZSSkeleton>
```

### ZSSkeleton 조건부 렌더링

```tsx
function DataComponent({ data, isLoading }) {
  return (
    <ZSSkeleton isFetching={isLoading}>
      {data ? (
        <ZSText typo="body.2">{data.title}</ZSText>
      ) : (
        <ZSText typo="body.2">데이터 없음</ZSText>
      )}
    </ZSSkeleton>
  );
}
```

### ZSSkeleton 커스텀 오버레이 색상

```tsx
<ZSSkeleton 
  isFetching={true} 
  overlayColor="#f0f0f0"
>
  <ZSText typo="body.2">커스텀 색상 스켈레톤</ZSText>
</ZSSkeleton>
```

### ZSSkeletonBox 기본 사용

```tsx
import { ZSSkeletonBox } from '@0610studio/zs-ui';

<ZSSkeletonBox height={100} />
<ZSSkeletonBox height={50} />
<ZSSkeletonBox height={200} />
```

### ZSSkeletonBox 다양한 형태

```tsx
{/* 직사각형 박스 */}
<ZSSkeletonBox height={100} style={{ borderRadius: 10 }} />

{/* 원형 박스 */}
<ZSSkeletonBox height={80} style={{ borderRadius: 40, width: 80 }} />

{/* 둥근 모서리 박스 */}
<ZSSkeletonBox height={50} style={{ borderRadius: 25 }} />
```

### ZSSkeletonBox 배경색 변경

```tsx
<ZSSkeletonBox height={100} color="layer1" />
<ZSSkeletonBox height={100} color="primary.main" />
<ZSSkeletonBox height={100} color="grey.20" />
```

### ZSSkeletonBox 커스텀 스타일

```tsx
<ZSSkeletonBox 
  height={120} 
  style={{ 
    borderRadius: 15, 
    marginVertical: 10,
    width: '90%' 
  }} 
/>
```

### 실제 사용 예제

```tsx
import { ZSSkeleton, ZSSkeletonBox, ZSText, ZSView } from '@0610studio/zs-ui';

function CardSkeleton({ isLoading }) {
  return (
    <ZSView style={{ padding: 20, borderRadius: 10 }}>
      <ZSSkeleton isFetching={isLoading}>
        <ZSText typo="heading.2">카드 제목</ZSText>
      </ZSSkeleton>
      
      <ZSSkeletonBox 
        height={150} 
        style={{ borderRadius: 8, marginTop: 10 }} 
      />
      
      <ZSSkeleton isFetching={isLoading}>
        <ZSText typo="body.2" style={{ marginTop: 10 }}>
          카드 설명 텍스트
        </ZSText>
      </ZSSkeleton>
    </ZSView>
  );
}
```

### 리스트 아이템 스켈레톤

```tsx
function ListItemSkeleton() {
  return (
    <ZSView style={{ flexDirection: 'row', padding: 15 }}>
      <ZSSkeletonBox 
        height={60} 
        style={{ borderRadius: 30, width: 60 }} 
      />
      <ZSView style={{ marginLeft: 15, flex: 1 }}>
        <ZSSkeletonBox height={20} style={{ borderRadius: 4, marginBottom: 8 }} />
        <ZSSkeletonBox height={16} style={{ borderRadius: 4, width: '70%' }} />
      </ZSView>
    </ZSView>
  );
}
```

