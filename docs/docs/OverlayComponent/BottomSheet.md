---
sidebar_position: 3
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# BottomSheet

화면 하단에서 위로 슬라이드하면서 나타나는 모달 인터페이스로, 추가적인 옵션이나 정보를 사용자에게 제공할 때 유용합니다.

<ExpoSnack id="@studio0610/zs-ui-bottom-sheet" />

## 기본 사용법

```tsx
import { useOverlay, ZSContainer, useTheme } from "@0610studio/zs-ui";

const { showBottomSheet } = useOverlay();

<Button
  title="show_BottomSheet"
  color="#331599"
  onPress={() => {
    showBottomSheet({
      isScrollView: true,
      contentsGestureEnable: false,
      maxHeight: 300,
      showsVerticalScrollIndicator: true,
      component: (
        <MyBottomSheet
          onConfirm={() => {
            console.log("event");
          }}
        />
      ),
    });
  }}
/>
```

```tsx title="MyBottomSheet.tsx"
import { ColorPalette, ThemeBackground, useOverlay, ZSPressable, ZSText, ZSView, useTheme } from '@0610studio/zs-ui';

function MyBottomSheet({ onConfirm }: MyBottomSheetProps) {
  const { hideOverlay } = useOverlay();

  const handleConfirmPress = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleClosePress = useCallback(() => {
    hideOverlay('bottomSheet');
  }, [hideOverlay]);

  return (
    <ZSView style={styles.container}>
      <ZSPressable fullWidth style={styles.confirm} onPress={handleConfirmPress}>
        <ZSText>확인</ZSText>
      </ZSPressable>
      <ZSPressable fullWidth style={styles.button} onPress={handleClosePress}>
        <ZSText>닫기</ZSText>
      </ZSPressable>
    </ZSView>
  );
}
```

---

## API 참조

### `showBottomSheet` 함수

`showBottomSheet` 함수는 Bottom Sheet 알림을 표시하는 데 사용됩니다. 이 함수는 `ShowBottomSheetProps` 타입의 객체를 인수로 받습니다.

#### 사용법

```typescript
showBottomSheet(props: ShowBottomSheetProps): void
```

### `ShowBottomSheetProps` 인터페이스

`ShowBottomSheetProps`는 `showBottomSheet` 함수에 전달되는 속성을 정의합니다.

```typescript
interface ShowBottomSheetProps {
  backgroundColor?: string;
  isBottomRadius?: boolean;
  marginHorizontal?: number;
  isHandleVisible?: boolean;
  marginBottom?: number;
  padding?: number;
  component: React.ReactNode;
  contentsGestureEnable?: boolean;
  maxHeight?: number;
  isScrollView?: boolean;
  showsVerticalScrollIndicator?: boolean;
  headerComponent?: React.ReactNode;
}
```

#### 속성 설명

| 속성                       | 타입                                    | 설명                                                                                                     |
| -------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `backgroundColor`          | `string` *(선택 사항)*                   | 바텀 시트의 배경색입니다.                                                                                |
| `isBottomRadius`           | `boolean` *(선택 사항, 기본값: `true`)* | 바텀 시트 상단의 둥근 모서리 여부를 결정합니다.                                                          |
| `marginHorizontal`         | `number` *(선택 사항)*                   | 바텀 시트의 수평 여백입니다.                                                                              |
| `isHandleVisible`          | `boolean` *(선택 사항, 기본값: `true`)* | 바텀 시트 상단의 핸들(표시기) 표시 여부를 결정합니다.                                                    |
| `marginBottom`             | `number` *(선택 사항)*                   | 바텀 시트의 하단 여백입니다.                                                                              |
| `padding`                  | `number` *(선택 사항)*                   | 바텀 시트 내부의 패딩입니다.                                                                              |
| `component`                | `ReactNode`                              | 바텀 시트 내부에 렌더링할 콘텐츠 컴포넌트입니다.                                                          |
| `contentsGestureEnable`    | `boolean` *(선택 사항, 기본값: `true`)* | 바텀 시트 콘텐츠 내에서 제스처 상호작용을 활성화할지 여부를 결정합니다.                                    |
| `maxHeight`                | `number` *(선택 사항)*                   | 바텀 시트의 최대 높이입니다. 기본값은 디바이스 높이에서 120을 뺀 값입니다.                                   |
| `isScrollView`             | `boolean` *(선택 사항, 기본값: `true`)* | 바텀 시트 콘텐츠가 스크롤 가능할지 여부를 결정합니다.                                                    |
| `showsVerticalScrollIndicator` | `boolean` *(선택 사항, 기본값: `false`)* | 세로 스크롤 인디케이터 표시 여부를 결정합니다.                                                            |
| `headerComponent`          | `ReactNode` *(선택 사항)*                | 바텀 시트 상단에 표시할 커스텀 헤더 컴포넌트입니다.                                                         |

---

## 커스터마이징

예시: 배경색과 패딩 변경

```jsx
showBottomSheet({
  component: (
    <View>
      <Text>커스텀 스타일의 바텀 시트입니다.</Text>
    </View>
  ),
  backgroundColor: '#ffffff',
  padding: 30,
});
```

### 헤더 컴포넌트 추가

바텀 시트 상단에 헤더 컴포넌트를 추가하여 제목이나 닫기 버튼 등을 표시할 수 있습니다.

```jsx
showBottomSheet({
  component: (
    <View>
      <Text>내용</Text>
    </View>
  ),
  headerComponent: (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ddd' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>헤더 제목</Text>
    </View>
  ),
});
```

### 제스처 및 스크롤 설정

바텀 시트의 콘텐츠가 스크롤 가능할지 여부와 제스처 상호작용을 설정할 수 있습니다.

```jsx
showBottomSheet({
  component: (
    <ScrollView>
      <Text>긴 내용...</Text>
    </ScrollView>
  ),
  isScrollView: true,
  showsVerticalScrollIndicator: true,
  maxHeight: 500,
});
```

---

- **최대 높이 설정:** `maxHeight` 속성을 사용하여 바텀 시트의 최대 높이를 설정할 수 있습니다. 기본값은 디바이스 높이에서 120을 뺀 값입니다.

- **헤더 컴포넌트:** `headerComponent`를 제공할 경우, 바텀 시트의 상단에 커스텀 헤더가 추가됩니다. 이를 통해 제목이나 닫기 버튼 등을 쉽게 추가할 수 있습니다.
