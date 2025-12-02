---
sidebar_position: 3
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# Typography

ZS-ui는 React Native 스타일링에서 일관된 타이포그래피를 적용할 수 있도록 `useTheme`에서 `typography`를 제공합니다. 이를 통해 ZS-ui 컴포넌트 외부에서도 동일한 타이포그래피 스타일을 사용할 수 있습니다.

<ExpoSnack id="@studio0610/zs-ui_13_zstext" />

## 기본 사용법

```tsx
import { useTheme } from '@0610studio/zs-ui';
import { Text } from 'react-native';

function MyComponent() {
  const { typography } = useTheme();

  return (
    <Text style={typography.heading[1]}>제목</Text>
    <Text style={typography.body[2]}>본문</Text>
  );
}
```

## Typography 구조

타이포그래피는 다음과 같은 구조로 구성됩니다:

- `heading`: 제목 스타일 (1~6)
- `title`: 페이지/섹션 제목 스타일 (1~6)
- `subTitle`: 부제목 스타일 (1~6)
- `label`: 레이블 스타일 (1~6)
- `body`: 본문 스타일 (1~6)
- `caption`: 작은 텍스트 스타일 (1~6)

## 사용 예제

### Heading

```tsx
const { typography } = useTheme();

<Text style={typography.heading[1]}>Heading 1</Text>
<Text style={typography.heading[2]}>Heading 2</Text>
<Text style={typography.heading[3]}>Heading 3</Text>
```

### Title

```tsx
<Text style={typography.title[1]}>Title 1</Text>
<Text style={typography.title[2]}>Title 2</Text>
```

### Body

```tsx
<Text style={typography.body[1]}>Body 1</Text>
<Text style={typography.body[2]}>Body 2</Text>
```

### Label

```tsx
<Text style={typography.label[1]}>Label 1</Text>
<Text style={typography.label[2]}>Label 2</Text>
```

### Caption

```tsx
<Text style={typography.caption[1]}>Caption 1</Text>
<Text style={typography.caption[2]}>Caption 2</Text>
```

## 폰트 설정

### ThemeFonts

`ThemeProvider`에서 폰트를 설정할 수 있습니다:

```tsx
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

<ThemeProvider themeFonts={themeFonts}>
  {/* 앱 내용 */}
</ThemeProvider>
```

### 폰트 접근

```tsx
const { typography } = useTheme();

// 폰트 정보 접근
const fontFamily = typography.themeFonts?.[400]; // 'Pretendard-Regular'
```

## 스타일 병합

타이포그래피 스타일을 다른 스타일과 병합할 수 있습니다:

```tsx
const { typography } = useTheme();

<Text style={[
  typography.body[2],
  { color: '#333', marginTop: 10 }
]}>
  커스텀 스타일이 적용된 텍스트
</Text>
```

## ZSText와의 관계

`ZSText` 컴포넌트는 내부적으로 이 타이포그래피 시스템을 사용합니다:

```tsx
// 이 두 가지는 동일한 결과를 생성합니다
<ZSText typo="body.2">텍스트</ZSText>

<Text style={typography.body[2]}>텍스트</Text>
```

하지만 `ZSText`는 추가로 색상 시스템과 통합되어 있어 더 편리합니다:

```tsx
<ZSText typo="body.2" color="primary">
  Primary 색상이 적용된 텍스트
</ZSText>
```
