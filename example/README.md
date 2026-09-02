# ZS-UI Example

저장소 루트의 zs-ui를 pnpm 워크스페이스 링크(`workspace:*`)로 참조하는 Expo 예제 앱입니다. npm에 배포된 버전과 분리되어 있어 새 버전을 배포하기 전에 Android, iOS, 웹 동작을 확인할 수 있습니다. 각 실행 명령은 먼저 루트 패키지를 빌드하므로 실제 배포 산출물과 같은 `build` 코드를 검증합니다.

이 저장소는 **pnpm만 사용합니다.** yarn이나 npm으로 설치하면 zs-ui가 링크가 아니라 복사본으로 들어와 react가 두 벌 로드되고 앱이 `Invalid hook call`로 죽습니다.

## 네이티브에서 확인

저장소 루트에서 의존성을 한 번 설치한 뒤 예제 앱을 실행합니다.

```bash
pnpm install
pnpm run ios       # 시뮬레이터
pnpm run ios:device  # 실기기
pnpm run android
```

## 웹에서 확인

```bash
pnpm install
pnpm run web
```

홈 화면의 `Web Example`에서 반응형 레이아웃, 테마 전환, 탭·세그먼트·칩·스위치·메시지·오버레이를 한 화면에서 확인합니다.

## 웹 프로덕션 빌드

```bash
pnpm run build:web
```

## 웹 E2E 검증

브라우저 실행 파일을 최초 한 번 준비합니다.

```bash
pnpm exec agent-browser install
```

그다음 프로덕션 웹 빌드, 모바일·데스크톱 상호작용, 가로 넘침, 1열·2열 전환과 브라우저 오류를 검증합니다. WCAG A/AA 감사 결과와 화면별 스크린샷도 함께 저장합니다.

```bash
pnpm run test:e2e:web
```

`E2E_OUTPUT_DIR`을 지정하면 빌드와 스크린샷을 원하는 위치에 저장할 수 있습니다.

```bash
E2E_OUTPUT_DIR=/tmp/zs-ui-web-e2e pnpm run test:e2e:web
```
