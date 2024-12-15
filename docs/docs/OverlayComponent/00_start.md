---
sidebar_position: 1
---

# 시작하기

`Alert`, `Snackbar`, `Bottom Sheet`, `Loader` 등의 **오버레이**를 선언적으로 관리할 수 있는 모듈입니다.

스크린 마다 모달 컴포넌트를 배치하고 visible 상태를 선언, props를 전달하는 과정을 생략하고 간단하게 모달을 관리할 수 있습니다.

`OverlayProvider`로 감싸서 전체 앱에서 Overlay를 사용할 수 있도록 설정합니다.

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

`OverlayProvider`는 다양한 유형의 알림을 표시하는 데 필요한 상태와 함수를 관리하는 컨텍스트 제공자입니다. 전체 애플리케이션을 감싸서 컨텍스트를 통해 알림 기능에 접근할 수 있도록 합니다.

### Props

| Prop               | Type                                                                                       | 설명                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `children`         | `ReactNode`                                                                                | 알림 컨텍스트에 접근할 수 있는 자식 컴포넌트들입니다.                                                |
| `customSnackbar`   | `(props: CustomSnackbarProps) => React.ReactNode` *(선택 사항)*                           | 기본 Snackbar 동작을 대체할 커스텀 Snackbar 컴포넌트입니다.                                            |
| `loaderComponent`  | `() => React.ReactNode` *(선택 사항)*                                                     | 기본 Loader 동작을 대체할 커스텀 Loader 컴포넌트입니다.                                                |

---

## Overlay 컨텍스트 사용하기

알림 기능을 사용하려면 `useOverlay` 훅을 사용하여 컨텍스트에 접근하세요.

```jsx
import { useOverlay } from "@0610studio/zs-ui";

const SomeComponent = () => {
  const { showAlert, showSnackBar, showBottomSheet, showLoader } = useOverlay();
};
```
