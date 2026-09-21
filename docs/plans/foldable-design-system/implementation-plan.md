# 폴더블 공통 디자인 시스템 개발 실행 계획

작성·수정일: 2026-09-12 KST · 상태: 실행 전 제안 · 기준: [기획·설계](./README.md), [조사 근거](./research.md)

## 1. 추진 방식과 일정 가정

공통 geometry·Android·기존 iOS 크기 대응을 먼저 구현하고, iOS 27.1 SDK 공개 후 Duo native adapter를 검증한다. 두 플랫폼의 최종 소비 API는 동일하게 유지한다. SDK 공개 대기는 iOS integration gate에만 적용하고 독립적인 공통 작업은 진행한다.

계획 공수는 RN/공통 담당 1명, native 담당 1명, 디자이너 0.5명, QA 0.5명을 가정한 추정치다. 1인 개발은 단계별 합산 공수와 기기 검증 시간을 기준으로 재산정한다. 아래의 병렬 작업은 향후 개발팀의 분업 제안이며 이 문서 작성 작업에 별도 에이전트를 실행했다는 뜻은 아니다.

| 단계 | 예상 경과 | 산출물 | 종료 기준 |
| --- | --- | --- | --- |
| G0 계약/호환 실험 | 3–5 작업일 | 입력 fixture, API ADR, 앱 shell 최소 예제 | Android 이벤트·RN 좌표·상태 유지의 위험 확인 |
| G1 공통 엔진/토큰 | 5–7 작업일 | geometry/policy/store/provider, 디자인 variants | geometry 불변식·경계·기본 fallback 통과 |
| G2 Android/기본 iOS/Web | 5–7 작업일 | Android stream, fallback, 예제 | 같은 크기의 접힘, resize, 수명주기 통과 |
| G3 Duo native integration | SDK 사용 가능 후 5–8 작업일 | iOS adapter, bar 연결 검증 | Xcode 27.1 빌드와 실제 simulator 결과 |
| G4 컴포넌트/과업 이관 | 7–10 작업일 | adaptive layout/grid, overlay, 폼·달력 | 핵심 시나리오·접근성·회귀 통과 |
| G5 prerelease/기기 QA | 5–7 작업일 | migration guide, 검증 표, release candidate | 아래 GA gate 통과 |

G2·G3 및 디자인 작업은 G1의 안정된 계약 이후 분업 가능하다. 예상 총 경과는 **6–8주 + SDK/기기 대기 변수**다. 10월 23일 판매 일정에 맞춰 지원 완료를 약속하는 일정은 아니다. 판매 전에 simulator 검증까지 마친 prerelease를 목표로 하고 실기기 검증 후 Duo `validated`를 표시한다.

## 2. 작업 목록과 선행 관계

모든 항목은 미착수다. ID는 이 문서 내부 작업 ID이며 외부 이슈가 생성된 상태를 뜻하지 않는다.

