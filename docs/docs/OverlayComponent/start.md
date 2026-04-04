---
sidebar_position: 1
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# 시작하기

`Alert`, `Snackbar`, `BottomSheet`, `PopOver`, `Modality`, `Loader` 등의 오버레이를 `useOverlay` 훅으로 선언적으로 제어할 수 있습니다.

별도의 visible 상태를 관리하거나 컴포넌트를 수동으로 배치할 필요 없이, 원하는 위치에서 `show*` 메서드를 호출하면 됩니다.

:::info
오버레이를 사용하려면 먼저 [OverlayProvider](../Provider/OverlayProvider)로 앱을 감싸야 합니다.
:::

<ExpoSnack id="@studio0610/zs-ui_13_overlay" />

## useOverlay 훅

`useOverlay` 훅에서 제공하는 메서드 목록입니다.

| 메서드 | 설명 |
| ------ | ---- |
| `showAlert(props)` | Alert 표시 |
| `showSnackBar(props)` | Snackbar 표시 |
| `showBottomSheet(props)` | BottomSheet 표시 |
| `showPopOverMenu(props)` | PopOver 메뉴 표시 |
| `showModality(props)` | Modality 표시 |
| `showLoader()` | Loader 표시 |
| `hideOverlay(option)` | 특정 오버레이를 닫거나 전체 닫기 |

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';
import { Button } from 'react-native';

function MyComponent() {
  const {
    showAlert,
    showSnackBar,
    showBottomSheet,
    showPopOverMenu,
    showModality,
    showLoader,
    hideOverlay,
  } = useOverlay();

  const handleShowAlert = () => {
    showAlert({
      title: '알림',
      informative: '메시지 내용',
      actions: {
        primary: { label: '확인', onPress: () => {} },
      },
    });
  };

  const handleShowLoader = () => {
    showLoader();
    setTimeout(() => hideOverlay('loader'), 2000);
  };

  return (
    <>
      <Button title="알림 표시" onPress={handleShowAlert} />
      <Button title="로더 표시" onPress={handleShowLoader} />
    </>
  );
}
```

## hideOverlay

`hideOverlay`는 특정 오버레이를 닫거나 한 번에 모두 닫을 수 있습니다.

```tsx
// 특정 오버레이 닫기
hideOverlay('alert');
hideOverlay('bottomSheet');
hideOverlay('snack');
hideOverlay('loader');
hideOverlay('popOver');
hideOverlay('modal');

// 전체 닫기
hideOverlay('all');
```

:::caution
`hideOverlay('all')`은 Alert, BottomSheet, Snackbar, Loader, PopOver, Modality를 닫습니다. `ZSAboveKeyboard`는 오버레이 시스템과 독립적으로 동작하므로 포함되지 않습니다.
:::

## 개별 오버레이 문서

각 컴포넌트의 상세한 props와 예제는 해당 문서를 참조하세요.

- [Alert](./Alert)
- [Snackbar](./Snackbar)
- [BottomSheet](./BottomSheet)
- [Loader](./Loader)
- [PopOver](./PopOver)
- [Modality](./Modality)
