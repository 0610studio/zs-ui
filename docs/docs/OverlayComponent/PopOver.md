import LocalPlayground from '@site/src/components/LocalPlayground';

# PopOver

작은 메뉴나 도구 모음을 버튼 위치 기준으로 표시할 수 있는 오버레이 컴포넌트입니다. `PopOverButton`의 `popOverMenuComponent`로 메뉴 내용을 넘기면 버튼을 눌렀을 때 메뉴가 열립니다. `PopOverMenu`는 `OverlayProvider`가 메뉴를 그릴 때 쓰는 렌더러이므로 앱 화면에서 직접 마운트하지 않습니다.

<LocalPlayground example="PopOver" />

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | 필수 | 버튼 영역의 너비 |
| `height` | `number` | 필수 | 버튼 영역의 높이 |
| `backgroundColor` | `string` | `'transparent'` | 버튼 배경색 |
| `popOverMenuComponent` | `React.ReactNode` | 필수 | 표시할 메뉴 컴포넌트 |
| `children` | `React.ReactNode` | `undefined` | 버튼 내부에 표시할 컴포넌트 |
| `...props` | `ViewProps` | `undefined` | React Native `View`의 모든 기본 속성. `style`을 넘기면 `width`·`height`·`backgroundColor` 스타일을 대체합니다 |

## API 참조

### `showPopOverMenu` 함수

`PopOverButton` 없이 임의의 좌표에서 직접 메뉴를 띄우려면 `useOverlay`의 `showPopOverMenu`를 사용합니다. `PopOverButton`도 내부적으로 버튼의 오른쪽 아래 모서리 좌표로 이 함수를 호출합니다.

```typescript
showPopOverMenu(props: PopOverMenuProps): void
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `px` | `number` | 필수 | 메뉴 오른쪽 끝을 맞출 x 좌표 (화면 절대 좌표) |
| `py` | `number` | 필수 | 메뉴 위쪽을 맞출 y 좌표 (화면 절대 좌표). 메뉴가 화면 아래로 넘치면 이 좌표 위쪽에 띄웁니다 |
| `component` | `React.ReactNode` | 필수 | 표시할 메뉴 컴포넌트 |

```tsx
import { useOverlay, ZSText } from '@0610studio/zs-ui';
import { Pressable, type GestureResponderEvent } from 'react-native';

function MyComponent() {
  const { showPopOverMenu } = useOverlay();

  const openMenu = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    showPopOverMenu({
      px: pageX,
      py: pageY,
      component: <MenuContent />,
    });
  };

  return (
    <Pressable onPress={openMenu}>
      <ZSText typo="body.2">메뉴 열기</ZSText>
    </Pressable>
  );
}
```

호출 시 키보드는 자동으로 닫히고, 화면 경계를 벗어나지 않도록 위치가 조정됩니다.

## 특징

- **자동 위치 조정**: 화면 경계를 벗어나지 않도록 자동으로 위치가 조정됩니다
- **애니메이션**: `FadeInUp`과 `FadeOutUp` 애니메이션이 적용됩니다
- **배경 터치로 닫기**: 배경을 터치하면 자동으로 닫힙니다
- **유연한 메뉴**: 원하는 컴포넌트를 메뉴로 표시할 수 있습니다

## 예제

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

## 관련 문서

- [Overlay 시작하기](./start)
- [Modality](./Modality)
- [ZSPressable](../UiComponent/ZSPressable)
