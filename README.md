<img width="100%" alt="zsui" src="https://0610studio.github.io/zs-ui/img/zs-banner.png">

This library was created using [create-expo-module](https://docs.expo.dev/modules/get-started/), a tool for creating native modules for Expo projects.

# ZS-ui

`@0610studio/zs-ui`는 Expo·React Native용 UI 컴포넌트 라이브러리입니다. 다크 모드, 테마, 타이포그래피, Alert·BottomSheet·Snackbar 같은 오버레이와 폴더블 기기 대응을 제공합니다. 컴포넌트는 JavaScript로 구현되어 있고, Android 폴더블 상태 감지에만 네이티브 모듈(`ZsUiModule`)을 사용합니다.

현재 패키지 버전은 `package.json`의 1.0.3입니다.

## 설치

```bash
npx expo install @0610studio/zs-ui
```

필수 peer 의존성 설치와 앱 루트 구성(`GestureHandlerRootView`, `ThemeProvider`, `OverlayProvider`)은 [시작하기](https://0610studio.github.io/zs-ui/docs/Provider/start/) 문서를 따릅니다.

## 문서

- [문서 사이트](https://0610studio.github.io/zs-ui/docs/intro/): 사용법, 컴포넌트 API, 플랫폼 지원
- [Playground](https://0610studio.github.io/zs-ui/docs/Playground/): 저장소 소스로 빌드한 예제를 브라우저에서 조작
- 문서 사이트 원본과 작성 기준: [docs/README.md](docs/README.md), [docs/DOCS_GUIDE.md](docs/DOCS_GUIDE.md)

## 개발

이 저장소는 **pnpm만 사용합니다.** 라이브러리(루트), 예제 앱(`example/`), 문서 사이트(`docs/`)가 하나의 pnpm 워크스페이스입니다.

```bash
pnpm install
pnpm start:ios       # 예제 앱을 iOS 시뮬레이터에서 실행
pnpm start:android   # 예제 앱을 Android 에뮬레이터에서 실행
pnpm run lint
pnpm run test        # 단위 테스트
pnpm run test:all    # 커버리지를 측정하고 아래 테스트 결과 표를 갱신
pnpm run build       # build/ 산출물 생성
```

예제 앱의 웹 실행과 E2E는 [example/README.md](example/README.md)를 참고합니다.

## 배포

- npm: `main`에 `package.json` 변경이 push되면 [publish-npm.yml](.github/workflows/publish-npm.yml)이 배포합니다.
- 문서: `main`에 push되면 [deploy-docs.yml](.github/workflows/deploy-docs.yml)이 GitHub Pages로 배포합니다.
<!-- TEST_RESULTS -->
## 테스트 결과

| 항목 | 값 |
|------|-----|
| **상태** | ✅ 성공 |
| **실행 시간** | 2026. 10. 11. PM 03:50 |
| **전체 테스트** | 448 |
| **성공** | ✅ 448 |
| **실패** | ✅ 0 |
| **성공률** | 100.0% |

### 📊 코드 커버리지

| 항목 | 커버리지 | 상태 |
|------|---------|------|
| **Statements** | 94.3% | 🟢 |
| **Branches** | 89.7% | 🟡 |
| **Functions** | 86.0% | 🟡 |
| **Lines** | 94.3% | 🟢 |

### ✅ 모든 테스트 통과

<!-- TEST_RESULTS -->
