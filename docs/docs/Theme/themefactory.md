---
sidebar_position: 4
---

# ThemeFactory

테마 팩토리 함수는 기본 색상 팔레트를 재정의하여 커스텀 테마를 생성할 수 있는 기능을 제공합니다. 라이트 모드와 다크 모드별로 색상을 개별적으로 커스터마이징할 수 있습니다.

## 기본 사용법

```tsx
import { ThemeProvider, themeFactory } from '@0610studio/zs-ui';

// 커스텀 팩토리 생성
const customPaletteFactory = themeFactory({
  light: {
    primary: {
      main: '#2196F3', // 블루 색상
      lighter: '#BBDEFB',
      light: '#64B5F6',
      dark: '#1976D2',
      darker: '#0D47A1',
    },
  },
  dark: {
    primary: {
      main: '#64B5F6', // 라이트 블루 색상
    },
  },
});

function App() {
  return (
    <ThemeProvider customPalette={customPaletteFactory}>
      {/* 앱 컴포넌트들 */}
    </ThemeProvider>
  );
}
```

## 타입 정의

### ThemeFactoryConfig

```typescript
interface ThemeFactoryConfig {
  light?: ThemeFactoryColors;
  dark?: ThemeFactoryColors;
}
```

### ThemeFactoryColors

```typescript
interface ThemeFactoryColors {
  primary?: Partial<ColorPaletteExtend>;
  secondary?: Partial<ColorPalette>;
  danger?: Partial<ColorPalette>;
  warning?: Partial<ColorPalette>;
  success?: Partial<ColorPalette>;
  information?: Partial<ColorPalette>;
  grey?: Partial<ColorPalette>;
}
```

## 예제

### Primary 색상만 변경

```tsx
const customPalette = themeFactory({
  light: {
    primary: {
      main: '#FF6B6B',
      lighter: '#FFE5E5',
      light: '#FFB3B3',
      dark: '#CC5555',
      darker: '#993333',
    },
  },
});

<ThemeProvider customPalette={customPalette}>
  {/* 앱 */}
</ThemeProvider>
```

### 여러 색상 변경

```tsx
const customPalette = themeFactory({
  light: {
    primary: {
      main: '#4ECDC4',
    },
    secondary: {
      main: '#45B7D1',
    },
    success: {
      main: '#96CEB4',
    },
  },
  dark: {
    primary: {
      main: '#6EDCD4',
    },
  },
});

<ThemeProvider customPalette={customPalette}>
  {/* 앱 */}
</ThemeProvider>
```

### 팔레트 색상 변경 (5~100)

```tsx
const customPalette = themeFactory({
  light: {
    primary: {
      main: '#FF6B6B',
      5: '#FFF5F5',
      10: '#FFE5E5',
      20: '#FFCCCC',
      30: '#FFB3B3',
      40: '#FF9999',
      50: '#FF6B6B',
      60: '#CC5555',
      70: '#994040',
      80: '#662B2B',
      90: '#331515',
      100: '#1A0A0A',
    },
  },
});

<ThemeProvider customPalette={customPalette}>
  {/* 앱 */}
</ThemeProvider>
```

### 부분 재정의

기존 색상을 완전히 교체하지 않고 일부만 변경할 수 있습니다:

```tsx
const customPalette = themeFactory({
  light: {
    primary: {
      main: '#9C27B0', // 메인 색상만 변경
    },
  },
});

// 나머지 색상(5, 10, 20 등)은 기본값 유지
```

### 라이트/다크 모드별 설정

```tsx
const customPalette = themeFactory({
  light: {
    primary: {
      main: '#2196F3', // 라이트 모드: 밝은 블루
    },
  },
  dark: {
    primary: {
      main: '#90CAF9', // 다크 모드: 더 밝은 블루
    },
  },
});

<ThemeProvider customPalette={customPalette}>
  {/* 앱 */}
</ThemeProvider>
```

## 사용 예제

### 브랜드 색상 적용

```tsx
// 브랜드 색상으로 테마 커스터마이징
const brandPalette = themeFactory({
  light: {
    primary: {
      main: '#FF5722', // 브랜드 오렌지
      lighter: '#FFE0B2',
      light: '#FFAB91',
      dark: '#D84315',
      darker: '#BF360C',
    },
  },
  dark: {
    primary: {
      main: '#FF8A65', // 다크 모드용 밝은 오렌지
    },
  },
});

function App() {
  return (
    <ThemeProvider customPalette={brandPalette}>
      <MyApp />
    </ThemeProvider>
  );
}
```

### 접근성 고려한 색상

```tsx
// WCAG 가이드라인을 따르는 고대비 색상
const accessiblePalette = themeFactory({
  light: {
    primary: {
      main: '#0052CC', // 고대비 블루
    },
    danger: {
      main: '#DE350B', // 고대비 레드
    },
  },
  dark: {
    primary: {
      main: '#4C9AFF', // 다크 모드용 밝은 블루
    },
  },
});
```
