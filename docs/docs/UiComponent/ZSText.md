---
sidebar_position: 2
---

# ZSText

애플리케이션에서 타이포그래피를 간단하고 일관되게 관리할 수 있도록 설계된 텍스트 컴포넌트입니다. 테마 시스템과 통합되어 자동으로 색상과 폰트 스타일이 적용됩니다.

## 기본 사용법

```tsx
import { ZSText } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ZSText typo="body.2" color="base">
      안녕하세요, ZSText!
    </ZSText>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `typo` | `TypoOptions` | `'body.2'` | 테마 설정에 따른 타이포그래피 스타일 선택 |
| `color` | `TypoColorOptions` | `'base'` | 테마 팔레트에 따른 텍스트 색상 지정 |
| `...props` | `TextProps` | - | React Native `Text` 컴포넌트의 모든 기본 속성 |

## 타이포그래피 옵션

타이포그래피 옵션은 `스타일.서브스타일` 형식으로 구성됩니다.

### TypoStyle

타이포그래피의 메인 스타일 그룹을 나타냅니다.

| 스타일 이름 | 설명 |
|------------|------|
| `heading` | 가장 크고 두드러진 제목 스타일 |
| `title` | 페이지나 섹션 제목 스타일 |
| `subTitle` | 부제목이나 설명 텍스트 스타일 |
| `label` | 버튼이나 입력 필드 레이블에 적합 |
| `body` | 일반 본문 텍스트 스타일 |
| `caption` | 작은 부가 텍스트 스타일 |

### TypoOptions

각 스타일은 1부터 6까지의 서브스타일을 가집니다:

- `heading.1` ~ `heading.6`
- `title.1` ~ `title.6`
- `subTitle.1` ~ `subTitle.6`
- `body.1` ~ `body.6`
- `label.1` ~ `label.6`
- `caption.1` ~ `caption.6`

## 색상 옵션

### TypoColorOptions

| 색상 옵션 | 설명 |
|----------|------|
| `base` | 테마에서 정의된 기본 텍스트 색상 (기본값) |
| `secondary` | 부가 텍스트 색상 |
| `disabled` | 비활성화된 텍스트 색상 |
| `white` | 흰색 |
| `black` | 검은색 |

### CommonColorOptions

팔레트 색상도 사용할 수 있습니다:

- `primary`, `primary.5`, `primary.10`, ..., `primary.100`
- `danger`, `danger.5`, `danger.10`, ..., `danger.100`
- `warning`, `warning.5`, `warning.10`, ..., `warning.100`
- `success`, `success.5`, `success.10`, ..., `success.100`
- `information`, `information.5`, `information.10`, ..., `information.100`
- `grey.5`, `grey.10`, ..., `grey.100`

## 특징

- **테마 통합**: 테마 시스템과 완전히 통합되어 자동으로 색상과 폰트가 적용됩니다
- **타이포그래피 시스템**: 일관된 타이포그래피 스타일을 제공합니다
- **유연한 색상**: 기본 색상과 팔레트 색상을 모두 사용할 수 있습니다
- **React Native 호환**: 모든 React Native `Text` 속성을 지원합니다

## 예제

### 다양한 타이포그래피 스타일

```tsx
import { ZSText } from '@0610studio/zs-ui';

<ZSText typo="heading.1" color="base">제목</ZSText>
<ZSText typo="body.2" color="secondary">본문 텍스트</ZSText>
<ZSText typo="caption.1" color="disabled">작은 텍스트</ZSText>
```

### 색상 사용

```tsx
import { ZSText } from '@0610studio/zs-ui';

<ZSText typo="body.2" color="primary">Primary 색상</ZSText>
<ZSText typo="body.2" color="danger">Danger 색상</ZSText>
<ZSText typo="body.2" color="primary.main">Primary Main 색상</ZSText>
```

### React Native Text 속성 사용

```tsx
import { ZSText } from '@0610studio/zs-ui';

<ZSText
  typo="heading.2"
  color="base"
  style={{ margin: 10, textAlign: 'center' }}
  numberOfLines={2}
>
  여러 줄 텍스트
</ZSText>
```
