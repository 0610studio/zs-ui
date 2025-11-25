---
sidebar_position: 3
---

# ZSTextField

Reanimated를 사용하여 다양한 스타일 애니메이션을 제공하는 텍스트 입력 필드 컴포넌트입니다. 플로팅 라벨, 포커스 애니메이션, 에러 상태 표시 등의 기능을 포함합니다.

## 기본 사용법

```tsx
import { ZSTextField } from '@0610studio/zs-ui';
import { useState } from 'react';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <ZSTextField
      label="닉네임"
      value={value}
      onChangeText={setValue}
      boxStyle="outline"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `typo` | `TypoOptions` | `'body.2'` | 텍스트 스타일을 정의. 테마에 따라 자동 적용 |
| `status` | `'default' \| 'error'` | `'default'` | 입력 상태를 설정. 에러 시 라벨 및 테두리 색상이 변경됨 |
| `value` | `string` | Required | 텍스트 필드의 입력 값 |
| `onChangeText` | `(text: string) => void` | `undefined` | 텍스트 변경 이벤트 핸들러 |
| `label` | `string` | `'Placeholder'` | 텍스트 필드의 라벨 텍스트 |
| `inputBgColor` | `string` | 테마 `background.base` | 입력 필드의 배경색 |
| `labelBgColor` | `string` | 테마 `background.base` | 라벨의 배경색 |
| `labelColor` | `string` | 테마 `text.secondary` | 라벨의 기본 텍스트 색상 |
| `placeHolderColor` | `string` | 테마 `grey[40]` | placeholder 텍스트 색상 |
| `borderColor` | `string` | 테마 `grey[30]` | 테두리 색상 |
| `borderRadius` | `number` | `14` | 테두리의 라운딩 반경 |
| `focusColor` | `string` | 테마 `primary.main` | 포커스 상태에서의 테두리 색상 |
| `errorColor` | `string` | 테마 `danger.main` | 에러 상태에서의 테두리 및 라벨 색상 |
| `paddingHorizontal` | `number` | `15` | 텍스트 필드의 좌우 여백 |
| `borderWidth` | `number` | `1.2` | 테두리 두께 |
| `errorMessage` | `string` | `undefined` | 에러 상태에서 표시할 메시지 |
| `textInputProps` | `TextInputProps` | `{}` | 기본 React Native `TextInput` 속성 |
| `boxStyle` | `'outline' \| 'underline' \| 'inbox'` | `'outline'` | 텍스트 필드 스타일 |
| `innerBoxStyle` | `'top' \| 'middle' \| 'bottom'` | `undefined` | 텍스트 필드가 그룹일 때 스타일을 정의 |
| `disabled` | `boolean` | `false` | 텍스트 필드 비활성화 여부 |
| `allowFontScaling` | `boolean` | `true` | 텍스트 크기 자동 조정 허용 여부 |
| `isTextArea` | `boolean` | `false` | 멀티라인 입력 여부 |

## 특징

- **플로팅 라벨**: 입력 시 라벨이 위로 이동하는 애니메이션
- **포커스 애니메이션**: 포커스 시 테두리 색상이 부드럽게 변경됩니다
- **에러 상태**: 에러 메시지와 함께 시각적 피드백 제공
- **다양한 스타일**: `outline`, `underline`, `inbox` 세 가지 스타일 지원
- **그룹 필드**: 여러 필드를 하나의 그룹으로 묶을 수 있습니다

## BoxStyle

텍스트 필드의 스타일을 선택할 수 있습니다:

- **`outline`**: 전체 테두리가 있는 박스 스타일 (기본값)
- **`underline`**: 하단 테두리만 있는 스타일
- **`inbox`**: 내부에 라벨이 들어가는 박스 스타일

## 예제

### Outline 스타일

```tsx
<ZSTextField
  boxStyle="outline"
  label="아이디"
  value={userId}
  onChangeText={setUserId}
/>
```

### Underline 스타일

```tsx
<ZSTextField
  boxStyle="underline"
  label="닉네임"
  value={nickname}
  onChangeText={setNickname}
/>
```

### Inbox 스타일

```tsx
<ZSTextField
  boxStyle="inbox"
  label="이메일"
  value={email}
  onChangeText={setEmail}
/>
```

### 에러 상태

```tsx
<ZSTextField
  label="비밀번호"
  value={password}
  onChangeText={setPassword}
  status="error"
  errorMessage="비밀번호는 8자 이상이어야 합니다"
/>
```

### 그룹 필드 (InnerBoxStyle)

여러 필드를 하나의 그룹으로 묶을 때 사용합니다:

```tsx
<ZSTextField
  label="상단 필드"
  value={value1}
  onChangeText={setValue1}
  innerBoxStyle="top"
/>

<ZSTextField
  label="중간 필드"
  value={value2}
  onChangeText={setValue2}
  innerBoxStyle="middle"
/>

<ZSTextField
  label="하단 필드"
  value={value3}
  onChangeText={setValue3}
  innerBoxStyle="bottom"
/>
```

### 텍스트 영역 (TextArea)

```tsx
<ZSTextField
  label="메시지"
  value={message}
  onChangeText={setMessage}
  isTextArea={true}
  textInputProps={{
    multiline: true,
    numberOfLines: 4,
  }}
/>
```

### 커스텀 스타일링

```tsx
<ZSTextField
  label="커스텀 필드"
  value={value}
  onChangeText={setValue}
  inputBgColor="#f5f5f5"
  labelBgColor="#ffffff"
  focusColor="#007AFF"
  borderRadius={20}
  paddingHorizontal={20}
  textInputProps={{
    style: { color: '#333' },
    placeholder: '입력하세요',
  }}
/>
```

### Ref 사용

```tsx
import { useRef } from 'react';
import { ZSTextField, ZSTextFieldRef } from '@0610studio/zs-ui';

function MyComponent() {
  const inputRef = useRef<ZSTextFieldRef>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <ZSTextField
        ref={inputRef}
        label="입력 필드"
        value={value}
        onChangeText={setValue}
      />
      <Button title="포커스" onPress={handleFocus} />
    </>
  );
}
```
