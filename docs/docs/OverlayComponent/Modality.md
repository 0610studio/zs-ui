---
sidebar_position: 6
---

# Modality

기존 화면 위에 새로운 화면을 슬라이드 방식으로 표시하는 오버레이 컴포넌트입니다. 배경 화면이 축소되며, 새로운 화면이 하단에서 올라오는 형태로 네이티브 모달과 유사하게 동작합니다.

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';

const { showModality } = useOverlay();

showModality({
  component: <View><Text>새 모달 화면</Text></View>,
});
```

`showModality`로 전달하는 컴포넌트는 전체 화면 높이를 차지하며, 내부에서 필요한 레이아웃을 자유롭게 구성할 수 있습니다.

## Props

| 이름 | 타입 | 설명 |
|------|------|------|
| `component` | `React.ReactNode` | 모달로 표시할 컴포넌트 |

Modality는 내부적으로 애니메이션을 사용하여 화면 전환을 수행하며, `hideOverlay('modal')`을 호출하여 닫을 수 있습니다.
