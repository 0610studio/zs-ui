---
sidebar_position: 1
---

# ThemeProvider

`ThemeProvider`는 프로젝트 전반에서 사용할 폰트와 테마 관련 설정을 관리합니다.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `themeFonts` | `ThemeFonts` | `undefined` | 폰트 굵기별로 사용할 폰트 이름을 정의 |
| `isDarkModeEnabled` | `boolean` | `true` | 다크 모드 활성화 여부 |
| `customPalette` | `function` | `undefined` | 커스텀 색상 팔레트 팩토리 함수 |
| `children` | `React.ReactNode` | Required | 자식 컴포넌트 |

## 기본 사용법

```tsx
import { ThemeProvider } from '@0610studio/zs-ui';

<ThemeProvider>
  {/* 앱 내용 */}
</ThemeProvider>
```

## 폰트 설정

```tsx
import { ThemeProvider } from '@0610studio/zs-ui';
import { useFonts } from 'expo-font';

const themeFonts = {
  100: 'Pretendard-Thin',
  200: 'Pretendard-ExtraLight',
  300: 'Pretendard-Light',
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
  800: 'Pretendard-ExtraBold',
  900: 'Pretendard-Black',
};

const requireFonts = {
  'Pretendard-Thin': require('../assets/fonts/Pretendard-Thin.otf'),
  'Pretendard-ExtraLight': require('../assets/fonts/Pretendard-ExtraLight.otf'),
  'Pretendard-Light': require('../assets/fonts/Pretendard-Light.otf'),
  'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
  'Pretendard-Black': require('../assets/fonts/Pretendard-Black.otf'),
};

export default function App() {
  const [loaded] = useFonts(requireFonts);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider themeFonts={themeFonts}>
      {/* 앱 내용 */}
    </ThemeProvider>
  );
}
```

## 커스텀 팔레트 사용

```tsx
import { ThemeProvider, themeFactory } from '@0610studio/zs-ui';

const customPalette = themeFactory({
  light: {
    primary: {
      main: '#2196F3',
    },
  },
  dark: {
    primary: {
      main: '#64B5F6',
    },
  },
});

<ThemeProvider customPalette={customPalette}>
  {/* 앱 내용 */}
</ThemeProvider>
```

자세한 내용은 [ThemeFactory 문서](../Theme/themefactory)를 참조하세요.

## 다크 모드 비활성화

```tsx
import { ThemeProvider } from '@0610studio/zs-ui';

<ThemeProvider isDarkModeEnabled={false}>
  {/* 앱 내용 - 항상 라이트 모드 */}
</ThemeProvider>
```

## useTheme 훅

`ThemeProvider` 내부에서 `useTheme` 훅을 사용하여 테마 정보에 접근할 수 있습니다:

```tsx
import { useTheme } from '@0610studio/zs-ui';
import { View, Text } from 'react-native';

function MyComponent() {
  const { palette, typography, elevation } = useTheme();

  return (
    <View style={{ backgroundColor: palette.background.base }}>
      <Text style={typography.heading[1]}>제목</Text>
    </View>
  );
}
```

### 테마 모드 전환

```tsx
import { useTheme } from '@0610studio/zs-ui';

function MyComponent() {
  const { palette } = useTheme();

  return (
    <Pressable onPress={palette.toggleTheme}>
      <Text>현재 모드: {palette.mode}</Text>
    </Pressable>
  );
}
```

### 시스템 색상 스키마 사용

```tsx
import { useTheme } from '@0610studio/zs-ui';

function MyComponent() {
  const { palette } = useTheme();

  // 시스템 색상 스키마 사용 여부 설정
  palette.setUseSystemColorScheme(true);

  // 현재 모드 확인
  const currentMode = palette.mode; // 'light' | 'dark'
  const isUsingSystem = palette.isUsingSystemColorScheme; // boolean
}
```

자세한 내용은 [Palette 문서](../Theme/palette)와 [Typography 문서](../Theme/typography)를 참조하세요.

