# 개발 안내

zs-ui 2.0.0은 pnpm 워크스페이스로 관리합니다. Node.js 24와 `package.json`의 pnpm 버전을 사용합니다.

```bash
corepack enable
pnpm install
```

## 저장소 구조

| 경로 | 내용 |
|---|---|
| `src/ui` | UI 컴포넌트 |
| `src/context` · `src/overlay` · `src/model` | Provider, 오버레이, 훅 |
| `src/navigation` · `src/layout` | 내비게이션과 적응형 레이아웃 |
| `src/theme` | 색·글꼴·모양·모션 토큰 |
| `src/__tests__` | Jest 테스트와 네이티브 모듈 mock |
| `ios` · `android` | Expo Modules 네이티브 코드 |
| `docs` | Docusaurus 문서 사이트 |
| `example` | [Expo 예제 앱·E2E](./example/README.md) |

## 검증

저장소 루트에서 실행합니다.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter docs run check
```

`typecheck`는 소스와 테스트를 검사합니다. 문서 `check`는 타입 검사, 공개 API 문서 커버리지, 링크 검사를 포함한 정적 빌드를 실행합니다. 네이티브 코드를 수정하면 예제 앱도 iOS·Android에서 빌드해 확인합니다.

## 문서 사이트

```bash
pnpm --filter docs run start
pnpm --filter docs run build
```

빌드 결과는 `docs/build`에 생성됩니다. `main`에 push하면 GitHub Pages로 배포됩니다.

### 작성 기준

- 현재 공개 API와 기본값을 `src/`에서 확인합니다. 플랫폼별 구현도 함께 확인합니다.
- API 문서는 용도, 기본 사용법, Props·반환값 표, 필요한 사용 조건 순서로 씁니다.
- Props 표는 `Prop | Type | Default | 설명`으로 통일합니다. 필수값은 `Required`, 기본값이 없으면 `undefined`로 씁니다.
- 한 주제는 한 곳에서 설명하고 다른 문서에서는 링크합니다. 설치는 `Provider/start`, 테마 설정은 `Provider/ThemeProvider`, 예제 실행은 `example/README.md`가 기준입니다.
- 합니다체, iOS·Android 순서, 색 역할·글꼴 variant 이름을 사용합니다.
- 이력·이전 버전 비교·내부 구현 설명·측정 기록·반복 예제는 넣지 않습니다.
- 문서 순서는 `docs/sidebars.ts`에서 관리합니다. 내부 문서 링크는 확장자를 생략합니다.
- 주석은 코드만으로 알기 어려운 제약이나 이유만 짧게 남깁니다.

## API 추가

1. `src/`에 구현하고 `src/index.ts`에서 공개 API와 타입을 내보냅니다.
2. 입력·상태 전환·접근성·플랫폼 차이 등 동작에 필요한 테스트를 추가합니다.
3. `docs/docs`에 API 문서를 작성하고 `docs/sidebars.ts`에 등록합니다.
4. 예제 화면을 추가하고 [검증](#검증)을 실행합니다.

커밋 메시지는 `<type>: [zs-ui] <설명>` 형식으로 씁니다.
