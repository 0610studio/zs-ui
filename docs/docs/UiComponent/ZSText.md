---
sidebar_position: 2
---

# ZSText

애플리케이션에서 타이포그래피를 간단하고 일관되게 관리할 수 있도록 설계된 컴포넌트입니다.

### 기본 사용법

```tsx
import React from 'react';
import { ZSText } from '@0610studio/zs-ui';

export default function App() {
  return <ZSText typo="body.1" color="primary">안녕하세요, ZSText!</ZSText>;
}
```

```tsx
import React from 'react';
import { ZSText } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ZSText
      typo="heading.2"
      color="secondary"
      style={{ margin: 10, textAlign: 'center' }}
    >
      ZSText 컴포넌트에 오신 것을 환영합니다
    </ZSText>
  );
}
```

---

## Props

| 이름       | 타입                       | 기본값     | 설명                                                       |
|------------|----------------------------|------------|-----------------------------------------------------------|
| `typo`     | `TypoOptions`              | `body.2`   | 테마 설정에 따른 타이포그래피 스타일 선택.                 |
| `color`    | `TextColorOptions`         | `primary`  | 테마 팔레트에 따른 텍스트 색상 지정.                       |
| `...props` | React Native의 `TextProps` | N/A        | `TextAtom` 컴포넌트로 전달되는 추가 props.                |


### TypoStyle

`TypoStyle`은 타이포그래피의 메인 스타일 그룹을 나타냅니다. 주로 텍스트의 목적(예: 제목, 본문, 캡션 등)에 따라 분류됩니다.

```typescript
export type TypoStyle = 'heading' | 'title' | 'subTitle' | 'label' | 'body' | 'caption';
```

| 스타일 이름   | 설명                          |
|---------------|-------------------------------|
| `heading`     | 가장 크고 두드러진 제목 스타일. |
| `title`       | 페이지나 섹션 제목 스타일.     |
| `subTitle`    | 부제목이나 설명 텍스트 스타일. |
| `label`       | 버튼이나 입력 필드 레이블에 적합. |
| `body`        | 일반 본문 텍스트 스타일.       |
| `caption`     | 작은 부가 텍스트 스타일.       |

### TypoOptions

타이포그래피 옵션은 `스타일.서브스타일` 형식으로 구성됩니다.  

- `heading`: `heading.1` ~ `heading.6`
- `title`: `title.1` ~ `title.6`
- `subTitle`: `subTitle.1` ~ `subTitle.6`
- `body`: `body.1` ~ `body.6`
- `label`: `label.1` ~ `label.6`
- `caption`: `caption.1` ~ `caption.6`

### TextColorOptions

| 색상 옵션       | 설명                                         |
|------------------|---------------------------------------------|
| `primary`       | 테마에서 정의된 기본 텍스트 색상.            |
| `secondary`     | 부가 텍스트 색상.                           |
| `disabled`      | 비활성화된 텍스트 색상.                     |
| `danger`        | 오류 또는 경고용 텍스트 색상.                |
| `warning`       | 경고 메시지 텍스트 색상.                    |
| `success`       | 성공 메시지 텍스트 색상.                    |
| `information`   | 정보 제공용 텍스트 색상.                    |
| `white`         | 흰색.                                        |
| `black`         | 검은색.                                      |

---

