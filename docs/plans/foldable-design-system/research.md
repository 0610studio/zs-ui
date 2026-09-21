# 폴더블 공통 디자인 시스템 공식 자료 조사

조사·수정일: 2026-09-12 KST · 대상 설계: [기획·설계](./README.md)

## 1. 조사 방법과 신뢰 수준

Apple·Android·React Native·Expo·React의 공식 자료와 ZS-UI 원본 코드를 확인했다. 검색으로 자료를 찾고 공식 본문·세션 요약·코드 예시를 대조했다. Apple HIG처럼 JavaScript 렌더링이 필요한 본문은 `agent-browser`에서 열어 확인했다. 판매 페이지의 사양을 layout breakpoint로 사용하지 않았다.

- **공식 확인:** 공개된 페이지/영상 페이지의 설명과 예시로 확인한 사실.
- **로컬 확인:** 아래 Git 기준점의 코드·설정 및 개발 도구 출력.
- **설계 제안:** 해당 사실에서 ZS-UI에 적합하다고 판단한 자체 계약·토큰·일정.
- **후속 검증:** SDK 컴파일, native event 전달, 실제 기기 동작으로 확인할 사항.

영상은 공개 영상 페이지에 제공되는 챕터 요약과 코드로 조사했다. 모든 영상을 재생하거나 native 실험을 완료한 것으로 해석하지 않는다. 공식 레퍼런스가 아직 공개 예정인 iOS API는 영상의 이름·의도 수준까지 확인한 상태다.

## 2. iPhone Duo: 발표와 도구 가용성

| 사실 | 확인 결과 | 계획에 미치는 영향 |
| --- | --- | --- |
| 제품명 | 공식 제품명이 iPhone Duo | 가칭 iPhone Fold와 구별 |
| 발표와 판매 | 9월 9일 발표, 10월 23일 판매 예정 [A01] | 발표 직후 대응 계획으로 정의 |
| Xcode | 허브의 Xcode 27.1 beta는 이달 말 공개 예정 [A02] | 다운로드 가능 시점과 세션의 사용 안내 구분 |
| 상세 준비 문서 | Preparing your app for iPhone Duo도 이달 말 공개 예정 [A02] | 문서/SDK 재검증을 명시적 마일스톤으로 둠 |
| 현재 로컬 도구 | `xcodebuild -version`: Xcode 26.6, build 17F113 | iOS 27.1 컴파일·Duo 시뮬레이터 검증을 완료했다고 주장할 근거 없음 |

세션에서 Xcode 27.1 사용을 안내하는 내용과 허브의 향후 공개 일정은 서로 다른 종류의 정보다. 개발 계획에서는 **현재 가용성은 허브 기준**, 새 API 사용 의도는 세션 기준으로 분리한다.

## 3. 플랫폼별 발견 사항

### Apple

| 출처 | 확인한 핵심 | ZS-UI의 대응 결정 |
| --- | --- | --- |
| [A03] Duo HIG | 양 디스플레이·자세 간 과업 연속성, 측면 bar, 비대칭 공간 | 기기별 화면 복제 대신 의미 있는 pane·bar 계약 |
| [A04] Prepare, 0:30·2:46·6:06·8:08 | SDK에 따른 화면 활용 차이; size class·scene·각 변의 safe area; reserved regions | SDK/OS 가용성 표, scene 기준 측정, 네 변 인셋 |
| [A05] Strike a pose, 6:39·7:50 | division/occlusion과 active/inactive 구분 | 공통 region 모델, width=0 division 유지 |
| [A05] 9:20 이후 | arrangement가 두 뷰를 규칙에 따라 배치 | RN 공통 엔진 설계 참고; native 자동 적용은 실험 |
| [A06] Raise the bar, 2:00·3:09 | navigation container의 bar와 공유 영역 | React Native custom bar를 별도 호환 항목으로 둠 |
| [A07] 0:49·2:35 | `onHingeChange`/`UIHingeInteraction`의 상태·각도; layout에는 region/arrangement 권장 | 각도는 후속 인터랙션 기능으로 분리 |
| [A07] 2:59·3:38 | Split View와 여러 scene 인스턴스 | 전역 window/store 가정 교체 |

