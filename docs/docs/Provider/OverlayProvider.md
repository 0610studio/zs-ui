---
sidebar_position: 2
---

# OverlayProvider

`OverlayProvider`는 프로젝트 전역에서 사용할 알림 시스템을 관리합니다. `customSnackbar`와 `loaderComponent`를 통해 커스텀 스낵바 및 로더 컴포넌트를 설정할 수 있습니다.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customSnackbar` | `(props: CustomSnackbarProps) => React.ReactNode` | `undefined` | 알림을 표시할 때 사용할 사용자 정의 스낵바 컴포넌트 |
| `loaderComponent` | `() => React.ReactNode` | `undefined` | 로딩 상태에서 사용할 사용자 정의 로더 컴포넌트 |
| `maxSnackbarCount` | `number` | `3` | 동시에 표시할 수 있는 스낵바 최대 개수 |
| `children` | `React.ReactNode` | Required | 자식 컴포넌트 |

## 기본 사용법

```tsx
import { OverlayProvider } from '@0610studio/zs-ui';

<OverlayProvider>
  {/* 앱 내용 */}
</OverlayProvider>
```

## 커스텀 스낵바

```tsx
import { OverlayProvider, CustomSnackbarProps } from '@0610studio/zs-ui';
import { View, Text } from 'react-native';

function CustomSnackbar({ snackType, snackMessage }: CustomSnackbarProps) {
  return (
    <View style={{
      backgroundColor: snackType === 'error' ? '#e74c3c' : '#2ecc71',
      padding: 15,
      borderRadius: 8,
    }}>
      <Text style={{ color: '#fff' }}>{snackMessage}</Text>
    </View>
  );
}

function App() {
  return (
    <OverlayProvider customSnackbar={CustomSnackbar}>
      {/* 앱 내용 */}
    </OverlayProvider>
  );
}
```

자세한 내용은 [Snackbar 문서](../OverlayComponent/Snackbar)를 참조하세요.

## 커스텀 로더

```tsx
import { OverlayProvider } from '@0610studio/zs-ui';
import { ActivityIndicator, View } from 'react-native';

function CustomLoader() {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

function App() {
  return (
    <OverlayProvider loaderComponent={CustomLoader}>
      {/* 앱 내용 */}
    </OverlayProvider>
  );
}
```

자세한 내용은 [Loader 문서](../OverlayComponent/Loader)를 참조하세요.

## 최대 스낵바 개수 설정

```tsx
import { OverlayProvider } from '@0610studio/zs-ui';

<OverlayProvider maxSnackbarCount={5}>
  {/* 앱 내용 */}
</OverlayProvider>
```

## useOverlay 훅

`OverlayProvider` 내부에서 `useOverlay` 훅을 사용하여 오버레이 기능에 접근할 수 있습니다:

```tsx
import { useOverlay } from '@0610studio/zs-ui';
import { Button } from 'react-native';

function MyComponent() {
  const { showAlert, showSnackBar, showBottomSheet } = useOverlay();

  const handleShowAlert = () => {
    showAlert({
      title: '알림',
      informative: '메시지',
      actions: {
        primary: { label: '확인', onPress: () => {} },
      },
    });
  };

  return <Button title="알림 표시" onPress={handleShowAlert} />;
}
```

### 사용 가능한 메서드

- `showAlert(props)` - Alert 표시
- `showSnackBar(props)` - Snackbar 표시
- `showBottomSheet(props)` - BottomSheet 표시
- `showModality(props)` - Modality 표시
- `showPopOverMenu(props)` - PopOver 메뉴 표시
- `showLoader()` - Loader 표시
- `hideOverlay(option)` - 오버레이 숨기기

각 오버레이 컴포넌트에 대한 자세한 내용은 [Overlay 컴포넌트 문서](../OverlayComponent/00_start)를 참조하세요.