| ID | 우선순위 / 담당 | 작업 | 선행 | 완료 증거 |
| --- | --- | --- | --- | --- |
| F00 | P0 / RN·native | 환경/region/좌표/수명 계약 ADR | 없음 | 타입·시퀀스·최소 재현 fixture 리뷰 |
| F01 | P0 / native | Android WindowManager 1.5.1 + Expo 57 빌드 실험 | F00 | debug/release build, 연속 이벤트 기록 |
| F02 | P0 / native | SDK/iOS 27.1 RN view 영역 관측 실험 | F00, SDK | 실제 header 가용성, 실행 캡처, adapter 후보 |
| F03 | P0 / 디자이너·RN | 토큰·단일/2패널/tabletop·overlay 시안 | F00 | 대표 상태/전환·큰 글자·RTL variants |
| F04 | P0 / RN | 순수 geometry 엔진과 region 정규화 | F00 | 좌표·0폭·교차·중복·복합 region 테스트 |
| F05 | P0 / RN | surface별 store/provider, stale event 방어 | F04 | 초기 조회 경합·재부착·복수 root 테스트 |
| F06 | P0 / native | Android lifecycle 관측·인셋·density 변환 | F01, F05 | 같은 크기의 posture 변경·회전·복귀 |
| F07 | P0 / RN | 기본 iOS/Web adaptive fallback | F05 | 미지원/오류 상태·SSR·resize |
| F08 | P0 / native | iOS reserved region/traits/scene adapter | F02, F05 | 실측 frame·inactive·카메라·Split View |
| F09 | P0 / RN | `ZSAdaptiveLayout` + `ZSContainer` 책임 분리 | F03–F05 | list-detail 축소/복귀·최소 폭·단일 과업 |
| F10 | P0 / RN·native | source pane/scene 기반 overlay placement | F05, F09 | 열린 중 접힘·IME·modal window·anchor 제거 |
| F11 | P0 / RN·native | iOS system bar / Android navigation 계약 | F02, F03 | native-stack/탭/overflow, 물리 edge/RTL |
| F12 | P1 / RN | grid·Calendar·TextField·선택 UI 적용 | F09, F10 | 측정/터치 좌표·폰트 확대·입력 유지 |
| F13 | P0 / RN·QA | 예제의 라우트·초안·scroll/focus 복원 | F09, F10 | 선택/뒤로가기·Activity 재생성 결과 |
| F14 | P0 / native | config plugin 책임 축소, 소비 앱 설정 안내 | F06, F13 | prebuild diff·task/deep link 회귀 |
| F15 | P0 / QA | 실제 기기/OS/입력/성능 매트릭스 실행 | F06–F14 | 기기별 실행 기록·결함 처리 |
| F16 | P0 / RN | 기존 API 제거·migration 문서·패키징 | F09–F15 | 구형 API 검색 0건 또는 명시적 문서 잔존 |
| F17 | P0 / 릴리스 담당 | prerelease → RC → 다음 major | F15, F16 | 설치·빌드·회귀·지원 범위 명시 |

P0는 첫 공통 지원의 완료 조건이다. F12 중 폼 접근성·Calendar 기본 표시 회귀는 P0 품질 기준에 포함하고, 고급 grid 밀도 조절 등 확장은 P1로 다룬다. 플랫폼별 beta가 분리되어도 F08·F11·Duo 수용 테스트가 완료되기 전에는 전체 공통 지원 GA로 표시하지 않는다.

## 3. G0 기술 실험의 구체적인 질문

| 질문 | 실험 | 결정 기준 / 대안 |
| --- | --- | --- |
| Android 크기가 같아도 fold가 전달되는가? | 에뮬레이터에서 창 크기를 유지한 채 flat/half-open 반복 | Dimensions 변화 없이 이벤트; 실패 시 native observer 수명/Extensions 확인 |
| Android bounds와 RN root가 일치하는가? | edge-to-edge, inset root, density 변경에 경계 선 겹쳐 표시 | px→dp 후 같은 물리 위치; 오프셋 변환을 adapter에서 해결 |
| iOS UIView에 division/occlusion이 전달되는가? | Expo native view를 scene root와 nested view에 붙여 비교 | 문서의 영역을 실측값으로 재현; 방식이 다르면 작은 native measurement host |
| iOS bar가 실제 RN navigation에 적용되는가? | 현재 Expo Router/screens로 native-stack·탭·custom header 비교 | 지원 버전/누락 항목 기록; 연결 계층 업데이트 또는 native bar adapter |
| 낮은 iOS deployment에서도 빌드되는가? | 기존 toolchain fallback과 Xcode 27.1 빌드 구성 비교 | runtime availability와 compile gate 둘 다 충족 |
| 패널 변경 시 입력 상태가 보존되는가? | 한국어 IME 조합 중 단일↔2패널, 포커스·selection 기록 | React 트리/host identity 유지 또는 복원 가능한 계약 확정 |
| 여러 root가 독립적인가? | 서로 다른 크기의 두 provider와 overlay를 동시에 생성 | source scene에만 이벤트·overlay 전달 |

iOS의 native 신규 API를 old SDK로 컴파일할 수 있다고 가정하지 않는다. 초기안은 별도 파일/빌드 조건으로 새 API를 격리하고, SDK 사용 시 런타임 `#available` 분기를 추가하는 방식이다. 실제 지원할 Xcode 범위는 F02에서 정한다. Podspec의 iOS 16.4 선언은 패키지 전체/Expo 57의 실제 최소 지원 보증과 구별한다.