Apple 신규 명칭 중 `ReservedRegion`, `UIViewReservedRegion`, `ArrangementView`, `UIArrangementViewController`는 공식 세션에서 확인했다. `UIView.reservedRegions(kind:)`와 `.division`/`.occlusion` 예시도 공개되어 있다. 다만 정확한 관측 콜백, 좌표 변환, RN native view 안에서 반환되는 영역 범위, deployment availability, 컴파일 조건은 Xcode 27.1 SDK에서 확정한다. [A04][A05]

Apple이 소개하는 layout 자동 적응은 해당 native system container의 기능이다. 기존 ZS-UI의 커스텀 overlay·Skia canvas·React tree가 같은 기능을 얻는다는 결론은 이 자료에서 나오지 않는다. 따라서 native/React 경계 검증이 선행되어야 한다.

### Android

| 출처 | 확인한 핵심 | ZS-UI의 대응 결정 |
| --- | --- | --- |
| [D01][D02] fold-aware / FoldingFeature | state, orientation, isSeparating, occlusionType, bounds 제공 | 속성을 보존하는 region 어댑터 |
| [D01] | `FoldingFeature`에 힌지 각도 API는 포함되지 않음 | 각도를 양 플랫폼 필수 계약에서 제외 |
| [D02] | bounds는 앱 window 좌표의 영역 | 로컬 view 좌표로 투영하고 px/dp 변환 |
| [D03] WindowInfoTracker | window layout 정보를 관측하는 흐름 | Activity/구독 수명에 연결된 연속 수집 |
| [D04] size classes | 폭 5단계·높이 3단계; 현재 창 기준 | 태블릿/폴드 기기 분류와 layout 분리 |
| [D05] releases | 안정 버전 1.5.1, alpha 1.6.0-alpha05 | stable 1.5.1을 초기 호환 실험 후보로 선정 |
| [D06] compatibility | Android 16/API 36의 큰 화면 적응 요구 | 방향 고정에 의존한 앱 구성 교체 |
| [D07] Android 17 | target 37은 큰 화면 제한의 opt-out 제거 | API 36과 37의 소비 앱 빌드 모두 계획 |
| [D08] quality | Adaptive ready/optimized/differentiated 등급 | 기본 크기 대응과 posture 최적화를 별도 검증 |

`isSeparating`과 `occlusionType`은 다른 질문에 답한다. 접힘선이 두 영역을 나누어도 화면이 완전히 가려지는 것은 아니며, 폭 0의 선도 의미가 있다. 반대로 dual-screen의 실제 hinge 영역에는 그려도 볼 수 없는 부분이 있다. 이 차이를 하나의 folded/unfolded enum에 압축하면 배치 결정을 복원하기 어렵다.

Android 공식 최신 예시는 Compose를 많이 사용한다. ZS-UI는 RN 패키지이므로 Compose UI를 새로 의존하는 대신 underlying Jetpack WindowManager의 관측값을 Expo Module로 전달한다. WindowManager 1.5.1의 실제 AGP/Kotlin/minSdk/Expo 57 조합은 별도 빌드 검증 대상이다.

### React Native·Expo·React

| 출처 | 확인한 핵심 | ZS-UI의 대응 결정 |
| --- | --- | --- |
| [R01] useWindowDimensions | 창 크기·fontScale 변화를 React에서 구독 | fallback/window 입력에 사용 |
| [R02] Measuring Layout | `measure`·`measureInWindow`, layout effect 기반 측정 | portal/anchor를 동일 좌표계로 변환 |
| [R03] Expo Module API | Events, 관측 시작·종료와 lifecycle 기능 | 이벤트 스트림과 해제 규칙 명문화 |
| [R04] Safe area context | 앱 root 및 일부 modal/native route에 provider 필요 | overlay surface의 독립 인셋 측정 |
| [R05] React state | tree 위치와 component identity가 상태 유지에 관여 | key만 믿는 reparenting 대신 상태 계약 |

`useWindowDimensions()`만으로 hinge와 내부 카메라 가림 영역을 얻는다는 근거는 없다. `safe-area-context`의 네 변 인셋으로 중앙 division을 모두 표현할 수도 없다. 기본 크기·safe area와 추가 native 영역 어댑터를 함께 사용한다.

