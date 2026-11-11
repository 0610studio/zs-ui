# 글꼴 역할

zs-ui는 글꼴을 **글꼴 역할**(variant)로 고릅니다. 크기·행간·굵기·자간은 두 플랫폼 같은 표 하나라 JS로 그리는 컴포넌트가 iOS·Android에서 같은 모양입니다. 크기는 iOS Dynamic Type 기본(Large) 크기에 맞췄고, iOS에서는 variant마다 대응하는 Dynamic Type 텍스트 스타일의 확대 곡선을 따릅니다.

```tsx
import { ZSText } from '@0610studio/zs-ui';

<ZSText variant="h3">섹션 제목</ZSText>
<ZSText>본문 (기본 body1)</ZSText>
<ZSText variant="caption" color="textSecondary">보조 설명</ZSText>
```

## variant — `TextVariant`

`TEXT_VARIANTS`는 아래 11개 variant 이름의 배열입니다. 값은 `fontSize / lineHeight`(pt·dp, Android 글자는 sp), 기본 굵기 → 강조(emphasized) 굵기, 자간(`letterSpacing`)입니다. 두 플랫폼 같습니다.

| variant | 크기 / 행간 | 굵기 | 자간 | iOS 텍스트 스타일 | 용도 |
|---------|-----------|------|------|------------------|------|
| `h1` | 34/42 | 700 → 700 | −0.8 | `largeTitle` | 화면 큰 제목 |
| `h2` | 28/36 | 700 → 700 | −0.5 | `title1` | 화면 제목 |
| `h3` | 22/30 | 700 → 700 | −0.3 | `title2` | 섹션 제목 |
| `h4` | 20/28 | 700 → 700 | −0.3 | `title3` | 작은 섹션 제목·Alert 제목 |
| `subtitle1` | 17/24 | 600 → 700 | −0.2 | `headline` | 목록 항목 제목·큰 버튼 라벨 |
| `subtitle2` | 15/22 | 600 → 700 | 0 | `subheadline` | 버튼·칩·세그먼트 라벨, 스낵바 문구 |
| `body1` | 17/24 | 400 → 500 | −0.1 | `body` | 본문 (기본), 입력 값 |
| `body2` | 15/22 | 400 → 600 | 0 | `subheadline` | 본문보다 작은 설명 |
| `caption` | 13/18 | 400 → 600 | 0 | `footnote` | 보조 문구·입력 필드 안내 |
| `label` | 12/16 | 600 → 700 | 0 | `caption1` | 작은 라벨·요일 |
| `overline` | 11/14 | 600 → 700 | 0 | `caption2` | 가장 작은 캡션 |