## 4. 순수 엔진의 필수 fixture

아래 치수는 모두 합성 시험용 RN 논리 단위이며 iPhone Duo의 실기기 사양을 뜻하지 않는다.

| fixture | 입력 | 기대 결과 |
| --- | --- | --- |
| 좁은 일반 창 | 390×844, regions 없음 | 단일 과업, compact |
| 넓은 일반 창 | 1024×768, regions 없음 | 콘텐츠 최소 크기가 맞으면 2패널 |
| 작은 다중 창 | 480×700, 장치 자체는 펼쳐짐 | 단일 패널; 기기명 영향 없음 |
| 세로 0폭 분할선 | 900×800, x=450·width=0, active division | 좌우 공간을 분리해 판정 |
| 비대칭 hinge | 1000×800, x=380·width=24, full occlusion + division | 실제 380/596 공간에서 인셋·clearance 반영 |
| 가로 분할 | 800×1000, y=490·height=20 | 축을 허용한 preview/controls만 상하 후보 |
| 내장 카메라 가림 | 900×700, 작은 내부 rect 활성화 | 해당 anchor/컨트롤 교차 회피; 전체 화면 강제 분할 없음 |
| 비활성 division | 같은 bounds, active=false | 활성 분할 적용 없음; 선택적 grid 힌트 |
| 부모 인셋 소비 | 부모가 top/left를 이미 적용 | 자식은 남은 인셋만 차감 |
| 별도 modal window | 다른 surfaceId·원점·인셋 | modal 좌표로 anchor/영역 재측정 |
| 중복·교차 영역 | division과 occlusion bounds 중복 | 가용 공간 중복 차감 없음 |
| 여러 힌지/잘린 영역 | 2개 이상 divider 또는 pane 일부와 교차 | 지원 topology는 계산; 그 외 안전한 단일 영역 fallback |
| IME resize | Android가 이미 viewport 축소 | 키보드 높이 중복 padding 없음 |
| stale event | generation N+1 뒤 N 이벤트 | 과거 이벤트 폐기, 현재 snapshot 유지 |

불변식은 모든 rect가 유한하고 크기가 음수가 아니며, 최종 interactive rect가 선택한 가용 영역 안에 있고, full occlusion과 교차하지 않으며, 같은 입력에 같은 layout을 반환하는 것이다. 허용 축·최소 크기를 충족하지 못한 결과는 명시적 fallback 사유를 반환한다.

## 5. 기능 수용 테스트

| AC | 절차 | 합격 기준 |
| --- | --- | --- |
| AC01 연속성 | 목록 선택 → 상세 scroll → 펼침 → 접힘, 20회 | 같은 항목/경로 유지, anchor 항목 보존, 앱의 중복 action 0건 |
| AC02 폼 | 한글 조합·선택 범위·초안을 가진 입력 중 크기/자세 변경 | 입력 유실·중복 문자 0건, 포커스/selection 유지 또는 계약된 복원 |
| AC03 열림 유지 | alert/sheet/modality/loader 표시 중 전환 | 같은 overlay ID 유지, 가림 회피, 닫기·확정 접근 가능 |
| AC04 같은 크기 posture | width/height 고정 상태에서 half-open/flat | region 변경만으로 새 배치 반영 |
| AC05 좌표 | 중첩 container/portal/Modal에서 anchored menu | anchor 연결 및 flip/shift/clamp 정상, 잘못된 scene 이동 0건 |
| AC06 tabletop | 지원 패턴에서 가로 hinge 사용 | preview 위·controls 아래, 높이 부족 시 활성 과업 유지 |
| AC07 수명주기 | background/foreground, rotate, Activity recreate, root unmount | 최신 geometry로 복귀, 오래된 수집 job/리스너 누수 0개 |
| AC08 접근성 | VoiceOver/TalkBack·큰 글자·키보드 탐색 | 과업 순서·focus trap/복귀 정상, 숨은 pane 중복 읽기 0건 |
| AC09 방향/바 | LTR/RTL·Duo Split View 양쪽 창 | content 방향성과 native bar 물리 edge 각각 정상 |
| AC10 카메라 가림 | Duo inner camera on/off | occlusion 변화 반영, 주요 컨트롤 충돌 0건 |
| AC11 크기 경계 | 폭 599/600/601, 839/840/841, 1199/1200/1201, 1599/1600/1601 | 선언한 클래스와 fit 규칙 일치, 왕복 전환 안정 |
| AC12 낮은 창 | 높이 479/480/481, 899/900/901 + IME | 수직 overflow는 스크롤 가능, action 접근 유지 |
| AC13 알 수 없는 상태 | native 미지원·오류·초기 지연·빈 feature | 정상 기본 레이아웃, 진단 상태 구분, crash 0건 |
| AC14 플러그인 | prebuild·deep link cold/warm start·뒤로가기 | 소비 앱 task 정책과 일치, route 중복 생성 0건 |
| AC15 읽기 흐름 | 긴 피드/문서에서 접기·펼치기 | 일반 fold에서 불필요한 칼럼 재분할 없음; full occlusion에서는 읽을 수 있는 pane 확보 |
| AC16 복수 scene | 다른 창에 각기 입력/overlay 표시 | 서로 다른 상태·지오메트리 유지, 전역 overlay 오배달 0건 |

