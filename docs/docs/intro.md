import LocalPlayground from '@site/src/components/LocalPlayground';

# 개요

`@0610studio/zs-ui`는 React Native Expo 환경에서 동작하는 UI 컴포넌트 라이브러리입니다. 다크 모드, 타이포그래피, 오버레이(Alert, BottomSheet, Snackbar), 폴더블 디바이스 지원까지 포함합니다.

## 한눈에 보기

현재 저장소 소스로 빌드한 앱 예제 카탈로그입니다. **예제 불러오기**를 선택하면 테마, 레이아웃, 입력, 선택, 오버레이와 폴더블 예제를 탐색하고 직접 조작할 수 있습니다.

<LocalPlayground example="Catalog" height={900} title="ZS-ui 앱 예제 Playground" />

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

## 플랫폼 지원

iOS·Android·웹에서 동작합니다. 다음 Skia 기반 기능만 iOS·Android 전용입니다.

- `ZSBorderBeam` 광선, `ZSSkeleton`·`ZSSkeletonBox` shimmer: 웹에서는 효과 없이 콘텐츠만 렌더링합니다.
- `ZSCalendar`: 웹에서는 아무것도 렌더링하지 않습니다(웹 빌드는 유지됩니다).

웹 미지원 기능이 웹에서 렌더링되면 개발 모드에서 컴포넌트당 한 번 경고합니다. 웹 플레이그라운드로 최종 판단할 수 없는 범위는 [Playground](./Playground) 문서에 정리되어 있습니다.

## 어떤 문서부터 볼까요?

| 목적 | 다음 문서 |
|---|---|
| 설치, 앱 루트 설정과 첫 화면 구성 | [시작하기](./Provider/start) |
| 색상·타이포그래피·공통 토큰 사용 | [설정과 테마](./Theme/start) |
| 입력, 선택, 피드백 컴포넌트 탐색 | [UI 컴포넌트](./UiComponent/ZSText) |
| Alert, BottomSheet, Snackbar 연결 | [Overlay](./OverlayComponent/start) |
| 폴더블 기기의 분할 화면 대응 | [폴더블 기기 지원](./FoldableDevice) |
| 저장소 예제를 직접 조작 | [Playground](./Playground) |
