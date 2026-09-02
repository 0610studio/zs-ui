
<img width="100%" alt="zsui" src="https://0610studio.github.io/zs-ui/img/zs-banner.png">

This library was created using [create-expo-module](https://docs.expo.dev/modules/get-started/), a tool for creating native modules for Expo projects.

# ZS-ui

ZS-ui는 JavaScript만으로 구현된 Expo용 UI 컴포넌트 라이브러리입니다.

다크 모드, 테마, 타이포그래피, Alert, BottomSheet와 같은 주요 UI 요소가 포함되어 있으며, 직관적이고 일관된 사용자 인터페이스를 구현할 수 있습니다.

<br />

## 설치

```bash
npx expo install @0610studio/zs-ui
```

<br />

## 사용법

사용법은 [문서](https://0610studio.github.io/zs-ui/docs/intro)를 확인해주세요.

<br />

### Playground

문서 사이트의 [Playground](https://0610studio.github.io/zs-ui/docs/Playground)에서 저장소 소스로 빌드한 예제를 바로 조작할 수 있습니다.

저장소를 받아 실제 기기에서 확인하려면 아래를 실행합니다. 이 저장소는 **pnpm만 사용합니다.**

```bash
pnpm install
pnpm start:ios       # iOS 시뮬레이터
pnpm start:android   # Android 에뮬레이터
```

<br />

### 플랫폼 지원

Skia를 사용하는 `ZSBorderBeam`, `ZSSkeleton`의 shimmer 효과는 iOS·Android 전용입니다. 웹에서는 효과 없이 콘텐츠만 렌더링됩니다. **`ZSCalendar`는 웹을 지원하지 않습니다** — 웹에서는 아무것도 렌더링하지 않고 개발 모드에서 한 번 경고합니다(웹 빌드가 깨지지는 않습니다). 그 외 컴포넌트는 웹을 포함한 세 플랫폼에서 동작합니다.

<br />

## 0.21.0 업그레이드 안내

`ZSCalendar`가 추가되면서 **`react-native-gesture-handler`가 필수 peer 의존성이 되었습니다.** 0.20.x에서 올라온다면 설치가 필요합니다.

```bash
npx expo install react-native-gesture-handler
```

앱 루트를 `GestureHandlerRootView`로 감싸주세요. 이미 react-navigation이나 다른 제스처 기반 라이브러리를 쓰고 있다면 대부분 충족되어 있습니다.

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>{/* ... */}</ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

`ZSCalendar`를 쓰지 않아도 설치는 필요합니다. 배포물이 CommonJS 번들이라 tree-shaking이 없어, 라이브러리를 import하는 순간 모듈이 평가되기 때문입니다.

<br />
<!-- TEST_RESULTS -->
## 테스트 결과

| 항목 | 값 |
|------|-----|
| **상태** | ✅ 성공 |
| **실행 시간** | 2026. 08. 31. 오후 04:11 |
| **전체 테스트** | 281 |
| **성공** | ✅ 281 |
| **실패** | ✅ 0 |
| **성공률** | 100.0% |

### 📊 코드 커버리지

| 항목 | 커버리지 | 상태 |
|------|---------|------|
| **Statements** | 93.0% | 🟢 |
| **Branches** | 88.8% | 🟡 |
| **Functions** | 80.6% | 🟡 |
| **Lines** | 93.0% | 🟢 |

### ✅ 모든 테스트 통과

<!-- TEST_RESULTS -->