AC07의 프로세스 종료 후 초안/탐색 복원은 **소비 앱의 persistence 책임**이다. 라이브러리는 복원 인터페이스와 예제를 제공하고, 앱이 persistence를 연결한 시험 경로에서 결과를 확인한다. RN 내부 상태만으로 OS가 종료한 프로세스를 복원한다고 약속하지 않는다.

## 6. 검증 환경 매트릭스

| 플랫폼 | 최소 검증 환경 | 핵심 변화 |
| --- | --- | --- |
| Android book fold | Galaxy Z Fold 계열 실제 기기 1대 + Pixel Fold 계열 실제/공식 emulator 1종 | outer/inner, book, tabletop, multi-window |
| Android flip | Galaxy Z Flip 계열 실제 또는 공식 emulator | 좁고 긴 화면, horizontal hinge, 작은 가용 높이 |
| Android dual-screen | 사용 가능한 emulator/기기 + 합성 full-occlusion fixture | 폭이 있는 hinge와 두 영역 |
| Android tablet/일반 폰 | tablet resizable emulator + 일반 폰 | fold 정보가 없는 large/small window |
| Android OS/target | API 36 target 36, API 37 target 37, 지원 최소 OS smoke | resize·orientation·lifecycle·insets |
| iPhone Duo | Xcode 27.1 Device Hub의 제공 pose + 출시 후 실제 기기 | outer/inner, 부분 접힘, 양 축, camera, Split View |
| 기존 iPhone | 현재 지원 OS의 실제/시뮬레이터, 가로·세로 | fallback, 인셋, 기존 overlay 회귀 |
| iPad | resizable window·Split View·복수 scene | 일반 large window와 scene 격리 |
| Web | Chrome/Safari, 문서 preview·iframe·resize | 기본 adaptive, SSR, native 미지원 표시 |

실행 기록에는 정확한 모델, OS/build, target SDK, Xcode/AGP, package commit, density/fontScale, window/container bounds, region snapshot, 입력 방식, 결과를 남긴다. 제조사별 값 차이는 fixture로 추가한다. 웹 합성 posture는 디자인·geometry 시험이고 native 센서 정확성의 증거와 구분한다.

## 7. 성능·안정성 기준

초기 엔지니어링 예산이며 F00에서 저사양 기준 기기를 정한 후 측정값으로 보정한다.

