---
sidebar_position: 4
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# ZSPressable

커스텀 스타일과 애니메이션이 적용된 프레서블 컴포넌트입니다. 클릭/롱클릭 이벤트를 다루고, 배경색·그림자·애니메이션 옵션을 간단히 조합할 수 있습니다.

<ExpoSnack id="@studio0610/zs-ui_13_zspressable" />

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
| `isLoading` | `boolean` | `false` | `true`일 때 클릭/롱클릭이 비활성화되고 버튼이 흐리게 표시됩니다. |
| `disabled` | `boolean` | `false` | `true`일 때 클릭/롱클릭이 비활성화되고 버튼이 흐리게 표시됩니다. |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **스케일 애니메이션**: 눌렸을 때 0.96배로 축소되는 애니메이션 효과
- **배경색 변경**: 눌렸을 때 배경색이 변경되는 시각적 피드백
- **그림자 지원**: `elevationLevel`로 플랫폼별 그림자 효과 적용
- **전체 너비 모드**: `fullWidth`로 전체 너비 버튼 구성 가능

## 예제

테마 색상과 롱클릭을 함께 사용하는 변형 예시입니다.

```tsx
<ZSPressable
  color="primary.main"
  elevationLevel={2}
  onPress={() => console.log('Pressed')}
  onLongPress={() => console.log('Long Pressed')}
  style={{ padding: 20 }}
>
  <ZSText typo="body.2" color="white">
    테마 액션 버튼
  </ZSText>
</ZSPressable>
```
