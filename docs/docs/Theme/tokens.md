# 토큰

zs-ui 컴포넌트가 함께 쓰는 간격·모서리·모션·상태·터치 영역·그림자 기준입니다. 커스텀 UI에도 같은 값을 쓰면 zs-ui 컴포넌트와 모양이 맞습니다.

## 간격 — `SPACE`

4pt 격자 간격(pt·dp)입니다. zs-ui 컴포넌트의 안쪽 여백·사이 간격이 이 값을 씁니다.

| 토큰 | 값 |
|------|----|
| `xxs` | 2 |
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `2xl` | 24 |
| `3xl` | 32 |

```tsx
import { View } from 'react-native';
import { SPACE } from '@0610studio/zs-ui';

<View style={{ paddingHorizontal: SPACE.xl, gap: SPACE.sm }} />;
```

`SpaceToken` 타입(`SPACE`의 키)을 내보냅니다.

## 모서리 — `RADIUS` · `radiusStyle`

모서리 반경(pt·dp)입니다.

| 토큰 | 값 | M3 shape scale |
|------|----|----------------|
| `none` | 0 | none |
| `xs` | 4 | extraSmall |
| `sm` | 8 | small |
| `md` | 12 | medium |
| `lg` | 16 | large |
| `xl` | 20 | largeIncreased |
| `2xl` | 28 | extraLarge |
| `3xl` | 32 | extraLargeIncreased |
| `4xl` | 48 | extraExtraLarge |
| `full` | 9999 | full |

숫자로 시작하는 키는 `RADIUS['2xl']`처럼 대괄호로 읽습니다.

| 토큰 | zs-ui 쓰임 |
|------|-----------|
| `full` | `ZSButton`·`ZSChip`·`ZSSegmentedControl`·스낵바·Android 떠 있는 탭 바 |
| `md` (12) | `ZSTooltip` |
| `lg` (16) | `ZSTextField`·Android `ZSSelect` 필드·`ZSCard` 기본·iOS 진행 표시 상자 |
| `xl` (20) | `ZSBanner` |
| `3xl` (32) | Alert |

`radiusStyle(token)`은 모서리 스타일을 반환합니다. iOS는 시스템 컨트롤과 같은 연속 곡률(`borderCurve: 'continuous'`)을 함께 넣습니다(`none`·`full` 제외).

```tsx
import { View } from 'react-native';
import { radiusStyle, useTheme } from '@0610studio/zs-ui';

const { colors } = useTheme();
<View style={[radiusStyle('lg'), { backgroundColor: colors.surface3, padding: 16 }]} />;
```

`RadiusToken` 타입(`RADIUS`의 키)을 내보냅니다.

## 모션 — spring · timing

위치·크기가 바뀌는 움직임(`move`)은 spring, 색·투명도가 바뀌는 움직임(`fade`)은 오버슈트 없는 spring 또는 짧은 timing을 씁니다. 모든 설정은 시스템 '동작 줄이기'를 따릅니다(켜져 있으면 끝값으로 바로 갑니다).

### `springConfig`

```ts
function springConfig(kind: MotionKind, speed?: MotionSpeed): WithSpringConfig;
```

```tsx
import { withSpring } from 'react-native-reanimated';
import { springConfig } from '@0610studio/zs-ui';

offset.value = withSpring(target, springConfig('move', 'fast'));
```

| 플랫폼 | 값 |
|--------|----|
| iOS | SwiftUI 기본 spring(`spring(duration: 0.5, bounce: 0)`)을 normal로 — `duration: IOS_SPRING_DURATION[speed]`, `dampingRatio: 1`. `fade`는 항상 fast(350ms) |
| Android | `ANDROID_SPRING[kind][speed]`의 `dampingRatio`·`stiffness`(Compose ExpressiveMotionTokens). `mass: 1`, `damping = dampingRatio × 2√stiffness` |

### `IOS_SPRING_DURATION`

`{ fast: 350, normal: 500, slow: 700 }`(ms). normal은 SwiftUI 기본값이고 fast·slow는 zs-ui가 정한 값입니다(HIG에 숫자 토큰이 없습니다).

### `ANDROID_SPRING`

