# 색 역할

zs-ui는 브랜드 시드 색으로 [Material 3 색 역할](https://m3.material.io/styles/color/roles)을 계산하고, 용도가 드러나는 이름(`background`·`text`·`border`·`surface1`~`surface5`·`primary` …)으로 내보냅니다. 앱 코드는 숫자 톤이 아니라 색 역할로 색을 고르고, 라이트·다크·고대비에서는 같은 역할이 다른 값을 갖습니다.

```tsx
const { colors } = useTheme();

<View style={{ backgroundColor: colors.surface3 }}>
  <Text style={{ color: colors.text }}>본문</Text>
</View>
```

## 만드는 방법

`ThemeProvider`는 시드 색, 모드, 대비 수준으로 `createThemeColors`를 호출합니다.

- `primary`는 채움 강조, `onPrimary`는 그 위의 글자·아이콘입니다.
- 밝은 시드의 `primary`는 채움에 쓰고, 작은 선택 표시에는 대비를 보정한 `primaryMark`를 씁니다.
- 배경·글자·선은 기본 무채색입니다. `neutral` 시드로 색조를 지정할 수 있습니다.
- `secondary`·`tertiary`는 생략하면 `primary`에서 파생합니다. 상태 색은 기본 시드를 사용합니다.
- 다크 모드와 고대비에서는 같은 색 역할의 값이 자동으로 바뀝니다.

## `DEFAULT_COLORS`

`colors`를 넘기지 않거나 일부만 넘기면 빈 자리를 기본 시드로 채웁니다. `secondary`·`tertiary`·`neutral`은 기본 시드가 없습니다(`secondary`·`tertiary`는 `primary`에서 만들고, `neutral`은 무채색입니다).

| 시드 | 기본값 |
|------|-------|
| `primary` | `#ffa20d` |
| `error` | `#ff4d6f` |
| `success` | `#4fd165` |
| `warning` | `#ffd700` |
| `info` | `#4981ff` |

## 색 규칙 — 채움과 얇은 표시

`primary`는 채움 색입니다. 글자나 얇은 선에는 쓰지 않습니다. 밝은 시드의 `primary`는 흰 바탕 위 글자·선으로 2:1 남짓이라(기본 호박 2.0:1) 읽히지 않습니다.

| 쓰임 | 색 | zs-ui 컴포넌트 |
|------|----|---------------|
| 넓은 채움 강조 | `primary` 면 + `onPrimary` 글자·아이콘 | `ZSButton` `filled`, 선택된 `ZSChip`, Android `ZSSelect`·`ZSMenu`의 고른 항목, `ZSSwitch` 켬, 스낵바 동작 버튼. `ZSCheckbox` 켬·고른 `ZSRadioGroup` 라디오도 `primary` 면이지만 체크·점은 흰색(플랫폼 기본 컨트롤처럼) |
| 얇은 선택 표시(3:1 필요) | `text` | `ZSTextField` 포커스 테두리·라벨·커서 |
| 글자 버튼·링크 | `text` | `ZSButton` `text`·`outlined`(`color="primary"`), 헤더 버튼·뒤로가기 |
| 주색 표시(아이콘·선택 라벨, 3:1) | `primaryMark` | `ZSTabNavigator` 선택 아이콘·라벨, `ZSCalendar` 선택 카드 위 숫자 |
| 브랜드 색조 글자(4.5:1) | `onPrimaryContainer` | `useStackTheme({ tint: 'primary' })`(밝은 시드일 때) |

선택 상태는 면 색 하나에 기대지 않습니다. 고른 칩·세그먼트·라디오 줄·달력 숫자는 굵기·체크로도 상태를 알립니다. 예외로 [ZSTabNavigator](../Navigation/ZSTabNavigator#테마)는 선택 아이콘·라벨을 주색 표시색 `primaryMark`로 칠합니다(Android 떠 있는 바은 회색 선택 캡슐이 함께 알립니다).

## 색 역할 목록 — `ColorName`

`ThemeColors`의 키(`ColorName`)이고, 모든 값은 `#rrggbb` 문자열입니다.

### 강조·상태 (팔레트 색마다 4개)

| 팔레트 색 (`PaletteColor`) | main | on | container | onContainer |
|------|------|----|-----------|-------------|
| primary | `primary` | `onPrimary` | `primaryContainer` | `onPrimaryContainer` |
| secondary | `secondary` | `onSecondary` | `secondaryContainer` | `onSecondaryContainer` |
| tertiary | `tertiary` | `onTertiary` | `tertiaryContainer` | `onTertiaryContainer` |
| error | `error` | `onError` | `errorContainer` | `onErrorContainer` |
| success | `success` | `onSuccess` | `successContainer` | `onSuccessContainer` |
| warning | `warning` | `onWarning` | `warningContainer` | `onWarningContainer` |
| info | `info` | `onInfo` | `infoContainer` | `onInfoContainer` |
| neutral(회색) | `neutral` | `onNeutral` | `neutralContainer` | `onNeutralContainer` |

- main은 강한 강조(채운 버튼·선택 면·위험 동작), container는 덜 강한 강조(배너 배경)입니다.
- `on*`은 그 색 위의 글자·아이콘입니다. 같은 행끼리만 짝지어 씁니다.

### 배경·글자·선

| 역할 | 용도 |
|------|------|
| `background` | 화면 배경(페이지)·입력 칸 면 — 라이트 흰색, 다크 `#131313` |
| `surface1` | 페이지 면 — 두 모드 모두 `background`와 같습니다. 라이트 Alert·`elevated` 카드 |
| `surface2` | 묶음 목록·칩·세그먼트 트랙·`filled` 카드, Android 시트 배경 |
| `surface3` | 눌림 면, 다크에서 떠 있는 면(Alert·`elevated` 카드·흐림 막), Android 내비게이션 바·메뉴 |
| `surface4` | 스켈레톤 자리 표시, 다크 세그먼트 선택 칸, Android 진행 표시 상자·스위치 꺼짐 트랙·탭 선택 캡슐 |
| `surface5` | 비활성 채움 |
| `text` | 본문 글자·아이콘, 얇은 선택 표시([색 규칙](#색-규칙--채움과-얇은-표시)) |
| `textSecondary` | 라벨·보조 글자·비선택 아이콘·일정 점 |
| `border` | 구분선·칩·세그먼트 테두리처럼 장식적인 선 |
| `borderStrong` | 입력 칸 테두리처럼 경계가 중요한 선 |
| `backgroundInverse` | 반전 배경(툴팁) |
| `textInverse` | 반전 배경 위 글자·아이콘 |
| `primaryInverse` | 반전 배경 위 강조 |
| `shadow` | 그림자 색 |
| `backdrop` | 모달 뒤를 덮는 색(불투명도는 `OPACITY.backdrop`) |

`surface1`~`surface5`는 숫자가 클수록 페이지와 멀어지는 면입니다. 라이트는 흰 페이지 위에서 5로 갈수록 짙어지고, 다크는 `#131313` 페이지 위에서 5로 갈수록 밝아집니다. 높낮이는 이 다섯 단계로 먼저 나타내고, 그림자는 떠 있는 요소에만 씁니다([토큰](./tokens#그림자--shadow)).

### Android Compose 스킴과의 대응

Android Compose 컨트롤은 zs-ui 색 역할로 덮은 M3 스킴을 받습니다(아래 [네이티브 컨트롤](#네이티브-컨트롤에-넘기는-테마)). M3 문서나 Material Theme Builder 결과와 맞춰 볼 때 씁니다. 강조·상태 색은 M3 이름 그대로입니다.

| zs-ui | M3 역할 |
|-------|---------|
| `background` | `background`·`surface` |
| `surface1`~`surface5` | `surfaceContainerLowest`·`Low`·(기본)·`High`·`Highest` |
| `surface5` | `surfaceVariant` |
| `text` | `onSurface`·`onBackground` |
| `textSecondary` | `onSurfaceVariant` |
| `border` | `outlineVariant` |
| `borderStrong` | `outline` |
| `backgroundInverse` | `inverseSurface` |
| `textInverse` | `inverseOnSurface` |
| `primaryInverse` | `inversePrimary` |
| `backdrop` | `scrim` |

`surfaceBright`·`surfaceDim`은 모드마다 가장 밝은·어두운 면(라이트 `background`·`surface5`, 다크 `surface5`·`background`)이고, `surfaceTint`는 투명입니다 — 면에 `primary`를 섞지 않습니다.

## 네이티브 컨트롤에 넘기는 테마

zs-ui가 감싼 시스템 컨트롤과 오버레이는 앱 테마의 색 모드를 받습니다. 버튼 색·모서리 같은 브랜드 모양은 넘기지 않습니다.

| | iOS | Android |
|---|-----|---------|
| 대상 | SwiftUI 컨트롤(`ZSSwitch`·`ZSSelect`) | Compose 컨트롤(`ZSSwitch`·`ZSSelect`·`ZSMenu`), 시트·진행 표시 — `ZSCheckbox`·`ZSRadioGroup`은 두 플랫폼 공통 SVG라 테마 색을 바로 씁니다 |
| 강조 색 | SwiftUI 기본 tint는 `text`입니다(tint가 글자·체크·커서 같은 얇은 표시에 쓰이기 때문). 켬 트랙을 채우는 `ZSSwitch`는 컨트롤에 `primary` tint를 직접 겁니다. `ZSSelect` 버튼 글자는 고른 값 `text`, 선택 전 `textSecondary` | primary 시드(`seedColor`)로 만든 Compose 스킴 위에 zs-ui 색 역할을 덮습니다([대응표](#android-compose-스킴과의-대응)). 컨트롤마다도 색을 넘깁니다 — 켠 스위치 트랙 `primary`, 포커스 테두리·라벨·커서 `text`, 꺼진 스위치 썸·테두리 `textSecondary`·트랙 `surface4`, 진행 표시 `textSecondary`·상자 `surface4`, 다크 시트 뒤 막 `backdrop` 52%(라이트 32%) |

iOS 메뉴는 색 모드만 받고 시스템 색으로 그립니다(메뉴의 destructive 항목 아이콘만 `error`). iOS 시트는 테마 색을 받지 않고, 색 모드는 [`syncNativeAppearance`](../Provider/ThemeProvider#네이티브-ui-동기화--syncnativeappearance)로 앱 테마를 따릅니다.

## `createThemeColors`

```ts
function createThemeColors(
  seeds: ThemeColorOptions,
  options: { mode: 'light' | 'dark'; contrastLevel: number },
): ThemeColors;
```

`ThemeProvider` 밖에서 같은 규칙으로 색을 미리 계산할 때 씁니다(예: 스플래시·위젯 색 맞추기, 디자인 토큰 내보내기, 테스트). `contrastLevel`은 0 표준 · 0.5 중간 · 1 높음입니다.

```ts
import { createThemeColors, DEFAULT_COLORS } from '@0610studio/zs-ui';

const dark = createThemeColors({ ...DEFAULT_COLORS, primary: '#2f6bff' }, { mode: 'dark', contrastLevel: 0 });
dark.background;
```

## 유틸

### `getPaletteColors`

팔레트 색 하나의 4개 색을 묶어 반환합니다. `ZSButton`·`ZSChip`·`ZSBanner`가 쓰는 규칙과 같습니다.

```ts
import { getPaletteColors, useTheme, type PaletteColor } from '@0610studio/zs-ui';

const { colors } = useTheme();
const { main, onMain, container, onContainer } = getPaletteColors(colors, 'success');
```

`PaletteColor`는 `'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info' | 'neutral'`입니다.

### `resolveColor`

색 역할이면 그 값을, 아니면 문자열을 그대로 반환합니다. 색 역할을 받는 prop(`ZSText`의 `color`, 여러 컴포넌트의 `backgroundColor` 등)이 이 규칙을 씁니다. 그 prop의 타입은 `ColorName | (string & {})`라 역할 이름이 자동 완성되고 `'#111827'`·`'rgba(0, 0, 0, 0.5)'`도 그대로 받습니다.

```ts
resolveColor(colors, 'textSecondary');
resolveColor(colors, '#111827');
resolveColor(colors, undefined);
```

### `withOpacity`

`#rrggbb`에 불투명도(0~1)를 붙여 `#rrggbbaa`로 만듭니다. 6자리 hex가 아니면 그대로 반환합니다.

```ts
import { OPACITY, withOpacity } from '@0610studio/zs-ui';

withOpacity(colors.text, OPACITY.disabled);
withOpacity(colors.backdrop, OPACITY.backdrop);
```

`ColorMode`·`ThemeColors`·`ColorName`·`PaletteColor`·`ThemeColorOptions` 타입을 내보냅니다.

## 관련 문서

- [ThemeProvider](../Provider/ThemeProvider) — `colors`·`contrast`·`dynamicColor`
- [토큰](./tokens) — 상태 불투명도·그림자
