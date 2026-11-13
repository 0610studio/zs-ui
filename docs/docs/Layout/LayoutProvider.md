# LayoutProvider

앱 창의 크기·크기 클래스·가독 폭·접힘선·기기 자세를 하위 컴포넌트에 공급하는 Provider입니다. 앱 루트에 한 번 둡니다.

| 플랫폼 | 창 크기·크기 클래스 | 접힘선·가림 영역 |
|--------|--------------------|-----------------|
| iOS | 관찰 뷰의 bounds·size class trait | reserved region(아이폰 듀오) |
| Android | androidx.window `WindowSizeClass` | Jetpack WindowManager `FoldingFeature` |

힌지 상태·각도는 두 플랫폼 모두 `expo-hinge`로 읽습니다. 기기 이름이나 화면 비율로 추측하지 않습니다.

## 기본 사용법

`SafeAreaProvider` 안쪽, `ThemeProvider` 바깥쪽에 둡니다. 루트 레이아웃 코드는 [시작하기](../Provider/start)에 있습니다.

[`ZSScreen`](../UiComponent/ZSScreen)·[`ZSKeyboardStickyView`](../UiComponent/ZSKeyboardStickyView)(가독 폭), [`ZSPaneLayout`](./ZSPaneLayout)(분할·접힘선), [`ZSTabNavigator`](../Navigation/ZSTabNavigator)(Android 바 ↔ 레일)가 이 값을 읽습니다. 네이티브 시트·메뉴의 넓은 창 배치와 접힘선 회피는 시스템이 맡습니다. Duo 가로 배치의 바텀시트는 앱 창의 전체 폭에 맞추고, Alert는 zs-ui가 창 가운데에 그립니다.

`LayoutProvider` 밖에서 `useWindowLayout`·`useDisplayFeatures`·`useDevicePosture`·`useBarAxis`나 이 값을 쓰는 컴포넌트를 쓰면 에러(`… must be used within a LayoutProvider`)를 던집니다.

