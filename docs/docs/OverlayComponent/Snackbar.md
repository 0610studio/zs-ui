---
sidebar_position: 4
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# Snackbar

화면 상단에 일시적인 메시지를 표시하여 사용자에게 정보를 전달하는 컴포넌트입니다. 여러 개의 Snackbar를 동시에 표시할 수 있으며, 자동으로 사라집니다.

<ExpoSnack id="@studio0610/zs-ui_13_snackbar" />

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showSnackBar } = useOverlay();

  const handleShowSnackbar = () => {
    showSnackBar({
      message: '작업이 완료되었습니다.',
      type: 'success',
    });
  };

  return <Button title="Snackbar 표시" onPress={handleShowSnackbar} />;
}
```

## API 참조

### `showSnackBar` 함수

```typescript
showSnackBar(props: ShowSnackBarProps): void
```

### `ShowSnackBarProps` 인터페이스

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | Required | Snackbar에 표시할 메시지 |
| `type` | `SnackType` | `'success'` | Snackbar의 유형 (`'success'`, `'error'`, `''`) |
| `index` | `number` | `Date.now()` | Snackbar의 고유 식별자 |
| `snackbarDuration` | `number` | `3000` | Snackbar가 표시될 지속 시간 (밀리초) |

### `SnackType` 타입

```typescript
type SnackType = 'success' | 'error' | '';
```

## 특징

- **자동 사라짐**: 지정된 시간 후 자동으로 사라집니다
- **다중 표시**: 여러 개의 Snackbar를 동시에 표시할 수 있습니다
- **커스터마이징**: `OverlayProvider`에서 커스텀 Snackbar 컴포넌트를 사용할 수 있습니다

## 예제

### 성공 메시지

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showSnackBar } = useOverlay();

  const handleSuccess = () => {
    showSnackBar({
      message: '저장되었습니다.',
      type: 'success',
    });
  };

  return <Button title="성공 메시지" onPress={handleSuccess} />;
}
```

### 에러 메시지

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showSnackBar } = useOverlay();

  const handleError = () => {
    showSnackBar({
      message: '오류가 발생했습니다.',
      type: 'error',
    });
  };

  return <Button title="에러 메시지" onPress={handleError} />;
}
```

### 일반 메시지

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showSnackBar } = useOverlay();

  const handleShowMessage = () => {
    showSnackBar({
      message: '알림 메시지',
      type: '',
    });
  };

  return <Button title="메시지 표시" onPress={handleShowMessage} />;
}
```

### 커스텀 지속 시간

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showSnackBar } = useOverlay();

  const handleShowMessage = () => {
    showSnackBar({
      message: '5초 동안 표시됩니다.',
      type: 'success',
      snackbarDuration: 5000,
    });
  };

  return <Button title="메시지 표시" onPress={handleShowMessage} />;
}
```

### 고유 ID 지정

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showSnackBar } = useOverlay();

  const handleShowMessage = () => {
    showSnackBar({
      message: '메시지',
      type: 'success',
      index: 12345,
    });
  };

  return <Button title="메시지 표시" onPress={handleShowMessage} />;
}
```

### 커스텀 Snackbar 컴포넌트

`OverlayProvider`에 커스텀 Snackbar 컴포넌트를 전달할 수 있습니다:

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

### Snackbar 닫기

```tsx
import { useOverlay, useSnackbar } from '@0610studio/zs-ui';

function MyComponent() {
  const { hideOverlay } = useOverlay();
  const { hideSnackBar } = useSnackbar();

  // 모든 Snackbar 닫기
  const closeAll = () => {
    hideOverlay('snack');
  };

  // 특정 Snackbar 닫기
  const closeSpecific = (index: number) => {
    hideSnackBar(index);
  };

  return (
    <>
      <Button title="모두 닫기" onPress={closeAll} />
      <Button title="특정 닫기" onPress={() => closeSpecific(12345)} />
    </>
  );
}
```

### 최대 개수 제한

`OverlayProvider`에서 동시에 표시할 수 있는 Snackbar의 최대 개수를 설정할 수 있습니다:

```tsx
<OverlayProvider maxSnackbarCount={5}>
  {/* 앱 내용 */}
</OverlayProvider>
```
