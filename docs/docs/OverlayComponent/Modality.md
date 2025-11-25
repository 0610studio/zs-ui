---
sidebar_position: 6
---

# Modality

기존 화면 위에 새로운 화면을 슬라이드 방식으로 표시하는 오버레이 컴포넌트입니다. 배경 화면이 축소되며, 새로운 화면이 하단에서 올라오는 형태로 네이티브 모달과 유사하게 동작합니다.

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showModality } = useOverlay();

  const handleOpenModal = () => {
    showModality({
      component: <MyModalContent />,
    });
  };

  return <Button title="모달 열기" onPress={handleOpenModal} />;
}
```

## API 참조

### `showModality` 함수

```typescript
showModality(props: ModalityProps): void
```

### `ModalityProps` 인터페이스

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `component` | `React.ReactNode` | Required | 모달로 표시할 컴포넌트 |
| `foldableSingleScreen` | `boolean` | `false` | 폴더블 디바이스에서 단일 화면 모드 사용 여부 |

## 특징

- **부드러운 애니메이션**: 배경 화면이 축소되고 새 화면이 슬라이드됩니다
- **전체 화면**: 모달 컴포넌트는 전체 화면 높이를 차지합니다
- **SafeArea 지원**: iOS의 SafeArea를 자동으로 고려합니다
- **폴더블 디바이스 지원**: 폴더블 디바이스에서도 올바르게 동작합니다

## 예제

- **부드러운 애니메이션**: 배경 화면이 축소되고 새 화면이 슬라이드됩니다
- **전체 화면**: 모달 컴포넌트는 전체 화면 높이를 차지합니다
- **SafeArea 지원**: iOS의 SafeArea를 자동으로 고려합니다
- **폴더블 디바이스 지원**: 폴더블 디바이스에서도 올바르게 동작합니다

## 예제

### 기본 사용

```tsx
import { useOverlay, ZSContainer, ZSText, ZSPressable } from '@0610studio/zs-ui';

function MyModalContent() {
  const { hideOverlay } = useOverlay();

  return (
    <ZSContainer>
      <ZSText typo="heading.1">모달 제목</ZSText>
      <ZSText typo="body.2">모달 내용</ZSText>
      <ZSPressable onPress={() => hideOverlay('modal')}>
        <ZSText typo="body.2">닫기</ZSText>
      </ZSPressable>
    </ZSContainer>
  );
}

function MyComponent() {
  const { showModality } = useOverlay();

  const handleOpenModal = () => {
    showModality({
      component: <MyModalContent />,
    });
  };

  return <Button title="모달 열기" onPress={handleOpenModal} />;
}
```

### 폴더블 디바이스 지원

```tsx
import { useOverlay } from '@0610studio/zs-ui';

const { showModality } = useOverlay();

showModality({
  component: <MyModalContent />,
  foldableSingleScreen: true,
});
```

### Modality 닫기

```tsx
import { useOverlay } from '@0610studio/zs-ui';

const { hideOverlay } = useOverlay();

hideOverlay('modal');
```

### 전체 화면 모달 예제

```tsx
import { useOverlay, ZSContainer, ZSText, ZSPressable } from '@0610studio/zs-ui';
import { View } from 'react-native';

function FullScreenModal() {
  const { hideOverlay } = useOverlay();

  return (
    <ZSContainer>
      <View style={{ padding: 20 }}>
        <ZSText typo="heading.1">전체 화면 모달</ZSText>
        <ZSText typo="body.2" style={{ marginTop: 20 }}>
          이 모달은 전체 화면을 차지합니다.
        </ZSText>
        <ZSPressable
          onPress={() => hideOverlay('modal')}
          style={{ marginTop: 40 }}
        >
          <ZSText typo="body.1">닫기</ZSText>
        </ZSPressable>
      </View>
    </ZSContainer>
  );
}

function MyComponent() {
  const { showModality } = useOverlay();

  const handleOpenModal = () => {
    showModality({
      component: <FullScreenModal />,
    });
  };

  return <Button title="모달 열기" onPress={handleOpenModal} />;
}
```
