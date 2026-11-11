# ThemeProvider

브랜드 시드 색으로 Material 3 색 역할을 만들고, 글꼴 역할·그림자·다크 모드·대비를 앱 전체에 공급합니다. 같은 테마를 네이티브 헤더·키보드·시스템 바·시스템 컨트롤에도 넘깁니다.

## 기본 사용법

```tsx
<ThemeProvider colors={{ primary: '#ffa20d' }}>
</ThemeProvider>
```

`LayoutProvider` 안쪽, `OverlayProvider` 바깥쪽에 둡니다. 루트 레이아웃 전체 코드는 [시작하기](./start#2-provider-설정)에 있습니다.

## Props — `ThemeProviderProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `colors` | `ThemeColorOptions` | `DEFAULT_COLORS` | 브랜드 시드 색. 여기서 라이트·다크·고대비 색 역할을 만듭니다 — [브랜드 색](#브랜드-색--colors) |
| `fonts` | `ThemeFonts` | `undefined` | 굵기별 글꼴 이름. 없으면 시스템 글꼴과 `fontWeight`를 씁니다 |
| `fontAssets` | `ThemeFontAssets` | `undefined` | `fonts`와 같은 키의 글꼴 **파일**(`require(...)`). Skia 캔버스(`ZSCalendar` 날짜 숫자·일정 칩 글자)가 씁니다 |
| `darkMode` | `boolean` | `true` | `false`면 항상 라이트입니다. 저장된 선택도 무시합니다 |
| `contrast` | `ContrastPreference` | `'system'` | `'system' \| 'standard' \| 'high'` — [대비](#대비--contrast) |
| `dynamicColor` | `boolean` | `false` | Android 12 이상에서 배경화면 색을 primary 시드로 씁니다 — [dynamic color](#android-dynamic-color--dynamiccolor) |
| `syncNativeAppearance` | `boolean` | `true` | 앱 테마 모드를 `Appearance.setColorScheme`으로 네이티브 UI에 반영합니다 — [네이티브 UI 동기화](#네이티브-ui-동기화--syncnativeappearance) |
| `accessibilityLabels` | `Partial<AccessibilityLabels>` | 영어 | 컴포넌트가 스크린 리더에 읽히는 기본 문구 — [스크린 리더 문구](#스크린-리더-문구--accessibilitylabels) |
| `maxFontSizeMultiplier` | `number` | `2` | 글자 확대 상한(시스템 글자 크기 배율). zs-ui 글자가 이 배율까지만 커집니다. `0`이면 제한하지 않습니다 — [적용 범위](../Theme/typography#앱-전체-상한--maxfontsizemultiplier) |
| `children` | `ReactNode` | Required | 앱 |

`ThemeProviderProps`·`ThemeContextValue`·`ColorSchemePreference`·`ContrastPreference`·`AccessibilityLabels` 타입을 내보냅니다.

## 브랜드 색 — `colors`

```tsx
<ThemeProvider
  colors={{
    primary: '#2f6bff',
    secondary: '#26b3a8',
    error: '#ff4d6f',
    neutral: '#5b6170',
  }}
>
</ThemeProvider>
```

| 필드 | 설명 |
|------|------|
| `primary` | 필수입니다. 주 버튼·선택 면 같은 채움 강조에 씁니다. 밝은 시드(톤 60 이상)는 그대로 `primary`가 되고 그 위 글자는 어두운 색입니다 — [만드는 방법](../Theme/colors#만드는-방법) |
| `secondary` · `tertiary` | 보조 강조입니다. `secondary`·`tertiary`를 생략하면 `primary`에서 파생합니다. 회색 버튼은 `neutral` 팔레트 색을 씁니다 |
| `error` · `success` · `warning` · `info` | 상태 색입니다. 생략하면 [`DEFAULT_COLORS`](../Theme/colors#default_colors)를 씁니다 |
| `neutral` | 배경·글자 회색의 색조입니다. 생략하면 무채색(흰·회색)입니다 |

생성되는 값은 [색 역할](../Theme/colors)을 참고하세요.

## 글꼴 — `fonts` · `fontAssets`

```tsx
import { useFonts } from 'expo-font';

const fonts = { 400: 'Pretendard-Regular', 600: 'Pretendard-SemiBold', 700: 'Pretendard-Bold' };
const fontAssets = {
  400: require('../assets/fonts/Pretendard-Regular.otf'),
  600: require('../assets/fonts/Pretendard-SemiBold.otf'),
  700: require('../assets/fonts/Pretendard-Bold.otf'),
};

export default function RootLayout() {
  const [loaded] = useFonts({
    'Pretendard-Regular': fontAssets[400],
    'Pretendard-SemiBold': fontAssets[600],
    'Pretendard-Bold': fontAssets[700],
  });
  if (!loaded) return null;

  return (
    <ThemeProvider fonts={fonts} fontAssets={fontAssets}>
    </ThemeProvider>
  );
}
```

- `ThemeFonts`의 키는 `100`~`900`입니다. 대표 굵기만 등록하면 없는 굵기는 가장 가까운 굵기(거리가 같으면 더 굵은 쪽)로 대신합니다.
- 글꼴 이름을 쓰면 `fontWeight`를 함께 넣지 않습니다. iOS가 같은 계열에서 다른 굵기를 고르기 때문입니다.
- 글꼴 로딩에 쓰는 `expo-font`는 `npx expo install expo-font`로 설치합니다.

## 다크 모드

| 상황 | 동작 |
|------|------|
| 기본 | `colorSchemePreference`가 `'system'`이라 OS 설정을 따릅니다 |
| `setColorSchemePreference('dark')` | 수동 선택입니다. AsyncStorage(`@zs-ui/color-scheme`)에 저장되어 앱을 다시 열어도 유지됩니다 |
| `toggleTheme()` | 지금 보이는 모드의 반대로 수동 전환합니다 |
| `darkMode={false}` | 항상 라이트입니다. 저장값을 무시하고 `setColorSchemePreference`는 아무것도 하지 않습니다 |

```tsx
import { ZSSegmentedControl, useTheme, type ColorSchemePreference, type ZSSegmentedControlOption } from '@0610studio/zs-ui';

const APPEARANCES: ZSSegmentedControlOption<ColorSchemePreference>[] = [
  { label: '시스템', value: 'system' },
  { label: '라이트', value: 'light' },
  { label: '다크', value: 'dark' },
];

function AppearanceSetting() {
  const { colorSchemePreference, setColorSchemePreference } = useTheme();
  return <ZSSegmentedControl options={APPEARANCES} value={colorSchemePreference} onValueChange={setColorSchemePreference} />;
}
```

### 네이티브 UI 동기화 — `syncNativeAppearance`

켜져 있으면(기본) 선택한 모드를 `Appearance.setColorScheme`으로 네이티브에 알립니다(`'system'`이면 `'auto'`). 그래서 네이티브 헤더·키보드·시트가 앱 테마를 따릅니다.

앱이 `Appearance`를 직접 제어해야 하면 `syncNativeAppearance={false}`로 끕니다. 끄면 네이티브 UI는 시스템 설정을 따르고 zs-ui 색만 바뀝니다. Android 상태 바·내비게이션 바 아이콘 색은 이 설정과 관계없이 앱 테마 모드에 맞춥니다(`expo-navigation-bar`). iOS Info.plist `UIViewControllerBasedStatusBarAppearance`가 `true`면 [`useStackTheme`](../Navigation/Stack)을 넣은 Stack 화면의 상태바도 이 설정과 관계없이 앱 테마 모드를 따릅니다.

## 대비 — `contrast`

| 값 | `contrastLevel` | 설명 |
|----|-----------------|------|
| `'system'` (기본) | 0 ~ 1 | iOS는 손쉬운 사용 '대비 증가'(켜면 1), Android는 대비 설정(14 이상, 0·0.5·1) 또는 고대비 텍스트(켜면 1)를 따릅니다. 설정이 바뀌면 바로 반영합니다 |
| `'standard'` | 0 | 시스템 설정을 무시합니다 |
| `'high'` | 1 | 항상 높은 대비입니다 |

색 역할은 대비 수준(`contrastLevel`)으로 만들어지므로, 고대비에서는 글자·선 색이 배경과 더 크게 대비됩니다. 면과 `primary` 면은 그대로입니다.

## Android dynamic color — `dynamicColor`

```tsx
<ThemeProvider colors={{ primary: '#ffa20d' }} dynamicColor>
</ThemeProvider>
```

Android 12 이상에서 배경화면 색을 primary 시드로 씁니다. 앱이 다시 활성화될 때(배경화면을 바꾸고 돌아온 경우) 다시 읽습니다. 나머지 시드(`secondary`·상태 색 등)는 그대로이고, iOS와 Android 11 이하에서는 효과가 없습니다. 브랜드 색을 대신하므로 기본은 끕니다.

## 네이티브 컨트롤에 넘기는 테마

zs-ui가 감싼 시스템 컨트롤과 오버레이는 앱의 색 모드와 강조 색을 받고, 버튼 색·모서리 같은 브랜드 모양은 받지 않습니다. 플랫폼별로 무엇을 넘기는지는 [색 역할 — 네이티브 컨트롤에 넘기는 테마](../Theme/colors#네이티브-컨트롤에-넘기는-테마)를 봅니다.

## 스크린 리더 문구 — `accessibilityLabels`

글자 없이 아이콘만 있는 버튼(지우기·닫기)과 진행 표시는 스크린 리더가 읽을 문구가 필요합니다. 기본값은 영어이고, 앱 언어가 다르면 루트에서 한 번 넘깁니다. 넘긴 키만 바뀌고 나머지는 영어 기본값을 씁니다.

```tsx
<ThemeProvider
  colors={{ primary: '#ffa20d' }}
  accessibilityLabels={{
    clearText: '지우기',
    closeMessage: '메시지 닫기',
    closeTooltip: '툴팁 닫기',
    loading: '불러오는 중',
    navigateUp: '뒤로',
  }}
>
</ThemeProvider>
```

| 키 | 기본값 | 쓰는 곳 | 화면별로 바꾸는 prop |
|----|--------|---------|----------------------|
| `clearText` | `'Clear text'` | [ZSTextField](../UiComponent/ZSTextField) 지우기 버튼 | `clearAccessibilityLabel` |
| `closeMessage` | `'Close message'` | [ZSBanner](../UiComponent/ZSBanner) 닫기 버튼 | `closeAccessibilityLabel` |
| `closeTooltip` | `'Close tooltip'` | [ZSTooltip](../UiComponent/ZSTooltip) 닫기 버튼 | `closeAccessibilityLabel` |
| `loading` | `'Loading'` | [showLoader](../OverlayComponent/Loader) 진행 표시 | `showLoader({ accessibilityLabel })` |
| `navigateUp` | `'Navigate up'` | Android 상단 바 뒤로 버튼([useStackTheme](../Navigation/Stack#반환값--stacktheme)) | — |

우선순위는 컴포넌트 prop → `accessibilityLabels` → 영어 기본값입니다.

## useTheme

`ThemeProvider` 안에서 테마 값을 읽습니다. 밖에서 부르면 `useTheme must be used within a ThemeProvider` 에러를 던집니다.

```tsx
import { Text, View } from 'react-native';
import { useTheme } from '@0610studio/zs-ui';

function Card() {
  const { colors, typography, shadows } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.surface1, borderRadius: 16, padding: 16 }, shadows.xs]}>
      <Text style={[typography.subtitle1, { color: colors.text }]}>제목</Text>
      <Text style={[typography.subtitle2, { color: colors.textSecondary }]}>설명</Text>
    </View>
  );
}
```

### 반환값 — `ThemeContextValue`

| 필드 | Type | 설명 |
|------|------|------|
| `colors` | `ThemeColors` | 현재 모드·대비의 색 역할입니다 — [색 역할](../Theme/colors) |
| `typography` | `TypographyStyles` | 글꼴 역할별 `TextStyle`과 `emphasized`입니다 — [글꼴 역할](../Theme/typography) |
| `shadows` | `ShadowStyles` | 단계(`none`~`xl`)별 `boxShadow` 스타일입니다 — [토큰](../Theme/tokens#그림자--shadow) |
| `mode` | `ColorMode` | 지금 보이는 모드 `'light' \| 'dark'`입니다 |
| `contrastLevel` | `number` | 0 표준 · 0.5 중간 · 1 높음 |
| `seedColor` | `string` | 실제로 쓰는 primary 시드입니다(dynamic color면 배경화면 색) |
| `fonts` | `ThemeFonts \| undefined` | `ThemeProvider`에 넘긴 글꼴 이름입니다 |
| `fontAssets` | `ThemeFontAssets \| undefined` | `ThemeProvider`에 넘긴 글꼴 파일입니다 |
| `colorSchemePreference` | `ColorSchemePreference` | `'system' \| 'light' \| 'dark'` |
| `setColorSchemePreference` | `(preference) => void` | 선택을 바꾸고 저장합니다 |
| `toggleTheme` | `() => void` | 지금 보이는 모드의 반대로 수동 전환합니다 |
| `accessibilityLabels` | `AccessibilityLabels` | 영어 기본값에 `accessibilityLabels`를 덮은 스크린 리더 문구입니다 |
| `maxFontSizeMultiplier` | `number` | 글자 확대 상한(`0`이면 제한 없음)입니다. 글자 크기로 레이아웃을 직접 계산할 때 상한이 1 이상이면 `Math.min(fontScale, 상한)`, `0`이면 `fontScale` 그대로 씁니다 |

## useStyles

테마 값으로 스타일을 만들 때 씁니다. 생성 함수는 `useTheme()` 반환값(`ThemeContextValue`) 전체를 받고, 테마 값이 바뀔 때만 다시 실행됩니다.

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { RADIUS, useStyles } from '@0610studio/zs-ui';

function Card() {
  const styles = useStyles(({ colors, typography, shadows }) =>
    StyleSheet.create({
      card: { backgroundColor: colors.surface1, borderRadius: RADIUS.lg, padding: 16, ...shadows.xs },
      title: { ...typography.subtitle1, color: colors.text },
    }),
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>카드</Text>
    </View>
  );
}
```

## 관련 문서

- [색 역할](../Theme/colors) · [글꼴 역할](../Theme/typography) · [토큰](../Theme/tokens)
- [Stack 테마 · 헤더](../Navigation/Stack) — 헤더·화면 배경을 테마에 맞추기
