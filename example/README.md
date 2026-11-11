# 예제 앱

zs-ui 2.0.0을 사용하는 Expo SDK 58 예제입니다. Metro가 저장소의 `src`를 직접 번들하므로 라이브러리 빌드 없이 수정 사항을 확인할 수 있습니다.

## 실행

Node.js 24, pnpm을 사용합니다. iOS는 Xcode, Android는 Android Studio와 SDK가 필요합니다. Expo Go 대신 개발 빌드로 실행합니다.

저장소 루트에서 실행합니다.

```bash
pnpm install
pnpm start:ios
pnpm start:ios:device
pnpm start:android
```

앱 실행 전 `sync:local`이 워크스페이스 링크와 라이브러리 타입을 검사합니다.

## 화면

홈에서 컴포넌트 예제, 건강수첩, 폴더블 달력과 레이아웃 Lab을 엽니다. Lab에서는 창 크기·접힘선·입력·키보드·오버레이·화면 분할을 확인합니다.

화면을 추가하려면 `app/<이름>Example.tsx`를 만들고 `app/index.tsx`에 경로를 연결합니다.

## E2E

Maestro와 실행 중인 개발 빌드가 필요합니다. `example` 폴더에서 실행합니다. `MAESTRO` 환경변수로 실행 파일 경로를 지정할 수 있습니다.

| 명령 | 확인 항목 |
|---|---|
| `scripts/e2e-ios-regression.sh <udid>` | iOS 전체 회귀 |
| `scripts/e2e-android-regression.sh <open \| folded> [device]` | Android 자세별 전체 회귀 |
| `scripts/e2e-fold.sh <flow.yaml> [stage ...]` | 접기·펼치기 전후 상태 유지 |
| `scripts/e2e-overlay-fold.sh <open \| folded> [device]` | 자세별 오버레이 위치 |

Android 기본 기기는 `emulator-5554`입니다. 폴더블 플로우는 Galaxy Z Fold7 AVD와 접힘선 구성을 기준으로 하며, 일반 기기에는 해당 좌표 단언을 사용하지 않습니다.

```bash
SCENARIO=pane DEVICE=emulator-5554 scripts/e2e-fold.sh .maestro/lab/foldable-state.yaml open folded reopened
```

Release에서 달력·FPS 상태 표시를 사용하려면 빌드 시 `EXPO_PUBLIC_DEV_STRIP=1`을 지정합니다. 실행 결과는 `.e2e-artifacts` 또는 `.maestro/artifacts`에 생성됩니다.
