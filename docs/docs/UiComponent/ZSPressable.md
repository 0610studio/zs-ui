---
sidebar_position: 4
---

# ZSPressable

커스텀 스타일과 애니메이션이 적용된 프레서블 컴포넌트입니다. 사용자의 클릭 및 롱클릭 이벤트를 다루며, 배경 색상, 애니메이션 효과, 그림자 레벨 등을 쉽게 설정할 수 있도록 설계되었습니다.

## 기본 사용법

```tsx
import { ZSPressable, ZSText } from '@0610studio/zs-ui';

<ZSPressable
  onPress={() => console.log('Pressed')}
  style={{
    padding: 20,
    borderRadius: 10,
  }}
>
  <ZSText typo="body.2">버튼</ZSText>
</ZSPressable>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `(value?: any) => void` | `undefined` | 버튼 클릭 시 실행될 콜백 함수 |
| `onLongPress` | `(value?: any) => void` | `undefined` | 버튼을 길게 누를 때 실행될 콜백 함수 |
| `pressedBackgroundColor` | `string` | `'rgba(180, 180, 180, 0.1)'` | 눌렸을 때 버튼의 배경 색상 |
| `pressedBackgroundBorderRadius` | `number` | `16` | 눌렸을 때의 버튼의 둥근 모서리 반경 |
| `isAnimation` | `boolean` | `true` | 버튼에 애니메이션 효과를 적용할지 여부 |
| `elevationLevel` | `ShadowLevel` | `undefined` | 버튼의 그림자 깊이를 설정 (0~9 단계) |
| `fullWidth` | `boolean` | `false` | 버튼이 부모 요소의 전체 너비를 차지하도록 설정 |
| `color` | `ViewColorOptions` | `undefined` | 배경색 옵션 (테마 팔레트 기반) |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **스케일 애니메이션**: 눌렀을 때 0.96배로 축소되는 애니메이션 효과
- **배경색 변경**: 눌렀을 때 배경색이 변경되는 시각적 피드백
- **그림자 지원**: `elevationLevel`을 통해 플랫폼별 그림자 효과 적용
- **전체 너비 모드**: `fullWidth` prop으로 전체 너비 사용 가능

- **스케일 애니메이션**: 눌렀을 때 0.96배로 축소되는 애니메이션 효과
- **배경색 변경**: 눌렀을 때 배경색이 변경되는 시각적 피드백
- **그림자 지원**: `elevationLevel`을 통해 플랫폼별 그림자 효과 적용
- **전체 너비 모드**: `fullWidth` prop으로 전체 너비 사용 가능

## 예제

### 기본 사용

```tsx
<ZSPressable
  onPress={() => console.log('Pressed')}
  style={{ padding: 20, backgroundColor: '#f0f0f0' }}
>
  <ZSText typo="body.2">기본 버튼</ZSText>
</ZSPressable>
```

### 전체 너비 버튼

```tsx
<ZSPressable
  fullWidth
  onPress={() => console.log('Pressed')}
  style={{ padding: 20 }}
>
  <ZSText typo="body.2" style={{ textAlign: 'center' }}>
    전체 너비 버튼
  </ZSText>
</ZSPressable>
```

### 그림자 효과

```tsx
<ZSPressable
  elevationLevel={3}
  onPress={() => console.log('Pressed')}
  style={{ padding: 20, borderRadius: 10 }}
>
  <ZSText typo="body.2">그림자 효과</ZSText>
</ZSPressable>
```

### 롱 프레스

```tsx
<ZSPressable
  onPress={() => console.log('Pressed')}
  onLongPress={() => console.log('Long Pressed')}
  style={{ padding: 20 }}
>
  <ZSText typo="body.2">롱 프레스 지원</ZSText>
</ZSPressable>
```

### 커스텀 배경색

```tsx
<ZSPressable
  onPress={() => console.log('Pressed')}
  pressedBackgroundColor="rgba(0, 122, 255, 0.2)"
  pressedBackgroundBorderRadius={20}
  style={{ padding: 20 }}
>
  <ZSText typo="body.2">커스텀 배경색</ZSText>
</ZSPressable>
```

### 애니메이션 비활성화

```tsx
<ZSPressable
  isAnimation={false}
  onPress={() => console.log('Pressed')}
  style={{ padding: 20 }}
>
  <ZSText typo="body.2">애니메이션 없음</ZSText>
</ZSPressable>
```

### 테마 색상 사용

```tsx
<ZSPressable
  color="primary.main"
  elevationLevel={2}
  onPress={() => console.log('Pressed')}
  style={{ padding: 20 }}
>
  <ZSText typo="body.2" color="white">
    테마 색상 배경
  </ZSText>
</ZSPressable>
```
