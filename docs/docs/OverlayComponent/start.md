---
sidebar_position: 1
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# 시작하기

`Alert`, `Snackbar`, `Bottom Sheet`, `Loader`, `PopOver`, `Modality` 등의 **오버레이**를 선언적으로 관리할 수 있는 모듈입니다.

스크린마다 모달 컴포넌트를 배치하고 visible 상태를 직접 관리하는 과정을 생략하고 간단하게 오버레이를 제어할 수 있습니다.

`OverlayProvider`로 감싸서 전체 앱에서 Overlay를 사용할 수 있도록 설정합니다.

<ExpoSnack id="@studio0610/zs-ui_13_overlay" />

## 기본 사용법

```jsx
import React from 'react';
import { OverlayProvider } from '@0610studio/zs-ui';
import App from './App';

const Root = () => (
  <OverlayProvider>
    <App />
  </OverlayProvider>
);

export default Root;
```

## OverlayProvider

`OverlayProvider`는 다양한 유형의 알림을 표시하기 위한 상태와 함수를 관리하는 컨텍스트 제공자입니다.

### Props

| Prop | Type | 설명 |
| ---- | ---- | ---- |
| `children` | `ReactNode` | 알림 컨텍스트에 접근할 수 있는 자식 컴포넌트들입니다. |
| `customSnackbar` | `(props: CustomSnackbarProps) => React.ReactNode` *(선택 사항)* | 기본 Snackbar 동작을 대체할 커스텀 컴포넌트입니다. |
| `loaderComponent` | `() => React.ReactNode` *(선택 사항)* | 기본 Loader 동작을 대체할 커스텀 컴포넌트입니다. |
| `maxSnackbarCount` | `number` *(선택 사항, 기본값: 3)* | 동시에 표시할 수 있는 Snackbar 최대 개수입니다. |

---

## Overlay 컨텍스트 사용하기

알림 기능을 사용하려면 `useOverlay` 훅을 이용해 컨텍스트에 접근합니다.

```jsx
import { useOverlay } from '@0610studio/zs-ui';

const SomeComponent = () => {
  const {
    showAlert,
    showSnackBar,
    showBottomSheet,
    showPopOverMenu,
    showModality,
    showLoader,
    hideOverlay,
  } = useOverlay();
};
```
