---
sidebar_position: 9
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# GlobalOverlay

React 컴포넌트와 훅 바깥에서 오버레이를 열고 닫을 수 있는 명령형 API입니다. API 클라이언트의 응답 인터셉터, 전역 오류 처리기처럼 `useOverlay()`를 호출할 수 없는 위치에서 사용합니다.

화면 컴포넌트 안에서는 생명주기와 의존 관계가 더 명확한 `useOverlay()`를 우선 사용하세요.

<LocalPlayground example="GlobalOverlay" height={760} />

## 사전 조건

`OverlayProvider`가 마운트되면 `GlobalOverlay`가 현재 오버레이 API에 연결됩니다. Provider가 없는 상태에서 호출하면 설정 오류를 빠르게 찾을 수 있도록 예외가 발생합니다.

## 기본 사용법

```tsx
import { GlobalOverlay } from '@0610studio/zs-ui';

export function notifyRequestFailure() {
  GlobalOverlay.showSnackBar({
    message: '요청을 처리하지 못했습니다.',
    type: 'error',
  });
}
```

## 제공 메서드

| Method | Description |
|--------|-------------|
| `showAlert(props)` | Alert 표시 |
| `showSnackBar(props)` | Snackbar 표시 |
| `showBottomSheet(props)` | BottomSheet 표시 |
| `showPopOverMenu(props)` | PopOver 표시 |
| `showModality(props)` | Modality 표시 |
| `showLoader()` | Loader 표시 |
| `hideOverlay(option?)` | 지정한 오버레이 또는 전체 오버레이 닫기 |

## 비동기 요청에서 사용

```tsx
import { GlobalOverlay } from '@0610studio/zs-ui';

export async function saveProfile() {
  GlobalOverlay.showLoader();

  try {
    await requestSaveProfile();
    GlobalOverlay.showSnackBar({ message: '저장되었습니다.', type: 'success' });
  } finally {
    GlobalOverlay.hideOverlay('loader');
  }
}
```

앱 종료나 테스트 정리 과정에서 `OverlayProvider`가 언마운트되면 전역 참조도 함께 해제됩니다.

