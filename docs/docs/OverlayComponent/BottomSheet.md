---
sidebar_position: 3
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# BottomSheet

화면 하단에서 위로 슬라이드하며 나타나는 모달 인터페이스입니다. 추가 설정을 통해 배경 터치 닫기 여부나 높이 등을 조절할 수 있습니다.

<ExpoSnack id="@studio0610/zs-ui-bottom-sheet" />

## 기본 사용법

```tsx
import { useOverlay } from '@0610studio/zs-ui';

const { showBottomSheet } = useOverlay();

<Button
  title="BottomSheet 열기"
  onPress={() => {
    showBottomSheet({
      component: <MyBottomSheet />,
      options: { height: 300, padding: 20 },
    });
  }}
/>
```

```tsx title="MyBottomSheet.tsx"
import { useOverlay, ZSPressable, ZSText, ZSView } from '@0610studio/zs-ui';

function MyBottomSheet() {
  const { hideOverlay } = useOverlay();

  return (
    <ZSView>
      <ZSPressable fullWidth onPress={() => hideOverlay('bottomSheet')}>
        <ZSText>닫기</ZSText>
      </ZSPressable>
    </ZSView>
  );
}
```

---

## API 참조

### `showBottomSheet` 함수

`showBottomSheet` 함수는 `ShowBottomSheetProps` 타입의 객체를 인수로 받습니다.

```typescript
showBottomSheet(props: ShowBottomSheetProps): void
```

### `ShowBottomSheetProps` 인터페이스

```typescript
interface ShowBottomSheetProps {
  component: React.ReactNode;
  headerComponent?: React.ReactNode;
  options?: BottomSheetOptions;
}

interface BottomSheetOptions {
  isBackgroundTouchClose?: boolean;
  marginHorizontal?: number;
  marginBottom?: number;
  height?: number;
  padding?: number;
}
```

#### 속성 설명

| 속성 | 타입 | 설명 |
| ---- | ---- | ---- |
| `component` | `ReactNode` | Bottom Sheet 내부에 표시할 컴포넌트 |
| `headerComponent` | `ReactNode` *(선택 사항)* | 상단에 표시할 헤더 컴포넌트 |
| `options.isBackgroundTouchClose` | `boolean` *(선택 사항, 기본값: true)* | 배경을 터치하면 닫을지 여부 |
| `options.marginHorizontal` | `number` *(선택 사항)* | 시트의 좌우 여백 |
| `options.marginBottom` | `number` *(선택 사항)* | 시트의 하단 여백 |
| `options.height` | `number` *(선택 사항)* | 시트의 높이 |
| `options.padding` | `number` *(선택 사항)* | 시트 내부 패딩 |

---

### 스타일 커스터마이징 예시

```jsx
showBottomSheet({
  component: <View><Text>내용</Text></View>,
  options: { height: 400, padding: 30, marginHorizontal: 10 },
});
```
