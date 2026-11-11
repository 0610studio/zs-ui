# Stack 테마 · 헤더

expo-router 네이티브 `Stack`의 헤더·화면 배경을 zs-ui 테마에 맞추는 훅 두 개, 투명 헤더 아래 콘텐츠를 비키는 도구(`useHeaderInset`·`ZSHeaderBackground`), 헤더 액션 작성 규칙입니다.

## 기본 사용법

두 훅은 zs-ui `ThemeProvider` 안에서 호출합니다. 루트 레이아웃 코드는 [시작하기](../Provider/start)에 있습니다.

| 훅 | 넣는 곳 | 맡는 것 |
|----|--------|--------|
| `useNavigationTheme()` | expo-router `<ThemeProvider value>` | React Navigation 테마 — 헤더 배경·제목 색·화면 배경·배지 색·서체 |
| `useStackTheme(options?)` | `<Stack screenOptions>`(펼쳐서) | 헤더 서체·버튼 색·뒤로가기 표시·투명 헤더·Android 뒤로 버튼 |
| `useHeaderButtonColors()` | Android `<Stack.Toolbar buttonContainerColor>`·툴바 글자 버튼 바탕 | 헤더 버튼 뒤 연한 둥근 바탕색 |

## `useNavigationTheme()`

| React Navigation 색 | 색 역할 |
|--------------------|--------|
| `primary` | `text` |
| `background` · `card` | `background` |
| `text` | `text` |
| `border` | `border` |
| `notification` | `error` |

