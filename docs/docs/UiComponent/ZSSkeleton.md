# ZSSkeleton

콘텐츠를 불러오는 동안 자리를 유지하고 광택 효과를 표시합니다.

| 컴포넌트 | 용도 |
|----------|------|
| `ZSSkeleton` | 실제 콘텐츠를 감싸 `loading` 동안 흐리게 두고 광택을 덮습니다 |
| `ZSSkeleton.Box` | 고정 높이의 자리 표시 상자 — 광택이 지나갑니다(원 자리는 면만) |

## 기본 사용법

```tsx
import { View } from 'react-native';
import { ZSSkeleton, ZSText } from '@0610studio/zs-ui';

<ZSSkeleton loading={isFetching}>
  <ZSText variant="h4" emphasized>{profile?.name ?? '이름'}</ZSText>
  <ZSText color="textSecondary">{profile?.bio ?? '소개 문구가 들어갑니다'}</ZSText>
</ZSSkeleton>

<View style={{ gap: 12 }}>
  <ZSSkeleton.Box height={180} radius="lg" />
  <ZSSkeleton.Box height={20} style={{ width: '60%' }} />
  <ZSSkeleton.Box height={48} radius="full" style={{ width: 48 }} />
</View>
```

- `ZSSkeleton`은 `loading`이 `false`면 `children`만 그립니다. `true`면 `children`을 50% 불투명도로 두고 그 위에 광택을 덮습니다.
- 두 컴포넌트 모두 폭은 부모 폭입니다.

## Props — `ZSSkeletonProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `loading` | `boolean` | `true` | `true`면 흐리게 + 광택, `false`면 `children`만 |
| `shimmerColor` | `string` | 라이트 `colors.background` · 다크 `colors.text` | 광택 색 |
| `shimmerOpacity` | `number` | `0.6` | 광택 띠 중심 불투명도(0~1). `shimmerColor`가 hex(`#RRGGBB`)일 때 적용됩니다 |
| `duration` | `number` | `1100` | 한 번 지나가는 시간(ms). iOS 동작 줄이기에서는 맥박이 한 번 밝아지는 시간 |
| `...props` | `ViewProps` | `undefined` | `style`·`children` 등 |

## Props — `ZSSkeletonBoxProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `height` | `number` | Required | 높이 |
| `backgroundColor` | `ColorName \| string` | `'surface4'` | 자리 표시 색 |
| `radius` | `RadiusToken` | `'sm'` | 모서리. `'full'`이고 `style.width`가 `height`와 같으면(아이콘·아바타 같은 원 자리) 광택 없이 면만 그립니다 |
| `shimmerColor` | `string` | 라이트 `colors.surface2` · 다크 자리 색(기본 `surface4`)을 `text` 쪽으로 12% 밝힌 색 | 광택 색 |
| `shimmerOpacity` | `number` | `0.7` | 광택 띠 중심 불투명도(0~1). `shimmerColor`가 hex(`#RRGGBB`)일 때 적용됩니다 |
| `duration` | `number` | `1100` | 한 번 지나가는 시간(ms). iOS 동작 줄이기에서는 맥박이 한 번 밝아지는 시간 |
| `...props` | `ViewProps` | `undefined` | `style` 등 |

`ZSSkeletonProps`·`ZSSkeletonBoxProps` 타입을 내보냅니다.

## 광택 모양

`ZSSkeleton`의 광택은 안쪽 `ZSText`의 글자 줄 모양으로만 지나가므로 글자 끝 너머 빈 자리에 띠가 생기지 않습니다.

| 안쪽 내용 | 광택 |
|-----------|------|
| `ZSText` | 글자 줄 모양으로 자름 |
| `ZSText`가 없음(React Native `Text`·이미지·View) | 감싼 영역 전체 |
| `ZSText`와 다른 내용이 섞임 | 글자 줄에만 — 이미지 같은 다른 내용은 흐리게만 둡니다. 따로 광택이 필요하면 `ZSSkeleton`을 나누거나 `ZSSkeleton.Box`로 자리를 잡으세요 |

버튼 라벨처럼 다른 zs-ui 컴포넌트 안의 `ZSText`도 줄 모양으로 셉니다.

## 접근성

- `loading` 동안 `busy` 상태를 알립니다.
- 시스템 '동작 줄이기'가 켜져 있으면 광택 띠가 지나가지 않습니다(HIG Accessibility).

| | iOS | Android |
|---|-----|---------|
| 동작 줄이기 | 띠가 지나가는 대신 광택 자리([광택 모양](#광택-모양)) 전체가 `duration`에 걸쳐 느리게 밝아졌다 같은 시간에 돌아옵니다(이동 없는 불투명도 맥박) | 광택 없이 멈춘 자리 표시만 둡니다('애니메이션 삭제'를 따릅니다) |

## 관련 문서

- [Loader](../OverlayComponent/Loader) — 화면을 막는 진행 표시
- [토큰](../Theme/tokens) — `RADIUS`
