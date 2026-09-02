---
sidebar_position: 2
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# 로컬 플레이그라운드

`@0610studio/zs-ui`의 현재 저장소 예제를 Expo Web 정적 빌드로 실행합니다. 문서에 표시되는 화면과 소스 코드는 모두 같은 Git 저장소에서 관리되며, Expo Snack에 별도로 저장한 코드를 불러오지 않습니다.

아래 카탈로그는 `example` 앱의 실제 홈 메뉴입니다. **예제 불러오기**를 선택한 뒤 테마, 웹 검증, 레이아웃, 오버레이, 이펙트, 폴더블 예제를 같은 분류로 탐색할 수 있습니다. 예제가 필요하지 않을 때는 Expo 번들과 폰트를 내려받지 않으므로 문서 본문을 먼저 읽을 수 있습니다.

:::warning 실제 앱 검증이 필요한 범위
웹 플레이그라운드는 컴포넌트의 기본 렌더링, 반응형 레이아웃, 포인터·키보드 상호작용을 빠르게 확인하는 용도입니다. 다음 기능은 웹 결과로 최종 판단하지 않고 `example` 앱을 iOS·Android에서 실행해 확인하세요.

- Skia 기반 효과: `ZSBorderBeam` 광선, `ZSSkeleton`·`ZSSkeletonBox` shimmer
- 네이티브 키보드·SafeArea·StatusBar: `ZSContainer`, `ZSAboveKeyboard`, `ZSTextField`
- Android 폴더블 상태와 2-pane 전환: `useFoldingState`, `ZSContainer` 폴더블 기능
- 네이티브 제스처·Android back 우선순위: BottomSheet, Modality, Loader와 Overlay 기능
:::

<LocalPlayground example="Catalog" height={1000} title="ZS-ui 전체 예제 메뉴" />

## 로컬 실행

```bash
cd example
pnpm run web
```

## 실제 앱에서 확인

```bash
cd example
pnpm run ios
# 또는
pnpm run android
```

SafeArea, 실제 소프트 키보드, 상태바, Android 하드웨어 뒤로가기, 폴더블 전환, Skia 애니메이션은 시뮬레이터·에뮬레이터 또는 실제 기기에서 검증합니다.

## 문서용 정적 예제 생성

```bash
cd docs
pnpm run playground:build
```

`pnpm run start`와 `pnpm run build`는 문서용 예제 생성을 먼저 실행합니다.
