# ZSBox

배경을 색 역할로, 그림자를 `shadow` 단계로 지정하는 `View`입니다.

## 기본 사용법

```tsx
import { ZSBox, ZSText } from '@0610studio/zs-ui';

<ZSBox backgroundColor="surface3" style={{ padding: 16, borderRadius: 16, gap: 4 }}>
  <ZSText variant="subtitle1">그룹</ZSText>
  <ZSText variant="subtitle2" color="textSecondary">설명</ZSText>
</ZSBox>
```

## Props — `ZSBoxProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `backgroundColor` | `ColorName \| string` | `undefined` (투명) | 배경 색 역할 또는 직접 지정한 색 |
| `shadow` | `ShadowToken` | `'none'` | 그림자 단계(`'none'`·`'xs'`·`'sm'`·`'md'`·`'lg'`·`'xl'`) |
| `...props` | `ViewProps` | `undefined` | React Native `View` 속성. `style`은 배경·그림자 위에 합쳐집니다 |

`ZSBoxProps` 타입을 내보냅니다.

## 표면 높낮이

높낮이는 그림자보다 `surface1`~`surface5`로 먼저 나타냅니다(M3). 그림자는 툴팁·떠 있는 카드처럼 실제로 떠 있는 요소에만 씁니다. 단계별 높이는 [토큰 — 그림자](../Theme/tokens#그림자--shadow)를 보세요. 모서리·누름·버튼 자리까지 갖춘 카드는 [ZSCard](./ZSCard)를 씁니다.

```tsx
<ZSBox backgroundColor="surface2" style={{ borderRadius: 16, padding: 16 }} />
<ZSBox backgroundColor="surface1" shadow="sm" style={{ borderRadius: 16, padding: 16 }} />
```

## 관련 문서

- [색 역할](../Theme/colors)
- [토큰 — 그림자](../Theme/tokens#그림자--shadow)
- [ZSCard](./ZSCard)
- [ZSPressable](./ZSPressable)
