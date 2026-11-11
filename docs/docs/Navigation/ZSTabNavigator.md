# ZSTabNavigator

expo-router 레이아웃에서 쓰는 플랫폼 네이티브 탭입니다. 탭 항목을 한 번 선언하면 플랫폼마다 시스템 탭 UI로 그리고 zs-ui 색 역할을 적용합니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS | expo-router `NativeTabs`(`UITabBarController`) — iOS 26+ Liquid Glass 탭 바, 검색 탭, bottom accessory, iOS 27+ 탭 사이드바 |
| Android | 콘텐츠 위에 뜬 떠 있는 바 하단 바(iOS 탭 바 모양, Compose) ↔ `WideNavigationRail`(시작 측 레일) — 창 크기·자세에 따라 바뀝니다 |

## 기본 사용법

`app/(tabs)/_layout.tsx` 같은 탭 그룹 레이아웃에서 씁니다. `name`은 expo-router 라우트 이름(파일·폴더명)입니다.

```tsx
import { ZSTabNavigator } from '@0610studio/zs-ui';

export default function TabsLayout() {
  return (
    <ZSTabNavigator>
      <ZSTabNavigator.Screen name="index" options={{ title: '기록', icon: { sf: 'list.bullet.rectangle', md: 'list' } }} />
      <ZSTabNavigator.Screen name="chat" options={{ title: '채팅', icon: { sf: 'bubble.left.and.bubble.right', md: 'chat' }, badge: unread > 0 ? unread : false }} />
      <ZSTabNavigator.Screen name="settings" options={{ title: '설정', icon: { sf: 'gearshape', md: 'settings' }, badge: true }} />
      <ZSTabNavigator.Screen name="search" options={{ title: '검색', icon: { sf: 'magnifyingglass', md: 'search' }, role: 'search' }} />
    </ZSTabNavigator>
  );
}
```

- 탭마다 네이티브 `Stack`을 둘 수 있습니다(`app/(tabs)/chat/_layout.tsx`에 `<Stack />`). 같은 탭을 다시 누르면 그 탭의 Stack이 첫 화면으로 돌아갑니다.
- 한 번 연 탭 화면은 다른 탭으로 옮겨도 유지됩니다. 아직 열지 않은 탭도 항목으로 보이고, 처음 열 때 마운트합니다.
- 탭은 5개 이하로 둡니다(HIG·M3).

## Props — `ZSTabNavigatorProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `ReactNode` | Required | `ZSTabNavigator.Screen` 선언 |
| `unselectedIconColor` | `ColorName \| string` | `undefined` | 비선택 탭 아이콘 색 — 색 역할 이름이나 색 값. 미지정이면 iOS는 시스템 색, Android는 `text`. iOS 26 이상은 적용되지 않습니다(아래 테마) |
| `unselectedLabelColor` | `ColorName \| string` | `undefined` | 비선택 탭 라벨 색 — 색 역할 이름이나 색 값. 미지정이면 iOS는 시스템 색, Android는 `text`. iOS 26 이상은 적용되지 않습니다(아래 테마) |
| `ios` | `ZSTabNavigatorIOSOptions` | `undefined` | iOS 전용(아래) |
| `android` | `ZSTabNavigatorAndroidOptions` | `undefined` | Android 전용(아래) |

`ZSTabNavigatorProps`·`ZSTabNavigatorScreenProps`·`ZSTabScreenOptions`·`ZSTabIcon`·`ZSTabNavigatorIOSOptions`·`ZSTabNavigatorSidebar`·`ZSTabNavigatorAndroidOptions`·`ZSTabNavigationMode` 타입을 내보냅니다.

### `ZSTabNavigator.Screen` — `ZSTabNavigatorScreenProps`

선언용이라 단독으로는 아무것도 그리지 않습니다.

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `name` | `string` | Required | 라우트 이름(expo-router 파일명) |
| `options` | `ZSTabScreenOptions` | Required | 아래 표 |
| `listeners` | `{ tabPress?: () => void }` | `undefined` | 탭 이벤트. `tabPress`는 선택된 탭을 다시 눌러도, `disabled` 탭을 눌러도 호출됩니다 |

