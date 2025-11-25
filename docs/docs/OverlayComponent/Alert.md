---
sidebar_position: 2
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# Alert

사용자에게 중요한 메시지를 전달하거나, 모달로부터 사용자의 응답을 받을 때 사용되는 알림 컴포넌트입니다.

<ExpoSnack id="@studio0610/zs-ui-alert" />

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showAlert } = useOverlay();

  const handleShowAlert = () => {
    showAlert({
      title: '확인',
      informative: '이 작업을 계속하시겠습니까?',
      actions: {
        primary: {
          label: '확인',
          onPress: () => console.log('확인'),
        },
        secondary: {
          label: '취소',
          onPress: () => console.log('취소'),
        },
      },
    });
  };

  return <Button title="Alert 표시" onPress={handleShowAlert} />;
}
```

## API 참조

### `showAlert` 함수

`showAlert` 함수는 Alert 알림을 표시하는 데 사용됩니다.

```typescript
showAlert(props: ShowAlertProps): void
```

### `ShowAlertProps` 인터페이스

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | 알림의 제목 |
| `informative` | `string` | `undefined` | 알림의 설명 메시지 |
| `actions` | `AlertActions` | `undefined` | 알림에 표시할 액션들 (기본 및 보조 버튼) |
| `isBackgroundTouchClose` | `boolean` | `true` | 배경을 터치하면 알림이 닫히는지 여부 |
| `titleStyle` | `TextProps['style']` | `undefined` | 알림 제목의 커스텀 스타일 |
| `informativeStyle` | `TextProps['style']` | `undefined` | 설명 메시지의 커스텀 스타일 |
| `secondaryButtonStyle` | `TouchableOpacityProps['style']` | `undefined` | 보조 버튼의 커스텀 스타일 |
| `primaryButtonStyle` | `TouchableOpacityProps['style']` | `undefined` | 기본 버튼의 커스텀 스타일 |
| `secondaryButtonTextStyle` | `TextProps['style']` | `undefined` | 보조 버튼 텍스트의 커스텀 스타일 |

### `AlertActions` 인터페이스

```typescript
interface AlertActions {
  primary: AlertAction;
  secondary?: AlertAction;
}
```

### `AlertAction` 인터페이스

```typescript
interface AlertAction {
  label: string;
  onPress?: () => void;
}
```

## 특징

- **모달 알림**: 사용자의 주의를 끌기 위한 모달 형태의 알림
- **액션 버튼**: 기본 버튼과 보조 버튼을 통해 사용자 응답 수집
- **커스터마이징**: 버튼 스타일과 텍스트 스타일을 자유롭게 설정 가능
- **배경 터치 제어**: 배경 터치로 닫기 여부를 설정할 수 있습니다

## 예제

### 단일 버튼 Alert

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showAlert } = useOverlay();

  const handleShowAlert = () => {
    showAlert({
      title: '알림',
      informative: '작업이 완료되었습니다.',
      actions: {
        primary: {
          label: '확인',
          onPress: () => console.log('확인'),
        },
      },
    });
  };

  return <Button title="Alert 표시" onPress={handleShowAlert} />;
}
```

### 두 개의 버튼 Alert

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showAlert } = useOverlay();

  const handleDelete = () => {
    showAlert({
      title: '삭제 확인',
      informative: '이 항목을 삭제하시겠습니까?',
      actions: {
        primary: {
          label: '삭제',
          onPress: () => {
            // 삭제 로직
          },
        },
        secondary: {
          label: '취소',
          onPress: () => {
            // 취소 로직
          },
        },
      },
    });
  };

  return <Button title="삭제" onPress={handleDelete} />;
}
```

### 커스텀 스타일

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showAlert } = useOverlay();

  const handleShowAlert = () => {
    showAlert({
      title: '경고',
      informative: '이 작업은 되돌릴 수 없습니다.',
      actions: {
        primary: {
          label: '삭제',
          onPress: () => console.log('삭제'),
        },
        secondary: {
          label: '취소',
          onPress: () => console.log('취소'),
        },
      },
      primaryButtonStyle: {
        backgroundColor: '#e74c3c',
        padding: 10,
      },
      secondaryButtonStyle: {
        backgroundColor: '#95a5a6',
        padding: 10,
      },
      primaryButtonTextStyle: {
        color: '#fff',
        fontWeight: 'bold',
      },
      secondaryButtonTextStyle: {
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  };

  return <Button title="경고 표시" onPress={handleShowAlert} />;
}
```

### 배경 터치로 닫기 비활성화

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showAlert } = useOverlay();

  const handleShowAlert = () => {
    showAlert({
      title: '중요한 알림',
      informative: '이 알림은 배경을 터치해도 닫히지 않습니다.',
      isBackgroundTouchClose: false,
      actions: {
        primary: {
          label: '확인',
          onPress: () => console.log('확인'),
        },
      },
    });
  };

  return <Button title="Alert 표시" onPress={handleShowAlert} />;
}
```

### Alert 닫기

Alert는 버튼을 누르거나 배경을 터치하면 자동으로 닫힙니다. 프로그래밍 방식으로 닫으려면:

```tsx
import { useOverlay } from '@0610studio/zs-ui';

const { hideOverlay } = useOverlay();

hideOverlay('alert');
```
