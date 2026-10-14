# 테마 개요

ZS-ui 테마는 `ThemeProvider`가 만들고 `useTheme()`으로 읽습니다. 색상은 `primary`, `secondary`, `danger`, `warning`, `success`, `information`, `grey` 시맨틱 팔레트와 텍스트·배경 색상으로 구성되며 라이트·다크 모드를 지원합니다. Provider 연결과 props는 [ThemeProvider](../Provider/ThemeProvider)를 참고하세요.

## 기본 사용법

```tsx
import { useTheme } from '@0610studio/zs-ui';
import { View, Text } from 'react-native';

function MyComponent() {
  const { palette, typography, elevation } = useTheme();

  return (
    <View style={[{ backgroundColor: palette.background.base }, elevation[2]]}>
      <Text style={typography.heading[1]}>제목</Text>
    </View>
  );
}
```

## API 참조

### `useTheme` 반환값

`useTheme()`은 `ThemeProps`를 반환합니다. `ThemeProvider` 밖에서 호출하면 오류가 발생합니다.

```typescript
interface ThemeProps {
  palette: Palette;                    // 색상 팔레트 + 모드 제어 함수
  typography: TypographyVariantsProps; // 타이포그래피 스타일
  elevation: ElevationStyles;          // 레벨 0~9의 boxShadow 스타일
  foldable: FoldableConfig;            // ThemeProvider의 폴더블 설정
  fontAssets?: ThemeFontAssets;        // ThemeProvider에 넘긴 굵기별 폰트 파일
}
```

### `Palette`

`Theme`에 모드 제어 API를 더한 타입입니다.

```typescript
interface Palette extends Theme {
  mode: 'light' | 'dark';                              // 현재 테마 모드
  isUsingSystemColorScheme: boolean;                   // 시스템 색상 모드 사용 여부
  setUseSystemColorScheme: (useSystem: boolean) => void;
  toggleTheme: () => void;                             // 라이트 ↔ 다크 수동 전환
}
```

### `Theme`

```typescript
interface Theme {
  mode: 'light' | 'dark';
  primary: ColorPaletteExtend; // 5~100 + main·lighter·light·dark·darker
  secondary: ColorPalette;     // 5~100 + main
  danger: ColorPalette;
  warning: ColorPalette;
  success: ColorPalette;
  information: ColorPalette;
  grey: ColorPalette;
  text: ThemeTextType;         // base·primary·secondary·disabled·white·black 및 상태색
  background: ThemeBackground; // base·layer1·layer2·neutral·primary 및 상태색
  elevationShadow: string[];   // 레벨별 그림자 색상(0~9)
  modalBgColor: string;        // 모달 오버레이 배경색
  mainColor: MainColors;       // 시맨틱 색상별 main 값 모음
}
```

색상 값과 예제는 [Palette](./palette)를 참고하세요.

### `TypographyVariantsProps`

`heading`, `title`, `subTitle`, `label`, `body`, `caption` 스타일이 각각 `1`~`6` 단계(`TypoNumber`)를 가지며, 적용된 폰트 매핑 `themeFonts`를 함께 담습니다. 자세한 내용은 [Typography](./typography)를 참고하세요.

### `useStyleSheetCreate`

현재 팔레트로 스타일 객체를 만들고, 팔레트가 바뀔 때만 다시 계산합니다.

```typescript
useStyleSheetCreate<T extends Record<string, any>>(createStyles: (palette: Theme) => T): T
```

```tsx
import { StyleSheet, View } from 'react-native';
import { useStyleSheetCreate } from '@0610studio/zs-ui';

function Card() {
  const styles = useStyleSheetCreate((palette) =>
    StyleSheet.create({
      card: { backgroundColor: palette.background.layer1, borderColor: palette.grey[30] },
    }),
  );

  return <View style={styles.card} />;
}
```

## 테마 모드

시스템 다크 모드는 `useColorScheme`으로 감지합니다. 처음에는 시스템 모드를 따르고, `toggleTheme`이나 `setUseSystemColorScheme`으로 바꿀 수 있습니다.

```tsx
const { palette } = useTheme();

palette.toggleTheme();               // 라이트 ↔ 다크 전환. 시스템 모드 사용을 끕니다
palette.setUseSystemColorScheme(true); // 시스템 모드를 다시 따릅니다

const currentMode = palette.mode;                       // 'light' | 'dark'
const isUsingSystem = palette.isUsingSystemColorScheme; // boolean
```

`mode`와 `isUsingSystemColorScheme`은 **AsyncStorage**에 저장되어 앱을 다시 열어도 유지됩니다. `ThemeProvider`에 `isDarkModeEnabled={false}`를 넘기면 저장값을 무시하고 항상 라이트 모드로 시작합니다.