## Props — `LayoutProviderProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `readableMaxWidth` | `ReadableMaxWidth` | `'system'` | 가독 폭(`'system' \| number`). 화면이 `maxContentWidth="readable"`을 고를 때만 씁니다 — 기본은 전폭이라 쓰지 않습니다 |
| `barAxis` | `BarAxis` | `'horizontal'` | 바 배치(`'vertical' \| 'horizontal'`). 아래 [바 배치](#바-배치--baraxis)를 보세요 |
| `children` | `ReactNode` | Required | 앱 |

| `readableMaxWidth` | iOS | Android |
|--------------------|-----|---------|
| `'system'` | 관찰 뷰의 `readableContentGuide` 폭 — 글자 크기 설정이 커지면 넓어집니다. 첫 측정 전에는 640입니다 | 640(Material 3 시트 최대 폭) |
| 숫자 | 그 값 | 그 값 |

compact 창에는 적용하지 않습니다. 넓은 창 폭 규칙은 [ZSScreen](../UiComponent/ZSScreen)을 보세요.

`LayoutProviderProps`·`ReadableMaxWidth`·`BarAxis` 타입을 내보냅니다.

## 바 배치 — `barAxis`

상태바·내비게이션 바·탭 바를 세로 바에 둘지, 위아래 가로 바에 둘지 정합니다. 기본은 `'horizontal'`이며 앱 단위로 한 번 정합니다. 시스템의 세로 배치를 사용하려면 `barAxis="vertical"`을 지정합니다.

```tsx
<LayoutProvider barAxis="horizontal">{children}</LayoutProvider>
```

| `barAxis` | iOS | Android |
|-----------|-----|---------|
| `'vertical'` | 시스템이 정합니다. 아이폰 듀오는 접힌 화면과 펼친 가로 화면에서 상태바·헤더 버튼·탭 바를 끝 쪽 세로 바에 둡니다 | [`ZSTabNavigator`](../Navigation/ZSTabNavigator#바--레일--navigationmode-auto) 기본 규칙 — 폴더블 펼침·태블릿은 레일 |
| `'horizontal'` | 세로 바를 끕니다. 상태바·내비게이션 바는 위로, 탭 바는 아래로 가고 세로 바 쪽 safe area inset이 없어집니다 | `ZSTabNavigator`가 모든 폭에서 하단 바를 씁니다(폴더블 펼침·태블릿 포함) |

- iOS는 `expo-status-bar`의 `StatusBar.setVerticalBarBehaviorIOS`로 적용합니다. 화면에 `<StatusBar verticalBarBehaviorIOS="…" />`를 따로 두면 그 값이 앞섭니다.
- iOS 세로 바는 iOS 27.1 이상에서 iOS 27.1 SDK(Xcode 27.1)로 빌드한 앱에만 있습니다. 세로 바가 없는 기기에서는 두 값이 같습니다. 세로 바가 놓이는 쪽(시작·끝)은 `expo-status-bar`의 `useVerticalBarEdgeIOS()`로 읽습니다.
- 바뀌면 시스템이 애니메이션으로 다시 배치하고, 화면은 safe area를 따라 다시 그려집니다.
- Duo에서 가로 배치를 선택하면 바텀시트는 앱 창 안에 표시합니다. UIKit 시스템 시트가 상태 표시줄을 세로로 전환하면서 우측 공간을 만드는 문제를 피하고, 접기·펴기 중에도 시트 내용과 입력 상태를 유지합니다. 일반 iPhone과 세로 배치는 네이티브 시트를 사용합니다.

### 실행 중에 바꾸기 — `useBarAxis`

`useBarAxis()`는 지금 배치와 바꾸는 함수를 반환합니다. 바꾼 값은 앱 전체(iOS 세로 바·Android 탭)에 적용되고, `LayoutProvider`의 `barAxis` prop이 바뀌면 그 prop 값으로 돌아갑니다.

```tsx
import { useEffect } from 'react';
import { useBarAxis, useWindowLayout } from '@0610studio/zs-ui';

function WideRail() {
  const [, setBarAxis] = useBarAxis();
  const { widthClass } = useWindowLayout();
  useEffect(() => {
    setBarAxis(widthClass === 'expanded' ? 'vertical' : 'horizontal');
  }, [widthClass, setBarAxis]);
  return null;
}
```

`'vertical'`로 바꾸면 iOS 세로 바도 다시 켜집니다.

## 첫 렌더

첫 렌더는 React Native `Dimensions` 추정값(`measured: false`)이고, 네이티브 관찰 뷰가 처음 측정하면 확정됩니다(`measured: true`). 필드는 [useWindowLayout](./useWindowLayout)을 보세요.

## 구독 범위

창·접힘선·자세는 따로 구독합니다. `useWindowLayout`은 창 값이, `useDisplayFeatures`는 접힘선·가림 영역이, `useDevicePosture`는 자세·힌지 각도가 바뀔 때만 리렌더합니다. 힌지 각도가 바뀌어도 `useWindowLayout`만 쓰는 화면은 리렌더하지 않습니다.

## 요구 사항

접힘선·자세·힌지 값은 아래 조건에서만 옵니다. 조건이 맞지 않으면 접힘선은 없고(`fold: null`), 자세는 접힘선으로 판정하며(iOS는 접힘선도 없어 `unknown`), `hingeAngle`은 `null`입니다.

| 값 | iOS | Android |
|----|-----|---------|
| 접힘선·가림 영역 | 아이폰 듀오, iOS 27.1 이상, iOS 27.1 SDK(Xcode 27.1)로 빌드한 앱 | `FoldingFeature`를 보고하는 폴더블 |
| 자세·힌지 각도 | 위와 같음 | Android 11 이상, 힌지 각도 센서가 있는 폴더블 |

## 관련 문서

- [useWindowLayout](./useWindowLayout) — 창 크기·크기 클래스
- [useDisplayFeatures · useDevicePosture](./useDisplayFeatures) — 접힘선·자세
- [ZSPaneLayout](./ZSPaneLayout) — 같은 화면 안 2-pane, `usePaneLayout`
- [ZSScreen](../UiComponent/ZSScreen) — 넓은 창 폭·safe area
