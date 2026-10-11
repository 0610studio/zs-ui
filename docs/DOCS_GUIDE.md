# ZS-ui 문서 작성 기준

공개 API 문서(`docs/docs/**`)는 사용자가 예제를 확인한 뒤 실제 앱 적용 여부를 판단할 수 있도록 아래 골격과 표기를 사용합니다. 문서 사이트 실행·빌드·검사 명령은 [README.md](./README.md)를 참고합니다.

## 페이지 순서

1. `# 이름`과 용도를 설명하는 한두 문장
2. 네이티브·웹 차이가 있을 때 플랫폼 안내(admonition)
3. `LocalPlayground` 미리보기
4. `## 기본 사용법`
5. `## Props`(컴포넌트) 또는 `## API 참조`(훅·함수·`show*` API)
6. `## 특징`
7. `## 예제`(예제마다 `###`)
8. `## 관련 문서`

국제화, 레이아웃 모드처럼 컴포넌트 고유 개념은 위 순서 사이에 별도 `##` 섹션으로 둡니다.

## 표기

- props 표 머리글은 `| Prop | Type | Default | Description |`를 쓰고, 필수 prop은 `필수`, 기본값이 없으면 `undefined`로 적습니다.
- 메서드 표 머리글은 `| 메서드 | 설명 |`를 씁니다.
- 인터페이스·반환값 타입은 TypeScript 코드 블록으로 적습니다.
- frontmatter는 쓰지 않습니다. 사이드바 순서와 분류는 `sidebars.ts`가 정하므로 새 문서는 `sidebars.ts`에 추가합니다.
- 현재 동작과 사용법만 적고, 버전별 변경 경과는 Git과 릴리스 기록에 맡깁니다. 블로그(`docs/blog/`)는 게시 시점의 글로 유지합니다.

## 작성 원칙

- 공개 API 이름과 기본값은 `src/` 타입과 구현을 확인해 작성합니다.
- 내부 렌더러는 직접 사용 여부를 명시합니다.
- 웹 미지원 기능은 플레이그라운드 결과만으로 판단하지 않도록 실제 기기 검증 범위를 적습니다.
- 예제는 한 번에 하나의 개념을 보여주고 복사 가능한 형태로 유지합니다. import는 `@0610studio/zs-ui`의 공개 export만 씁니다.
- 새 runtime export를 추가하면 `pnpm --filter docs run validate:coverage`가 통과하도록 관련 문서에 API 이름을 포함합니다.
- 같은 내용은 아래 정본 한 곳에 두고 다른 문서는 링크합니다.

| 내용 | 정본 |
|---|---|
| 설치, 필수 peer 의존성, 앱 루트 구성 | `docs/docs/Provider/start.md` |
| 플랫폼 지원 | `docs/docs/intro.md` |
| `ThemeProvider` props와 폰트 설정 | `docs/docs/Provider/ThemeProvider.md` |
| `useTheme` 반환값, 테마 모드 전환·저장 | `docs/docs/Theme/start.md` |
| `OverlayProvider` props, 커스텀 스낵바·로더, 뒤로가기 우선순위 | `docs/docs/Provider/OverlayProvider.md` |
| 예제 앱 실행과 웹·Maestro E2E | `example/README.md` |
| 문서 사이트 실행·빌드·배포 | `docs/README.md` |

## 페이지 골격

```md
# 컴포넌트 이름

컴포넌트가 해결하는 문제를 한 문장으로 설명합니다.

<LocalPlayground example="ExampleName" />

## 기본 사용법

## Props

## 특징

## 예제

### 예제 이름

## 관련 문서
```
