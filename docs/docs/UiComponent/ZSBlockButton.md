---
sidebar_position: 5
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# ZSBlockButton

블록 형태의 버튼 컴포넌트입니다. 다양한 intent와 variant를 지원하며, 테마 시스템과 통합되어 일관된 디자인을 제공합니다.

<ExpoSnack id="@studio0610/zs-ui_13_zsbutton" />

## 기본 사용법

```tsx
import { ZSBlockButton } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ZSBlockButton
      title="버튼"
      typo="body.2"
      onPress={() => console.log('버튼 클릭')}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | Required | 버튼 클릭 시 호출되는 함수 |
| `title` | `string` | Required | 버튼에 표시될 텍스트 |
| `typo` | `TypoOptions` | Required | 버튼 텍스트의 타이포그래피 스타일 |
| `intent` | `IntentOptions` | `'primary'` | 버튼의 의도/색상 테마 |
| `variant` | `'solid' \| 'pastel' \| 'stroke'` | `'solid'` | 버튼의 스타일 변형 |
| `prefixIcon` | `ImageSourcePropType` | `undefined` | 버튼 텍스트 앞에 표시될 아이콘 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 버튼 컨테이너의 추가 스타일 |

## Intent 옵션

버튼의 의도와 색상을 결정합니다.

| Intent | 설명 |
|--------|------|
| `primary` | 주요 액션 (기본값) |
| `danger` | 위험한 액션 (삭제, 취소 등) |
| `warning` | 경고 액션 |
| `success` | 성공 액션 |
| `information` | 정보 액션 |
| `grey` | 중립적인 액션 |

## Variant 옵션

버튼의 시각적 스타일을 결정합니다.

### solid (기본값)

배경색이 채워진 형태의 버튼입니다. 텍스트는 흰색으로 표시됩니다.

```tsx
<ZSBlockButton
  title="Solid 버튼"
  typo="body.2"
  variant="solid"
  intent="primary"
  onPress={() => {}}
/>
```

### pastel

연한 배경색과 진한 텍스트 색상의 버튼입니다.

```tsx
<ZSBlockButton
  title="Pastel 버튼"
  typo="body.2"
  variant="pastel"
  intent="primary"
  onPress={() => {}}
/>
```

### stroke

투명한 배경과 테두리만 있는 버튼입니다.

```tsx
<ZSBlockButton
  title="Stroke 버튼"
  typo="body.2"
  variant="stroke"
  intent="primary"
  onPress={() => {}}
/>
```

## 특징

- **다양한 스타일**: solid, pastel, stroke 세 가지 variant 지원
- **Intent 시스템**: primary, danger, warning, success, information, grey 등 다양한 의도 표현
- **테마 통합**: 테마 시스템과 완전히 통합되어 자동으로 색상이 적용됩니다
- **아이콘 지원**: prefixIcon을 통해 버튼 앞에 아이콘 추가 가능
- **타이포그래피 통합**: TypoOptions를 통해 버튼 크기와 스타일 제어
- **자동 패딩**: typo 크기에 따라 자동으로 패딩이 조정됩니다

## 예제

### 다양한 Intent

```tsx
<ZSBlockButton title="Primary" typo="body.2" intent="primary" onPress={() => {}} />
<ZSBlockButton title="Danger" typo="body.2" intent="danger" onPress={() => {}} />
<ZSBlockButton title="Warning" typo="body.2" intent="warning" onPress={() => {}} />
<ZSBlockButton title="Success" typo="body.2" intent="success" onPress={() => {}} />
<ZSBlockButton title="Information" typo="body.2" intent="information" onPress={() => {}} />
<ZSBlockButton title="Grey" typo="body.2" intent="grey" onPress={() => {}} />
```

### 다양한 Variant

```tsx
<ZSBlockButton title="Solid" typo="body.2" variant="solid" onPress={() => {}} />
<ZSBlockButton title="Pastel" typo="body.2" variant="pastel" onPress={() => {}} />
<ZSBlockButton title="Stroke" typo="body.2" variant="stroke" onPress={() => {}} />
```

### 아이콘과 함께 사용

```tsx
import { ZSBlockButton } from '@0610studio/zs-ui';
import { require } from 'react-native';

<ZSBlockButton
  title="아이콘 버튼"
  typo="body.2"
  prefixIcon={require('./assets/icon.png')}
  onPress={() => {}}
/>
```

### 다양한 타이포그래피 크기

```tsx
<ZSBlockButton title="작은 버튼" typo="label.3" onPress={() => {}} />
<ZSBlockButton title="중간 버튼" typo="body.2" onPress={() => {}} />
<ZSBlockButton title="큰 버튼" typo="title.2" onPress={() => {}} />
```

### 커스텀 스타일

```tsx
<ZSBlockButton
  title="커스텀 스타일"
  typo="body.2"
  style={{ marginTop: 20, width: '100%' }}
  onPress={() => {}}
/>
```

### Intent와 Variant 조합

```tsx
{/* Danger Solid */}
<ZSBlockButton
  title="삭제"
  typo="body.2"
  intent="danger"
  variant="solid"
  onPress={() => {}}
/>

{/* Success Pastel */}
<ZSBlockButton
  title="저장 완료"
  typo="body.2"
  intent="success"
  variant="pastel"
  onPress={() => {}}
/>

{/* Primary Stroke */}
<ZSBlockButton
  title="취소"
  typo="body.2"
  intent="primary"
  variant="stroke"
  onPress={() => {}}
/>
```

