---
sidebar_position: 12
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSSegmented

트랙 안에서 선택 블록(thumb)이 미끄러지는 세그먼트 컨트롤입니다. 값 선택·필터 토글에 사용합니다.

콘텐츠를 전환하는 내비게이션 성격이라면 [ZSTab](./ZSTab.md)이 더 적합합니다.

| | ZSSegmented | ZSTab |
|---|-------------|-------|
| 형태 | 트랙 + 슬라이딩 블록 | 하단 밑줄 인디케이터 |
| 용도 | 값 선택 · 필터 토글 | 화면 내 콘텐츠 전환 |
| 식별자 | 배열 **인덱스** | `items` 의 `value` 문자열 |

<LocalPlayground example="ZSSegmented" />

## 기본 사용법

```tsx
import { ZSSegmented } from '@0610studio/zs-ui';
import { useState } from 'react';

function MyControl() {
  const [index, setIndex] = useState(0);

  return (
    <ZSSegmented
      options={['일간', '주간', '월간']}
      selectedIndex={index}
      onChange={setIndex}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `string[]` | Required | 세그먼트 라벨 목록 (2개 이상) |
| `selectedIndex` | `number` | `undefined` | 선택 인덱스를 외부에서 제어할 때 사용 (미지정 시 내부 상태로 동작) |
| `initialIndex` | `number` | `0` | 비제어 모드의 초기 선택 인덱스 |
| `onChange` | `(index: number) => void` | `undefined` | 세그먼트 선택 시 호출. 이미 선택된 세그먼트를 눌러도 호출되지 않습니다 |
| `fullWidth` | `boolean` | `true` | `true`: 부모 폭을 가득 채워 균등 분할 · `false`: 가장 긴 라벨 폭에 맞춤 |
| `containerHeight` | `number` | `40` | 컨트롤 높이(px). 곡률은 높이의 절반으로 자동 계산됩니다 |
| `textSize` | `'1'` ~ `'6'` | `'2'` | 라벨 typo 크기 |
| `trackColor` | `string` | 테마 `background.layer2` | 트랙 배경색 |
| `thumbColor` | `string` | 테마 `background.base` | 선택 블록 색상 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **thumb 슬라이딩**: 선택 블록이 250ms `ease-out` 으로 이동합니다
- **thumb 그림자**: `boxShadow` 로 렌더해 iOS·Android 가 동일하며, 다크 모드에서는 밝은 그림자로 블록을 구분합니다
- **라벨 폭 자동 측정**: `fullWidth={false}` 일 때 활성(굵은) typo 기준으로 폭을 측정해, 선택 전환 시 글자가 넘치지 않습니다
- **말줄임 처리**: 폭을 넘는 라벨은 한 줄 말줄임(…)으로 표시됩니다
- **접근성**: 컨테이너에 `tablist`, 각 세그먼트에 `tab` 역할과 `accessibilityState.selected` 를 부여합니다

## 레이아웃

### fullWidth (기본값)

부모 폭을 세그먼트 개수로 균등 분할합니다.

```tsx
<ZSSegmented options={['일간', '주간', '월간', '연간']} onChange={setIndex} />
```

### `fullWidth={false}`

가장 긴 라벨과 글자 크기에 맞춰 전체 폭이 결정됩니다. 화면 일부에만 놓을 때 사용합니다.

```tsx
<ZSSegmented fullWidth={false} options={['ON', 'OFF']} />
<ZSSegmented fullWidth={false} options={['오늘', '이번 주', '최근 30일']} />
```

## 예제

### 콘텐츠 전환

```tsx
const TABS = ['홈', '검색', '알림'];
const [index, setIndex] = useState(0);

<ZSSegmented options={TABS} onChange={setIndex} />
{index === 0 && <HomeView />}
{index === 1 && <SearchView />}
{index === 2 && <NotificationView />}
```

### 크기 조절

`textSize` 와 `containerHeight` 를 함께 맞추면 비율이 자연스럽습니다.

```tsx
<ZSSegmented options={['왼쪽', '오른쪽']} textSize="1" containerHeight={48} />
<ZSSegmented options={['왼쪽', '오른쪽']} textSize="3" containerHeight={40} />
<ZSSegmented options={['왼쪽', '오른쪽']} textSize="6" containerHeight={32} />
```

### 커스텀 색상

```tsx
<ZSSegmented
  options={['라이트', '다크']}
  trackColor="#EEF2F6"
  thumbColor="#FFFFFF"
/>
```

### 비제어 모드

`selectedIndex` 를 넘기지 않으면 내부 상태로 동작합니다.

```tsx
<ZSSegmented
  options={['최신순', '인기순']}
  initialIndex={1}
  onChange={(index) => refetch(index)}
/>
```