[커스텀 글꼴](../Provider/ThemeProvider#글꼴--fonts--fontassets)은 등록한 굵기 중 가장 가까운 것으로 그립니다([`fontFamilyFor`](#fontfamilyfor)). 위 표의 굵기(400·500·600·700)를 모두 등록하면 기본·강조 굵기가 그대로 갈립니다. 400·700만 등록하면 500은 400, 600은 700으로 그립니다.

## 글자 크기 설정

- **iOS**: `ZSText`는 variant에 대응하는 iOS 텍스트 스타일을 `dynamicTypeRamp`로 넘겨, 사용자의 글자 크기 설정을 그 텍스트 스타일 비율대로 따릅니다(작은 글자는 더 많이, 큰 제목은 덜 커집니다).
- **Android**: 시스템 글꼴 크기(sp 배율)를 따릅니다.

### 앱 전체 상한 — `maxFontSizeMultiplier`

[`ThemeProvider`](../Provider/ThemeProvider)의 `maxFontSizeMultiplier`(기본 **2배**)까지만 글자가 커집니다. 기본값은 Android 글자 크기 최대(200%)와 같습니다. `0`이면 제한하지 않습니다.

```tsx
<ThemeProvider maxFontSizeMultiplier={1.8}>
</ThemeProvider>
```

| 대상 | 앱 상한 |
|---|---|
| `ZSText`와 이를 쓰는 컴포넌트, `ZSTextField`(칸 높이 계산 포함) | 따릅니다 |
| `ZSCalendar` 캔버스 글자 | 따릅니다 |
| iOS SwiftUI 컨트롤(`ZSSwitch`·`ZSSelect`) | 따릅니다 — 가장 가까운 Dynamic Type 단계로 바꿔 겁니다 |
| Android Compose 컨트롤(`ZSSwitch` 라벨, `ZSSelect` 필드, `ZSMenu`) | 따르지 않습니다 — 시스템 배율까지 커집니다(기본 2배는 Android 최대와 같아 차이가 없습니다) |
| 앱이 직접 쓴 React Native `Text` | 따르지 않습니다 — `ZSText`를 쓰거나 `maxFontSizeMultiplier`를 직접 넘깁니다 |

`ZSText`·`ZSTextField`·`ZSButton`의 `maxFontSizeMultiplier` prop은 앱 상한보다 우선합니다.

좁은 곳에 놓이는 아래 글자는 자체 상한이 있고, 앱 상한이 더 낮으면 앱 상한을 따릅니다.

| 대상 | 자체 상한 |
|---|---|
| `ZSChip`·`ZSSegmentedControl` | 1.6배 |
| `ZSCalendar` 날짜 숫자 | 1.5배 |
| `ZSCalendar` 요일 | 1.4배 |
| `ZSCalendar` 일정 칩 | 1.3배 |
| Android 하단 탭·레일 라벨·배지([ZSTabNavigator](../Navigation/ZSTabNavigator)) | 1.3배 |

### 헤더·탭 바

바는 높이가 정해져 있어 글자 크기 설정을 거의 따르지 않습니다.

| | iOS | Android |
|---|-----|---------|
| 헤더 제목([Stack](../Navigation/Stack)) | 17pt 고정 | 20dp 고정(브랜드 글꼴은 600에 가까운 굵기) |
| 하단 탭·레일 라벨([ZSTabNavigator](../Navigation/ZSTabNavigator)) | 시스템 탭 바 — 커지지 않습니다 | 1.3배까지(앱 상한이 더 낮으면 그것) |

## `typography` — `TypographyStyles`

`useTheme().typography`는 variant별 `TextStyle`과, 같은 variant의 강조 스타일 묶음 `emphasized`입니다.

```tsx
import { Text } from 'react-native';
import { useTheme } from '@0610studio/zs-ui';

function Title() {
  const { typography, colors } = useTheme();
  return <Text style={[typography.emphasized.h4, { color: colors.text }]}>제목</Text>;
}
```

각 스타일은 `fontSize`·`lineHeight`, 자간이 있으면 `letterSpacing`, 글꼴을 등록했으면 `fontFamily`, 아니면 `fontWeight`를 담습니다. 직접 `Text`를 쓸 때 iOS Dynamic Type 램프까지 맞추려면 `dynamicTypeRamp`(위 표의 iOS 텍스트 스타일 이름 — 예: `h4`는 `title3`)도 함께 넘기거나 `ZSText`를 씁니다.

## API

### `TYPE_SCALE`

원본 값입니다. `TYPE_SCALE.ios[variant]`·`TYPE_SCALE.android[variant]`는 `TypeMetric`(`fontSize`·`lineHeight`·`weight`·`emphasizedWeight`)이고 두 플랫폼이 같은 표를 가리킵니다. 자간은 `TypeMetric`에 없고 `typography` 스타일에만 들어갑니다.

```ts
import { TYPE_SCALE, TEXT_VARIANTS } from '@0610studio/zs-ui';

TEXT_VARIANTS.map((variant) => `${variant} ${TYPE_SCALE.android[variant].fontSize}sp`);
```

### `createTypography`

```ts
function createTypography(fonts: ThemeFonts | undefined, platform?: 'ios' | 'android'): TypographyStyles;
```

`ThemeProvider`가 `fonts`로 부르는 함수입니다. `platform`을 생략하면 현재 플랫폼입니다. 크기표는 두 플랫폼 같습니다.

### `fontFamilyFor`

```ts
function fontFamilyFor(fonts: ThemeFonts | undefined, weight: number): string | undefined;
```

요청한 굵기에 가장 가까운 등록 글꼴 이름을 반환합니다. 거리가 같으면 더 굵은 쪽, 등록한 글꼴이 없으면 `undefined`입니다. 커스텀 컴포넌트에서 테마 글꼴을 고를 때 씁니다.

```ts
fontFamilyFor({ 400: 'Pretendard-Regular', 700: 'Pretendard-Bold' }, 500);
fontFamilyFor({ 400: 'Pretendard-Regular', 700: 'Pretendard-Bold' }, 600);

const { fonts } = useTheme();
fontFamilyFor(fonts, 500);
```

`TextVariant`·`FontWeight`(`400 | 500 | 600 | 700`)·`TypeMetric`·`ThemeFonts`·`ThemeFontAssets`·`FontAsset`·`TypographyStyles` 타입을 내보냅니다.

## 관련 문서

- [ZSText](../UiComponent/ZSText)
- [ThemeProvider — 글꼴](../Provider/ThemeProvider#글꼴--fonts--fontassets)
