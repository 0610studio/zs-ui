# ZS-UI Example

현재 저장소를 로컬 파일 의존성으로 참조하는 Expo 예제 앱입니다. npm에 배포된 버전과 분리되어 있어 새 버전을 배포하기 전에 Android, iOS, 웹 동작을 확인할 수 있습니다. 웹 실행 직전에 루트 패키지를 빌드하고 예제 앱의 로컬 의존성과 동기화하므로 실제 배포 산출물과 같은 `build` 코드를 검증합니다.

## 웹에서 확인

```bash
yarn install
yarn web
```

홈 화면의 `Web Example`에서 반응형 레이아웃, 테마 전환, 탭·세그먼트·칩·스위치·메시지·오버레이를 한 화면에서 확인합니다.

## 웹 프로덕션 빌드

```bash
yarn build:web
```

## 웹 E2E 검증

브라우저 실행 파일을 최초 한 번 준비합니다.

```bash
yarn agent-browser install
```

그다음 프로덕션 웹 빌드, 모바일·데스크톱 상호작용, 가로 넘침, 1열·2열 전환과 브라우저 오류를 검증합니다. WCAG A/AA 감사 결과와 화면별 스크린샷도 함께 저장합니다.

```bash
yarn test:e2e:web
```

`E2E_OUTPUT_DIR`을 지정하면 빌드와 스크린샷을 원하는 위치에 저장할 수 있습니다.

```bash
E2E_OUTPUT_DIR=/tmp/zs-ui-web-e2e yarn test:e2e:web
```
