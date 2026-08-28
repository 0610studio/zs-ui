---
sidebar_position: 21
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# TextAtom

React Native `Text`를 그대로 감싼 최소 텍스트 프리미티브입니다. 별도의 타이포그래피나 테마 색상을 적용하지 않으므로, 디자인 시스템 바깥의 원시 `TextProps` 동작이 필요한 경우에만 사용합니다.

앱 화면의 일반 텍스트에는 폰트·크기·색상 토큰을 제공하는 [ZSText](./ZSText)를 우선 사용하세요.

<LocalPlayground example="TextAtom" height={780} />

## 기본 사용법

```tsx
import { TextAtom } from '@0610studio/zs-ui';

<TextAtom
  numberOfLines={1}
  style={{ fontSize: 16, lineHeight: 24, color: '#222222' }}
>
  원시 텍스트
</TextAtom>
```

## Props

`TextAtom`은 `children`을 포함한 React Native `TextProps` 전체를 그대로 전달합니다. 자체 기본 스타일, 색상 토큰, 폰트 매핑은 추가하지 않습니다.

## ZSText와의 차이

| 항목 | `TextAtom` | `ZSText` |
|------|------------|----------|
| 기반 API | React Native `Text` | `TextAtom` + 테마 |
| 타이포그래피 | 직접 `style` 지정 | `typo="body.2"` 등 토큰 사용 |
| 색상 | 직접 `style` 지정 | `color="primary"` 등 시맨틱 색상 |
| 권장 용도 | 저수준 래퍼·호환 레이어 | 앱 화면의 일반 텍스트 |