#### `options` — `ZSTabScreenOptions`

| 필드 | Type | Default | 설명 |
|------|------|---------|------|
| `title` | `string` | Required | 탭 라벨. 라벨은 항상 보입니다(HIG·M3 모두 라벨을 권합니다) |
| `icon` | `ZSTabIcon` | `undefined` | `{ sf?, md?, drawable?, src? }` — iOS는 `sf` → `src`, Android는 `drawable` → `md` → `src` 순으로 씁니다 |
| `badge` | `boolean \| number \| string` | `undefined` | 숫자·문자는 그 값을 배지로, `true`는 글자 없는 배지, `false`는 없음. `true`는 iOS에서 기본 크기의 빈 원(`UITabBarItem`에 점 API가 없음), Android에서 M3 작은 점(6dp)입니다 |
| `hidden` | `boolean` | `undefined` | 탭 숨김 |
| `role` | `'search'` | `undefined` | 검색 탭. iOS 26+는 탭 바 끝에 따로 떨어진 시스템 검색 탭(Liquid Glass)으로 그리고 시스템 아이콘·제목을 씁니다. Android는 일반 탭(`title`·`icon`)입니다 |
| `accessibilityLabel` | `string` | `title` | 스크린 리더가 읽는 탭 이름. iOS는 탭 항목 접근성 라벨, Android는 `contentDescription`이라 UI 테스트(Maestro)도 이 이름으로 탭을 찾습니다 |
| `disabled` | `boolean` | `undefined` | 눌러도 선택되지 않고 `listeners.tabPress`만 호출됩니다 — [잠긴 탭](#잠긴-탭--disabled) |

#### 잠긴 탭 — `disabled`

`hidden`과 달리 탭 바에 남고, 누르면 선택하지 않은 채 `tabPress`만 알립니다(두 플랫폼 같음). 코드로 이동(`router.push`)하는 것은 막지 않습니다. 로그인해야 여는 탭을 누르면 로그인 화면으로 보내는 식으로 씁니다.

```tsx
<ZSTabNavigator.Screen
  name="mypage"
  options={{ title: '내 정보', icon: { sf: 'person', md: 'person' }, disabled: !signedIn }}
  listeners={{ tabPress: () => { if (!signedIn) router.push('/login'); } }}
/>
```

Android `md` 아이콘(Material Symbols 이름)은 `expo-symbols`가 필요합니다. 없으면 개발 모드에서 경고하고 `md`를 건너뜁니다. `drawable`(Android 리소스 이름)·`src`(이미지 소스)는 추가 패키지 없이 씁니다.

Android 리소스 축소를 켰다면 이름으로 지정한 앱의 `drawable`을 보존합니다. `android/app/src/main/res/raw/keep.xml`에 사용하는 리소스를 적습니다.

```xml
<resources xmlns:tools="http://schemas.android.com/tools"
    tools:keep="@drawable/ic_home,@drawable/ic_profile" />
```

`md` 변환이 실패하면 `src`를 쓰고, 내비게이터가 다시 마운트될 때 재시도합니다. 잘못된 아이콘 이름·누락 리소스는 개발 로그에서 확인합니다.

`src` 이미지는 단색(투명 바탕) PNG를 씁니다. 두 플랫폼 모두 모양(알파)만 쓰고 선택·비선택 색으로 칠합니다 — iOS는 template 이미지로 넘깁니다.

### `ios` — `ZSTabNavigatorIOSOptions`

| 필드 | Type | Default | 설명 |
|------|------|---------|------|
| `minimizeBehavior` | NativeTabs `minimizeBehavior` | `undefined` | iOS 26+ 스크롤 시 탭 바 최소화(예: `'onScrollDown'`) |
| `disableTransparentOnScrollEdge` | `boolean` | `undefined` | 스크롤 끝에서 투명 탭 바 끄기 |
| `sidebar` | `ZSTabNavigatorSidebar` | `undefined` | `'automatic' \| 'sidebar' \| 'tabBar'` — iOS 27+ 탭 사이드바 배치(아래) |
| `prominent` | `string` | `undefined` | iOS 27+ 강조 탭의 라우트 이름(아래) |
| `bottomAccessory` | `ReactNode` | `undefined` | iOS 26+ 탭 바 위 액세서리(아래) |

#### `sidebar`

사이드바와 탭 바 중 하나만 보일 수 있을 때(대형 iPhone 가로·아이폰 듀오 내부) 어느 쪽을 쓸지 정합니다. 지정하면 iPad도 사이드바 토글이 있는 모드가 되고, 미지정이면 플랫폼 기본(탭 바)입니다.

`'sidebar'`를 쓰면 **탭마다 Stack을 둡니다**(`app/(tabs)/home/_layout.tsx` 같은 탭 폴더 레이아웃). iPhone에서는 탭 바 대신 사이드바만 보이는데, 사이드바가 숨으면(사용자가 숨기거나 아이폰 듀오 세로 펼침처럼 시스템이 숨기면) 다시 여는 버튼을 시스템이 탭 화면의 Stack 헤더 왼쪽에 둡니다. 탭 화면에 Stack 헤더가 없으면 버튼을 둘 곳이 없어 탭을 바꿀 수 없게 됩니다. iPad는 사이드바를 숨기면 떠 있는 탭 바로 바뀌어 이 문제가 없습니다.

```tsx
<ZSTabNavigator ios={{ sidebar: 'sidebar' }}>
  <ZSTabNavigator.Screen name="home" options={{ title: '홈', icon: { sf: 'house', md: 'home' } }} />
  <ZSTabNavigator.Screen name="records" options={{ title: '기록', icon: { sf: 'list.bullet.rectangle', md: 'list' } }} />
</ZSTabNavigator>

import { Stack } from 'expo-router';
import { useStackTheme } from '@0610studio/zs-ui';

export default function HomeLayout() {
  return <Stack screenOptions={useStackTheme()} />;
}
```

#### `prominent`

화면의 대표 동작(글쓰기 등) 탭 하나를 강조합니다(`UITabBarController.prominentTabIdentifier`). 그 탭은 탭 바에서 떨어져 자기 표면(Liquid Glass)에 아이콘으로 놓이고, 스크롤로 탭 바가 최소화돼도 남습니다. 미지정이면 시스템 기본입니다(검색 탭이 검색을 바로 여는 설정이면 그 탭). iOS 26 이하에서는 지정해도 적용하지 않습니다.

```tsx
<ZSTabNavigator ios={{ prominent: 'compose' }}>
  <ZSTabNavigator.Screen name="index" options={{ title: '홈', icon: { sf: 'house', md: 'home' } }} />
  <ZSTabNavigator.Screen name="compose" options={{ title: '글쓰기', icon: { sf: 'square.and.pencil', md: 'edit' } }} />
</ZSTabNavigator>
```

#### `bottomAccessory`

재생 중인 미디어나 읽지 않은 메시지처럼 모든 탭에 걸친 상태를 탭 바 위에 둡니다(`UITabBarController.bottomAccessory`). 탭 바가 최소화되면 바 옆 줄(inline)로 들어가므로, 배치를 expo-router `NativeTabs.BottomAccessory.usePlacement()`로 읽어 내용을 줄입니다.

```tsx
import { View } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';
import { ZSButton, ZSTabNavigator, ZSText } from '@0610studio/zs-ui';

function UnreadAccessory({ unread, onReadAll }: { unread: number; onReadAll: () => void }) {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
      <ZSText variant="subtitle2" emphasized numberOfLines={1} style={{ flex: 1 }}>
        {placement === 'inline' ? `미읽음 ${unread}` : `채팅 미읽음 ${unread}개`}
      </ZSText>
      {placement === 'regular' ? <ZSButton title="모두 읽음" variant="text" size="small" onPress={onReadAll} /> : null}
    </View>
  );
}

<ZSTabNavigator ios={{ minimizeBehavior: 'onScrollDown', bottomAccessory: <UnreadAccessory unread={unread} onReadAll={readAll} /> }}>
</ZSTabNavigator>
```

### `android` — `ZSTabNavigatorAndroidOptions`

| 필드 | Type | Default | 설명 |
|------|------|---------|------|
| `navigationMode` | `'auto' \| ZSTabNavigationMode` | `'auto'` | `'auto'`는 아래 규칙. `'bar'`·`'rail'`로 고정할 수 있습니다 |
| `barStyle` | `ZSTabBarStyle` | `'floating'` | 하단 바 모양. `'floating'`은 콘텐츠 위에 뜬 떠 있는 바, `'standard'`는 화면 아래에 붙은 M3 짧은 내비게이션 바. 레일에는 적용하지 않습니다 |
| `hideOnKeyboard` | `boolean` | `false` | 키보드가 보이는 동안 하단 바를 숨겨 아래 입력창이 바 높이만큼 뜨지 않게 합니다(레일은 유지). 끄면 iOS처럼 키보드가 바를 덮습니다 |

`ZSTabBarStyle` 타입을 내보냅니다.

#### 하단 바 모양 — `barStyle`

기본(`'floating'`)은 iOS 탭 바(Liquid Glass)를 따른 떠 있는 바입니다.

- 크기: 높이 62dp, 완전 둥근 모서리, 화면 양옆 21dp·내비게이션 바 위 16dp. 항목은 모두 같은 폭(항목당 100dp, 라벨이 길면 가장 넓은 항목에 맞춤)이고 틈 없이 놓이며, 화면보다 넓으면 화면 폭에 맞춰 줄어듭니다.
- 항목: 넓은 창에서도 아이콘 위 라벨, 아이콘 24dp·라벨 10sp·사이 2dp.
- 선택: 아이콘·라벨을 함께 감싼 회색 캡슐(`surface4`)을 떠 있는 바과 위아래·앞뒤 4dp 간격으로 깔고, 누름 리플도 캡슐 전체에 그립니다. 강조색은 선택 아이콘·라벨에만 쓰고, 채움 `primary`보다 짙은 주색 표시색 `primaryMark`(라이트 기본 `#e27200`)로 칠합니다. 비선택 아이콘·라벨은 `text`입니다.
- 바탕: [흐림 막](../OverlayComponent/start#흐림-막)과 같은 규칙입니다. 뒤 탭 화면을 흐리고(흐림 22) 라이트 `surface1`·다크 `#2A2A2A` 80% 막, 테두리(라이트 `text` 8%·다크 10%), 그림자 `shadows.md`를 깝니다. Android 11 이하는 흐리지 않고 막을 96%로 깝니다.

탭 화면은 떠 있는 바 뒤까지 깔리고 떠 있는 바이 그 위에 뜹니다. 떠 있는 바이 덮는 높이는 이렇게 비킵니다.

| 화면 | 처리 |
|------|------|
| [`ZSScreen`](../UiComponent/ZSScreen) 스크롤 | 스크롤 뷰는 떠 있는 바 뒤까지 깔고, 콘텐츠를 아래 inset·떠 있는 바 위 10dp에서 끝냅니다 |
| `ZSScreen` `bottomComponent`·[`ZSKeyboardStickyView`](../UiComponent/ZSKeyboardStickyView) | 떠 있는 바 위에 놓입니다. 키보드가 열리면 키보드 위로 갑니다 |
| `ZSScreen scrollEnabled={false}`·[`ZSPaneLayout`](../Layout/ZSPaneLayout) | 스크롤 pane은 `ZSScreen`과 같고, 고정 화면·pane은 떠 있는 바 위에서 끝납니다 |
| 직접 스크롤하는 목록(`FlatList` 등) | `contentContainerStyle.paddingBottom`에 아래 safe area와 `useTabBarInset()`을 더합니다 |

```tsx
const { bottom } = useSafeAreaInsets();
const tabBarInset = useTabBarInset();

<FlatList contentContainerStyle={{ paddingBottom: bottom + tabBarInset }} … />
```

`useTabBarInset()`은 떠 있는 바이 덮는 높이에 콘텐츠와 떠 있는 바 사이 간격(10dp)을 더한 값입니다(아래 safe area 제외). iOS(UIKit이 비킵니다), 탭 화면 밖, `'standard'`, 레일이면 `0`입니다. 바를 화면 아래에 붙이려면 `android={{ barStyle: 'standard' }}`를 줍니다.

#### 바 ↔ 레일 — `navigationMode: 'auto'`

Google `NavigationSuiteScaffold` 기본 규칙과 같습니다. 크기 클래스는 [useWindowLayout](../Layout/useWindowLayout), 자세는 [useDevicePosture](../Layout/useDisplayFeatures#usedeviceposture)를 따릅니다.

| 조건 | 탭 UI |
|------|------|
| 창 폭 **또는** 높이가 `compact` | 하단 바(`'bar'`) |
| 테이블탑 자세(반쯤 접어 가로 접힘선) | 하단 바 — 아래 반쪽 조작 영역 |
| 그 밖 | 시작 측 레일(`'rail'`) |

그래서 폰 세로·가로는 바, 폴더블 펼침·태블릿은 레일입니다. `'standard'` 바는 창 폭이 compact면 항목 아이콘이 라벨 위에, 넓은 창(폰 가로 등)은 아이콘이 라벨 앞에 놓입니다(M3 Expressive). 떠 있는 바은 늘 아이콘 위 라벨입니다.

[`LayoutProvider barAxis="horizontal"`](../Layout/LayoutProvider#바-배치--baraxis)이면 모든 폭에서 하단 바를 씁니다(폴더블 펼침·태블릿 포함). 넓은 창만 레일로 쓰려면 [`useBarAxis`](../Layout/LayoutProvider#실행-중에-바꾸기--usebaraxis)로 그 창에서 `'vertical'`로 바꿉니다. `navigationMode`를 `'bar'`·`'rail'`로 지정하면 `barAxis`보다 앞섭니다.

- 바 ↔ 레일 전환(접기·펼치기·회전)에도 탭 화면과 탭 안 Stack 상태는 그대로 유지됩니다.
- Android는 탭 화면마다 `SafeAreaProvider`를 두므로 레일·`'standard'` 바가 차지한 영역의 시스템 inset(내비게이션 바, 시작 측 cutout)이 탭 화면에 다시 적용되지 않습니다. 떠 있는 바(`'floating'`)은 탭 화면이 아래 끝까지 깔리므로 내비게이션 바 inset을 받습니다.
- 레일은 표면을 칠하지 않습니다(M3 — 화면과 같은 표면, 선택 표시로만 구분). 레일 열은 `ZSTabNavigator`를 둔 Stack 화면의 배경을 따르므로, 탭 화면이 기본(`background`)과 다른 배경을 쓰면 `<Stack.Screen options={{ contentStyle: { backgroundColor } }} />`로 같은 색을 줍니다. `'standard'` 바는 자기 표면(`surface3`)을, 떠 있는 바은 블러 바탕을 칠합니다.
- [투명 헤더](./Stack#투명-헤더-기본) 아래에서 레일은 헤더 아래에서 시작합니다. 레일 위 칸(헤더 아래, 탭 화면 밖)은 선택된 탭 화면의 헤더 바탕과 같은 색으로 함께 바뀌어, 스크롤 뒤 채운 헤더가 레일 열에서 끊기지 않습니다. 바깥 헤더를 숨기고 탭마다 Stack을 두면 레일이 화면 위끝부터 이어지고 헤더는 그 옆에 놓입니다.

#### 탭 화면의 safe area

탭 안의 `useSafeAreaInsets()`·`SafeAreaView`는 두 플랫폼 모두 **탭 화면 기준**입니다. 각 탭의 `SafeAreaProvider`가 그 위치에서 inset을 잽니다(iOS는 expo-router `NativeTabs`, Android는 `ZSTabNavigator`가 제공합니다).

| 플랫폼 | safe area 범위 | 별도로 비킬 높이 |
|--------|----------------|------------------|
| iOS | 탭 화면 기준 — UIKit이 헤더·탭 바를 포함합니다 | 없음 — `useTabBarInset()`·`useHeaderInset()` 모두 `0` |
| Android | 탭 화면 기준 — 그 영역과 겹치는 시스템 바만 포함합니다. 떠 있는 바·투명 헤더는 시스템 바가 아니므로 빠집니다 | 떠 있는 바은 `useTabBarInset()`, 투명 헤더는 [`useHeaderInset()`](./Stack#투명-헤더-기본)으로 비킵니다 |

직접 만든 목록의 아래 여백은 두 플랫폼 모두 `insets.bottom + useTabBarInset()`입니다. `ZSScreen`·`ZSPaneLayout`은 자체 provider와 겹침 처리로 자동 적용합니다.

## 테마

색·서체는 [ThemeProvider](../Provider/ThemeProvider) 색 역할에서 자동으로 적용합니다.

| 항목 | iOS | Android |
|------|-----|---------|
| 선택 아이콘 | `primaryMark`(tint) | `primaryMark` |
| 선택 라벨 | `primaryMark` | `primaryMark` |
| 선택 바탕 | 시스템(아이콘·라벨을 감싼 캡슐) | `surface4` — 떠 있는 바은 iOS처럼 아이콘·라벨을 함께 감싼 캡슐이고 누름 리플도 캡슐 전체에 그립니다. 레일·`'standard'` 바는 M3 표시(아이콘 둘레) |
| 비선택 아이콘·라벨 | 시스템. `unselectedIconColor`·`unselectedLabelColor`는 iOS 25 이하에서만 적용됩니다 — iOS 26 이상 Liquid Glass 탭 바는 비선택 색을 시스템이 정합니다(UIKit `normal` 상태 색·`unselectedItemTintColor` 무시) | `text`(iOS 탭 바처럼 본문 색) — 같은 prop으로 바꿉니다 |
| 바 배경 | 시스템 재질(Liquid Glass) | 떠 있는 바은 흐림 막(위 [바탕](#하단-바-모양--barstyle)), `'standard'` 바 `surface3`, 레일 투명 |
| 배지 | 바탕 `error`, 숫자는 시스템 흰색. 흰 숫자와 대비가 4.5:1이 안 되면(다크 등) 같은 색조의 진한 빨강 | `error` · `onError` |
| 라벨 서체 | 시스템 | 브랜드 글꼴(500에 가까운 굵기, `fonts`) |

## 접근성

iOS는 `UITabBar`, Android는 Material 3 내비게이션 항목의 기본 스크린 리더 동작을 따릅니다. 라벨은 항상 보이고(아이콘만 있는 탭을 두지 않습니다), 배지 값도 함께 읽힙니다. 라벨과 다른 이름을 읽혀야 하면 `options.accessibilityLabel`을 줍니다 — iOS 접근성 라벨, Android 탭 항목 `contentDescription`입니다. 탭 라벨의 글자 크기 상한은 [글꼴 역할](../Theme/typography)을 보세요.

## 관련 문서

- [Stack 테마 · 헤더](./Stack) — `useNavigationTheme`·`useStackTheme`
- [ZSSegmentedControl](../UiComponent/ZSSegmentedControl) — 화면 안 하위 보기 전환
- [LayoutProvider](../Layout/LayoutProvider) — Android 바·레일 판단에 쓰는 창 크기 클래스·자세, 바 배치(`barAxis`)