- 60Hz 기준 기기 release build에서 순수 normalize+resolve 계산 p95 2ms 이하를 목표로 한다. 1,000개 fixture 반복과 실제 transition 모두 기록한다.
- native의 일관된 새 snapshot을 받은 뒤 JS layout 결정까지 p95 1 display frame 이내를 목표로 한다. bridge와 layout commit 전체 시간은 별도 기록한다.
- 안정된 pose에서 100회 resize/fold 전환 후 idle 리스너·coroutine 수는 시작 시점과 같아야 한다. 지연 job의 이전 scene 참조는 남기지 않는다.
- key 입력·network action·미디어 재생 side effect의 중복 실행은 0건이어야 한다. 픽셀 이동이 있어도 과업 의미를 보존한다.
- 동일 입력에서 추가 React commit을 만들지 않는다. geometry 변경 시 provider 전체 소비자 대신 영향받는 layout/overlay만 갱신한다.
- 120Hz에서는 프레임 예산을 8.3ms로 별도 평가한다. JS 전달이 native transition을 따라가지 못하면 가림 회피 최소 경로의 native 처리 또는 native presentation을 검토한다.

측정 중 디버그 logging과 development build 비용을 분리한다. 성능 목표를 충족하지 못한 경우 장식 motion을 먼저 줄이고 실제 가림 회피와 입력 동작을 우선 보장한다.

## 8. 테스트와 저장소 검사

| 계층 | 검증 방식 | 목적 |
| --- | --- | --- |
| TypeScript geometry | Jest 순수 테스트, 생성된 rect 경계 사례 | 좌표·분할·가림·최소 크기 불변식 |
| store/provider | React Native Testing Library | 초기 경합·해제·scene 격리 |
| Android native | WindowManager testing 도구 + instrumentation | lifecycle·density·실제 posture 이벤트 |
| iOS native | XCTest/지원되는 simulator 도구 | region 관측·traits·scene·availability |
| RN 컴포넌트 | 기존 Jest/RNTL 회귀 + 새 계약 테스트 | 상태·focus·overlay policy |
| 앱 E2E | 기존 도구 우선, native 자동화 도구는 G0에서 선택 | 실제 입력/전환/뒤로가기; 선택 도구의 Xcode 27.1 지원 확인 |
| Web QA | 저장소 `agent-browser` 경로 | 문서/예제의 가용 폭·fallback·레이아웃 |

구현 PR에서는 저장소의 `pnpm run build`, `pnpm run test`, `pnpm run lint`, `pnpm --filter docs run check` 중 변경에 관련된 검사를 실행하고 native 검사를 추가한다. `test:all`은 현재 실패를 `|| true`로 흡수하므로 단독 성공 판정에 사용하지 않는다. 플랫폼 성공은 모의 Jest 결과와 실제 실행 결과를 함께 기록한다.

현재 기획 문서 PR의 검증 범위는 UTF-8·상대 링크·문서 내용 일관성·`git diff --check` 및 저장소 docs CI에 대응하는 `pnpm --filter docs run check`이다. 구현 테스트나 실기기 수용 테스트가 통과한 상태를 의미하지 않는다.

## 9. 문서·디자인 산출물

디자인은 기종별 고정 화면 대신 pattern × 크기/높이 × region × fontScale × overlay scope의 상태를 정의한다. Figma 산출물은 다음 구현 작업에서 만든다.

| 산출물 | 담당 | 포함할 내용 |
| --- | --- | --- |
| Adaptive token sheet | 디자이너·RN | margin/gutter/min/max/clearance와 적용 이유 |
| Layout pattern variants | 디자이너 | single/list-detail/supporting/tabletop, 낮은 창 |
| Overlay placement variants | 디자이너·RN | source pane, anchored, IME, error/fallback |
| Transition storyboard | 디자이너·QA | 입력/선택/scroll/focus의 전후 상태 |
| Platform adapter ADR | native | source API, availability, 좌표, event lifecycle |
| 지원표·migration guide | RN | 구형→신형 API, breaking changes, provider 순서 |
| Example/gallery | RN | 목록/상세, 폼, 미디어, 달력, overlay laboratory |

공개 API가 구현된 다음 기존 `docs/docs/FoldableDevice.md`와 관련 컴포넌트 문서를 갱신한다. 개발 전 기획 문서는 `docs/plans/`에 두어 현재 API 사용법과 구분한다. 외부 Figma 파일·Command Center wiki/context-map 반영은 이 문서 작성 범위와 별도의 유지관리 작업으로 다룬다.

