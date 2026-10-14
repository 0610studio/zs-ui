import LocalPlayground from '@site/src/components/LocalPlayground';

# OverlayProvider

`OverlayProvider`는 앱 전역에서 오버레이 상태를 관리하는 컨텍스트 제공자입니다.

이 Provider 안에서는 `useOverlay` 훅을 통해 Alert, Snackbar, BottomSheet, PopOver, Modality, Loader를 선언적으로 제어할 수 있습니다. 각 스크린마다 visible 상태를 직접 관리하거나 컴포넌트를 수동으로 배치할 필요가 없습니다.

<LocalPlayground example="OverlayProvider" height={760} />

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | 필수 | 자식 컴포넌트 |
| `customSnackbar` | `(props: CustomSnackbarProps) => ReactNode` | `undefined` | 기본 Snackbar를 대체할 커스텀 컴포넌트 |
| `loaderComponent` | `() => ReactNode` | `undefined` | 기본 로딩 인디케이터를 대체할 함수. 배경 딤과 가운데 정렬은 그대로 유지됩니다 |
| `maxSnackbarCount` | `number` | `3` | 동시에 표시할 수 있는 Snackbar 최대 개수 |

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

`loaderComponent`는 Loader의 배경 딤 가운데에 들어갈 인디케이터만 바꿉니다. 컴포넌트로 마운트하지 않고 함수로 호출하므로 안에서 훅을 쓰지 않습니다.

```tsx
import { OverlayProvider } from '@0610studio/zs-ui';
import { ActivityIndicator } from 'react-native';

function CustomLoader() {
  return <ActivityIndicator size="large" color="#007AFF" />;
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

## 뒤로가기(back) 처리 — 우선순위 기반

:::warning 실제 Android 앱에서 확인하세요
웹에는 Android 하드웨어 뒤로가기 이벤트가 없습니다. 로더 > Alert/PopOver/Modal > BottomSheet 우선순위와 `dismissable: false` 소비 동작은 실제 Android 앱에서 확인하세요.
:::

오버레이가 열려 있을 때 Android back 키는 **최상위 오버레이 하나만** 닫습니다
(로더 > Alert/PopOver/Modal > BottomSheet 순).
로더가 표시 중이면 back은 무시(소비)되고, `dismissable: false` 바텀시트는 back을 소비만 하고 유지됩니다.

앱 화면도 `useBackHandler(callback, { enabled, priority })`로 같은 체계에 참여할 수 있습니다. `BackPriority`는 숫자가 클수록 먼저 처리되며 `SCREEN`(0, 기본값) · `SHEET`(10) · `OVERLAY`(20) · `LOADER`(30)입니다. `useBackHandler`는 `OverlayProvider` 안에서만 동작합니다.

```tsx
import { useBackHandler, BackPriority } from '@0610studio/zs-ui';

function MyScreen() {
  useBackHandler(
    () => {
      // true를 반환하면 back 이벤트를 소비합니다
      return handleCustomBack();
    },
    { enabled: isEditing, priority: BackPriority.SCREEN },
  );
}
```

`hideOverlay()`는 인자를 생략하면 `'all'`로 동작해 모든 오버레이를 닫습니다.
