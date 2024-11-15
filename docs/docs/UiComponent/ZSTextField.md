---
sidebar_position: 3
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# ZSTextField

Reanimated를 사용하여 다양한 스타일 애니메이션을 제공하는 텍스트 필드 컴포넌트입니다.

<!-- TODO: 웹에서 스타일이 깨짐. -->
<!-- <ExpoSnack id="@studio0610/zs-ui-textfield" /> -->

### 기본 사용법

```tsx
import { ZSTextField } from '@0610studio/zs-ui';

<ZSTextField
  boxStyle="underline"
  label="닉네임"
  value={nick}
  inputBgColor={background.base}
  labelBgColor={background.base}
  focusColor={primary.main}
  onChangeText={setNick}
  textInputProps={{
    multiline: false,
    style: { color: text.primary },
  }}
/>

<ZSTextField
  boxStyle="outline"
  label="아이디"
  value={userId}
  inputBgColor={background.base}
  labelBgColor={background.base}
  focusColor={primary.main}
  onChangeText={serUserId}
  textInputProps={{
    multiline: false,
    style: { color: text.primary, paddingTop: 8, paddingBottom: 10 },
  }}
/>

<ZSTextField
  boxStyle="inbox"
  label="이메일"
  value={email}
  inputBgColor={background.base}
  labelBgColor={background.base}
  focusColor={primary.main}
  onChangeText={setEmail}
  textInputProps={{
    multiline: false,
    style: { color: text.primary },
  }}
/>
```

---

### Props

| **Prop**              | **Type**                              | **Default**      | **Description**                                                                                                                                              |
|-----------------------|---------------------------------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `typo`               | `TypoOptions`                        | `'body.2'`       | 텍스트 스타일을 정의. 테마에 따라 자동 적용.                                                                                                                 |
| `status`             | `'default' \| 'error'`               | `'default'`      | 입력 상태를 설정. 에러 시 라벨 및 테두리 색상이 변경됨.                                                                                                     |
| `value`              | `string`                             | `''`             | 텍스트 필드의 입력 값.                                                                                                                                       |
| `onChangeText`       | `(text: string) => void`             | `undefined`      | 텍스트 변경 이벤트 핸들러.                                                                                                                                   |
| `inputBgColor`       | `string`                             | `'white'`        | 입력 필드의 배경색.                                                                                                                                         |
| `labelBgColor`       | `string`                             | `'white'`        | 라벨의 배경색.                                                                                                                                               |
| `label`              | `string`                             | `'Placeholder'`  | 텍스트 필드의 라벨 텍스트.                                                                                                                                   |
| `labelColor`         | `string`                             | `'#757575'`      | 라벨의 기본 텍스트 색상.                                                                                                                                    |
| `placeHolderColor`   | `string`                             | `'#B1B1B1'`      | placeholder 텍스트 색상.                                                                                                                                     |
| `fontSize`           | `number`                             | 테마에 따름       | 입력 필드 텍스트 크기.                                                                                                                                       |
| `borderColor`        | `string`                             | `'#E7EDF0'`      | 테두리 색상.                                                                                                                                                 |
| `borderRadius`       | `number`                             | `14`             | 테두리의 라운딩 반경.                                                                                                                                       |
| `focusColor`         | `string`                             | `'#007AFF'`      | 포커스 상태에서의 테두리 색상.                                                                                                                              |
| `errorColor`         | `string`                             | `'#FF3B30'`      | 에러 상태에서의 테두리 및 라벨 색상.                                                                                                                        |
| `paddingHorizontal`  | `number`                             | `15`             | 텍스트 필드의 좌우 여백.                                                                                                                                    |
| `borderWidth`        | `number`                             | `1.2`            | 테두리 두께.                                                                                                                                                 |
| `errorMessage`       | `string`                             | `undefined`      | 에러 상태에서 표시할 메시지.                                                                                                                                |
| `textInputProps`     | `TextInputProps`                     | `{}`             | 기본 React Native `TextInput` 속성.                                                                                                                         |
| `boxStyle`           | `'outline' \| 'underline' \| 'inbox'`| `'outline'`      | 텍스트 필드 스타일.                                                                                                                                         |
| `innerBoxStyle`      | `'top' \| 'middle' \| 'bottom'`      | `undefined`      | 텍스트 필드가 그룹일 때 스타일을 정의.                                                                                                                       |
| `disabled`           | `boolean`                            | `false`          | 텍스트 필드 비활성화 여부.                                                                                                                                   |
| `allowFontScaling`   | `boolean`                            | `true`           | 텍스트 크기 자동 조정 허용 여부.                                                                                                                            |
| `isTextArea`         | `boolean`                            | `false`          | 멀티라인 입력 여부.                                                                                                                                        |
