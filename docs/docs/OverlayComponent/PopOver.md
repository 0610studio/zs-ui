---
sidebar_position: 7
---

# PopOver

작은 메뉴나 도구 모음을 버튼 위치 기준으로 표시할 수 있는 오버레이 컴포넌트입니다. `PopOverButton`을 사용하면 손쉽게 메뉴를 열 수 있으며, 메뉴 내용은 `PopOverMenu`에 전달한 컴포넌트로 렌더링됩니다.

## 기본 사용법

```tsx
import { PopOverButton } from '@0610studio/zs-ui';

<PopOverButton
  width={40}
  height={40}
  popOverMenuComponent={<MyMenu />}
>
  <Icon name="more" />
</PopOverButton>
```

`PopOverButton`을 누르면 자동으로 `showPopOverMenu`가 호출되어 메뉴가 표시됩니다.

## Props

| 이름 | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `width` | `number` | Required | 버튼 영역의 너비 |
| `height` | `number` | Required | 버튼 영역의 높이 |
| `backgroundColor` | `string` | `'transparent'` | 버튼 배경색 |
| `popOverMenuComponent` | `React.ReactNode` | Required | 표시할 메뉴 컴포넌트 |

`popOverMenuComponent`로 전달한 컴포넌트는 `PopOverMenu` 내부에서 렌더링되며, 화면 경계를 벗어나지 않도록 자동으로 위치가 조정됩니다.

