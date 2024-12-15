---
sidebar_position: 5
---

# Loader

진행 중인 프로세스를 사용자에게 시각적으로 표시하여, 

작업이 완료될 때까지 사용자의 행동을 제어할 수 있습니다.

### 기본 사용법

```jsx
import React, { useContext } from 'react';
import { Button } from 'react-native';
import { useOverlay } from '@0610studio/zs-ui';

const LoaderExample = () => {
  const { showLoader, hideOverlay } = useOverlay();

  const handleShowLoader = () => {
    showLoader();
    // 예시: 3초 후에 로더 숨기기
    setTimeout(() => {
      hideOverlay('loader');
    }, 3000);
  };

  return <Button title="Loader 표시" onPress={handleShowLoader} />;
};

export default LoaderExample;
```

### Loader 알림 숨기기

Loader를 숨기려면 `hideOverlay` 함수를 호출하고, 인수로 `'loader'`를 전달합니다.

```jsx
hideOverlay('loader');
```

---

## API 참조

### `showLoader` 함수

`showLoader` 함수는 Loader 알림을 표시하는 데 사용됩니다. 이 함수는 인수를 받지 않으며, 호출 시 로더가 화면에 표시됩니다.

```typescript
showLoader(): void
```

### `hideOverlay` 함수

`hideOverlay` 함수는 특정 유형의 알림을 숨기는 데 사용됩니다. Loader를 숨기기 위해서는 `'loader'`를 인수로 전달합니다.

```typescript
hideOverlay(option: HideOption): void
```

- `option`: `'loader'` – Loader 알림을 숨깁니다.

## 커스터마이징

기본 Loader 컴포넌트 대신 커스텀 Loader 컴포넌트를 사용하려면, `OverlayProvider`에 `loaderComponent` prop을 전달합니다. 이를 통해 애플리케이션의 디자인에 맞는 Loader를 구현할 수 있습니다.

```jsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LoaderComponentProps } from 'Overlay-library';

const CustomLoader = (props: LoaderComponentProps) => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#3498db" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomLoader;
```

#### OverlayProvider에 커스텀 Loader 적용

```jsx
import React from 'react';
import { OverlayProvider } from '@0610studio/zs-ui';
import App from './App';
import CustomLoader from './CustomLoader';

const Root = () => (
  <OverlayProvider loaderComponent={CustomLoader}>
    <App />
  </OverlayProvider>
);

export default Root;
```
