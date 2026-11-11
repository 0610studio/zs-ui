# ZSChip

목록을 거르는 필터 칩입니다. 하나만 두지 않고 여러 개를 묶어 씁니다. 두 플랫폼 모두 zs-ui가 같은 모양으로 그립니다 — 높이 36의 캡슐이고, 선택하면 앞에 체크 표시가 붙고(`checkIcon`) 라벨이 강조 굵기가 됩니다.

## 기본 사용법

```tsx
import { View } from 'react-native';
import { ZSChip } from '@0610studio/zs-ui';

<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  <ZSChip label="즐겨찾기" selected={favorite} onSelectedChange={setFavorite} />
  <ZSChip label="사진 있음" selected={withPhoto} onSelectedChange={setWithPhoto} />
</View>
```

## Props — `ZSChipProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `label` | `string` | Required | 라벨 |
| `selected` | `boolean` | `undefined` | 선택 여부(제어) |
| `defaultSelected` | `boolean` | `false` | 비제어 초기값 |
| `onSelectedChange` | `(selected: boolean) => void` | `undefined` | 바뀐 선택 |
| `color` | `PaletteColor` | `'primary'` | 선택 면 색. 고르면 이 색 main 면에 on 색 글자·체크 |
| `checkIcon` | `boolean` | `true` | 선택 시 앞에 체크 표시 |
| `icon` | `ReactNode` | `undefined` | 앞 아이콘 — 선택되어 체크가 보이면 체크가 대신합니다. `false`·`''`도 아이콘 없음으로 봅니다(`icon={cond && <Icon />}`) |
| `disabled` | `boolean` | `false` | |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | |

`ZSChipProps` 타입을 내보냅니다.

## 제어·비제어

`selected`를 주지 않으면 비제어로 토글하고, 처음 값은 `defaultSelected`(기본 `false`)입니다.

```tsx
<ZSChip label="이번 주" defaultSelected onSelectedChange={(selected) => track(selected)} />
```

## 색

| 상태 | 컨테이너 | 글자·아이콘 | 외곽선 |
|------|---------|-----------|-------|
| 선택 안 됨 | `surface2` | `text` | `border` 1 |
| 선택 | `color` main(`primary`) | `color` on(`onPrimary`), 강조 굵기 | 없음(두께 1은 투명으로 남아 크기가 바뀌지 않습니다) |
| 비활성 | 선택이면 `text` 12%, 아니면 `surface2` | `text` 38% | 선택 안 됨이면 `text` 12% |

밝은 시드의 `primary` 면은 바탕과 대비가 낮습니다. 선택은 면 색 말고 체크와 굵기로도 드러납니다.

```tsx
<ZSChip label="오류만" color="error" defaultSelected />
<ZSChip label="체크 없이" checkIcon={false} defaultSelected />
```

## 선택 전환

`checkIcon`이 `true`일 때의 움직임입니다.

- 면 색은 바로 바뀝니다(섞인 중간색이 보이지 않습니다).
- 앞 아이콘이 없으면 선택할 때 체크 자리가 열리며 칩 폭이 늘고, 체크는 페이드·확대로 들어옵니다. 폭 변화는 move spring([모션 토큰](../Theme/tokens#모션--spring--timing))이라 줄바꿈된 칩 행도 튀지 않고 함께 움직입니다.
- 앞 아이콘이 있으면 폭은 그대로이고 아이콘과 체크가 같은 자리에서 맞바뀝니다.

## 접근성

`checkbox` 역할과 `checked` 상태를 알립니다. 라벨은 한 줄이고 글자 확대는 1.6배와 [앱 상한](../Theme/typography#앱-전체-상한--maxfontsizemultiplier) 중 작은 쪽까지입니다. 큰 글자에서는 칩 높이가 늘어나고, 터치 영역은 44pt·48dp를 채웁니다.

## 관련 문서

- [ZSSegmentedControl](./ZSSegmentedControl) — 하나만 고르는 보기 전환
- [ZSButton](./ZSButton)
