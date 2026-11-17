# 시작하기

Expo SDK 58.0.26 이상·React Native 0.88 프로젝트에 zs-ui 2.1.6를 설치합니다. iOS·Android를 지원합니다.

## 1. 설치

zs-ui와 peer 의존성을 함께 설치합니다. `npx expo install`이 Expo SDK 58에 맞는 버전을 고릅니다.

```bash
npx expo install @0610studio/zs-ui@2.1.6 @expo/ui expo-router expo-navigation-bar \
  @react-native-async-storage/async-storage react-native-skia \
  react-native-reanimated react-native-worklets react-native-gesture-handler \
  react-native-safe-area-context react-native-screens react-native-svg expo-blur expo-status-bar
```

| peer | 버전 | 비고 |
|------|------|------|
| `expo` | `>=58.0.0` | |
| `react` | `*` | |
| `react-native` | `>=0.88.0` | |
| `@expo/ui` | `>=58.0.22` | 시스템 컨트롤·메뉴·시트 |
| `expo-router` | `>=58.0.26` | 탭·Stack |
| `expo-navigation-bar` | `>=58.0.0` | Android 시스템 바 아이콘 색 |
| `@react-native-async-storage/async-storage` | `*` | 다크 모드 선택 저장 |
| `react-native-skia` | `>=3.0.0` | `ZSCalendar`·`ZSSkeleton`·`ZSBorderBeam`. Skia v3(Graphite)라 Android `minSdkVersion` 26 이상·Vulkan 1.1, iOS 15.1 이상이 필요합니다 |
| `react-native-reanimated` | `>=4.7.0 <5.0.0` | |
| `react-native-worklets` | `>=0.13.0 <0.14.0` | |
| `react-native-gesture-handler` | `>=3.2.0 <4.0.0` | |
| `react-native-safe-area-context` | `>=5.9.0` | |
| `react-native-screens` | `>=4.30.0` | |
| `react-native-svg` | `*` | |
| `expo-blur` | `>=58.0.0` | 오버레이·툴팁·Android 떠 있는 탭 바·Android 헤더의 [흐림 막](../OverlayComponent/start#흐림-막) |
| `expo-status-bar` | `>=58.0.4` | iOS 세로 바 끄기 — [LayoutProvider `barAxis`](../Layout/LayoutProvider#바-배치--baraxis) |
| `expo-symbols` | `>=58.0.0` (선택) | Android 탭 아이콘에 Material Symbols(`md`)를 쓸 때만 |

zs-ui는 Expo Modules 네이티브 코드를 포함하므로 Expo Go가 아니라 [개발 빌드](https://docs.expo.dev/develop/development-builds/introduction/)로 실행합니다. 설치 뒤 `npx expo prebuild`(또는 `npx expo run:ios`·`npx expo run:android`)로 네이티브 프로젝트를 다시 만듭니다.

## 2. Provider 설정

expo-router 루트 레이아웃(`app/_layout.tsx`)에 Provider를 아래 순서로 둡니다.

| Provider | 맡는 것 |
|----------|--------|
| `SafeAreaProvider` | safe area inset (react-native-safe-area-context) |
| [`LayoutProvider`](../Layout/LayoutProvider) | 창 크기·크기 클래스·가독 폭·접힘선·자세 |
| [`ThemeProvider`](./ThemeProvider) | 색 역할·글꼴·다크 모드·대비 |
| [`OverlayProvider`](../OverlayComponent/start#overlayprovider) | Alert·시트·스낵바·진행 표시·포털 호스트. 테마 색을 읽으므로 `ThemeProvider` 안쪽에 둡니다 |

```tsx
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LayoutProvider, ThemeProvider, OverlayProvider, useNavigationTheme, useStackTheme } from '@0610studio/zs-ui';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LayoutProvider>
        <ThemeProvider colors={{ primary: '#ffa20d' }}>
          <OverlayProvider>
            <ThemedStack />
          </OverlayProvider>
        </ThemeProvider>
      </LayoutProvider>
    </SafeAreaProvider>
  );
}

function ThemedStack() {
  const navigationTheme = useNavigationTheme();
  const stackTheme = useStackTheme();
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ ...stackTheme, animation: 'slide_from_right' }} />
    </NavigationThemeProvider>
  );
}
```

- `colors.primary` 하나로 라이트·다크·고대비 색 역할을 만듭니다 — [색 역할](../Theme/colors).
- `useNavigationTheme()`·`useStackTheme()`은 네이티브 헤더·화면 배경을 테마에 맞춥니다 — [Stack 테마 · 헤더](../Navigation/Stack). 탭은 [ZSTabNavigator](../Navigation/ZSTabNavigator)를 씁니다.
- 브랜드 글꼴은 `ThemeProvider`의 [`fonts`·`fontAssets`](./ThemeProvider#글꼴--fonts--fontassets)로 넘깁니다.
- `ZSCalendar`를 쓰면 `GestureHandlerRootView`가 필요합니다 — [ZSCalendar](../UiComponent/ZSCalendar).
- 스크린 리더 기본 문구는 영어입니다. 앱 언어가 다르면 [`accessibilityLabels`](./ThemeProvider#스크린-리더-문구--accessibilitylabels)를 넘깁니다.

## 3. 첫 화면

```tsx
import { ZSButton, ZSScreen, ZSText, useOverlay } from '@0610studio/zs-ui';

export default function HomeScreen() {
  const { showAlert } = useOverlay();

  return (
    <ZSScreen
      style={{ gap: 12, padding: 20 }}
      bottomComponent={
        <ZSButton
          title="알림 보기"
          fullWidth
          onPress={() =>
            showAlert({
              title: 'zs-ui',
              message: '테마가 적용된 대화상자입니다.',
              confirm: { label: '확인' },
            })
          }
        />
      }
    >
      <ZSText variant="h1" emphasized>zs-ui</ZSText>
      <ZSText color="textSecondary">Expo용 iOS·Android UI 라이브러리</ZSText>
    </ZSScreen>
  );
}
```

iOS·Android 모두 zs-ui 대화상자가 앱 테마 색으로 뜹니다 — [Alert](../OverlayComponent/Alert).

## 다음 단계

- [ThemeProvider](./ThemeProvider) — 시드 색, 다크 모드·대비, Android dynamic color
- [오버레이 개요](../OverlayComponent/start) — Alert, BottomSheet, Snackbar, 진행 표시
- [UI 컴포넌트](../UiComponent/ZSText) — 텍스트, 버튼, 입력, 선택, 화면 컨테이너
- [레이아웃](../Layout/LayoutProvider) — 창 크기 클래스·접힘선·2-pane
