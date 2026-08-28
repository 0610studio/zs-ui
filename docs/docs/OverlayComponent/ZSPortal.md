---
sidebar_position: 8
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSPortal

컴포넌트의 현재 레이아웃 위치와 `overflow`, `zIndex` 제약을 벗어나 `OverlayProvider`의 최상위 레이어에 콘텐츠를 렌더링합니다. 자체 팝업이나 화면 최상단 플로팅 UI처럼 표준 오버레이 API로 표현하기 어려운 UI에 사용합니다.

Alert, BottomSheet, Snackbar, Loader에는 `ZSPortal`을 직접 구성하는 대신 [useOverlay](./start)를 우선 사용하세요.

<LocalPlayground example="ZSPortal" height={780} />

## 사전 조건

`ZSPortal`은 `OverlayProvider`가 제공하는 포털 호스트에 콘텐츠를 등록합니다. 앱 루트에 Provider가 있어야 합니다.

```tsx
<ThemeProvider>
  <OverlayProvider>
    <App />
  </OverlayProvider>
</ThemeProvider>
```

## 기본 사용법

```tsx
import { ZSPortal, ZSView, ZSText } from '@0610studio/zs-ui';
import { StyleSheet } from 'react-native';

<ZSPortal isFocused={isOpen}>
  <ZSView style={styles.floatingLayer} elevationLevel={8}>
    <ZSText typo="body.2">최상위 레이어 콘텐츠</ZSText>
  </ZSView>
</ZSPortal>

const styles = StyleSheet.create({
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | 최상위 레이어에 렌더링할 콘텐츠 |
| `isFocused` | `boolean` | `true` | `true`면 등록하고 `false`면 포털에서 제거 |

컴포넌트가 언마운트될 때 등록된 콘텐츠도 자동으로 제거됩니다. `children`이 바뀌면 같은 포털 항목의 내용이 갱신됩니다.

