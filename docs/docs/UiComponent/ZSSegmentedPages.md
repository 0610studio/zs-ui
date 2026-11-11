# ZSSegmentedPages

[ZSSegmentedControl](./ZSSegmentedControl)로 고른 하위 보기를 페이지처럼 가로로 넘겨 보여 주는 콘텐츠 영역입니다. 세그먼트를 탭처럼 쓸 때 컨트롤 아래에 둡니다.

## 기본 사용법

```tsx
import { ScrollView } from 'react-native';
import { ZSSegmentedControl, ZSSegmentedPages, type ZSSegmentedControlOption } from '@0610studio/zs-ui';

const PERIODS: ZSSegmentedControlOption[] = [
  { label: '일간', value: 'day' },
  { label: '주간', value: 'week' },
  { label: '월간', value: 'month' },
];

const [period, setPeriod] = useState('day');

<View style={{ flex: 1 }}>
  <ZSSegmentedControl options={PERIODS} value={period} onValueChange={setPeriod} />
  <ZSSegmentedPages
    options={PERIODS}
    value={period}
    onValueChange={setPeriod}
    swipeEnabled
    renderPage={(page) => (
      <ScrollView>
        <PeriodCards period={page} />
      </ScrollView>
    )}
  />
</View>
```

같은 `options` 배열을 컨트롤과 함께 넘기면 됩니다(`value`만 씁니다).

## Props — `ZSSegmentedPagesProps<T>`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `options` | `{ value: T }[]` | Required | 페이지 순서. 컨트롤의 `options`를 그대로 줍니다 |
| `value` | `T` | Required | 보여 줄 페이지(제어) |
| `renderPage` | `(value: T, index: number) => ReactNode` | Required | 페이지 내용 |
| `onValueChange` | `(value: T, index: number) => void` | `undefined` | 스와이프로 페이지를 넘겼을 때. 컨트롤과 같은 setter를 줍니다 |
| `swipeEnabled` | `boolean` | `false` | 좌우로 밀어 이웃 페이지로 넘기기 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | 페이지마다 `{testID}-page-{value}` |

`ZSSegmentedPagesProps` 타입을 내보냅니다.

## 동작

- `value`가 바뀌면 고른 쪽 방향으로 한 페이지씩 가로로 넘어갑니다(모션 토큰 `move` spring). 시스템 '동작 줄이기'가 켜져 있으면 움직임 없이 바로 바뀝니다.
- 처음 자리를 잡을 때와 폭이 바뀔 때(회전·접기·펼치기)는 움직이지 않고 그 자리에 둡니다.
- 오른쪽에서 왼쪽으로 읽는 언어는 방향이 반대입니다.
- 한 번 연 페이지는 붙여 둡니다. 다시 돌아오면 스크롤 위치·입력이 그대로입니다. 열지 않은 페이지는 그리지 않습니다.
- 지금 페이지만 누를 수 있고 스크린 리더에 보입니다.
- 컨테이너는 부모 높이를 채우고(`flex: 1`) 페이지도 그 높이입니다. 길어지는 내용은 페이지 안에 `ScrollView`를 둡니다.

## 스와이프

`swipeEnabled`를 켜면 좌우로 밀어 이웃 페이지로 넘깁니다. iOS HIG의 세그먼트 컨트롤은 스와이프를 쓰지 않으므로 기본은 꺼져 있습니다.

- 가로로 12 이상 움직여야 시작하고, 세로로 16 넘게 움직이면 세로 스크롤에 양보합니다.
- 폭의 28% 넘게 밀거나 빠르게 튕기면(500/s) 넘어갑니다. 첫·끝 페이지 밖으로는 저항이 걸리고 넘어가지 않습니다.
- 넘기면 `onValueChange`를 부릅니다. 부모가 `value`를 바꾸지 않으면 원래 페이지로 돌아갑니다.
- 스와이프 영역은 컴포넌트가 `GestureHandlerRootView`로 직접 감쌉니다. 앱 루트에 따로 두지 않아도 됩니다.
- 페이지 안에 가로로 끄는 내용(가로 스크롤, 슬라이더)이 있으면 제스처가 겹치니 켜지 마세요.

## 관련 문서

- [ZSSegmentedControl](./ZSSegmentedControl)