## 10. 출시·이관·롤백

1. 다음 major의 alpha에서 새 provider/layout/overlay 계약을 완성하고 example 앱에서 기존 fold API 사용을 전환한다.
2. beta에서 소비 앱 1개의 목록/상세·폼·overlay·달력 대표 흐름을 이관한다. 실제 앱 적용은 해당 앱의 작업 범위에서 진행한다.
3. RC에서 기존 public fold API·문서·types·native method 제거 여부와 package tarball의 native 파일 포함을 검증한다. clean 프로젝트에 설치해 prebuild/debug/release build를 확인한다.
4. **GA gate:** Android native, 기존 iOS, Duo simulator·실기기, 웹 fallback의 필수 AC 완료; iOS 27.1 툴체인/배포 경로 확인; P0/P1 결함 처리; migration 문서와 지원 버전표 확정.
5. Duo 실기기 확보가 늦으면 beta/RC 상태를 유지하거나 출시 범위를 `adaptive`로 명시한다. `validated` 지원은 실제 검증된 조합에만 표시한다.

정식 release에서는 자동 npm 배포 트리거(`main`의 package.json 변경)를 고려해 버전 변경을 별도 검토한다. 이번 계획 PR에는 패키지 버전 변경과 런타임 배포가 포함되지 않는다.

rollback은 소비 앱이 검증된 기존 major와 이전 native binary로 돌아가는 방식이다. 새 native API를 호출하는 JS를 이전 binary에 OTA로 배포하지 않도록 runtime version을 분리한다. layout 정책 플래그는 신규 엔진의 single 패턴으로 안전하게 축소할 수 있게 설계하되 구형 folded/unfolded 구현을 신규 내부 fallback으로 다시 연결하지 않는다.

## 11. 위험과 대응

| 위험 | 영향 | 대응 / 결정 시점 |
| --- | --- | --- |
| Xcode 27.1 공개·API 변경 | iOS 구현 일정 이동 | SDK 공개 후 F02에서 실제 선언 확정; 독립 공통 작업 진행 |
| RN navigation의 새 bar 미지원 | Duo 시스템 패턴과 차이 | F11 최소 앱으로 검증, adapter/호환 업데이트 범위 결정 |
| native↔JS geometry 지연 | 열린 overlay 순간 가림 | generation/revision·묶음 갱신·release 성능 측정 |
| density·inset·origin 혼합 | 터치와 화면 위치 불일치 | 단위/좌표 표준 및 디버그 region 표시 |
| 큰 글자와 두 패널 최소 크기 충돌 | 읽기·조작 불가 | single 과업 fallback, 최소 터치 크기 유지 |
| 소비 앱의 state가 subtree 내부에 있음 | 접힘 후 초안·선택 유실 | migration guide에 앱 상태 소유·복원 계약 제공 |
| 글로벌 overlay target 모호함 | 다른 scene에 알림 표시 | 명시적 target; 여러 scene일 때 implicit 대상 오류 처리 |
| 제조사별 folding metadata 편차 | 같은 posture의 배치 차이 | native 값 기록·공식 OEM/Pixel 환경·unknown fallback |
| 기기 확보 지연 | 지원 완료 판정 불가 | simulator와 실제 검증 등급을 분리해 표시 |

## 12. 첫 착수 체크리스트

- [ ] F00: 공통 좌표·region·event 타입과 단일/복합 topology fallback 확정.
- [ ] F01: Expo 57 / RN 0.86 / WindowManager 1.5.1 최소 빌드와 fold stream 확인.
- [ ] F03: 토큰 초안과 4가지 과업 패턴의 큰 글자·낮은 창 설계.
- [ ] F04: 0폭 division, full occlusion, 비대칭 인셋, nested surface fixture 구현.
- [ ] F02: Xcode 27.1 공개 상태 재확인 후 iOS region/bar 실험 진행.
- [ ] F13: 입력/선택/scroll을 가진 예제에서 전환 수용 기준 재현.

위 체크리스트의 완료 기록과 SDK 확인일을 다음 구현 PR에서 갱신한다.
