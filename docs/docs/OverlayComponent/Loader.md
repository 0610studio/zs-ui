---
sidebar_position: 5
---

# Loader

진행 중인 프로세스를 사용자에게 시각적으로 표시하여, 작업이 완료될 때까지 사용자의 행동을 제어할 수 있는 로딩 컴포넌트입니다.

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showLoader, hideOverlay } = useOverlay();

  const handleShowLoader = () => {
    showLoader();
    
    // 예시: 3초 후에 로더 숨기기
    setTimeout(() => {
      hideOverlay('loader');
    }, 3000);
  };

  return <Button title="Loader 표시" onPress={handleShowLoader} />;
}
```

## API 참조

### `showLoader` 함수

`showLoader` 함수는 Loader를 표시하는 데 사용됩니다. 이 함수는 인수를 받지 않으며, 호출 시 로더가 화면에 표시됩니다.

```typescript
showLoader(): void
```

### `hideOverlay` 함수

`hideOverlay` 함수는 특정 유형의 오버레이를 숨기는 데 사용됩니다. Loader를 숨기기 위해서는 `'loader'`를 인수로 전달합니다.

```typescript
hideOverlay(option: HideOption): void
```

`HideOption` 타입:
- `'loader'` – Loader를 숨깁니다
- `'all'` – 모든 오버레이를 숨깁니다

## 특징

- **전체 화면 오버레이**: 화면 전체를 덮어 다른 상호작용을 차단합니다
- **커스터마이징 가능**: `OverlayProvider`에서 커스텀 로더 컴포넌트를 사용할 수 있습니다
- **간단한 API**: `showLoader()`와 `hideOverlay('loader')`로 쉽게 제어 가능

## 예제

- **전체 화면 오버레이**: 화면 전체를 덮어 다른 상호작용을 차단합니다
- **커스터마이징 가능**: `OverlayProvider`에서 커스텀 로더 컴포넌트를 사용할 수 있습니다

## 예제

### 기본 사용

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showLoader, hideOverlay } = useOverlay();

  const handleAsyncOperation = async () => {
    showLoader();
    
    try {
      await performLongOperation();
    } finally {
      hideOverlay('loader');
    }
  };

  return <Button title="작업 시작" onPress={handleAsyncOperation} />;
}
```

### 네트워크 요청과 함께 사용

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showLoader, hideOverlay } = useOverlay();

  const handleFetchData = async () => {
    showLoader();
    
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      // 데이터 처리
    } catch (error) {
      console.error('Error:', error);
    } finally {
      hideOverlay('loader');
    }
  };

  return <Button title="데이터 가져오기" onPress={handleFetchData} />;
}
```

### 커스텀 Loader 컴포넌트

기본 Loader 컴포넌트 대신 커스텀 Loader 컴포넌트를 사용하려면, `OverlayProvider`에 `loaderComponent` prop을 전달합니다.

```tsx
import { OverlayProvider } from '@0610studio/zs-ui';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function CustomLoader() {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ZSText typo="body.2" style={{ marginTop: 20 }}>
          로딩 중...
        </ZSText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
});

function App() {
  return (
    <OverlayProvider loaderComponent={CustomLoader}>
      {/* 앱 내용 */}
    </OverlayProvider>
  );
}
```

### Lottie 애니메이션 사용

```tsx
import LottieView from 'lottie-react-native';

function LottieLoader() {
  return (
    <View style={styles.overlay}>
      <LottieView
        source={require('./loading.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}

<OverlayProvider loaderComponent={LottieLoader}>
  {/* 앱 내용 */}
</OverlayProvider>
```

### 모든 오버레이 닫기

```tsx
import { useOverlay } from '@0610studio/zs-ui';

const { hideOverlay } = useOverlay();

// 모든 오버레이(Loader 포함) 닫기
hideOverlay('all');
```
