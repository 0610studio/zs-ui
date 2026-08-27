---
sidebar_position: 6
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
| `pressedBackgroundColor` | `string` | 테마 `grey[50]` + 10% 투명도 | 눌렸을 때 버튼의 배경 색상 |
| `pressedBackgroundBorderRadius` | `number` | `16` | 눌렸을 때의 버튼의 둥근 모서리 반경 |
| `isAnimation` | `boolean` | `true` | 버튼에 애니메이션 효과를 적용할지 여부 |
| `elevationLevel` | `ShadowLevel` | `undefined` | 버튼의 그림자 깊이를 설정 (0~9 단계) |
| `fullWidth` | `boolean` | `false` | 버튼이 부모 요소의 전체 너비를 차지하도록 설정 |
| `color` | `ViewColorOptions` | `undefined` | 배경색 옵션 (테마 팔레트 기반) |
| `isLoading` | `boolean` | `false` | `true`일 때 클릭/롱클릭이 비활성화되고 버튼이 흐리게 표시됩니다. |
| `preventDoublePress` | `boolean` | `false` | `true`일 때 기본 디바운스(300ms) 대신 2초 잠금을 적용합니다. 결제·제출처럼 중복 실행이 위험한 액션에 사용합니다 |
| `disabled` | `boolean` | `false` | `true`일 때 클릭/롱클릭이 비활성화되고 버튼이 흐리게 표시됩니다. |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **스케일 애니메이션**: 눌렸을 때 0.96배로 축소되는 애니메이션 효과
- **배경색 변경**: 눌렸을 때 배경색이 변경되는 시각적 피드백
- **연타 방어 기본 내장**: 마지막 press 이후 **300ms** 동안 재호출을 무시합니다. `onPress`·`onLongPress` 가 이 잠금을 공유합니다
- **그림자 지원**: `elevationLevel`로 `boxShadow` 기반 그림자 적용 (iOS·Android 동일 렌더)
- **전체 너비 모드**: `fullWidth`로 전체 너비 버튼 구성 가능

## 중복 실행 방지

`ZSPressable` 은 기본적으로 마지막 press 이후 300ms 동안 재호출을 무시합니다. 결제·주문 제출처럼 두 번 실행되면 안 되는 액션에는 `preventDoublePress` 로 잠금을 2초로 늘립니다.

```tsx
<ZSPressable preventDoublePress onPress={submitOrder}>
  <ZSText typo="body.2">결제하기</ZSText>
</ZSPressable>
```

`ZSPressable` 을 쓰지 않는 커스텀 버튼에는 같은 잠금을 `usePreventDoublePress` 훅으로 직접 적용할 수 있습니다.

```tsx
import { usePreventDoublePress } from '@0610studio/zs-ui';

const handleSubmit = usePreventDoublePress(submitOrder);        // 기본 2000ms
const handleSearch = usePreventDoublePress(search, 500);        // 간격 직접 지정

<Pressable onPress={handleSubmit} />
```

## 예제

테마 색상과 롱클릭을 함께 사용하는 변형 예시입니다.

```tsx
<ZSPressable
  color="primary.50"
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
