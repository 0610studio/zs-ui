# ZSPaneLayout

같은 화면 안에서 주 콘텐츠(목록 등)와 보조 콘텐츠(상세 등)를 나란히 놓습니다. Material 3의 list-detail·supporting pane, HIG의 "넓은 화면에서 한 단계 더 깊은 계층 표시"에 해당합니다.

## 기본 사용법

```tsx
import { ZSPaneLayout } from '@0610studio/zs-ui';

export default function MailScreen() {
  return (
    <ZSPaneLayout
      primary={<MailList />}
      secondary={<MailDetail />}
      scroll
    />
  );
}
```

화면 최상위에 둡니다. ScrollView 안에 넣으면 개발 모드에서 경고합니다(HIG: 분할 뷰를 스크롤 컨테이너 안에 두지 않습니다). pane별 스크롤은 `scroll`을 씁니다.

## Props — `ZSPaneLayoutProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `primary` | `ReactNode` | Required | 주 콘텐츠. 1단일 때도 항상 보입니다 |
| `secondary` | `ReactNode` | `undefined` | 보조 콘텐츠 |
| `divider` | `boolean \| ReactNode` | iOS `true` · Android `false` | pane 사이 구분선. `true`는 `border` 색 hairline, ReactNode는 그대로 그립니다 |
| `spacing` | `number` | iOS `0` · Android `24` | 비율 분할일 때 pane 사이 간격(Material 3 pane spacer) |
| `primaryFraction` | `number` | `0.4` | 비율 분할에서 주 pane 비율(0–1). 각 pane은 300을 확보하고, 큰 화면 창에서 모자라면 240까지 줄입니다 |
| `compactBehavior` | `'hide' \| 'stack'` | `'hide'` | 1단일 때 secondary — 숨기거나 primary 아래에 쌓습니다 |
| `scroll` | `boolean` | `false` | 각 pane을 ScrollView로 감쌉니다 |
| `extendUnderTabBar` | `boolean` | `false` | 고정 pane을 Android 떠 있는 탭 바 뒤(화면 아래 끝)까지 깝니다. pane 안의 콘텐츠가 아래 inset·`useTabBarInset()`만큼 비킵니다 — [떠 있는 탭 바](../Navigation/ZSTabNavigator#하단-바-모양--barstyle) |
| `tabletop` | `boolean` | `false` | 테이블탑 자세(화면을 가르는 가로 접힘선)에서 위·아래로 나눕니다 |
| `backgroundColor` | `ColorName \| string` | `'background'` | 표면색 — 색 역할 이름 또는 직접 지정한 색 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | |

간격(`spacing`이나 접힘선 두께)이 있으면 그 간격이 경계이고 `divider`는 그리지 않습니다. iOS에서 간격을 두려면 `spacing`을, Android에서 구분선을 쓰려면 `spacing={0} divider`를 줍니다.

`ZSPaneLayoutProps` 타입을 내보냅니다.

## 분할 규칙

위에서부터 먼저 맞는 규칙을 씁니다.

1. **`tabletop`을 켜고 화면을 가르는 가로 접힘선**이 있으면 primary를 위, secondary를 아래에 둡니다. 기본은 끕니다(Apple은 자세 기반 재배치를 권하지 않고, Android는 테이블탑 UX를 권하므로 필요한 앱만 켭니다).
2. **화면을 가르는 세로 접힘선**(반쯤 접은 책 자세 — `active: true`)이 레이아웃 안에 있으면 그 경계로 나누고 접힘선 두께만큼 비웁니다. compact 창이어도 나눕니다(HIG: 힌지 위에 인터랙티브 요소를 두지 않습니다). 평평하게 펼친 접힘선(`active: false`)은 경계로 쓰지 않고 3·4를 따릅니다.
3. **큰 화면 창이 아니면 1단**입니다([`useWindowLayout().largeScreen`](./useWindowLayout#큰-화면-창--largescreen) — 바형 폰은 폭과 상관없이 1단).
4. 큰 화면 창은 `primaryFraction` 비율로 나눕니다. 가용 폭(레이아웃 폭 − 좌우 safe area − 구분선 − `spacing`)에서 pane을 300씩 확보하고, 화면 확대로 모자라면 240까지 줄입니다. 그래도 모자라면 1단입니다.

### 배치 세부

- 비율 분할은 좌우 safe area(가로 노치, 아이폰 듀오 레일)를 뺀 보이는 폭을 나눕니다. 시작 쪽 pane은 시작 쪽 inset만, 끝 쪽 pane은 끝 쪽 inset만 패딩으로 받습니다. RTL이면 좌우가 바뀝니다. 테이블탑에서는 위 pane이 위, 아래 pane이 아래 inset을 받습니다.
- Android 투명 헤더([Stack](../Navigation/Stack#투명-헤더-기본) 기본) 아래에서는 위 inset을 받는 pane이 헤더 높이만큼 비킵니다. `scroll` pane은 콘텐츠만 내리고 pane마다 `ZSHeaderBackground`를 깝니다. 그 pane이 스크롤되면 헤더 뒤 콘텐츠를 흐리고 [흐림 막](../OverlayComponent/start#흐림-막)과 아래 0.5 선을 얹습니다. 모든 pane이 같은 막이라, 창 전체에 걸친 헤더가 pane 경계에서 두 색으로 갈리지 않습니다. Android 12(SDK 31) 미만은 흐림 없이 짙은 막만 깔립니다.
- 1단 ↔ 2단(또는 테이블탑)이 바뀌면 pane 트리를 새로 마운트합니다. pane 안의 로컬 상태는 초기화되므로 선택 항목 같은 상태는 화면에서 들고 있습니다.

## usePaneLayout

pane 안의 컴포넌트는 창이 아니라 **자기 pane 크기**에 반응해야 합니다.

```tsx
import { usePaneLayout } from '@0610studio/zs-ui';

function DetailHeader() {
  const { widthClass } = usePaneLayout();
  return <Title compact={widthClass === 'compact'} />;
}
```

### 반환값 — `PaneLayout`

| 필드 | Type | 설명 |
|------|------|------|
| `role` | `PaneRole` | `'primary' \| 'secondary' \| 'single'` |
| `width` | `number` | pane 콘텐츠 폭(safe area 제외) |
| `widthClass` | `WindowSizeClassName` | pane 폭의 Material 3 600·840 분류 — 창 크기 클래스를 넘지 않습니다 |
| `height` | `number` | pane 콘텐츠 높이(safe area 제외). 테이블탑 위·아래 pane은 창보다 낮습니다 |
| `heightClass` | `WindowSizeClassName` | pane 높이의 Material 3 480·900 분류 — 창 높이 클래스를 넘지 않습니다 |

`PaneLayout`·`PaneRole` 타입을 내보냅니다. pane 밖에서 쓰면 `usePaneLayout must be used within a ZSPaneLayout pane` 에러를 던집니다.

높이는 테이블탑처럼 pane이 창보다 낮을 때 씁니다. 예: 위 pane이 `compact`면 달력을 주간 한 줄로 둡니다([ZSCalendar](../UiComponent/ZSCalendar)).

## useCanSplitPanes

pane 밖(화면 컴포넌트·아래 버튼 자리 등)에서 "이 창이면 `ZSPaneLayout`이 두 칸으로 나누는가"를 알아야 할 때 씁니다. 위 분할 규칙 3·4와 같은 계산입니다.

```tsx
import { useCanSplitPanes } from '@0610studio/zs-ui';

function MailScreen() {
  // ZSPaneLayout 에 준 spacing·divider 와 같은 값을 넘긴다
  const split = useCanSplitPanes({ spacing: 0 });
  return split ? <ZSPaneLayout spacing={0} primary={<MailList />} secondary={<MailDetail />} /> : <MailList />;
}
```

| 옵션 | Type | Default | 설명 |
|------|------|---------|------|
| `spacing` | `number` | iOS `0` · Android `24` | `ZSPaneLayout spacing`과 같은 값 |
| `divider` | `boolean` | iOS `true` · Android `false` | `ZSPaneLayout divider`가 `true`(hairline)인지 |

- 창 전체를 쓰는 `ZSPaneLayout` 기준입니다(창 폭 − 좌우 safe area − 구분선 − `spacing`). 창의 일부에 둔 `ZSPaneLayout`은 자기 폭으로 판단합니다.
- 책 자세처럼 접힘선으로 나뉘는 경우(분할 규칙 2)는 포함하지 않습니다. 필요하면 [`useDisplayFeatures().fold`](./useDisplayFeatures)를 함께 봅니다.
- [`ZSScreen bottomComponentPlacement`](../UiComponent/ZSScreen#아래-영역-위치)는 안의 `ZSPaneLayout`이 알려 주는 실제 분할을 따르고, 없을 때만 기본 옵션의 이 값을 씁니다.

`CanSplitPanesOptions` 타입을 내보냅니다.

## 관련 문서

- [useDisplayFeatures](./useDisplayFeatures) — 접힘선
- [ZSCalendar](../UiComponent/ZSCalendar) — 캘린더 + 아젠다 2-pane 레시피
- [ZSScreen](../UiComponent/ZSScreen) — 단일 화면의 넓은 창 폭
