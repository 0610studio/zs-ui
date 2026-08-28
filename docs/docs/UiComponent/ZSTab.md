---
sidebar_position: 13
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSTab

하단 인디케이터형 탭입니다. 선택된 아이템 아래로 밑줄이 미끄러지며 이동합니다.

트랙 안에서 블록이 움직이는 형태가 필요하면 [ZSSegmented](./ZSSegmented.md)를 사용하세요. 두 컴포넌트는 역할이 다릅니다.

| | ZSTab | ZSSegmented |
|---|-------|-------------|
| 형태 | 하단 밑줄 인디케이터 | 트랙 + 슬라이딩 블록(thumb) |
| 용도 | 화면 내 콘텐츠 전환 (내비게이션 성격) | 값 선택 · 필터 토글 |
| 식별자 | `items` 의 `value` 문자열 | 배열 인덱스 |

<LocalPlayground example="ZSTab" height={720} />

## 기본 사용법

```tsx
import { ZSTab, type ZSTabItem } from '@0610studio/zs-ui';
import { useState } from 'react';

const items: ZSTabItem[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행중' },
  { value: 'done', label: '완료' },
];

function MyScreen() {
  const [tab, setTab] = useState('all');

  return <ZSTab items={items} value={tab} onChange={setTab} />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ZSTabItem[]` | Required | 탭 아이템 목록 |
| `value` | `string` | `undefined` | 선택 값을 외부에서 제어할 때 사용 (미지정 시 내부 상태로 동작) |
| `initialValue` | `string` | 첫 아이템의 `value` | 비제어 모드의 초기 선택 값 |
| `onChange` | `(value: string, index: number) => void` | `undefined` | 탭 선택 시 호출. 이미 선택된 탭을 눌러도 호출되지 않습니다 |
| `layout` | `'fill' \| 'hug'` | `'fill'` | `fill`: 부모 폭을 균등 분할 · `hug`: 라벨 폭에 맞춰 좌측 정렬 |
| `intent` | `IntentOptions` | `'primary'` | 활성 탭의 텍스트·인디케이터 색상 계열 |
| `textSize` | `TypoSubStyle` | `'2'` | 라벨 typo 크기 (`'1'`~`'6'`). 아이템 세로 패딩도 함께 결정됩니다 |
| `indicatorColor` | `string` | `palette[intent][50]` | 인디케이터 색상 직접 지정 |
| `showDivider` | `boolean` | `true` | 탭 하단 구분선 표시 |
| `disabled` | `boolean` | `false` | 전체 비활성화 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

### ZSTabItem

```typescript
interface ZSTabItem {
  value: string;      // 아이템 식별자. onChange 로 되돌려준다
  label: string;
  disabled?: boolean; // 이 탭만 비활성화
}
```

## 특징

- **인디케이터 애니메이션**: 각 탭의 실제 레이아웃을 측정해 폭과 위치를 함께 전환합니다 (250ms, `ease-out`). 최초 배치는 0에서 미끄러져 들어오지 않도록 애니메이션 없이 놓입니다
- **제어·비제어 양쪽 지원**: `value` 를 넘기면 부모가 선택 상태를 소유하고, 넘기지 않으면 내부 상태로 토글합니다
- **접근성**: 컨테이너에 `tablist`, 각 탭에 `tab` 역할과 `accessibilityState.selected` 를 부여합니다
- **아이템 단위 비활성화**: `item.disabled` 로 특정 탭만 막을 수 있습니다

## 레이아웃

### fill (기본값)

부모 폭을 아이템 개수로 균등 분할합니다. 탭 수가 적고 고정된 화면 상단 탭에 적합합니다.

```tsx
<ZSTab items={items} onChange={setTab} />
```

### hug

라벨 폭에 맞춰 좌측부터 배치합니다. 카테고리처럼 항목 수가 유동적일 때 적합합니다.

```tsx
<ZSTab items={items} layout="hug" onChange={setTab} />
```

> `hug` 는 자체 스크롤을 제공하지 않습니다. 아이템이 화면 폭을 넘길 수 있다면 `ScrollView` 로 감싸세요.

## 예제

### 콘텐츠 전환

```tsx
const [tab, setTab] = useState('all');

<ZSTab items={items} value={tab} onChange={setTab} />
{tab === 'all' && <AllList />}
{tab === 'ongoing' && <OngoingList />}
{tab === 'done' && <DoneList />}
```

### intent 변경

```tsx
<ZSTab items={items} intent="danger" onChange={setTab} />
<ZSTab items={items} intent="success" onChange={setTab} />
```

### 특정 탭만 비활성화

```tsx
<ZSTab
  items={[
    { value: 'ready', label: '대기' },
    { value: 'paid', label: '결제완료' },
    { value: 'canceled', label: '취소', disabled: true },
  ]}
  onChange={setTab}
/>
```

### 구분선 없이 · 인디케이터 색상 지정

```tsx
<ZSTab
  items={items}
  showDivider={false}
  indicatorColor="#FF6B6B"
  onChange={setTab}
/>
```

### index 가 필요한 경우

`onChange` 는 두 번째 인자로 인덱스를 함께 전달합니다.

```tsx
<ZSTab
  items={items}
  onChange={(value, index) => {
    console.log(value, index); // 'done', 2
  }}
/>
```
