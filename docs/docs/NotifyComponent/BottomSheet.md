---
sidebar_position: 1
---

import ExpoSnack from '@site/src/components/ExpoSnack';

# BottomSheet

호출하는 함수에서 컴포넌트를 정의하고 콜백을 처리할 수 있도록 제작되었습니다.

<ExpoSnack id="@studio0610/zs-ui-bottomsheet" />


### 기본 사용법

```tsx
import { useNotify, ZSContainer, useTheme } from "@0610studio/zs-ui";

const { showBottomSheet } = useNotify();

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
import { ColorPalette, ThemeBackground, useNotify, ZSPressable, ZSText, ZSView, useTheme } from '@0610studio/zs-ui';

function MyBottomSheet({ onConfirm }: MyBottomSheetProps) {
  const { hideNotify } = useNotify();

  const handleConfirmPress = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleClosePress = useCallback(() => {
    hideNotify('bottomSheet');
  }, [hideNotify]);

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