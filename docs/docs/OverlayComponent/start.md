# 오버레이 개요

Alert·시트·스낵바·진행 표시를 `useOverlay()`로 띄웁니다. 앱 루트에 [`OverlayProvider`](#overlayprovider)를 한 번 두면 화면마다 visible 상태를 만들 필요가 없습니다. 시트는 플랫폼 시스템 시트라 그리기·접힘선 회피·모달 포커스·글자 크기를 시스템이 처리합니다. 진행 표시는 시스템 진행 표시를 zs-ui가 앱 창 맨 위 막 위에 그립니다. Alert·스낵바는 zs-ui가 두 플랫폼 같은 모양으로 그리고 테마 색 역할을 따릅니다. 버튼 색·모서리 같은 브랜드 스타일 props는 없습니다.

| 메서드 | iOS | Android | 문서 |
|--------|-----|---------|------|
| `showAlert(props)` | zs-ui 대화상자 | zs-ui 대화상자 | [Alert](./Alert) |
| `showBottomSheet(props)` | SwiftUI sheet(detent) | M3 `ModalBottomSheet` | [BottomSheet](./BottomSheet) |
| `hideBottomSheet()` | 열린 시트 닫기 | 열린 시트 닫기 | [BottomSheet](./BottomSheet) |
| `showSnackbar(props)` | zs-ui 스낵바(기본 화면 위) | zs-ui 스낵바(기본 화면 위) | [Snackbar](./Snackbar) |
| `showLoader(props?)` | 시스템 activity indicator | M3 Expressive `ContainedLoadingIndicator` | [Loader](./Loader) |
| `hideLoader()` | 진행 표시 닫기 | 진행 표시 닫기 | [Loader](./Loader) |

이 메서드 묶음의 타입은 `OverlayContextProps`이고, React 밖에서는 같은 메서드를 [GlobalOverlay](#globaloverlay)로 호출합니다.

## 기본 사용법

```tsx
import { ZSButton, useOverlay } from '@0610studio/zs-ui';

function NotifyButton() {
  const { showSnackbar } = useOverlay();
  return <ZSButton title="알림" onPress={() => showSnackbar({ message: '저장했습니다' })} />;
}
```

## OverlayProvider

앱 루트의 `ThemeProvider` 안쪽에 한 번 둡니다. 전체 구성은 [시작하기](../Provider/start)를 참고하세요.

### Props — `OverlayProviderProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `ReactNode` | Required | 앱 화면 |
| `snackbarPosition` | `'top' \| 'bottom'` | `'top'` | 스낵바 자리 — `top`은 기기 상태바 바로 아래(상단 바를 덮는다), `bottom`은 M3 자리(아래 고정 영역·탭 바·키보드 위). [자리와 개수](./Snackbar#자리와-개수) |

- `OverlayProvider` 밖에서 `useOverlay()`를 부르면 `useOverlay must be used within an OverlayProvider` 에러를 던집니다.
- Alert·시트는 각각 한 번에 하나씩 보입니다. 이어서 부른 Alert는 [차례로](./Alert) 뜨고, 열린 시트에 `showBottomSheet`를 다시 부르면 [새 시트로 바뀝니다](./BottomSheet#닫기--dismissible--hidebottomsheet--onclose). 스낵바는 [최대 3개까지 쌓입니다](./Snackbar#자리와-개수).
- `showAlert`·`showBottomSheet`는 먼저 키보드를 내립니다.
- Android 뒤로가기는 닫을 수 있는 Alert·시트를 닫습니다(Alert는 [취소가 있거나 `dismissible`일 때](./Alert#닫기--dismissible)). 진행 표시나 닫을 수 없는 Alert·시트가 떠 있으면 소비만 해서 뒤 화면으로 넘어가지 않습니다. 화면별 back 처리는 React Native `BackHandler`를 직접 씁니다.

## GlobalOverlay

React 밖에서는 `GlobalOverlay`로 같은 메서드를 호출합니다. `OverlayProvider`가 마운트되지 않았거나 이미 언마운트되면 에러를 던집니다.

```tsx
import { GlobalOverlay } from '@0610studio/zs-ui';

GlobalOverlay.showSnackbar({ message: '저장했습니다', type: 'success' });
```

## 흐림 막

오버레이·툴팁·Android 투명 헤더는 테마 색과 `expo-blur`로 배경을 구분합니다. 흐림을 사용할 수 없으면 더 짙은 단색으로 표시합니다.

| 환경 | 동작 |
|---|---|
| iOS | 흐림을 사용하며, 시스템 '투명도 줄이기' 설정에서는 단색으로 표시합니다. |
| Android 12 이상 | 앱 화면 밖에 배치한 스낵바·포털은 배경을 흐립니다. |
| Android 11 이하·별도 창·시트 안·툴팁 | 단색으로 표시합니다. |

## 어떤 걸 쓸까요

| 하고 싶은 것 | 쓸 것 |
|-------------|------|
| 되돌릴 수 없는 동작 확인, 짧은 결정 | [`showAlert`](./Alert) |
| 화면을 떠나지 않는 짧은 선택·입력 | [`showBottomSheet`](./BottomSheet) |
| 화면 단위 작성·편집(제목·입력 여러 개·자체 버튼) | [formSheet 라우트](#화면-단위-모달--formsheet-라우트) |
| 요소에서 여는 동작 목록(편집·공유·삭제) | [`ZSMenu`](../UiComponent/ZSMenu) |
| 저장 완료 같은 짧은 알림 | [`showSnackbar`](./Snackbar) — 사라지지 않고 화면 안에 남겨야 하면 [`ZSBanner`](../UiComponent/ZSBanner) |
| 진행 중 화면 막기 | [`showLoader`](./Loader) — 가능하면 버튼 안 진행 표시(`ZSButton loading`) |
| 화면 위 임의의 JS 레이어 | [`ZSPortal`](./ZSPortal) |

## 화면 단위 모달 — formSheet 라우트

화면 단위 작성·편집은 expo-router Stack의 `presentation: 'formSheet'`를 사용합니다.

```tsx
<Stack.Screen
  name="edit"
  options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true }}
/>
```

`router.push('/edit')`로 열고 `router.back()`으로 닫습니다. 전체 화면 모달은 `presentation: 'modal'`을 사용합니다.

## 관련 문서

- [시작하기](../Provider/start) — Provider 순서
- [Stack 테마 · 헤더](../Navigation/Stack)
