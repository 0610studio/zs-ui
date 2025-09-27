---
sidebar_position: 4
---

# themeFactory

테마 팩토리 함수는 기본 색상 팔레트를 재정의하여 커스텀 테마를 생성할 수 있는 기능을 제공합니다. 라이트 모드와 다크 모드별로 색상을 개별적으로 커스터마이징할 수 있습니다.

## 기본 사용법

## ThemeProvider

```tsx
import React from 'react';
import { ThemeProvider } from '@0610studio/zs-ui/src/model/useThemeProvider';
import { themeFactory } from '@0610studio/zs-ui/src/theme/palette';

// 커스텀 팩토리 생성
const customPaletteFactory = themeFactory({
  light: {
    primary: {
      main: '#2196F3', // 블루 색상
    },
  },
  dark: {
    primary: {
      main: '#64B5F6', // 라이트 블루 색상
    },
  },
});

export default function App() {
  return (
    <ThemeProvider customPalette={customPaletteFactory}>
      {/* 앱 컴포넌트들 */}
    </ThemeProvider>
  );
}
```

## 타입 정의

### ThemeFactoryConfig

```tsx
export interface ThemeFactoryConfig {
  light?: ThemeFactoryColors;
  dark?: ThemeFactoryColors;
}
```

### ThemeFactoryColors

```tsx
export interface ThemeFactoryColors {
  primary?: Partial<ColorPaletteExtend>;
  secondary?: Partial<ColorPalette>;
  danger?: Partial<ColorPalette>;
  warning?: Partial<ColorPalette>;
  success?: Partial<ColorPalette>;
  information?: Partial<ColorPalette>;
  grey?: Partial<ColorPalette>;
}
```
