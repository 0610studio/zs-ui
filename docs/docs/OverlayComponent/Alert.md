---
sidebar_position: 2
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# Alert

사용자에게 중요한 메시지를 전달하거나, 모달로부터 사용자의 응답을 받을때 사용됩니다.

<ExpoSnack id="@studio0610/zs-ui-alert" />

### 기본 사용법

```jsx
import React, { useContext } from 'react';
import { Button } from 'react-native';
import { useOverlay } from "@0610studio/zs-ui";

const AlertExample = () => {
  const { showAlert, showSnackBar, showBottomSheet } = useOverlay();

  const handleShowAlert = () => {
    showAlert({
      title: "타이틀 테스트 길어지면 줄바꿈이 될 수 있습니다.",
      informative: "테스트 informative 길~~~~~~~~어지면 줄바꿈이 될 수 있습니다.",
      primaryButtonStyle: { backgroundColor: primary.main },
      actions: {
        primary: {
          label: "확인",
          onPress: () => console.log("확인"),
        },
        secondary: {
          label: "취소",
          onPress: () => console.log("취소"),
        },
      },
    })
  };

  return <Button title="Alert 표시" onPress={handleShowAlert} />;
};

export default AlertExample;
```

---

## API 참조

### `showAlert` 함수

`showAlert` 함수는 Alert 알림을 표시하는 데 사용됩니다. 이 함수는 `ShowAlertProps` 타입의 객체를 인수로 받습니다.

```typescript
showAlert(props: ShowAlertProps): void
```

### `ShowAlertProps` 인터페이스

`ShowAlertProps`는 `showAlert` 함수에 전달되는 속성을 정의합니다.

```typescript
interface ShowAlertProps {
  title: string;
  informative: string;
  actions?: AlertActions;
  isBackgroundTouchClose?: boolean;
  titleStyle?: TextProps['style'];
  informativeStyle?: TextProps['style'];
  secondaryButtonStyle?: TouchableOpacityProps['style'];
  primaryButtonStyle?: TouchableOpacityProps['style'];
  secondaryButtonTextStyle?: TextProps['style'];
  primaryButtonTextStyle?: TextProps['style'];
  singleButtonTextStyle?: TextProps['style'];
}
```

#### 속성 설명

| 속성                      | 타입                                        | 설명                                                                                       |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `title`                   | `string`                                    | 알림의 제목입니다.                                                                         |
| `informative`             | `string`                                    | 알림의 설명 메시지입니다.                                                                   |
| `actions`                 | `AlertActions` *(선택 사항)*                | 알림에 표시할 액션들 (예: 기본 및 보조 버튼)입니다.                                         |
| `isBackgroundTouchClose`  | `boolean` *(선택 사항, 기본값: `true`)*     | 배경을 터치하면 알림이 닫히는지 여부를 결정합니다.                                           |
| `titleStyle`              | `TextStyle` *(선택 사항)*                   | 알림 제목의 커스텀 스타일입니다.                                                            |
| `informativeStyle`        | `TextStyle` *(선택 사항)*                   | 설명 메시지의 커스텀 스타일입니다.                                                           |
| `secondaryButtonStyle`    | `TouchableOpacityStyle` *(선택 사항)*        | 보조 버튼의 커스텀 스타일입니다.                                                              |
| `primaryButtonStyle`      | `TouchableOpacityStyle` *(선택 사항)*        | 기본 버튼의 커스텀 스타일입니다.                                                              |
| `secondaryButtonTextStyle`| `TextStyle` *(선택 사항)*                   | 보조 버튼 텍스트의 커스텀 스타일입니다.                                                       |
| `primaryButtonTextStyle`  | `TextStyle` *(선택 사항)*                   | 기본 버튼 텍스트의 커스텀 스타일입니다.                                                       |
| `singleButtonTextStyle`   | `TextStyle` *(선택 사항)*                   | 버튼이 하나만 있을 때의 텍스트 커스텀 스타일입니다.                                           |

### `AlertActions` 인터페이스

`AlertActions`는 Alert 알림에 포함될 버튼들을 정의합니다.

```typescript
interface AlertActions {
  primary: AlertAction;
  secondary?: AlertAction;
}
```

#### 속성 설명

| 속성       | 타입               | 설명                                     |
| ---------- | ------------------ | ---------------------------------------- |
| `primary`  | `AlertAction`      | 기본 버튼을 정의합니다.                   |
| `secondary`| `AlertAction` *(선택 사항)* | 보조 버튼을 정의합니다. (선택 사항) |

### `AlertAction` 인터페이스

`AlertAction`은 개별 버튼의 속성을 정의합니다.

```typescript
interface AlertAction {
  label: string;
  onPress?: () => void;
}
```

#### 속성 설명

| 속성      | 타입                 | 설명                          |
| --------- | -------------------- | ----------------------------- |
| `label`   | `string`             | 버튼에 표시될 텍스트입니다.    |
| `onPress` | `() => void` *(선택 사항)* | 버튼 클릭 시 실행될 함수입니다. |

---

## 커스터마이징

Alert 알림의 외관과 동작을 커스터마이징하여 애플리케이션의 디자인과 일관되게 만들 수 있습니다.

```jsx
  showAlert({
    title: '경고',
    informative: '이 작업은 되돌릴 수 없습니다.',
    actions: {
      primary: { label: '삭제', onPress: () => console.log('삭제 클릭됨') },
      secondary: { label: '취소', onPress: () => console.log('취소 클릭됨') },
    },
    primaryButtonStyle: { backgroundColor: '#e74c3c', padding: 10 },
    secondaryButtonStyle: { backgroundColor: '#95a5a6', padding: 10 },
    primaryButtonTextStyle: { color: '#fff', fontWeight: 'bold' },
    secondaryButtonTextStyle: { color: '#fff', fontWeight: 'bold' },
  });
```
---
