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
