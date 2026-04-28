---
sidebar_position: 7
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# ZSSwitch

애니메이션이 적용된 토글 스위치 컴포넌트입니다. React Native Reanimated를 사용하여 부드러운 전환 효과를 제공합니다.

<ExpoSnack id="@studio0610/zs-ui_13_zsswitch" />

## 기본 사용법

```tsx
import { ZSSwitch } from '@0610studio/zs-ui';
import { useState } from 'react';

function MyComponent() {
  const [isActive, setIsActive] = useState(false);

  return (
    <ZSSwitch
      isActive={isActive}
      onToggle={() => setIsActive(!isActive)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isActive` | `boolean` | `false` | 스위치의 활성화 상태 |
| `onToggle` | `() => void` | Required | 토글 시 호출되는 함수 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 스타일 |
| `width` | `number` | `50` | 스위치의 너비 (높이는 자동으로 계산됨: width * 0.6) |
| `trackColorInactive` | `string` | 테마 `grey[30]` | 비활성화 상태의 트랙 색상 |
| `trackColorActive` | `string` | 테마 `primary.main` | 활성화 상태의 트랙 색상 |
| `thumbColor` | `string` | `'#ffffff'` | 썸(움직이는 원)의 색상 |

## 특징

- **부드러운 애니메이션**: 200ms 동안 부드럽게 전환됩니다
- **반응형 크기**: 높이는 너비의 60%로 자동 계산됩니다
- **테마 통합**: 테마 색상을 사용하여 일관된 디자인 유지

## 예제

커스텀 색상을 적용한 예시입니다.

```tsx
<ZSSwitch
  isActive={isActive}
  onToggle={() => setIsActive(!isActive)}
  trackColorInactive="#e0e0e0"
  trackColorActive="#4CAF50"
  thumbColor="#ffffff"
/>
```
