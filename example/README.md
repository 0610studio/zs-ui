# ZS-UI Example

저장소 루트의 zs-ui를 pnpm 워크스페이스 링크(`workspace:*`)로 참조하는 Expo 예제 앱입니다. npm에 배포된 버전과 분리되어 있어 새 버전을 배포하기 전에 Android, iOS, 웹 동작을 확인할 수 있습니다. Metro가 루트 `src/`를 직접 번들하므로(`metro.config.js`) 소스 수정이 Fast Refresh로 바로 반영되고, 각 실행 명령은 시작 전에 워크스페이스 링크와 루트 타입 검사만 확인합니다(`scripts/sync-local-package.mjs`).

이 저장소는 **pnpm만 사용합니다.** yarn이나 npm으로 설치하면 zs-ui가 링크가 아니라 복사본으로 들어와 react가 두 벌 로드되고 앱이 `Invalid hook call`로 죽습니다.

아래 명령은 저장소 루트에서 `pnpm install`을 한 번 실행한 뒤 `example/` 디렉터리에서 실행합니다.

## 네이티브에서 확인

```bash
pnpm run ios         # 시뮬레이터
pnpm run ios:device  # 실기기
pnpm run android
```

저장소 루트의 `pnpm start:ios`, `pnpm start:ios:device`, `pnpm start:android`는 설치와 실행을 한 번에 합니다.

## 웹에서 확인

```bash
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

빌드와 스크린샷은 기본적으로 시스템 임시 디렉터리의 `zs-ui-web-e2e/`에 저장합니다. `E2E_OUTPUT_DIR`로 위치를 바꿀 수 있습니다.

```bash
E2E_OUTPUT_DIR=/tmp/zs-ui-web-e2e pnpm run test:e2e:web
```

## 네이티브 E2E(Maestro)

`ZSCalendar` 시나리오는 `.maestro/zscalendar*.yaml`에 있습니다(앱 ID `kr.co.studio0610.zsui.example`). 시뮬레이터·에뮬레이터에 예제 앱을 실행해 둔 뒤 Maestro CLI로 실행합니다.

```bash
maestro test .maestro/zscalendar.yaml
```
