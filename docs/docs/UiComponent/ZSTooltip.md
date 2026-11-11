# ZSTooltip

꼬리가 달린 말풍선으로 주변 요소에 짧은 안내를 붙입니다. 레이아웃 안에 놓이는 인라인 말풍선이고(오버레이가 아닙니다), 두 플랫폼에서 같은 모양으로 zs-ui가 그립니다.

- 말풍선: 모서리 `RADIUS.md`(12), 한 줄 높이 40, 그림자 `shadows.md`. 면은 반전 흐림 막(`backgroundInverse` 라이트 88%·다크 92% + 뒤 흐림)이고, `backgroundColor`를 주면 그 색 단색입니다. 흐림 재질은 [오버레이 개요](../OverlayComponent/start#흐림-막)를 봅니다.
- 꼬리: 18×8, 끝이 둥근 삼각형.
- 문구: `textVariant` 강조 굵기.
- 닫기: 기본으로 보입니다. 보이는 크기 32, 아이콘 16. 말풍선을 넓혀도 늘 말풍선 끝(오른쪽)에 붙습니다.

## 기본 사용법

```tsx
import { ZSTooltip } from '@0610studio/zs-ui';

<ZSTooltip message="여기서 기록을 추가할 수 있어요" />
<ZSTooltip message="아래를 가리키는 화살표" placement="top" arrowAlign="center" />
<ZSTooltip message="위를 가리키는 화살표" placement="bottom" showClose={false} />
```

## Props — `ZSTooltipProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `message` | `string` | `undefined` | 문구. `children`이 있으면 `children`이 우선합니다 |
| `children` | `ReactNode` | `undefined` | 말풍선 안 커스텀 콘텐츠 |
| `visible` | `boolean` | `undefined` | 보임 여부 — 제어. 주지 않으면 비제어 |
| `defaultVisible` | `boolean` | `true` | 비제어 초기값 |
| `onClose` | `() => void` | `undefined` | 닫기 버튼을 눌렀을 때 |
| `placement` | `ZSTooltipPlacement` | `'top'` | `'top'`이면 말풍선이 대상 위에 있고 화살표가 아래를 향합니다. `'bottom'`은 반대. [화면 위 끝에서 뒤집기](#대상-옆에-띄우기) |
| `showClose` | `boolean` | `true` | 닫기 버튼. 닫을 필요가 없는 안내면 `false` |
| `floating` | `boolean` | `false` | 위아래로 떠다니는 애니메이션 — 시스템 '동작 줄이기'가 켜져 있으면 멈춥니다 |
| `backgroundColor` | `ColorName \| string` | 반전 흐림 막 | 말풍선 색 — 색 역할 이름 또는 직접 지정한 색. 주면 흐림 없는 단색입니다 |
| `textColor` | `ColorName \| string` | `'textInverse'` | 글자·닫기 아이콘 색 — 색 역할 이름 또는 직접 지정한 색 |
| `textVariant` | `TextVariant` | `'caption'` | 문구 글꼴 역할 |
| `arrowAlign` | `ZSTooltipArrowAlign` | `'start'` | `'start' \| 'center' \| 'end'` |
| `arrowOffset` | `number` | `16` | `start`·`end` 정렬일 때 가장자리에서 화살표까지 거리 |
| `closeAccessibilityLabel` | `string` | `accessibilityLabels.closeTooltip`(`'Close tooltip'`) | 닫기 버튼의 스크린 리더 라벨. 앱 전체 기본값은 [ThemeProvider `accessibilityLabels`](../Provider/ThemeProvider#스크린-리더-문구--accessibilitylabels)로 바꿉니다 |
| `...props` | `ViewProps` | `undefined` | `style` 등 |

`ZSTooltipProps`·`ZSTooltipPlacement`·`ZSTooltipArrowAlign` 타입을 내보냅니다.

## 대상 옆에 띄우기

말풍선은 레이아웃 흐름 안에 놓입니다. 대상 위에 겹쳐 띄우려면 대상과 함께 감싼 뷰 안에서 `position: 'absolute'`로 둡니다. 나타날 때는 대상 반대쪽에서 8 다가오며 페이드인하고, 사라질 때는 대상 쪽으로 4 비켜 가며 짧게 페이드아웃합니다([모션 토큰](../Theme/tokens#모션--spring--timing)).

`placement="top"`이고 `position: 'absolute'`에 `bottom`만 준 말풍선은 처음 놓일 때 위치를 잽니다. 화면 위 끝(safe area + 12)에 걸리면 대상 아래로 뒤집어 `top`·`bottom`, `marginTop`·`marginBottom`을 맞바꿉니다. 숨겼다 다시 보이면 원래 자리에서 다시 잽니다.

```tsx
<View>
  <ZSButton title="추가" onPress={add} />
  <ZSTooltip
    message="여기서 기록을 추가할 수 있어요"
    placement="top"
    showClose
    floating
    style={{ position: 'absolute', bottom: '100%', marginBottom: 8 }}
  />
</View>
```

## 커스텀 콘텐츠

`children`은 닫기 버튼과 같은 가로 줄에 놓이므로 여러 줄이면 `View`로 묶습니다.

```tsx
<ZSTooltip arrowAlign="center">
  <View style={{ flexShrink: 1, gap: 2 }}>
    <ZSText variant="caption" emphasized color="textInverse">새 기능</ZSText>
    <ZSText variant="caption" color="textInverse">길게 눌러 메뉴를 여세요</ZSText>
  </View>
</ZSTooltip>
```

## 접근성

말풍선 문구는 일반 텍스트로 읽힙니다. 닫기 버튼은 `closeAccessibilityLabel`을 읽고 터치 영역을 44pt·48dp로 넓힙니다. 안내가 중요한 정보라면 툴팁에만 두지 말고 화면 본문에도 두세요.

## 관련 문서

- [ZSBanner](./ZSBanner) — 화면 안 상태 메시지
- [ZSPortal](../OverlayComponent/ZSPortal) — 레이아웃 밖 최상위 레이어
