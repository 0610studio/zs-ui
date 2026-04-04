---
sidebar_position: 0
---

# 시작하기

## 1. 설치

```bash
npx expo install @0610studio/zs-ui
```

## 2. Provider 설정

앱 최상위에 `ThemeProvider`와 `OverlayProvider`를 추가합니다. `ThemeProvider`가 바깥쪽이어야 합니다.

```tsx
import { ThemeProvider, OverlayProvider } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ThemeProvider>
      <OverlayProvider>
        {/* 앱 내용 */}
      </OverlayProvider>
    </ThemeProvider>
  );
}
```

## 3. 커스텀 테마 적용 (선택)

브랜드 색상과 폰트를 지정하려면 `themeFactory`와 `themeFonts`를 전달합니다.

```tsx
import { ThemeProvider, OverlayProvider, themeFactory } from '@0610studio/zs-ui';

const themeFonts = {
  400: 'Pretendard-Regular',
  700: 'Pretendard-Bold',
};

const customPalette = themeFactory({
  light: { primary: { main: '#007AFF' } },
});

export default function App() {
  return (
    <ThemeProvider themeFonts={themeFonts} customPalette={customPalette}>
      <OverlayProvider>
        {/* 앱 내용 */}
      </OverlayProvider>
    </ThemeProvider>
  );
}
```

## 4. 컴포넌트 사용

`useOverlay`로 오버레이를 제어하고, `ZSContainer`로 스크린을 구성합니다.

```tsx
import { ZSContainer, ZSText, ZSBlockButton, useOverlay } from '@0610studio/zs-ui';

export default function HomeScreen() {
  const { showAlert } = useOverlay();

  return (
    <ZSContainer edges={['bottom']}>
      <ZSText typo="heading.2" color="base">
        ZS-ui
      </ZSText>
      <ZSBlockButton
        title="저장"
        intent="primary"
        variant="solid"
        onPress={() =>
          showAlert({
            title: '확인',
            informative: '저장되었습니다.',
          })
        }
      />
    </ZSContainer>
  );
}
```

## 다음 단계

- **[Theme](/docs/Theme/start)**: 다크 모드, 색상 팔레트, `useStyleSheetCreate`
- **[Overlay 컴포넌트](/docs/OverlayComponent/start)**: Alert, BottomSheet, Snackbar 상세 옵션
- **[UI 컴포넌트](/docs/UiComponent/ZSText)**: ZSText, ZSView, ZSContainer, ZSTextField 등
- **[ThemeProvider](/docs/Provider/ThemeProvider)**: `themeFactory`와 `customPalette` 상세 설정
- **[OverlayProvider](/docs/Provider/OverlayProvider)**: Snackbar 최대 개수, 커스텀 Loader 등

> **참고**: `useAlert`, `useSnackbar` 같은 개별 context hook은 내부 구현용입니다. 오버레이 제어는 `useOverlay` 하나만 사용하세요.
