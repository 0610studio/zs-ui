import LocalPlayground from '@site/src/components/LocalPlayground';

# Snackbar

화면 상단에 일시적인 메시지를 표시하여 사용자에게 정보를 전달하는 컴포넌트입니다. 여러 개의 Snackbar를 동시에 표시할 수 있으며, 자동으로 사라집니다.

<LocalPlayground example="Snackbar" />

## SnackbarNotify 렌더러

`SnackbarNotify`는 `OverlayProvider`가 스낵바 큐와 최대 표시 개수를 렌더링하는 내부 호스트입니다. 직접 마운트하는 대신 `showSnackBar()`를 호출하고, 전체 스낵바를 즉시 비울 때는 `hideOverlay('snack')`을 사용하세요. 모양을 교체하려면 `OverlayProvider`의 `customSnackbar`를 전달합니다.

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
| `message` | `string` | 필수 | Snackbar에 표시할 메시지 |
| `type` | `SnackType` | `'success'` | Snackbar의 유형 (`'success'`, `'error'`, `''`) |
| `index` | `number` | `Date.now()` | Snackbar의 고유 식별자 |
| `snackbarDuration` | `number` | `3500` | Snackbar가 표시될 지속 시간 (밀리초) |

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

`OverlayProvider`의 `customSnackbar`에 `CustomSnackbarProps`(`snackType`, `snackMessage`)를 받는 컴포넌트를 넘기면 기본 Snackbar를 대체합니다. 예제는 [OverlayProvider의 커스텀 스낵바](../Provider/OverlayProvider#커스텀-스낵바)를 참고하세요.

### Snackbar 닫기

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { hideOverlay } = useOverlay();

  // 모든 Snackbar 닫기
  const closeAll = () => {
    hideOverlay('snack');
  };

  return <Button title="모두 닫기" onPress={closeAll} />;
}
```

### 최대 개수 제한

동시에 표시할 수 있는 Snackbar 수는 `OverlayProvider`의 `maxSnackbarCount`(기본값 `3`)로 정합니다. 개수를 넘으면 가장 오래된 Snackbar부터 닫힙니다. 설정 예제는 [OverlayProvider의 최대 스낵바 개수 설정](../Provider/OverlayProvider#최대-스낵바-개수-설정)을 참고하세요.
