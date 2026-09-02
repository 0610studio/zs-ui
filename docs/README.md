# ZS-ui 문서 사이트

[Docusaurus](https://docusaurus.io/)로 만든 ZS-ui 문서 사이트입니다. 저장소 루트의 pnpm 워크스페이스에 속해 있습니다.

문서 작성 기준은 [DOCS_GUIDE.md](./DOCS_GUIDE.md)를 참고하세요.

## 설치

이 저장소는 **pnpm만 사용합니다.** 저장소 루트에서 한 번만 설치하면 됩니다.

```bash
pnpm install
```

## 로컬 실행

```bash
pnpm --filter docs run start
```

로컬 개발 서버를 띄우고 브라우저를 엽니다. 대부분의 변경은 서버를 다시 시작하지 않아도 반영됩니다. 실행 전에 저장소 소스로 문서용 예제(`playground:build`)를 먼저 생성합니다.

## 빌드

```bash
pnpm --filter docs run build
```

`build` 디렉터리에 정적 파일을 생성합니다.

## 검사

```bash
pnpm --filter docs run check
```

타입 검사, 문서 커버리지 검증(`validate:coverage`), 빌드를 차례로 실행합니다. 공개 runtime export가 문서에 노출되지 않으면 커버리지 검증이 실패합니다.

## 배포

`main` 브랜치에 push하면 [deploy-docs.yml](../.github/workflows/deploy-docs.yml) 워크플로가 GitHub Pages로 자동 배포합니다. 수동 배포가 필요한 경우에만 아래를 사용합니다.

```bash
GIT_USER=<GitHub 사용자명> pnpm --filter docs run deploy
```
