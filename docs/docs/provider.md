---
sidebar_position: 2
---

# Provider 구성

프로젝트에서 `ZS-ui`를 사용할 때 필요한 Provider를 최상위 경로에 추가합니다.

### ThemeProvider

ThemeProvider는 프로젝트 전반에서 사용할 폰트와 테마 관련 설정을 관리합니다.

- `themeFonts` : 폰트 굵기별로 사용할 폰트 이름을 정의합니다.

- `requireFonts` : require 구문을 사용하여 각 폰트 파일을 로드합니다.


### OverlayProvider

OverlayProvider는 프로젝트 전역에서 사용할 알림 시스템을 관리합니다. customSnackbar와 loaderComponent를 통해 커스텀 스낵바 및 로더 컴포넌트를 설정할 수 있습니다.

- `customSnackbar` : 알림을 표시할 때 사용할 사용자 정의 스낵바 컴포넌트입니다. 프로젝트에 맞게 커스터마이징한 스낵바를 설정할 수 있습니다.

- `loaderComponent` : 로딩 상태에서 사용할 사용자 정의 로더 컴포넌트입니다.


### 예제

```tsx title="app/_layout.tsx"
const themeFonts = {
  100: 'Pretendard-Thin',
  200: 'Pretendard-ExtraLight',
  300: 'Pretendard-Light',
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
  800: 'Pretendard-ExtraBold',
  900: 'Pretendard-Black',
};

const requireFonts = {
  'Pretendard-Thin': require('../assets/fonts/Pretendard-Thin.otf'),
  'Pretendard-ExtraLight': require('../assets/fonts/Pretendard-ExtraLight.otf'),
  'Pretendard-Light': require('../assets/fonts/Pretendard-Light.otf'),
  'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
  'Pretendard-Black': require('../assets/fonts/Pretendard-Black.otf'),
};

const [loaded] = useFonts(requireFonts);

<ThemeProvider themeFonts={themeFonts}>
  <OverlayProvider
    customSnackbar={SnackBar} // Optional - 사용자 정의 스낵바 컴포넌트
    loaderComponent={LoadingLottieComponent}  // Optional - 사용자 정의 로더 컴포넌트
  >

  </OverlayProvider>
</ThemeProvider>
```