## 4. 현재 ZS-UI 확인

Command Center의 `README.md → context-map/index.yaml → domains/barabom.yaml`에서 `barabom-design-system` entity를 따라 `wiki/barabom/services/design-system/README.md`와 원본 `zs-ui`에 진입했다. 별도의 ZS-UI `AGENTS.md`는 발견되지 않았다.

최초 확인: 로컬 `1.0.3` branch / `30355ae`. 원격 fetch 후 `origin/main`은 `0003f34` / package 1.0.2였고, 로컬 branch가 버전·웹 예제 수정 2개 커밋만큼 앞서 있었다. 문서 작업은 `origin/main` 기반의 별도 branch에서 수행하며 기존 `1.0.3` branch는 유지한다. 아래 runtime 구조는 두 기준점에서 같은 설계다.

| 항목 | 로컬 확인 | 제로 베이스 교체 이유 |
| --- | --- | --- |
| [package.json](../../../package.json) | Expo 57.0.18, RN 0.86.3, React 19.2.3, pnpm 10.16.1 | 현행 의존성을 출발점으로 호환 실험 |
| [Android module](../../../android/src/main/java/kr/co/studio0610/zsui/ZsUiModule.kt) | `runBlocking` + flow `first()`, feature 1개 선택 | 연속 관측·수명주기·복수 feature 계약 필요 |
| [Android 설정](../../../android/build.gradle) | WindowManager 1.2.0, 기본 compile/target 36, min 24 | stable 후보와 소비 앱 toolchain 재검증 |
| [iOS module](../../../ios/ZsUiModule.swift) | foldingFeature=nil, value=0 반환 stub | 새 scene/view 어댑터 필요 |
| [Podspec](../../../ios/ZsUi.podspec) | 선언상 iOS/tvOS 16.4, Swift 5.4 | Expo 전체 실제 최소 OS와 구분; compile/runtime guard 필요 |
| [useFoldingState](../../../src/model/useFoldingState.tsx) | Dimensions 변경에 조회, feature 존재 여부로 2상태, Android 외 folded | 같은 크기의 자세 변화·iOS 영역·unknown 표현 부족 |
| [types](../../../src/model/types.ts) | native bounds/state 일부 있으나 public 훅은 state/width | region·height·insets·source·capability 확장 필요 |
| [ZSContainer](../../../src/ui/ZSContainer/index.tsx) | unfolded일 때 rightComponent 표시, flex1 좌우 분할 | 물리 hinge·패널 최소 크기·navigation 의미 분리 |
| [ThemeContext](../../../src/context/ThemeContext.tsx) | `foldable.unfoldedSinglePaneMaxWidth` | 기기 상태와 무관한 콘텐츠 역할 토큰 필요 |
| [BottomSheet](../../../src/overlay/BottomSheetOverlay/index.tsx)·[Modality](../../../src/overlay/Modality/index.tsx) | foldableSingleScreen과 width 상한 중심 | source pane/가림/IME/열린 중 전환을 공통 계산 |
| [PopOver](../../../src/overlay/PopOver/PopOverMenu.tsx) | window 크기 기반 위치 계산 | local host/anchor/region 좌표 일치 필요 |
| [Calendar layout](../../../src/ui/ZSCalendar/core/layout.ts) | 컨테이너 폭 기반 계산 | 좋은 독립 원칙으로 유지; hinge·hit test 연동 검증 |
| [config plugin](../../../app.plugin.js) | singleTask와 configChanges 주입 | DS와 앱 task/deep link 정책 책임 분리 |
| [example/app.json](../../../example/app.json) | orientation portrait, supportsTablet true | 여러 창/회전/자세 실험 앱 구성 점검 |
| [기존 Foldable 문서](../../docs/FoldableDevice.md) | folded/unfolded·rightComponent 사용법 | 신규 major에서 기획된 계약으로 교체 |

분석한 코드를 실제 Android/iOS에서 실행해 결함을 재현한 것은 아니다. 위의 교체 이유는 코드 구조와 새 요구사항의 차이를 평가한 것이다.

