# ZSPressable

누를 수 있는 영역입니다. 누름 표시는 플랫폼 관례를 따르고, 보이는 크기가 작아도 터치 영역은 최소 크기를 채우며, 연타를 막는 쓰로틀이 들어 있습니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS | `pressedColor` 10% 하이라이트를 위에 덮습니다. 누르는 순간 바로 켜지고, 손을 떼면 fade spring([모션 토큰](../Theme/tokens#모션--spring--timing))으로 사라집니다 |
| Android | ripple(M3 상태 레이어) — `pressedColor` 10% |

## 기본 사용법

```tsx
import { ZSPressable, ZSText } from '@0610studio/zs-ui';

<ZSPressable radius="lg" backgroundColor="surface4" style={{ padding: 20 }} onPress={openDetail}>
  <ZSText>상세 보기</ZSText>
</ZSPressable>
```

## Props — `ZSPressableProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `onPress` | `() => void` | `undefined` | 누를 때 |
| `onLongPress` | `() => void` | `undefined` | 길게 누를 때 |
| `backgroundColor` | `ColorName \| string` | `undefined` | 배경 색 역할 또는 직접 지정한 색 |
| `radius` | `RadiusToken` | `'none'` | 모서리. 누름 표시도 이 모양으로 잘립니다 |
| `pressedColor` | `ColorName \| string` | `'text'` | 누름 표시 색 — 색 역할 이름 또는 직접 지정한 색 |
| `loading` | `boolean` | `false` | 처리 중 — 누를 수 없고 흐리게 보이며 `busy` 상태를 알립니다 |
| `preventDoublePress` | `boolean` | `false` | `true`면 2초간 중복 실행을 막습니다(결제·제출) — [중복 실행 방지](#중복-실행-방지) |
| `disabled` | `boolean` | `false` | 누를 수 없고 50%로 흐리게 보입니다 |
| `hitSlop` | `Insets \| number` | 자동 | 주지 않으면 [최소 터치 영역](#최소-터치-영역)을 채우도록 넓힙니다 |
| `accessibilityRole` | `AccessibilityRole` | `'button'` | |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `...props` | `PressableProps` | `undefined` | React Native `Pressable` 속성(`style`·`children` 함수 형태 제외) |

`ZSPressableProps` 타입을 내보냅니다.

## 최소 터치 영역

보이는 크기가 iOS 44pt·Android 48dp(`MIN_TOUCH_TARGET`)보다 작으면 `hitSlop`을 자동으로 넓혀 그 크기를 채웁니다. 작은 아이콘 버튼도 따로 계산하지 않습니다.

```tsx
<ZSPressable radius="full" accessibilityLabel="닫기" onPress={close} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
  <CloseIcon size={14} />
</ZSPressable>
```

## 중복 실행 방지

- 기본: 처음 누름은 바로 실행하고 300ms 안의 연타는 버립니다. `onPress`·`onLongPress`가 같은 잠금을 씁니다.
- `preventDoublePress`: 2초(`PREVENT_DOUBLE_PRESS_INTERVAL`) 동안 다시 실행하지 않습니다.

버튼 밖에서 같은 잠금이 필요하면 `usePreventDoublePress`를 씁니다. 첫 호출만 통과시키고 `interval`(기본 `PREVENT_DOUBLE_PRESS_INTERVAL`, 2000ms) 동안 다시 부르지 않습니다. 돌려주는 핸들러는 identity가 고정되고, `onPress`가 없으면 `undefined`를 반환합니다.

```tsx
import { PREVENT_DOUBLE_PRESS_INTERVAL, usePreventDoublePress } from '@0610studio/zs-ui';

const handleSubmit = usePreventDoublePress(() => submitForm(), PREVENT_DOUBLE_PRESS_INTERVAL);

<Pressable onPress={handleSubmit} />;
```

## 관련 문서

- [ZSButton](./ZSButton) — 라벨이 있는 버튼
- [토큰](../Theme/tokens) — `OPACITY`·`MIN_TOUCH_TARGET`·`RADIUS`
