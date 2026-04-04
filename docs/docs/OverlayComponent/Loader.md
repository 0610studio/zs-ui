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

비동기 작업과 함께 사용하는 기본 패턴입니다.

```tsx
const { showLoader, hideOverlay } = useOverlay();

const handleAsyncOperation = async () => {
  showLoader();
  try {
    await performLongOperation();
  } finally {
    hideOverlay('loader');
  }
};
```
