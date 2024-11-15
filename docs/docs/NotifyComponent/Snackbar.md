---
sidebar_position: 4
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# Snackbar

화면 상단에 일시적인 메시지를 표시하여 사용자에게 정보를 전달합니다. 

<ExpoSnack id="@studio0610/zs-ui-snackbar" />

### 기본 사용법

```jsx
import React, { useContext } from 'react';
import { Button } from 'react-native';
import { useNotify } from '@0610studio/zs-ui';

const SnackbarExample = () => {
const { showSnackBar } = useNotify();

  const handleShowSnackbar = () => {
    showSnackBar({
      message: Date.now().toString(),
      type: "success",
    });
  };

  return <Button title="Snackbar 표시" onPress={handleShowSnackbar} />;
};

export default SnackbarExample;
```

---

## API 참조

### `showSnackBar` 함수

`showSnackBar` 함수는 Snackbar 알림을 표시하는 데 사용됩니다. 이 함수는 `ShowSnackBarProps` 타입의 객체를 인수로 받습니다.

```typescript
showSnackBar(props: ShowSnackBarProps): void
```

### `ShowSnackBarProps` 인터페이스

`ShowSnackBarProps`는 `showSnackBar` 함수에 전달되는 속성을 정의합니다.

```typescript
interface ShowSnackBarProps {
  message: string;
  type?: SnackType;
  index?: number;
  snackbarDuration?: number;
}
```

#### 속성 설명

| 속성               | 타입                                                   | 설명                                                                                         |
| ------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `message`          | `string`                                               | Snackbar에 표시할 메시지입니다.                                                               |
| `type`             | `SnackType` *(선택 사항, 기본값: `'success'`)*         | Snackbar의 유형입니다. `'success'`, `'error'`, 또는 `''` 중 하나를 선택할 수 있습니다.       |
| `index`            | `number` *(선택 사항)*                                 | Snackbar의 고유 식별자입니다. 기본값은 `Date.now()`입니다.                                   |
| `snackbarDuration` | `number` *(선택 사항, 기본값: `3000`)*                 | Snackbar가 표시될 지속 시간 (밀리초)입니다.                                                 |

### `CustomSnackbarProps` 인터페이스

`CustomSnackbarProps`는 커스텀 Snackbar 컴포넌트를 구현할 때 사용하는 속성을 정의합니다.

```typescript
interface CustomSnackbarProps {
  snackType: SnackType;
  snackMessage: string;
}
```

#### 속성 설명

| 속성         | 타입          | 설명                                    |
| ------------ | ------------- | --------------------------------------- |
| `snackType`  | `SnackType`   | Snackbar의 유형을 나타냅니다.           |
| `snackMessage` | `string`    | Snackbar에 표시될 메시지입니다.         |

---

## 커스터마이징

NotifyProvider에 커스텀 Snackbar 적용

```jsx
import React from 'react';
import { NotifyProvider } from '@0610studio/zs-ui';
import App from './App';
import CustomSnackbar from './CustomSnackbar';

const Root = () => (
  <NotifyProvider customSnackbar={CustomSnackbar}>
    <App />
  </NotifyProvider>
);

export default Root;
```
