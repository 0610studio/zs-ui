# Loader

저장·결제처럼 끝날 때까지 다른 조작을 막아야 하는 작업 동안 화면 전체를 덮는 진행 표시를 띄웁니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS | 시스템 activity indicator(large, `textSecondary`)를 88 정사각 흐림 막 상자(모서리 16)에 |
| Android | Material 3 Expressive `ContainedLoadingIndicator`(Compose) — 표시 `textSecondary`, 상자 `surface4` |

두 플랫폼 모두 뒤를 [흐림 막](./start#흐림-막) scrim(라이트 `backdrop` 32%·다크 52% + 흐림)으로 덮고 짧게 페이드합니다. Android는 `Modal` 창이라 흐리지 않고 짙은 막(48%·다크 60%)을 깝니다.

:::tip 먼저 버튼 안 진행 표시를 고려하세요
HIG는 진행 상태를 그 동작을 시작한 컨트롤 가까이 보여 주라고 하고, M3는 오래 걸리는 작업에서 사용자가 화면을 떠날 수 있게 하라고 합니다. 버튼 하나의 작업이면 [`ZSButton loading`](../UiComponent/ZSButton)을, 콘텐츠를 불러오는 중이면 [`ZSSkeleton`](../UiComponent/ZSSkeleton)을 먼저 쓰세요.
:::

## 기본 사용법

```tsx
import { ZSButton, useOverlay } from '@0610studio/zs-ui';

function PayButton() {
  const { showLoader, hideLoader } = useOverlay();

  const pay = async () => {
    showLoader({ accessibilityLabel: '결제하는 중' });
    try {
      await requestPayment();
    } finally {
      hideLoader();
    }
  };

  return <ZSButton title="결제" fullWidth preventDoublePress onPress={pay} />;
}
```

`showLoader(props?)`는 진행 표시를 띄우고, 이미 떠 있으면 문구와 진행률만 바꿉니다. `hideLoader()`로 닫습니다.

## 진행률 — `progress`

얼마나 남았는지 알 수 있는 작업(파일 압축·올리기 등)은 `progress`(0~1)를 함께 넘깁니다. 진행 표시 아래 막(veil) 상자에 막대(120×4, 채움 `primary`·바탕 `surface4`)와 백분율(`label`, `textSecondary`)을 그립니다. 같은 작업 중에 `showLoader`를 다시 호출해 값을 바꾸면 막대가 짧게 이어서 늘어납니다.

```tsx
const { showLoader, hideLoader } = useOverlay();

showLoader({ accessibilityLabel: '동영상 압축 중', progress: 0 });
await compress(video, (value) => showLoader({ accessibilityLabel: '동영상 압축 중', progress: value }));
hideLoader();
```

- 값은 0~1로 자르고 백분율은 내림합니다(`0.999` → `99%`). 숫자가 아닌 값은 `0%`입니다.
- `progress`를 빼고 다시 호출하면 진행률만 거두고 진행 표시는 남습니다.
- 진행률이 생기거나 사라져도 진행 표시는 화면 가운데에서 움직이지 않습니다.
- 막대와 글자는 RN 뷰로 그려 iOS·Android 모양이 같습니다.

## Props — `ShowLoaderProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `accessibilityLabel` | `string` | `accessibilityLabels.loading`(`'Loading'`) | 스크린 리더가 읽는 문구. 앱 전체 기본값은 [ThemeProvider `accessibilityLabels`](../Provider/ThemeProvider#스크린-리더-문구--accessibilitylabels)로 바꿉니다 |
| `progress` | `number` | `undefined` | 0~1 진행률. 주면 진행 표시 아래에 막대와 백분율을 보입니다 |

`ShowLoaderProps` 타입을 내보냅니다.

## 동작

- 앱 창 맨 위(iOS는 react-native-screens `FullWindowOverlay`, Android는 `Modal` 창)에 그려, 열린 [BottomSheet](./BottomSheet)·formSheet 라우트까지 막습니다.
- 떠 있는 동안 아래 화면·시트는 터치를 받지 않고, Android 뒤로가기는 소비만 합니다(닫히지 않습니다).
- 포털·키보드 위 UI보다 위에 그립니다.

## 접근성

진행 표시는 `progressbar` 역할의 모달 요소입니다(`accessibilityViewIsModal`, `busy` 상태). 스크린 리더 포커스가 진행 표시로 옮겨지고 `accessibilityLabel`을 읽습니다. `progress`를 주면 `accessibilityValue`(`min` 0·`max` 100·`now` 백분율)로 진행률도 읽으므로, `accessibilityLabel`에는 백분율을 넣지 않습니다.

## 관련 문서

- [ZSButton](../UiComponent/ZSButton) — `loading`
- [ZSSkeleton](../UiComponent/ZSSkeleton)
- [GlobalOverlay](./start#globaloverlay)
