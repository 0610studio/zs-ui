---
sidebar_position: 7
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# PopOver

작은 메뉴나 도구 모음을 버튼 위치 기준으로 표시할 수 있는 오버레이 컴포넌트입니다. `PopOverButton`을 사용하면 손쉽게 메뉴를 열 수 있으며, 메뉴 내용은 `PopOverMenu`에 전달한 컴포넌트로 렌더링됩니다.

<ExpoSnack id="@studio0610/zs-ui_13_popover" />

## 기본 사용법

```tsx
import { PopOverButton } from '@0610studio/zs-ui';

function MyComponent() {
  return (
    <PopOverButton
      width={40}
      height={40}
      popOverMenuComponent={
        <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8 }}>
          <ZSPressable onPress={() => console.log('옵션 1')}>
            <ZSText typo="body.2">옵션 1</ZSText>
          </ZSPressable>
          <ZSPressable onPress={() => console.log('옵션 2')}>
            <ZSText typo="body.2">옵션 2</ZSText>
          </ZSPressable>
        </View>
      }
    >
      <Icon name="more" />
    </PopOverButton>
  );
}
```

## PopOverButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | Required | 버튼 영역의 너비 |
| `height` | `number` | Required | 버튼 영역의 높이 |
| `backgroundColor` | `string` | `'transparent'` | 버튼 배경색 |
| `popOverMenuComponent` | `React.ReactNode` | Required | 표시할 메뉴 컴포넌트 |
| `children` | `React.ReactNode` | Required | 버튼 내부에 표시할 컴포넌트 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **자동 위치 조정**: 화면 경계를 벗어나지 않도록 자동으로 위치가 조정됩니다
- **애니메이션**: `FadeInUp`과 `FadeOutUp` 애니메이션이 적용됩니다
- **배경 터치로 닫기**: 배경을 터치하면 자동으로 닫힙니다
- **유연한 메뉴**: 원하는 컴포넌트를 메뉴로 표시할 수 있습니다

## 예제

- **자동 위치 조정**: 화면 경계를 벗어나지 않도록 자동으로 위치가 조정됩니다
- **애니메이션**: `FadeInUp`과 `FadeOutUp` 애니메이션이 적용됩니다
- **배경 터치로 닫기**: 배경을 터치하면 자동으로 닫힙니다

## 예제

### 기본 사용

```tsx
import { PopOverButton } from '@0610studio/zs-ui';

<PopOverButton
  width={40}
  height={40}
  popOverMenuComponent={
    <View style={{ backgroundColor: '#fff', padding: 10 }}>
      <ZSText typo="body.2">메뉴 항목</ZSText>
    </View>
  }
>
  <Icon name="more" />
</PopOverButton>
```

### 커스텀 배경색

```tsx
import { PopOverButton } from '@0610studio/zs-ui';

<PopOverButton
  width={50}
  height={50}
  backgroundColor="#f0f0f0"
  popOverMenuComponent={<MyMenu />}
>
  <Icon name="menu" />
</PopOverButton>
```

### 메뉴 항목 리스트

```tsx
function MenuContent() {
  const { hideOverlay } = useOverlay();

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8 }}>
      <ZSPressable
        onPress={() => {
          console.log('편집');
          hideOverlay('popOver');
        }}
        style={{ padding: 12 }}
      >
        <ZSText typo="body.2">편집</ZSText>
      </ZSPressable>
      <ZSPressable
        onPress={() => {
          console.log('삭제');
          hideOverlay('popOver');
        }}
        style={{ padding: 12 }}
      >
        <ZSText typo="body.2" color="danger">삭제</ZSText>
      </ZSPressable>
    </View>
  );
}

<PopOverButton
  width={40}
  height={40}
  popOverMenuComponent={<MenuContent />}
>
  <Icon name="more" />
</PopOverButton>
```

### PopOver 닫기

```tsx
import { useOverlay } from '@0610studio/zs-ui';

const { hideOverlay } = useOverlay();

hideOverlay('popOver');
```

### 프로그래밍 방식으로 열기

`useOverlay` 훅의 `showPopOverMenu` 함수를 직접 사용할 수도 있습니다:

```tsx
import { useOverlay } from '@0610studio/zs-ui';

function MyComponent() {
  const { showPopOverMenu } = useOverlay();
  const buttonRef = useRef<View>(null);

  const handlePress = () => {
    buttonRef.current?.measure((fx, fy, width, height, pageX, pageY) => {
      if (pageX !== undefined && pageY !== undefined) {
        showPopOverMenu({
          px: pageX + width,
          py: pageY + height,
          component: <MyMenu />,
        });
      }
    });
  };

  return (
    <ZSPressable onPress={handlePress}>
      <View ref={buttonRef}>
        <Icon name="more" />
      </View>
    </ZSPressable>
  );
}
```