React Navigation `primary`는 iOS 헤더 버튼·뒤로가기 기본 tint, 검색 막대 커서처럼 글자·얇은 선에 쓰여 zs-ui `text`를 넘깁니다([색 규칙](../Theme/colors#색-규칙--채움과-얇은-표시)).

`dark`는 현재 모드, `fonts`(regular·medium·bold·heavy)는 등록한 글꼴에서 400·500·700·800에 가장 가까운 굵기입니다. 이 테마를 넣지 않으면 native-stack이 기본 라이트 테마로 헤더를 칠해 다크 모드에서도 헤더가 흰색으로 남습니다.

## `useStackTheme(options?)`

### 옵션 — `StackThemeOptions`

| 옵션 | Type | Default | 설명 |
|------|------|---------|------|
| `tint` | `'text' \| 'primary'` | `'text'` | 헤더 버튼·뒤로가기 글자색. `'primary'`는 브랜드 색조 글자 — `primary`가 `background` 위 4.5:1 이상이면(진한 시드) `primary`, 아니면(밝은 시드) `onPrimaryContainer` |
| `transparentHeader` | `boolean` | `true` | iOS 26 이상·Android에서 투명 헤더(아래) |

### 반환값 — `StackTheme`

| 필드 | 값 |
|------|----|
| `headerTintColor` | `tint`에 따른 색 |
| `headerTitleStyle` · `headerLargeTitleStyle` | iOS는 넣지 않습니다(시스템 서체). Android는 `ThemeProvider` `fonts`가 있으면 `{ fontFamily }` — 브랜드 글꼴에서 600(`subtitle1` 굵기, iOS 시스템 제목 Semibold와 같음)에 가까운 굵기, 없으면 넣지 않습니다 |
| `headerBackButtonDisplayMode` | `'minimal'` |
| `headerTransparent` | `transparentHeader`이고 iOS 26 이상 또는 Android면 `true` |
| `headerLeft` | Android만 — 뒤로 버튼을 iOS 26 유리 바 버튼처럼 연한 둥근 바탕(40dp, `surface2` 92%)으로 그립니다. 뒤로 갈 곳이 없으면 그리지 않고, 읽기 이름은 `accessibilityLabels.navigateUp`(기본 'Navigate up')입니다. iOS는 넣지 않습니다(시스템 유리 버튼) |
| `statusBarStyle` | iOS이고 Info.plist `UIViewControllerBasedStatusBarAppearance`가 `true`면 테마 모드에 맞춘 값(라이트 `'dark'`·다크 `'light'`). 그 밖에는 넣지 않습니다 |

`StackTheme`·`StackThemeOptions` 타입을 내보냅니다.

- 헤더 제목 크기는 글자 크기 설정을 따르지 않습니다. 값은 [글꼴 역할](../Theme/typography)을 보세요.
- `UIViewControllerBasedStatusBarAppearance`가 `false`면 `statusBarStyle`을 넣지 않습니다(레드 박스가 납니다). 상태바 동작은 [ZSScreen 상태바](../UiComponent/ZSScreen#상태바)를 보세요.

## 투명 헤더 (기본)

iOS 26 이상과 Android에서 `useStackTheme()`은 `headerTransparent: true`를 반환합니다. 헤더 바를 칠하지 않고 화면 콘텐츠를 헤더 아래까지 깝니다(iOS 26 HIG). iOS 26 미만은 불투명 헤더입니다.

| 플랫폼 | 쉴 때 | 스크롤할 때 | 콘텐츠가 헤더를 비키는 방법 |
|--------|------|------------|-------------------------|
| iOS 26+ | 화면 배경이 헤더까지 이어집니다 | 시스템 스크롤 가장자리 효과가 헤더 아래를 흐리게 덮습니다 | UIKit — 스크롤 뷰 `contentInsetAdjustmentBehavior="automatic"`, 고정 영역은 safe area |
| Android | 헤더 영역이 투명해 화면 배경이 그대로 보입니다 | 헤더 영역에 [흐림 막](../OverlayComponent/start#흐림-막)과 아래 0.5 선이 짧게 나타납니다 | 헤더 높이(`useHeaderInset()`)만큼 콘텐츠를 내립니다 |

[`ZSScreen`](../UiComponent/ZSScreen)·[`ZSPaneLayout`](../Layout/ZSPaneLayout)(pane마다)·[`ZSTabNavigator`](./ZSTabNavigator)(Android 레일)는 자동으로 비킵니다. 덮였는지는 컨테이너 위치로 판단하므로 화면별로 불투명 헤더를 쓰거나 헤더 아래에 다른 뷰를 둬도 여백이 겹치지 않습니다.

불투명 헤더를 쓰려면 `useStackTheme({ transparentHeader: false })`, 화면 하나만이면 `<Stack.Screen options={{ headerTransparent: false }} />`를 줍니다.

### 직접 스크롤하는 화면 — `useHeaderInset` · `ZSHeaderBackground`

`FlatList`처럼 직접 스크롤하는 화면은 두 가지를 씁니다.

| API | 하는 일 |
|-----|--------|
| `useHeaderInset()` | 투명 헤더 아래 콘텐츠가 비킬 높이(상태바 포함). iOS·Stack 화면 밖은 `0`, Android만 값이 있습니다 |
| `ZSHeaderBackground` | Android 헤더 바탕. 처음엔 투명(`color`), `scrolled`면 흐림 막(또는 `scrolledColor` 단색)이 나타납니다. iOS나 투명 헤더가 아니면 그리지 않습니다 |

탭 화면이면 아래도 비킵니다 — Android 떠 있는 탭 바가 덮는 높이는 [`useTabBarInset()`](./ZSTabNavigator#하단-바-모양--barstyle)입니다.

#### Props — `ZSHeaderBackgroundProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `color` | `ColorValue` | `colors.background` | 스크롤 전 색 — 화면 표면색과 같게 둡니다 |
| `scrolledColor` | `ColorValue` | `undefined` | 스크롤 뒤 단색. 없으면 흐림 막(라이트 `surface1`·다크 `surface3` + 아래 0.5 선)을 깝니다 |
| `scrolled` | `boolean` | `false` | 콘텐츠가 헤더 아래로 스크롤됐는지 |
| `height` | `number` | `useHeaderInset()` | 덮을 높이 |
| `blurTarget` | `RefObject<HostInstance \| null>` | `undefined` | expo-blur `BlurTargetView` ref. 주면 그 콘텐츠를 흐려 막(80%) 아래에 깝니다. 없으면 흐림 없이 짙은 막(96%)입니다. `scrolledColor`가 있으면 쓰지 않습니다 |

`ZSHeaderBackgroundProps` 타입을 내보냅니다. 막·색은 짧게 페이드되고 상태바 영역까지 덮습니다. `ZSTabNavigator` Android 레일 안의 탭 화면이면 레일 위 칸도 함께 칠합니다 — 막이면 막 색을 화면 바탕 위에 얹은 단색입니다.

`blurTarget`을 쓸 때는 `BlurTargetView` 안의 스크롤 뷰에 화면 바탕색을 칠합니다. 흐릴 그림의 투명한 곳은 Activity 창 바탕으로 채워져, 다크 모드에서도 밝은 띠가 생깁니다. Android 12(SDK 31) 미만은 흐림 없이 짙은 막(96%)만 깔립니다.

```tsx
import { useState } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ZSHeaderBackground, useHeaderInset, useTheme } from '@0610studio/zs-ui';

export default function FeedScreen() {
  const { colors } = useTheme();
  const headerInset = useHeaderInset();
  const [scrolled, setScrolled] = useState(false);

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: colors.surface3 }}>
      <FlatList
        data={items}
        renderItem={renderItem}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: headerInset }}
        scrollEventThrottle={16}
        onScroll={(event) => setScrolled(event.nativeEvent.contentOffset.y > 0.5)}
      />
      <ZSHeaderBackground color={colors.surface3} scrolled={scrolled} />
    </SafeAreaView>
  );
}
```

- iOS `contentInsetAdjustmentBehavior="automatic"`은 스크롤 축(상·하)만 맞춥니다. 좌·우 inset은 위처럼 직접 비켜야 합니다.
- 화면 맨 위가 스크롤되지 않는 고정 뷰라면 `<ZSScreen scrollEnabled={false}>`로 감싸면 됩니다.

## 헤더 액션 — `Stack.Toolbar`

1. 좌·우 액션은 expo-router `Stack.Toolbar`(`Button`·`Menu`·`Spacer`·`Badge`)로 작성합니다. 커스텀 `headerLeft`·`headerRight` JS 컴포넌트를 쓰면 iOS 26+ 유리 캡슐 안에 JS 뷰가 겹쳐 그려지고 오버플로 메뉴·시스템 간격을 받지 못합니다.
2. 모든 항목에 아이콘과 라벨(또는 접근성 라벨)을 줍니다.
3. Android 아이콘은 **이미지 소스**만 받습니다. SF Symbol은 iOS 전용이고, 아이콘 없는 버튼은 Android에서 그려지지 않습니다.
4. Android 버튼도 iOS 26 유리 바 버튼처럼 연한 둥근 바탕에 둡니다 — `<Stack.Toolbar buttonContainerColor={useHeaderButtonColors().container}>`. 글자 버튼('저장' 등)은 `Stack.Toolbar.View` 안에 같은 바탕의 캡슐(`ZSButton variant="text"` + 바탕색)로 둡니다. 뒤로 버튼은 `useStackTheme`이 맞춥니다.

```tsx
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useHeaderButtonColors, useTheme } from '@0610studio/zs-ui';

export default function SettingsScreen() {
  const { toggleTheme } = useTheme();
  const headerButton = useHeaderButtonColors();

  return (
    <>
      <Stack.Screen options={{ title: '설정' }} />
      <Stack.Toolbar placement="right" buttonContainerColor={Platform.OS === 'android' ? headerButton.container : undefined}>
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'moon.fill' : require('../assets/icons/dark_mode.png')}
          iconRenderingMode="template"
          accessibilityLabel="다크 모드로 전환"
          onPress={toggleTheme}
        />
      </Stack.Toolbar>
    </>
  );
}
```

## 관련 문서

- [ZSTabNavigator](./ZSTabNavigator)
- [ZSScreen](../UiComponent/ZSScreen) — 헤더 아래 스크롤·safe area
- [글꼴 역할](../Theme/typography) — 헤더 제목 크기
- [오버레이 개요](../OverlayComponent/start#화면-단위-모달--formsheet-라우트) — `presentation: 'formSheet'` 라우트
