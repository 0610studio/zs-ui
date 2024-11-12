---
sidebar_position: 2
---

# palette

색상 팔레트를 설정하는 함수로, 라이트 및 다크 모드를 포함하며 사용자 정의 색상 팔레트를 지원합니다.


### 기본 사용법

```tsx
import { useTheme } from '@0610studio/zs-ui/src/model/useThemeProvider';

const {
  palette: {
    toggleTheme,
    mode,
    background,
    text,
    primary,
    secondary,
    danger,
    warning,
    success,
    information,
  },
} = useTheme();
```

- 테마 모드 전환: toggleTheme 함수를 통해 라이트와 다크 모드를 전환할 수 있습니다.

- 현재 테마 모드 확인: mode 값을 통해 현재 테마가 'light'인지 'dark'인지 확인할 수 있습니다.


```tsx
<Pressable onPress={toggleTheme}>
  <Text>현재 모드: {mode}</Text>
</Pressable>
```

<br />

### 색상 팔레트

각 테마 색상은 primary, secondary, danger, warning, success, information 과 같이 지정되어 있으며, 팔레트의 각 색상은 라이트와 다크 모드를 지원합니다.

```tsx
<View style={{ backgroundColor: primary.lighter }}>
  <Text style={styles.textWhite}>Primary Lighter</Text>
</View>
<View style={{ backgroundColor: primary.main }}>
  <Text style={styles.textWhite}>Primary Main</Text>
</View>
<View style={{ backgroundColor: secondary.main }}>
  <Text style={styles.textWhite}>Secondary Main</Text>
</View>

<Text style={{ color: text.primary }}>Text Primary Color</Text>
<Text style={{ color: text.secondary }}>Text Secondary Color</Text>
<Text style={{ color: text.danger }}>Text Danger Color</Text>
<Text style={{ color: text.warning }}>Text Warning Color</Text>
<Text style={{ color: text.success }}>Text Success Color</Text>
<Text style={{ color: text.information }}>Text Information Color</Text>
```

**타입**

```tsx title="ColorPalette 타입"
export type ColorPalette = {
  0: string;
  5: string;
  10: string; // p-lighter
  20: string; // p-light
  30: string;
  40: string;
  50: string; // p-main
  60: string; // p-dark
  70: string; // p-darker
  80: string;
  90: string;
  100: string;
  main: string;
};

export type ColorPaletteExtend = ColorPalette & {
  lighter: string;
  light: string;
  dark: string;
  darker: string;
};
```

```json title="텍스트 타입"
{
  main: string;
  primary: string;
  secondary: string;
  disabled: string;
  danger: string;
  warning: string;
  success: string;
  information: string;
  white: string;
  black: string;
}
```