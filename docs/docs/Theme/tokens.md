---
sidebar_position: 5
---

# 공통 토큰과 유틸리티

ZS-ui 컴포넌트가 함께 사용하는 모서리, 모션, 비활성 상태와 그림자 기준입니다. 앱에서 ZS-ui 컴포넌트와 나란히 배치하는 커스텀 UI에도 같은 값을 적용할 수 있습니다.

## 토큰

```tsx
import { RADIUS, DURATION, DISABLED_OPACITY } from '@0610studio/zs-ui';
```

| Export | 용도 |
|---|---|
| `RADIUS` | 컴포넌트 모서리 반경 단계 |
| `DURATION` | 상태 변화와 진입 애니메이션 시간 |
| `DISABLED_OPACITY` | 비활성 컴포넌트의 공통 투명도 |

토큰은 개별 화면에서 비슷한 숫자를 새로 만드는 대신, ZS-ui 컴포넌트와 시각적 리듬을 맞춰야 할 때 사용합니다.

## 그림자 생성

`createShadow`는 React Native 그림자 속성과 테마 색상을 `boxShadow` 값 배열(`BoxShadowValue[]`)로 변환합니다.

```tsx
import { createShadow, useTheme } from '@0610studio/zs-ui';

const { palette } = useTheme();
const cardShadow = createShadow(
  {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  palette.grey[100],
);
```

일반적인 카드와 오버레이는 `ZSView`의 `elevationLevel`을 먼저 사용하고, 임의의 오프셋이나 블러가 필요한 경우에만 `createShadow`를 사용하세요.

## 중복 실행 방지

`usePreventDoublePress`는 결제나 제출처럼 중복 호출을 막아야 하는 액션에 사용합니다. 기본 잠금 시간은 `PREVENT_DOUBLE_PRESS_INTERVAL`로 확인할 수 있습니다.

```tsx
import {
  PREVENT_DOUBLE_PRESS_INTERVAL,
  usePreventDoublePress,
} from '@0610studio/zs-ui';

const handleSubmit = usePreventDoublePress(
  () => submitForm(),
  PREVENT_DOUBLE_PRESS_INTERVAL,
);
```

일반 버튼의 짧은 연타 방어는 `ZSPressable`에 내장되어 있습니다. 더 긴 잠금이 필요한 경우 `ZSBlockButton`의 `preventDoublePress` 또는 이 훅을 사용하세요.

## 관련 문서

- [Palette](./palette)
- [Typography](./typography)
- [ZSView](../UiComponent/ZSView)
- [ZSPressable](../UiComponent/ZSPressable)
