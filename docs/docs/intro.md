---
sidebar_position: 1
---

# 개요

`@0610studio/zs-ui`는 React Native Expo 환경에서 동작하는 UI 컴포넌트 라이브러리입니다. 다크 모드, 타이포그래피, 오버레이(Alert, BottomSheet, Snackbar), 폴더블 디바이스 지원까지 포함합니다.

## 개발자 경험

### 1. Declarative Overlay

화면마다 모달의 `isOpen` 상태를 따로 만들고 관리할 필요가 없습니다. 이것이 기본 원칙입니다. `useOverlay` 훅에서 `showAlert`, `showBottomSheet`, `showSnackBar`를 호출하면 끝입니다. 숨기고 싶을 때는 `hideOverlay`로 한 번에 처리합니다. 내부 컨텍스트는 `OverlayProvider` 하나가 모두 담당합니다.

```tsx
const { showAlert, showSnackBar, hideOverlay } = useOverlay();

showAlert({ title: '확인', informative: '저장되었습니다.' });
showSnackBar({ message: '성공', type: 'success' });
hideOverlay('all');
```

### 2. Consistent Container

`ZSContainer`가 `SafeAreaView`, `ScrollView`, `StatusBar`를 하나로 묶어 제공합니다. 모든 스크린에 동일한 구조를 적용하면 SafeArea, 키보드, 폴더블 처리가 자동으로 따라옵니다.

```tsx
<ZSContainer edges={['bottom']} topComponent={<Header />}>
  {/* 스크린 내용 */}
</ZSContainer>
```

### 3. Input Scroll Tracking

키보드가 올라오면 `ZSContainer`가 현재 포커스된 입력 필드를 자동으로 스크롤해서 보여줍니다. 별도 플래그를 관리하거나 `KeyboardAvoidingView`를 수동으로 배치할 필요가 없습니다.

---

## 설치

```bash
npx expo install @0610studio/zs-ui
```

## 문서 구조

- **[시작하기](/docs/Provider/start)**: Provider 설정과 첫 컴포넌트 사용
- **[Theme](/docs/Theme/start)**: 테마 시스템과 `useStyleSheetCreate`
- **[UI 컴포넌트](/docs/UiComponent/ZSText)**: ZSText, ZSView, ZSContainer 등
- **[폴더블 기기 지원](/docs/FoldableDevice)**: 분할 화면/힌지 대응 가이드
- **[Overlay 컴포넌트](/docs/OverlayComponent/start)**: Alert, BottomSheet, Snackbar 등

## 추가 리소스

- **Playground**: [Expo Snack](https://snack.expo.dev/@studio0610/zs-ui_13_playground)에서 라이브 예제 확인
- **GitHub**: [소스 코드](https://github.com/0610studio/zs-ui)