| kind | fast | normal | slow |
|------|------|--------|------|
| `move` (M3 spatial, 오버슈트 있음) | 0.6 / 800 | 0.8 / 380 | 0.8 / 200 |
| `fade` (M3 effects, 오버슈트 없음) | 1 / 3800 | 1 / 1600 | 1 / 800 |

(dampingRatio / stiffness)

### `timingConfig` · `DURATION`

페이드처럼 시간 기반이 필요한 `fade` 움직임에 씁니다. `DURATION`은 `{ fast: 150, normal: 200, slow: 300 }`(ms)입니다.

```tsx
import { withTiming } from 'react-native-reanimated';
import { timingConfig } from '@0610studio/zs-ui';

opacity.value = withTiming(1, timingConfig('fast'));
```

`MotionKind`·`MotionSpeed` 타입을 내보냅니다.

## 상태 — `OPACITY`

M3 상태 레이어·비활성 불투명도입니다. [`withOpacity`](./colors#withopacity)와 함께 씁니다.

| 키 | 값 | 용도 |
|----|----|------|
| `disabled` | 0.38 | 비활성 글자·아이콘 (`text` 38%) |
| `disabledBackground` | 0.12 | 비활성 배경·외곽선 (`text` 12%) |
| `hover` | 0.08 | |
| `focus` | 0.1 | |
| `pressed` | 0.1 | 누름 표시 (`ZSPressable`) |
| `dragged` | 0.16 | |
| `backdrop` | 0.32 | 모달 뒤를 덮는 `backdrop` 색 |
| `disabledView` | 0.5 | 안쪽 색을 모르는 영역 전체를 흐리게 합니다(zs-ui 값). 색을 아는 컴포넌트는 `disabled`·`disabledBackground`를 씁니다 |

```tsx
const { colors } = useTheme();
const disabledText = withOpacity(colors.text, OPACITY.disabled);
```

## 최소 터치 영역 — `MIN_TOUCH_TARGET`

`{ ios: 44, android: 48 }` — iOS 44pt, Android 48dp. `ZSPressable`은 보이는 크기가 이보다 작으면 `hitSlop`을 자동으로 넓혀 이 크기를 채웁니다.

## 그림자 — shadow

그림자 단계입니다. 높이(dp)는 M3 elevation 0~5 단계 값 그대로입니다. 표면 높낮이는 `surface1`~`surface5`로 먼저 나타내고, 그림자는 툴팁·떠 있는 카드처럼 실제로 떠 있는 요소에만 씁니다.

| 토큰 | `none` | `xs` | `sm` | `md` | `lg` | `xl` |
|------|--------|------|------|------|------|------|
| `SHADOW` (dp) | 0 | 1 | 3 | 6 | 8 | 12 |
| M3 elevation 단계 | 0 | 1 | 2 | 3 | 4 | 5 |

- `useTheme().shadows[token]`은 `{ boxShadow }` 스타일입니다(`none`은 빈 객체). `ZSBox shadow`가 이 값을 씁니다.
- `createShadows(colors)`는 `shadow` 색으로 단계별 스타일(`ShadowStyles`)을 만듭니다. `colors`에 `background`가 있고 어두운 바탕이면 다크 불투명도(아래)를 씁니다.
- `shadowFor(dp, shadowColor)`는 dp 높이를 key·ambient 두 겹 `BoxShadowValue[]`로 바꿉니다. 단계에 없는 높이가 필요할 때 씁니다.

```tsx
import { View } from 'react-native';
import { shadowFor, useTheme } from '@0610studio/zs-ui';

const { colors, shadows } = useTheme();

<View style={[{ backgroundColor: colors.surface1, borderRadius: 16 }, shadows.sm]} />;
<View style={{ boxShadow: shadowFor(4, colors.shadow) }} />;
```

`ShadowToken`(`'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`)·`ShadowStyles` 타입을 내보냅니다.

## 관련 문서

- [색 역할](./colors)
- [ZSBox](../UiComponent/ZSBox) — `shadow`
- [ZSPressable](../UiComponent/ZSPressable) — 누름 표시·최소 터치 영역·`usePreventDoublePress`
