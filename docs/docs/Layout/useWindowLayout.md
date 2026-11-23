# useWindowLayout

앱 창의 크기와 크기 클래스(`compact`·`medium`·`expanded`)를 돌려주는 훅입니다. "펼쳤는가"가 아니라 "창이 얼마나 넓은가"로 레이아웃을 정할 때 씁니다.

## 기본 사용법

```tsx
import { useWindowLayout } from '@0610studio/zs-ui';

function Gallery() {
  const { widthClass } = useWindowLayout();
  const columns = widthClass === 'compact' ? 2 : widthClass === 'medium' ? 3 : 4;
  return <Grid columns={columns} />;
}
```

[LayoutProvider](./LayoutProvider) 아래에서만 쓸 수 있습니다. pane 안에서는 창이 아니라 [usePaneLayout](./ZSPaneLayout#usepanelayout)으로 자기 pane 크기에 반응합니다.

## 반환값 — `WindowLayout`

| 필드 | Type | 설명 |
|------|------|------|
| `width`, `height` | `number` | LayoutProvider 루트(앱 창) 크기, pt·dp |
| `widthClass` | `WindowSizeClassName` | `'compact' \| 'medium' \| 'expanded'` |
| `heightClass` | `WindowSizeClassName` | 높이 기준 크기 클래스 |
| `orientation` | `'portrait' \| 'landscape'` | 폭이 높이보다 크면 `landscape` |
| `measured` | `boolean` | `false`면 네이티브 첫 측정 전 추정값 |
| `readableMaxWidth` | `number` | `LayoutProvider readableMaxWidth`를 해석한 가독 폭(compact 창에서도 값은 있습니다) |
| `largeScreen` | `boolean` | 큰 화면 창(태블릿·펼친 폴더블·iPad·펼친 iPhone Duo). 화면 확대(밀도)·글자 크기와 상관없고, 바형 폰은 늘 `false`입니다 — [아래](#큰-화면-창--largescreen) |
| `platform` | `WindowPlatformInfo` | 플랫폼 원본 값(아래) |

`WindowLayout`·`WindowSizeClassName`·`WindowPlatformInfo`·`IOSSizeClass`·`AndroidWindowSizeClass`·`ReadableMaxWidth`·`ContentMaxWidth` 타입을 내보냅니다.

## 크기 클래스 기준

| `widthClass` | iOS | Android |
|--------------|-----|---------|
| `compact` | `horizontalSizeClass == .compact` | `WindowSizeClass` 폭 < 600dp |
| `medium` | regular이고 폭 < 840pt | 600 ≤ 폭 < 840dp |
| `expanded` | regular이고 폭 ≥ 840pt | 폭 ≥ 840dp |

- iOS는 compact 판정에 size class trait를 그대로 씁니다. 일반 iPhone 가로는 폭과 무관하게 compact이고, Pro Max 가로·iPad는 regular입니다. 그래서 1단 ↔ 2단 전환이 `UISplitViewController`·탭 사이드바 전환과 같은 순간에 일어납니다.
- Android는 androidx.window `WindowSizeClass`(현재 창 `WindowMetrics` 기준)를 그대로 씁니다. 멀티윈도우·데스크톱 창에서도 실제 앱 창 크기입니다.
- `heightClass`는 iOS `verticalSizeClass`(compact면 compact, regular면 높이 900pt 미만 `medium`·이상 `expanded`), Android 높이 480·900dp 기준입니다.
- 측정 전 추정값은 Material 3 브레이크포인트(폭 600·840, 높이 480·900)로 분류합니다.

## 큰 화면 창 — `largeScreen`

`widthClass`는 dp 기준이라 Android에서 화면 크기(확대)를 키우면 펼친 폴더블도 compact가 됩니다(예: Galaxy Z Fold7 526dpi에서 599dp). `largeScreen`은 기기 모양으로 정해 이 영향을 받지 않습니다. [`ZSPaneLayout`](./ZSPaneLayout)이 두 칸으로 나눌지 이 값으로 정합니다.

| 플랫폼 | 큰 화면 창 |
|--------|------------|
| iOS | `horizontalSizeClass == .regular`(iPad 전체 화면·넓은 분할, 펼친 iPhone Duo). iPhone 세로는 compact |
| Android | 기기 고유 밀도(`DisplayMetrics.DENSITY_DEVICE_STABLE`)로 잰 창의 짧은 변 ≥ 600dp(sw600dp) |

Android 고유 밀도 크기는 zs-ui 2.2.0 네이티브가 보냅니다. 그 전 네이티브 바이너리에서는 JS가 다음으로 대신합니다.

- 현재 창의 짧은 변 ≥ 600dp이고 긴 변/짧은 변 < 1.9(태블릿. 바형 폰은 19.5:9 ≈ 2.17 이상)
- 접힘선([useDisplayFeatures](./useDisplayFeatures))이 있고 긴 변/짧은 변 ≤ 1.6(책처럼 펼친 폴더블. 위아래로 여는 Flip은 약 2.3)

## `platform` — `WindowPlatformInfo`

```ts
type WindowPlatformInfo =
  | { os: 'ios'; horizontalSizeClass: IOSSizeClass | null; verticalSizeClass: IOSSizeClass | null }
  | { os: 'android'; windowSizeClass: AndroidWindowSizeClass | null };
```

측정 전 추정값에서는 `horizontalSizeClass`·`verticalSizeClass`·`windowSizeClass`가 `null`입니다.

크기 클래스를 쓰는 규칙은 [ZSScreen](../UiComponent/ZSScreen)(넓은 창 폭), [ZSPaneLayout](./ZSPaneLayout#분할-규칙)(분할), [ZSTabNavigator](../Navigation/ZSTabNavigator#바--레일--navigationmode-auto)(Android 바 ↔ 레일)에 있습니다. 구독 범위는 [LayoutProvider](./LayoutProvider#구독-범위)를 보세요.

## 관련 문서

- [LayoutProvider](./LayoutProvider)
- [useDisplayFeatures · useDevicePosture](./useDisplayFeatures)
- [ZSPaneLayout](./ZSPaneLayout) — pane 단위 크기는 `usePaneLayout`
