# ZSPortal

컴포넌트의 레이아웃 위치와 `overflow`·`zIndex` 제약을 벗어나 `OverlayProvider`의 최상위 JS 레이어에 콘텐츠를 그립니다. 화면 위에 떠야 하는 자체 UI처럼 시스템 오버레이로 표현할 수 없는 경우에 씁니다. `OverlayProvider`가 없으면 아무것도 그리지 않습니다.

Alert·시트·스낵바·진행 표시는 `ZSPortal`로 직접 만들지 말고 [useOverlay](./start)를 쓰세요. 이 오버레이들은 모달 포커스·뒤로가기를 이미 처리하지만, 포털은 그렇지 않습니다.

## 기본 사용법

```tsx
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OPACITY, ZSButton, ZSPortal, ZSText, ZSBox, useTheme, withOpacity } from '@0610studio/zs-ui';

function Coachmark() {
  const { colors } = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <ZSPortal isFocused={open}>
      <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: withOpacity(colors.backdrop, OPACITY.backdrop) }]}>
        <ZSBox backgroundColor="surface1" shadow="xl" style={styles.card}>
          <ZSText variant="subtitle1">새 기능</ZSText>
          <ZSText variant="subtitle2" color="textSecondary">기록을 길게 눌러 메뉴를 열 수 있습니다.</ZSText>
          <ZSButton title="확인" onPress={() => setOpen(false)} />
        </ZSBox>
      </View>
    </ZSPortal>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: 20, padding: 24, gap: 12 },
});
```

## Props — `ZSPortalProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `ReactNode` | Required | 최상위 레이어에 그릴 콘텐츠 |
| `isFocused` | `boolean` | `true` | `true`면 등록하고 `false`면 포털에서 뺍니다 |

`ZSPortalProps` 타입을 내보냅니다.

## 동작

- 포털 레이어는 화면 전체를 덮지만 `pointerEvents: 'box-none'`이라, 콘텐츠가 없는 곳의 터치는 아래 화면으로 지나갑니다.
- 조금 위에서 내려오며 페이드인하고, 아래로 비켜 가며 짧게 페이드아웃합니다([모션 토큰](../Theme/tokens#모션--spring--timing)).
- 컴포넌트가 언마운트되면 등록한 콘텐츠도 빠집니다. `children`이 바뀌면 같은 항목의 내용이 갱신됩니다.
- 포털 레이어는 [ZSKeyboardStickyView](../UiComponent/ZSKeyboardStickyView)와 같은 높이에 있고, 스낵바·진행 표시보다 아래입니다.

## 접근성

포털은 모달이 아닙니다. 화면을 막는 UI라면 뒤 화면이 스크린 리더에 읽히지 않도록 직접 처리하거나, 가능하면 시스템 오버레이·formSheet 라우트를 쓰세요.

## 관련 문서

- [오버레이 개요](./start)
