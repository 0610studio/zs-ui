---
sidebar_position: 2
---

# OverlayProvider

`OverlayProvider`는 앱 전역에서 오버레이 상태를 관리하는 컨텍스트 제공자입니다.

이 Provider 안에서는 `useOverlay` 훅을 통해 Alert, Snackbar, BottomSheet, PopOver, Modality, Loader를 선언적으로 제어할 수 있습니다. 각 스크린마다 visible 상태를 직접 관리하거나 컴포넌트를 수동으로 배치할 필요가 없습니다.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | 자식 컴포넌트 |
| `customSnackbar` | `(props: CustomSnackbarProps) => ReactNode` | `undefined` | 기본 Snackbar를 대체할 커스텀 컴포넌트 |
| `loaderComponent` | `() => ReactNode` | `undefined` | 기본 Loader를 대체할 커스텀 컴포넌트 |
| `maxSnackbarCount` | `number` | `3` | 동시에 표시할 수 있는 Snackbar 최대 개수 |

## 기본 사용법

```tsx
import { OverlayProvider } from '@0610studio/zs-ui';

<OverlayProvider>
  {/* 앱 내용 */}
</OverlayProvider>
```

ThemeProvider와 함께 사용할 때는 `ThemeProvider` 안에 `OverlayProvider`를 배치합니다.

```tsx
import { ThemeProvider, OverlayProvider } from '@0610studio/zs-ui';

<ThemeProvider>
  <OverlayProvider>
    {/* 앱 내용 */}
  </OverlayProvider>
</ThemeProvider>
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
      top: 0, left: 0, right: 0, bottom: 0,
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
<OverlayProvider maxSnackbarCount={5}>
  {/* 앱 내용 */}
</OverlayProvider>
```
