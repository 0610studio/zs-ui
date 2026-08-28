---
sidebar_position: 11
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSChip

선택 상태를 토글하는 칩 컴포넌트입니다. 필터·태그 선택에 사용합니다.

콘텐츠 폭으로 렌더링(hug)되므로 `flexWrap` 부모 안에 여러 개를 나열하면 자동으로 줄바꿈됩니다.

<LocalPlayground example="ZSChip" />

## 기본 사용법

```tsx
import { ZSChip } from '@0610studio/zs-ui';
import { useState } from 'react';

function MyFilter() {
  const [selected, setSelected] = useState(false);

  return (
    <ZSChip
      label="산책"
      selected={selected}
      onChange={setSelected}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | Required | 칩 라벨 |
| `selected` | `boolean` | `undefined` | 선택 상태를 외부에서 제어할 때 사용 (미지정 시 내부 상태로 토글) |
| `initialSelected` | `boolean` | `false` | 비제어 모드의 초기 선택 상태 |
| `onChange` | `(selected: boolean) => void` | `undefined` | 토글 시 다음 선택 상태를 전달 |
| `intent` | `IntentOptions` | `'primary'` | 선택 상태의 색상 계열 |
| `variant` | `'pastel' \| 'solid' \| 'stroke'` | `'pastel'` | 선택 상태의 스타일 |
| `textSize` | `TypoSubStyle` | `'3'` | 라벨 typo 크기 (`'1'`~`'6'`). 패딩과 체크 아이콘 크기도 함께 결정됩니다 |
| `checkIcon` | `boolean` | `false` | `true`면 선택 시 라벨 앞에 체크 아이콘 표시 |
| `leftIcon` | `React.ReactNode` | `undefined` | 라벨 왼쪽 커스텀 요소 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 칩 본체 추가 스타일 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## Variant

선택 상태일 때의 표현만 달라집니다. **미선택 상태는 세 variant 모두 동일**하게 흰 배경 + 회색 테두리입니다.

| Variant | 선택 시 배경 | 선택 시 테두리 | 선택 시 텍스트 |
|---------|-------------|---------------|---------------|
| `pastel` (기본) | `intent.10` | `intent.30` | `intent.60` |
| `solid` | `intent.50` | `intent.50` | 흰색 (`warning` 만 검정) |
| `stroke` | 배경 없음 | `intent.50` | `intent.50` |

```tsx
<ZSChip label="pastel" variant="pastel" initialSelected />
<ZSChip label="solid" variant="solid" initialSelected />
<ZSChip label="stroke" variant="stroke" initialSelected />
```

## 특징

- **색상 전환 애니메이션**: 배경·테두리 색이 200ms 동안 보간되며 전환됩니다
- **press 피드백**: 누르는 동안 0.96배로 살짝 축소됩니다
- **hug 레이아웃**: 콘텐츠 폭으로 렌더링되어 `flexWrap` 부모에서 자연스럽게 줄바꿈됩니다
- **pill 형태**: 좌우가 완전히 둥근 형태로 고정입니다
- **접근성**: `button` 역할과 `accessibilityState.selected` 를 부여합니다

## 예제

### 다중 선택 필터

```tsx
const OPTIONS = ['산책', '간식', '돌봄', '병원'];
const [selected, setSelected] = useState<string[]>([]);

<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {OPTIONS.map((option) => (
    <ZSChip
      key={option}
      label={option}
      selected={selected.includes(option)}
      onChange={(next) =>
        setSelected(next ? [...selected, option] : selected.filter((v) => v !== option))
      }
      checkIcon
    />
  ))}
</View>
```

### 단일 선택 (라디오처럼)

```tsx
const [selected, setSelected] = useState('전체');

<View style={{ flexDirection: 'row', gap: 8 }}>
  {['전체', '진행중', '완료'].map((option) => (
    <ZSChip
      key={option}
      label={option}
      selected={selected === option}
      onChange={() => setSelected(option)}
      variant="solid"
    />
  ))}
</View>
```

> 값 하나를 고르는 세그먼트 형태가 더 맞다면 [ZSSegmented](./ZSSegmented.md)를, 콘텐츠를 전환하는 탭이라면 [ZSTab](./ZSTab.md)을 고려하세요.

### intent 별 표현

```tsx
<ZSChip label="기본" intent="primary" initialSelected />
<ZSChip label="위험" intent="danger" initialSelected />
<ZSChip label="완료" intent="success" initialSelected />
<ZSChip label="주의" intent="warning" initialSelected />
```

### 아이콘과 함께

```tsx
{/* 선택 시 체크 아이콘 자동 표시 */}
<ZSChip label="필터 적용" checkIcon selected={selected} onChange={setSelected} />

{/* 항상 표시되는 커스텀 아이콘 */}
<ZSChip
  label="위치"
  leftIcon={<MyPinIcon size={14} />}
  selected={selected}
  onChange={setSelected}
/>
```

### 크기 변경

```tsx
<ZSChip label="큰 칩" textSize="1" />
<ZSChip label="기본" textSize="3" />
<ZSChip label="작은 칩" textSize="6" />
```
