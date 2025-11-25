---
sidebar_position: 2
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# Palette

색상 팔레트를 설정하는 함수로, 라이트 및 다크 모드를 포함하며 사용자 정의 색상 팔레트를 지원합니다.

<ExpoSnack id="@studio0610/zs-ui-theme-example" />

## 기본 사용법

```tsx
import { useTheme } from '@0610studio/zs-ui';

function MyComponent() {
  const { palette } = useTheme();

  return (
    <View>
      <View style={{ backgroundColor: palette.primary.main }}>
        <ZSText color="white">Primary Main</ZSText>
      </View>
      <ZSText color="base">Base Text</ZSText>
      <ZSText color="secondary">Secondary Text</ZSText>
    </View>
  );
}
```

## 테마 모드

### 모드 전환

```tsx
const { palette } = useTheme();

// 테마 토글
palette.toggleTheme();

// 시스템 색상 스키마 사용 여부 설정
palette.setUseSystemColorScheme(true);

// 현재 모드 확인
const currentMode = palette.mode; // 'light' | 'dark'
const isUsingSystem = palette.isUsingSystemColorScheme; // boolean
```

### 모드 확인

```tsx
<Pressable onPress={palette.toggleTheme}>
  <ZSText typo="body.2">현재 모드: {palette.mode}</ZSText>
</Pressable>
```

## 색상 팔레트

각 테마 색상은 `primary`, `secondary`, `danger`, `warning`, `success`, `information`, `grey`와 같이 지정되어 있으며, 팔레트의 각 색상은 라이트와 다크 모드를 지원합니다.

### ColorPalette 타입

```typescript
type ColorPalette = {
  5: string;
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  60: string;
  70: string;
  80: string;
  90: string;
  100: string;
  main: string;
};
```

### ColorPaletteExtend 타입 (Primary 전용)

```typescript
type ColorPaletteExtend = ColorPalette & {
  lighter: string;
  light: string;
  dark: string;
  darker: string;
};
```

## 색상 사용 예제

### Primary 색상

```tsx
<View style={{ backgroundColor: palette.primary.lighter }}>
  <ZSText color="white">Primary Lighter</ZSText>
</View>
<View style={{ backgroundColor: palette.primary.light }}>
  <ZSText color="white">Primary Light</ZSText>
</View>
<View style={{ backgroundColor: palette.primary.main }}>
  <ZSText color="white">Primary Main</ZSText>
</View>
<View style={{ backgroundColor: palette.primary.dark }}>
  <ZSText color="white">Primary Dark</ZSText>
</View>
<View style={{ backgroundColor: palette.primary.darker }}>
  <ZSText color="white">Primary Darker</ZSText>
</View>
```

### 팔레트 색상 (5~100)

```tsx
<View style={{ backgroundColor: palette.primary[5] }}>
  <ZSText>Primary 5</ZSText>
</View>
<View style={{ backgroundColor: palette.primary[50] }}>
  <ZSText>Primary 50</ZSText>
</View>
<View style={{ backgroundColor: palette.primary[100] }}>
  <ZSText>Primary 100</ZSText>
</View>
```

### 텍스트 색상

```tsx
<ZSText color="base">Base Text</ZSText>
<ZSText color="primary">Primary Text</ZSText>
<ZSText color="secondary">Secondary Text</ZSText>
<ZSText color="disabled">Disabled Text</ZSText>
<ZSText color="danger">Danger Text</ZSText>
<ZSText color="warning">Warning Text</ZSText>
<ZSText color="success">Success Text</ZSText>
<ZSText color="information">Information Text</ZSText>
<ZSText color="white">White Text</ZSText>
<ZSText color="black">Black Text</ZSText>
```

### 배경 색상

```tsx
<View style={{ backgroundColor: palette.background.base }}>
  <ZSText>Base Background</ZSText>
</View>
<View style={{ backgroundColor: palette.background.layer1 }}>
  <ZSText>Layer 1 Background</ZSText>
</View>
<View style={{ backgroundColor: palette.background.layer2 }}>
  <ZSText>Layer 2 Background</ZSText>
</View>
<View style={{ backgroundColor: palette.background.neutral }}>
  <ZSText>Neutral Background</ZSText>
</View>
```

### 상태별 배경 색상

```tsx
<View style={{ backgroundColor: palette.background.danger }}>
  <ZSText>Danger Background</ZSText>
</View>
<View style={{ backgroundColor: palette.background.warning }}>
  <ZSText>Warning Background</ZSText>
</View>
<View style={{ backgroundColor: palette.background.success }}>
  <ZSText>Success Background</ZSText>
</View>
<View style={{ backgroundColor: palette.background.information }}>
  <ZSText>Information Background</ZSText>
</View>
```

## 주요 색상

### Main Colors

```tsx
palette.mainColor.primary    // Primary 메인 색상
palette.mainColor.secondary  // Secondary 메인 색상
palette.mainColor.danger     // Danger 메인 색상
palette.mainColor.warning    // Warning 메인 색상
palette.mainColor.success    // Success 메인 색상
palette.mainColor.information // Information 메인 색상
palette.mainColor.grey       // Grey 메인 색상
```

## 모달 배경색

```tsx
palette.modalBgColor // 모달 오버레이 배경색
```

## 그림자 색상

```tsx
palette.elevationShadow // 그림자 색상 배열 (0~9 레벨)
```
