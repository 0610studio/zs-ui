---
sidebar_position: 0
---

# 시작하기

프로젝트에서 `ZS-ui`를 사용할 때 필요한 Provider를 최상위 경로에 추가합니다. `ThemeProvider`와 `OverlayProvider`를 모두 설정해야 합니다.

## 기본 구조

```tsx
import { ThemeProvider, OverlayProvider } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ThemeProvider>
      <OverlayProvider>
        {/* 앱 내용 */}
      </OverlayProvider>
    </ThemeProvider>
  );
}
```

## 전체 예제

```tsx
import { ThemeProvider, OverlayProvider, themeFactory } from '@0610studio/zs-ui';
import { useFonts } from 'expo-font';

const themeFonts = {
  400: 'Pretendard-Regular',
  700: 'Pretendard-Bold',
};

const requireFonts = {
  'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
};

const customPalette = themeFactory({
  light: {
    primary: {
      main: '#007AFF',
    },
  },
});

export default function App() {
  const [loaded] = useFonts(requireFonts);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider themeFonts={themeFonts} customPalette={customPalette}>
      <OverlayProvider maxSnackbarCount={5}>
        {/* 앱 내용 */}
      </OverlayProvider>
    </ThemeProvider>
  );
}
```

## Provider 목록

- **[ThemeProvider](./ThemeProvider)**: 테마와 폰트 설정을 관리합니다
- **[OverlayProvider](./OverlayProvider)**: 오버레이 시스템(Alert, BottomSheet, Snackbar 등)을 관리합니다

각 Provider에 대한 자세한 내용은 해당 문서를 참조하세요.

