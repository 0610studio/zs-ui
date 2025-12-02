---
sidebar_position: 3
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# BottomSheet

화면 하단에서 위로 슬라이드하며 나타나는 모달 인터페이스입니다. 제스처로 드래그하여 닫을 수 있으며, 키보드가 나타나면 자동으로 위치를 조정합니다.

<ExpoSnack id="@studio0610/zs-ui_13_bottomsheet" />

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showBottomSheet } = useOverlay();

  const handleOpenBottomSheet = () => {
    showBottomSheet({
      component: <MyBottomSheetContent />,
      options: {
        height: 300,
        padding: 20,
      },
    });
  };

  return <Button title="BottomSheet 열기" onPress={handleOpenBottomSheet} />;
}
```

## API 참조

### `showBottomSheet` 함수

```typescript
showBottomSheet(props: ShowBottomSheetProps): void
```

### `ShowBottomSheetProps` 인터페이스

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `component` | `React.ReactNode` | Required | Bottom Sheet 내부에 표시할 컴포넌트 |
| `headerComponent` | `React.ReactNode` | `undefined` | 상단에 표시할 헤더 컴포넌트 |
| `options` | `BottomSheetOptions` | `{}` | Bottom Sheet 옵션 |

### `BottomSheetOptions` 인터페이스

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isBackgroundTouchClose` | `boolean` | `true` | 배경을 터치하면 닫을지 여부 |
| `marginHorizontal` | `number` | `10` | 시트의 좌우 여백 |
| `marginBottom` | `number` | `10` | 시트의 하단 여백 |
| `height` | `number` | Required | 시트의 높이 |
| `padding` | `number` | `14` | 시트 내부 패딩 |
| `foldableSingleScreen` | `boolean` | `false` | 폴더블 디바이스에서 단일 화면 모드 사용 여부 |
| `type` | `'floating' \| 'fixed'` | `'floating'` | 시트 타입 (`floating`: 떠있는 형태, `fixed`: 화면 하단에 고정) |

## 특징

- **제스처 지원**: 드래그하여 닫을 수 있습니다
- **키보드 대응**: 키보드가 나타나면 자동으로 위치를 조정합니다
- **애니메이션**: 부드러운 스프링 애니메이션이 적용됩니다
- **폴더블 디바이스 지원**: 폴더블 디바이스에서도 올바르게 동작합니다

## 예제

### 기본 사용

```tsx
import { useOverlay, ZSText, ZSPressable } from '@0610studio/zs-ui';
import { View } from 'react-native';

function MyBottomSheetContent() {
  const { hideOverlay } = useOverlay();

  return (
    <View>
      <ZSText typo="heading.2">제목</ZSText>
      <ZSText typo="body.2">내용</ZSText>
      <ZSPressable onPress={() => hideOverlay('bottomSheet')}>
        <ZSText typo="body.2">닫기</ZSText>
      </ZSPressable>
    </View>
  );
}

function MyComponent() {
  const { showBottomSheet } = useOverlay();

  const handleOpenBottomSheet = () => {
    showBottomSheet({
      component: <MyBottomSheetContent />,
      options: {
        height: 300,
      },
    });
  };

  return <Button title="BottomSheet 열기" onPress={handleOpenBottomSheet} />;
}
```

### 헤더 컴포넌트 사용

```tsx
import { useOverlay, ZSText } from '@0610studio/zs-ui';
import { View } from 'react-native';

function MyComponent() {
  const { showBottomSheet } = useOverlay();

  const handleOpenBottomSheet = () => {
    showBottomSheet({
      headerComponent: (
        <View style={{ padding: 20 }}>
          <ZSText typo="heading.2">헤더</ZSText>
        </View>
      ),
      component: <MyBottomSheetContent />,
      options: {
        height: 400,
      },
    });
  };

  return <Button title="BottomSheet 열기" onPress={handleOpenBottomSheet} />;
}
```

### Fixed 타입 (화면 하단 고정)

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showBottomSheet } = useOverlay();

  const handleOpenBottomSheet = () => {
    showBottomSheet({
      component: <MyBottomSheetContent />,
      options: {
        height: 500,
        type: 'fixed',
        padding: 20,
      },
    });
  };

  return <Button title="BottomSheet 열기" onPress={handleOpenBottomSheet} />;
}
```

### 커스텀 여백

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showBottomSheet } = useOverlay();

  const handleOpenBottomSheet = () => {
    showBottomSheet({
      component: <MyBottomSheetContent />,
      options: {
        height: 400,
        marginHorizontal: 20,
        marginBottom: 30,
        padding: 30,
      },
    });
  };

  return <Button title="BottomSheet 열기" onPress={handleOpenBottomSheet} />;
}
```

### 배경 터치로 닫기 비활성화

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showBottomSheet } = useOverlay();

  const handleOpenBottomSheet = () => {
    showBottomSheet({
      component: <MyBottomSheetContent />,
      options: {
        height: 300,
        isBackgroundTouchClose: false,
      },
    });
  };

  return <Button title="BottomSheet 열기" onPress={handleOpenBottomSheet} />;
}
```

### BottomSheet 닫기

```tsx
import { useOverlay, ZSPressable, ZSText } from '@0610studio/zs-ui';
import { View } from 'react-native';

function MyBottomSheetContent() {
  const { hideOverlay } = useOverlay();

  return (
    <View>
      <ZSPressable onPress={() => hideOverlay('bottomSheet')}>
        <ZSText typo="body.2">닫기</ZSText>
      </ZSPressable>
    </View>
  );
}
```

### 폴더블 디바이스 지원

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showBottomSheet } = useOverlay();

  const handleOpenBottomSheet = () => {
    showBottomSheet({
      component: <MyBottomSheetContent />,
      options: {
        height: 400,
        foldableSingleScreen: true,
      },
    });
  };

  return <Button title="BottomSheet 열기" onPress={handleOpenBottomSheet} />;
}
```
