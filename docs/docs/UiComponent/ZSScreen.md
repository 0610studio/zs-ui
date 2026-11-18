# ZSScreen

화면 하나의 루트 컨테이너입니다. safe area·스크롤·키보드 대응·넓은 창 폭을 한 번에 처리하므로 `SafeAreaView`·`KeyboardAvoidingView`·`ScrollView`를 따로 조합하지 않습니다. 같은 화면 안 2-pane은 [ZSPaneLayout](../Layout/ZSPaneLayout), 키보드 바로 위에 붙는 버튼·툴바는 [ZSKeyboardStickyView](./ZSKeyboardStickyView)를 씁니다.

## 기본 사용법

```tsx
import { ZSButton, ZSScreen, ZSText } from '@0610studio/zs-ui';

function EditScreen() {
  return (
    <ZSScreen bottomComponent={<ZSButton title="저장" fullWidth onPress={save} />}>
      <ZSText variant="h2" emphasized>제목</ZSText>
      <ZSText>본문 내용</ZSText>
    </ZSScreen>
  );
}
```

[LayoutProvider](../Layout/LayoutProvider) 아래에서 동작합니다(창 크기 클래스·가독 폭).

## Props — `ZSScreenProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `backgroundColor` | `ColorName \| string` | 콘텐츠 `style`의 배경 → `'background'` | 화면 표면색 — 색 역할 이름 또는 직접 지정한 색. safe area 영역까지 같은 색으로 칠합니다 |
| `edges` | `Array<'top' \| 'right' \| 'bottom' \| 'left'>` | 영역별 자동 | 지정하면 그 방향만 safe area 패딩으로 처리합니다 — [Safe area](#safe-area) |
| `maxContentWidth` | `'readable' \| number \| 'none'` | `'none'` | 넓은 창에서 콘텐츠·`topComponent`·`bottomComponent`의 최대 폭 — [넓은 창 폭](#넓은-창-폭) |
| `scrollEnabled` | `boolean` | `true` | `false`면 `ScrollView` 없이 고정 `View`로 그립니다(키보드 자동 스크롤·`refreshControl`·`bounces`도 꺼짐) |
| `refreshControl` | `ReactElement<RefreshControlProps>` | `undefined` | 당겨서 새로고침 — [아래](#당겨서-새로고침) |
| `bounces` | `boolean` | `refreshControl`이 있으면 `true`, 없으면 `false` | 스크롤 끝에서 튕김(iOS). Android는 오버스크롤 효과(`overScrollMode`)를 같은 값으로 켜고 끕니다 |
| `topComponent` | `ReactNode` | `undefined` | 스크롤 밖 상단에 고정하는 영역 |
| `bottomComponent` | `ReactNode` | `undefined` | 스크롤 밖 하단에 고정하는 영역. 배경은 `backgroundColor`와 같게 둡니다 — [Safe area](#safe-area) |
| `bottomComponentPlacement` | `'full' \| 'start' \| 'end'` | `'full'` | 넓은 창에서 `bottomComponent`를 놓을 자리 — 전폭, 시작 쪽 절반, 끝 쪽 절반. compact 창은 늘 전폭입니다 — [아래 영역 위치](#아래-영역-위치) |
| `showsVerticalScrollIndicator` | `boolean` | `true` | 세로 스크롤 인디케이터 표시 |
| `scrollToFocusedInput` | `boolean` | `true` | 키보드가 포커스 입력을 가리면 가린 만큼 스크롤 — [키보드 자동 스크롤](#키보드-자동-스크롤) |
| `keyboardScrollExtraOffset` | `number` | `30` | 포커스 입력 하단과 키보드 상단 사이 여유(pt·dp). 키보드 위 CTA가 있으면 그 높이를 더합니다 |
| `onScroll` | `(event: NativeSyntheticEvent<NativeScrollEvent>) => void` | `undefined` | 스크롤 이벤트 핸들러 |
| `scrollEventThrottle` | `number` | `16` | 스크롤 이벤트 스로틀(ms) |
| `...props` | `ViewProps` | `undefined` | 콘텐츠 뷰에 적용하는 `View` 속성(`style`·`testID`·접근성 등) |

`ZSScreenProps`·`ZSScreenRef`·`ZSScreenBottomPlacement` 타입을 내보냅니다. `ref`(`ZSScreenRef`)는 안쪽 `ScrollView`입니다 — `ref.current?.scrollTo({ y: 0, animated: true })`. `scrollEnabled={false}`면 `ScrollView`를 그리지 않아 `null`입니다.

## Safe area

`edges`를 지정하지 않으면 영역마다 알맞게 처리합니다.

| 영역 | iOS | Android |
|------|-----|---------|
| 좌·우 | safe area 패딩(가로 회전 시 측면 Dynamic Island·cutout 회피) | safe area 패딩 |
| 스크롤 상·하 | UIKit 자동 조정 — 네이티브 헤더·탭바 아래로 콘텐츠가 흐름 | 상·하 inset 패딩 |
| 고정 영역(`bottomComponent`·`scrollEnabled={false}`) | 하단 inset | 하단 inset |
| 투명 헤더 아래([Stack](../Navigation/Stack) 기본) | `topComponent`·고정 영역은 safe area(내비게이션 바 포함)만큼 비킴, 스크롤은 위와 같음 | 헤더 높이만큼 콘텐츠를 내리고, 스크롤되면 헤더 영역에 짙은 흐림 막(96%)과 아래 0.5 선을 깜([ZSHeaderBackground](../Navigation/Stack#직접-스크롤하는-화면--useheaderinset--zsheaderbackground)) |

- inset은 창이 아니라 컨테이너 위치 기준입니다. 헤더 아래 컨테이너는 top이 0, 탭바 위 컨테이너는 bottom이 그만큼 줄어듭니다. 컨테이너 안의 `useSafeAreaInsets()`도 같은 값을 받습니다.
- 콘텐츠의 `flex: 1` 자식은 inset 안쪽 남은 높이를 채웁니다.
- 헤더가 없는 화면은 top inset이 0일 수 있으니(아이폰 듀오, iPhone 가로) 맨 위에 디자인 여백을 두세요.
- 하단 inset(홈 인디케이터)과 좌·우 inset(아이폰 듀오 레일, 가로 Dynamic Island)은 표면색(`backgroundColor`)으로 칠합니다. `bottomComponent`에 다른 배경색을 주면 그 둘레에 띠가 생기므로 표면색과 같게 둡니다.

```tsx
<ZSScreen edges={['top', 'bottom']}>{/* 상·하만 직접 지정 */}</ZSScreen>
<ZSScreen edges={[]}>{/* safe area 없음(엣지 투 엣지) */}</ZSScreen>
```

## 넓은 창 폭

기본은 전폭입니다 — 창 폭은 기기마다 다르므로 여백만 고정합니다. 글이 길게 이어지거나 이름·값이 한 줄에 나란한 화면은 아주 넓은 창(iPad 가로 등)에서 `"readable"`이나 숫자를 주세요.

```tsx
<ZSScreen>{/* 기본: 전폭 */}</ZSScreen>
<ZSScreen maxContentWidth="readable">{/* LayoutProvider readableMaxWidth — iOS readableContentGuide, Android 640 */}</ZSScreen>
<ZSScreen maxContentWidth={600}>{/* 두 플랫폼 모두 600 */}</ZSScreen>
```

- 넓은 창(`medium`·`expanded`)에만 적용하고 compact 창은 전폭입니다.
- `topComponent`·`bottomComponent`도 본문과 같은 열에 놓입니다.
- 스크롤 뷰 자체는 전폭이라 측면 여백에서도 스크롤되고, 인디케이터는 창 가장자리에 붙습니다.
- iOS `readableContentGuide`는 기기에 따라 창 전체 폭이 되기도 합니다. 두 플랫폼을 같게 하려면 숫자를 주세요.

## 아래 영역 위치

넓은 창을 두 칸(목록 | 상세)으로 나눈 화면에서 CTA가 한 칸에만 해당하면 `bottomComponentPlacement`로 그 칸 아래에만 둡니다. 다른 칸은 화면 아래 끝까지 씁니다.

```tsx
<ZSScreen scrollEnabled={false} bottomComponent={<WriteButton />} bottomComponentPlacement="start">
  <View style={{ flex: 1, flexDirection: 'row' }}>
    <ListPane />   {/* 아래에 CTA가 겹친다 — useScreenBottomInset() 만큼 끝 여백 */}
    <DetailPane /> {/* 아래 끝까지 */}
  </View>
</ZSScreen>
```

| 값 | 넓은 창(`medium`·`expanded`) | compact 창 |
|----|------|------|
| `'full'` | 본문 아래 전폭 | 본문 아래 전폭 |
| `'start'` | 본문 위 바닥, 시작 쪽 절반 폭(RTL이면 오른쪽) | 본문 아래 전폭 |
| `'end'` | 본문 위 바닥, 끝 쪽 절반 폭 | 본문 아래 전폭 |

- 절반 폭은 화면(또는 `maxContentWidth` 열)의 50%입니다. 칸 사이 간격·화면 여백은 `bottomComponent` 안의 패딩으로 칸 가장자리에 맞춥니다.
- `start`·`end`면 본문이 CTA 아래로 흐릅니다. 스크롤 본문은 CTA 높이만큼 아래 여백을 자동으로 더하고, 칸마다 따로 스크롤하는 화면은 겹치는 칸에서 `useScreenBottomInset()`(CTA 높이, 전폭이면 `0`)을 아래 여백으로 씁니다. 훅은 `ZSScreen` 자식 안에서 부릅니다.
- 아래 safe area(홈 인디케이터)는 두 칸 모두 비웁니다. 스낵바는 CTA 윗변 위에 뜹니다.

## 키보드 자동 스크롤

`scrollToFocusedInput`(기본 켬)이면 포커스한 입력이 키보드에 가릴 때만 가린 만큼 스크롤합니다. 탭·다음 키·`ref.focus()` 모두 같은 규칙입니다. Android에서 키보드가 떠 있는 동안 포커스를 옮길 때는 [ZSTextField](./ZSTextField)만 따라 스크롤합니다. 이 컨테이너 안의 입력만 대상이고, 시트·모달 위 입력은 스크롤하지 않습니다.

얼마나 올릴지는 화면 좌표로 잽니다 — 지금 스크롤 위치(스크롤 뷰 윗변과 콘텐츠 윗변의 차이)에 가린 만큼을 더합니다. iOS 네이티브 헤더 아래(`edges` 생략)에서는 UIKit 자동 인셋 때문에 맨 위 정지 위치가 `0`이 아니라 `-인셋`이라, 목표가 `-인셋`과 `0` 사이일 수 있습니다. React Native의 `scrollTo`는 이 범위를 `0`으로 잘라 헤더·상태 표시줄 높이만큼 더 올려 버리므로, 이 경우에만 `scrollToOverflowEnabled`를 켭니다. 키보드가 떠 있는 동안 본문 아래 여백은 키보드 높이에 `keyboardScrollExtraOffset`을 더한 값이라, 가린 만큼 올려도 스크롤 끝을 넘지 않습니다.

```tsx
<ZSScreen keyboardScrollExtraOffset={50}>
  <ZSTextField label="이름" value={name} onChangeText={setName} />
  <ZSTextField label="이메일" value={email} onChangeText={setEmail} />
</ZSScreen>
```

키보드 위에 CTA를 붙이는 화면은 [ZSKeyboardStickyView](./ZSKeyboardStickyView#zsscreen과-함께-쓰기)를 보세요.

## 당겨서 새로고침

React Native `RefreshControl`을 `refreshControl`로 넘깁니다. `refreshing`은 제어 값이라 `onRefresh`에서 켜고, 불러오기가 끝나면 끕니다.

```tsx
const { colors } = useTheme();
const [refreshing, setRefreshing] = useState(false);
const refresh = async () => {
  setRefreshing(true);
  await reload();
  setRefreshing(false);
};

<ZSScreen
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressBackgroundColor={colors.surface3}
    />
  }
>
  <ZSText>목록</ZSText>
</ZSScreen>
```

- 스피너는 시스템이 그려 테마를 따르지 않습니다. 위 예제처럼 iOS `tintColor`, Android `colors`·`progressBackgroundColor`에 테마 색을 넘깁니다.
- 투명 헤더 아래에서는 스피너가 헤더 아래에서 나옵니다. `edges`를 직접 지정한 화면은 Android에서 [`useHeaderInset()`](../Navigation/Stack) 값을 `progressViewOffset`으로 넘깁니다.

## 상태바

상태바 아이콘은 테마를 따릅니다. 시스템과 다른 수동 테마도 같습니다. 방법과 화면별로 바꾸는 법은 플랫폼과 iOS Info.plist `UIViewControllerBasedStatusBarAppearance` 값에 따라 다릅니다.

| 플랫폼·설정 | 테마를 따르는 방법 | 화면마다 바꾸기 |
|-------------|--------------------|-----------------|
| iOS `true` (Expo SDK 58.0.23 이상 템플릿 기본값) | [`useStackTheme()`](../Navigation/Stack)이 테마 모드의 `statusBarStyle`을 넣습니다 | Stack 화면 옵션 `statusBarStyle: 'light'` 등 |
| iOS `false` (그 전 템플릿) | [ThemeProvider](../Provider/ThemeProvider)의 `Appearance` 동기화 | Xcode 27(iOS 27 SDK)로 빌드하면 바꿀 수 없습니다. Stack `statusBarStyle`은 레드 박스가 납니다 |
| Android | ThemeProvider | `expo-status-bar`의 `<StatusBar style="light" />` 등 |

- iOS `true`에서는 Stack `screenOptions`에 `useStackTheme()`을 넣어야 상태바가 테마를 따릅니다. 넣지 않으면 앱 테마가 시스템과 다를 때 상태바가 시스템 모드로 남습니다(다크 테마에 검은 글자).
- iOS에서 `expo-status-bar`·React Native `StatusBar`는 expo-router Stack 화면에서 효과가 없습니다. Stack 화면이 있으면 react-native-screens가 화면별 `statusBarStyle`로 상태바를 정하기 때문입니다.
- 값은 prebuild 때 Info.plist에 들어갑니다. 바꾸려면 `app.json`의 `ios.infoPlist.UIViewControllerBasedStatusBarAppearance`를 정하고 다시 prebuild합니다. 그 전 템플릿으로 만든 `ios` 폴더는 `false`로 남아 있습니다.

iOS에서 상태바를 탭하면 스크롤이 맨 위로 갑니다. 시트·진행 표시가 화면을 덮고 있는 동안에는 가려진 화면이 반응하지 않습니다 — 오버레이 위쪽 버튼을 누를 때 가려진 화면까지 맨 위로 올라가지 않게 하려는 것입니다. 컨테이너 밖에서 직접 쓰는 `ScrollView`·`FlatList`에는 적용되지 않습니다.

## 관련 문서

- [ZSKeyboardStickyView](./ZSKeyboardStickyView) — 키보드 위 CTA
- [ZSPaneLayout](../Layout/ZSPaneLayout) — 같은 화면 안 2-pane
- [LayoutProvider](../Layout/LayoutProvider) — `readableMaxWidth`
- [Stack 테마 · 헤더](../Navigation/Stack) — 투명 헤더·`useHeaderInset`
