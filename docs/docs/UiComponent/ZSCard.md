# ZSCard

한 대상에 관한 내용과 동작을 한 면에 묶는 카드입니다. 두 플랫폼 모두 zs-ui가 그리고, 그림자는 iOS·Android가 같은 `boxShadow` 값을 씁니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS | 연속 곡률 모서리. 누르면 하이라이트 |
| Android | 원형 모서리. 누르면 ripple |

## 기본 사용법

```tsx
import { ZSCard, ZSText } from '@0610studio/zs-ui';

<ZSCard contentStyle={{ gap: 4 }}>
  <ZSText variant="subtitle1" emphasized>치즈</ZSText>
  <ZSText variant="body2" color="textSecondary">고양이 · 3살</ZSText>
</ZSCard>
```

`onPress`를 주면 카드가 버튼 하나가 됩니다. 버튼을 함께 둘 때는 [누를 수 있는 카드와 버튼](#누를-수-있는-카드와-버튼)을 보세요.

```tsx
<ZSCard onPress={() => router.push('/friends/cheese')} contentStyle={{ gap: 4 }}>
  <ZSText variant="subtitle1" emphasized>치즈</ZSText>
  <ZSText variant="body2" color="textSecondary">고양이 · 3살</ZSText>
</ZSCard>
```

## Props — `ZSCardProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `ReactNode` | `undefined` | 카드 내용. `onPress`가 있으면 이 영역이 누름 영역입니다 |
| `variant` | `ZSCardVariant` | `'elevated'` | `'elevated'`·`'filled'`·`'outlined'` — [변형 고르기](#변형-고르기) |
| `onPress` | `() => void` | `undefined` | 있으면 내용 영역 전체가 버튼 하나입니다 |
| `onLongPress` | `() => void` | `undefined` | 길게 누르기. 이것만 줘도 누를 수 있는 카드입니다 |
| `actions` | `ReactNode` | `undefined` | 카드 아래 버튼 줄 — 누름 영역 밖에 그립니다. 오른쪽 정렬, 간격 8 |
| `cornerAction` | `ReactNode` | `undefined` | 오른쪽 위 모서리 동작(아이콘 버튼 하나) — 누름 영역 위에 겹쳐 그립니다 |
| `disabled` | `boolean` | `false` | 카드 누름을 막고 그림자까지 카드 전체를 흐리게 합니다(`OPACITY.disabledView`). `actions`·`cornerAction`도 눌리지 않습니다 |
| `radius` | `RadiusToken` | `'lg'` | 모서리 반경(16) |
| `backgroundColor` | `ColorName \| string` | `undefined` | 면 색. 미지정이면 `variant`의 면 색입니다 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 카드 겉 — 크기·바깥 여백·배치 |
| `contentStyle` | `StyleProp<ViewStyle>` | `undefined` | 카드 안 — `padding`(기본 16)·`gap`·`flexDirection` |
| `accessibilityLabel` | `string` | `undefined` | 누를 수 있는 카드의 스크린 리더 이름. 미지정이면 안쪽 글자를 이어 읽습니다 |
| `accessibilityHint` | `string` | `undefined` | 누를 수 있는 카드의 스크린 리더 힌트 |
| `testID` | `string` | `undefined` | 카드 겉 View |

`ZSCardProps`·`ZSCardVariant` 타입을 내보냅니다.

## 변형 고르기

| `variant` | 면 | 테두리 | 그림자 | 쓰는 곳 |
|-----------|----|--------|--------|---------|
| `elevated` | 라이트 `surface1`, 다크 `surface3` | 없음 | [`sm`](../Theme/tokens#그림자--shadow) | 화면에서 따로 눈에 띄어야 하는 묶음 |
| `filled` | `surface2` | 없음 | 없음 | 요약 숫자·설정처럼 그림자 없이 차분하게 묶을 때. 묶음 목록·칩과 같은 회색 면입니다 |
| `outlined` | `background` | `border` 1 | 없음 | 카드가 여러 장 이어지는 목록·격자. 가장 가볍습니다 |

## 누를 수 있는 카드와 버튼

`onPress`를 주면 내용(`children`) 영역 전체가 버튼 하나가 됩니다. 누르는 동안 그림자는 그대로이고, 누름 표시·연타 방지·최소 터치 영역은 [`ZSPressable`](./ZSPressable)과 같습니다.

```tsx
<ZSCard onPress={openFriend} accessibilityHint="친구 소개를 엽니다">
  <ZSText variant="subtitle1" emphasized>보리</ZSText>
</ZSCard>
```

누를 수 있는 카드에 버튼을 함께 둘 때는 `children` 안이 아니라 `actions`(아래 버튼 줄)·`cornerAction`(오른쪽 위 모서리)에 넣습니다. 두 자리는 누름 영역 밖이라 버튼을 눌러도 카드가 눌리지 않고, 스크린 리더는 카드와 버튼을 따로 읽습니다.

```tsx
<ZSCard
  onPress={openDetail}
  actions={
    <>
      <ZSButton title="공유" variant="text" onPress={share} />
      <ZSButton title="신청하기" variant="tonal" onPress={apply} />
    </>
  }
>
  <ZSText variant="subtitle1" emphasized>보호소 산책 봉사</ZSText>
</ZSCard>
```

누를 수 없는 카드는 버튼·스위치를 `children`에 둘 수 있습니다. `disabled`면 카드와 부가 동작이 모두 눌리지 않습니다. 안쪽 버튼의 스크린 리더 상태도 비활성으로 알리려면 각 버튼에도 `disabled`를 줍니다.

## 배치와 여백

`style`은 바깥 크기·배치, `contentStyle`은 안쪽 여백·간격에 적용합니다. 이미지를 가장자리까지 채우려면 `contentStyle={{ padding: 0 }}`을 줍니다. 콘텐츠는 카드 모서리에서 잘리고 그림자는 바깥에 그립니다.

## iOS·Android 차이

| | iOS | Android |
|---|---|---|
| 그림자 | `boxShadow` `sm` | iOS와 같은 `boxShadow` `sm`. Android 8.1(API 27) 이하는 `boxShadow`를 그리지 않아 같은 높이의 `elevation`으로 대신합니다 |
| 모서리 | 연속 곡률(`borderCurve: 'continuous'`) | 원형 곡률 |
| 누름 표시 | 하이라이트(`text` 10%) | ripple(`text` 10%) |

## 접근성

누를 수 있는 카드는 `button` 역할로 묶입니다. `accessibilityLabel`을 생략하면 안쪽 글자를 이어 읽습니다. `actions`·`cornerAction`은 별도로 읽으며, 아이콘 버튼에는 접근성 이름을 지정합니다. 누를 수 없는 카드는 안쪽 요소를 하나씩 읽습니다.

## 관련 문서

- [ZSBox](./ZSBox) — 카드 모양 없이 배경·그림자만 줄 때
- [ZSPressable](./ZSPressable) — 누름 표시·최소 터치 영역
- [토큰 — 그림자](../Theme/tokens#그림자--shadow)
- [색 역할](../Theme/colors)
