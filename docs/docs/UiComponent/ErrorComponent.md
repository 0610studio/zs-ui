---
sidebar_position: 22
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ErrorComponent

경고 아이콘과 오류 문구를 한 줄로 표시하는 인라인 오류 컴포넌트입니다. `ZSTextField`의 `status="error"`와 `errorMessage`가 내부에서 사용하는 동일한 표현을 별도 영역에서도 재사용할 수 있습니다.

입력 필드 바로 아래의 오류라면 별도로 배치하지 않고 `ZSTextField errorMessage`를 사용하는 것이 좋습니다.

<LocalPlayground example="ErrorComponent" height={780} />

## 기본 사용법

```tsx
import { ErrorComponent, useTheme } from '@0610studio/zs-ui';

function ValidationMessage() {
  const { palette } = useTheme();

  return (
    <ErrorComponent
      errorMessage="필수 입력 항목입니다."
      errorColor={palette.danger.main}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `errorMessage` | `string` | Required | 표시할 오류 문구 |
| `errorColor` | `string` | Required | 아이콘 배경과 문구에 적용할 색상 |
| `...props` | `ViewProps` | - | 최상위 Animated View에 전달할 속성 |

컴포넌트가 나타날 때 `FadeInDown` 애니메이션이 적용됩니다. 색상은 `palette.danger.main`처럼 현재 테마의 시맨틱 색상을 전달하세요.

