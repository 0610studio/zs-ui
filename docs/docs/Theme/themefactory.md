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

## API 참조

`themeFactory`는 설정에 없는 색상을 기본 팔레트로 채운 팔레트 함수를 반환합니다. 반환값을 `ThemeProvider`의 `customPalette`에 넘깁니다. `ThemeProvider`는 이 함수에 `mode`만 넘깁니다.

```typescript
themeFactory(config?: ThemeFactoryConfig): (options?: {
  mode?: 'light' | 'dark';
  themeColors?: { light?: Theme; dark?: Theme }; // 지정한 모드의 Theme 값을 통째로 덮어씀
}) => Theme
```

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

## 관련 문서

- [ThemeProvider](../Provider/ThemeProvider)
- [Palette](./palette)