## 5. 대안 평가

| 대안 | 장점 | 비용·제약 | 결정 |
| --- | --- | --- | --- |
| 기기명·가로폭 기반 기존 훅 확장 | 작은 초기 변경 | 자세/가림/scene를 표현하기 어려움 | 폐기 |
| 양 플랫폼 native UI 전체 분리 | 시스템 동작 활용 | API·스타일·회귀 시험 이중화, RN 콘텐츠 연동 비용 | 1차 제외 |
| 공통 geometry + native adapter | 입력 차이를 보존하며 배치/테스트 공유 | 좌표·이벤트 일관성 구현 필요 | 채택 제안 |
| 완전 JS responsive만 제공 | 웹·구형 OS 적용 용이 | 실제 hinge/camera region 데이터 부족 | fallback으로 사용 |

아래 항목은 현재 자료만으로 확정하지 않는다: iOS 영역 변경의 정확한 관측 방법, inner camera 활성화 때 RN에 전달되는 값, nested modal의 region 좌표, 여러 RN root와 UIWindowScene 대응, 설치된 Expo Router/screens의 새 bar 지원 범위, 새 SDK의 EAS image 가용성. 담당·종료 조건은 [실행 계획](./implementation-plan.md)에 기록했다.

## 6. 공식 출처 목록

모든 URL의 확인일은 2026-09-12이다. 문서 갱신일과 실제 제품/SDK 공개일을 별도로 해석한다. 아래 ID는 본 문서의 근거 추적용이다.

| ID | 공식 자료 | 조사 범위 |
| --- | --- | --- |
| A01 | [Apple unveils iPhone Duo](https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/) | 제품 발표·판매 일정 |
| A02 | [Get ready for iPhone Duo](https://developer.apple.com/iphone-duo/) | SDK·문서 공개 일정, 공식 세션 진입 |
| A03 | [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo) | 실제 브라우저 본문; dynamic layouts·vertical controls |
| A04 | [Prepare your app for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111461/) | 챕터 요약·code; SDK·size classes·safe area |
| A05 | [Strike a pose with adaptive layouts on iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111463/) | division·occlusion·arrangement |
| A06 | [Raise the bar with iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111462/) | system container·bar·overflow |
| A07 | [Leverage multiple displays and scenes on iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111464/) | hinge 관측, scene, multi-display 경계 |
| A08 | [Design for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111466/) | pose 간 과업·표현 연속성 |
| D01 | [Make your app fold aware](https://developer.android.com/develop/adaptive-apps/guides/foldables/make-your-app-fold-aware) | fold 정보와 tabletop/book 의미 |
| D02 | [FoldingFeature API](https://developer.android.com/reference/androidx/window/layout/FoldingFeature) | 분할·가림·window bounds 계약 |
| D03 | [WindowInfoTracker API](https://developer.android.com/reference/androidx/window/layout/WindowInfoTracker) | layout flow·window 관측 |
| D04 | [Use window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes) | 공식 width/height 경계 |
| D05 | [WindowManager release notes](https://developer.android.com/jetpack/androidx/releases/window) | 1.5.1 stable / 1.6 alpha 구분 |
| D06 | [Device compatibility mode](https://developer.android.com/guide/practices/device-compatibility-mode) | resize·orientation compatibility |
| D07 | [Android 17 target behavior changes](https://developer.android.com/about/versions/17/behavior-changes-17) | 큰 화면 opt-out 변경 |
| D08 | [Adaptive app quality guidelines](https://developer.android.com/docs/quality-guidelines/adaptive-app-quality) | 등급·기기 종류·검증 범위 |
| R01 | [RN useWindowDimensions](https://reactnative.dev/docs/usewindowdimensions) | 창 크기·fontScale |
| R02 | [RN Measuring the Layout](https://reactnative.dev/docs/the-new-architecture/layout-measurements) | native view 측정 |
| R03 | [Expo Module API Reference](https://docs.expo.dev/modules/module-api/) | events·observing·lifecycle |
| R04 | [Expo Safe area context](https://docs.expo.dev/versions/latest/sdk/safe-area-context/) | root/modal provider |
| R05 | [React Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) | 트리 위치·상태 보존 |
