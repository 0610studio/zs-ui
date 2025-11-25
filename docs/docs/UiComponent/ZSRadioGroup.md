---
sidebar_position: 5
---

# ZSRadioGroup

여러 개의 라디오 버튼을 그룹으로 묶어 선택할 수 있는 컴포넌트입니다. 옵션은 배열 형태로 전달하며, 선택된 값을 상위 컴포넌트로 전달합니다.

## 기본 사용법

```tsx
import { ZSRadioGroup, RadioOption } from '@0610studio/zs-ui';
import { useState } from 'react';

const options: RadioOption[] = [
  { index: '0', value: 'Apple' },
  { index: '1', value: 'Banana' },
  { index: '2', value: 'Orange' },
];

function MyComponent() {
  const [selected, setSelected] = useState<RadioOption | undefined>();

  return (
    <ZSRadioGroup
      options={options}
      value={selected}
      onSelect={setSelected}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `RadioOption[]` | Required | 라디오 버튼 옵션 배열 |
| `value` | `RadioOption` | `undefined` | 현재 선택된 값 |
| `onSelect` | `(value: RadioOption) => void` | Required | 값이 변경될 때 호출되는 함수 |
| `containerStyle` | `ViewProps` | `undefined` | 최상위 컨테이너 스타일 |
| `valueStyle` | `ZSTextProps` | `undefined` | 옵션 텍스트 스타일 |
| `selectStyle` | `ZSTextProps` | `undefined` | fullWidth 모드에서 선택 버튼 텍스트 스타일 |
| `disabled` | `boolean` | `false` | 전체 비활성화 여부 |
| `rowCount` | `1 \| 2 \| 3` | `1` | 한 행에 표시할 옵션 개수 |

## 특징

- **다양한 레이아웃**: 세로 배열과 그리드 레이아웃 지원
- **시각적 피드백**: 선택된 옵션에 대한 명확한 시각적 표시
- **접근성**: 비활성화 상태 지원 및 키보드 네비게이션 가능
- **커스터마이징**: 텍스트 스타일과 컨테이너 스타일을 자유롭게 설정 가능

## RadioOption 타입

```typescript
interface RadioOption {
  value: string;
  index: string;
}
```

## 레이아웃 모드

### rowCount = 1 (기본값)

전체 너비를 차지하는 세로 배열 형태로 렌더링됩니다. 각 옵션 우측에 선택 버튼이 표시됩니다.

```tsx
<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
  rowCount={1}
/>
```

### rowCount = 2 또는 3

한 행에 여러 옵션을 표시하는 그리드 형태로 렌더링됩니다. 각 옵션 좌측에 원형 체크박스가 표시됩니다.

```tsx
<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
  rowCount={2}
/>
```

## 예제

### 기본 사용 (세로 배열)

```tsx
const options: RadioOption[] = [
  { index: '0', value: '옵션 1' },
  { index: '1', value: '옵션 2' },
  { index: '2', value: '옵션 3' },
];

<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
/>
```

### 그리드 레이아웃 (2열)

```tsx
<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
  rowCount={2}
/>
```

### 그리드 레이아웃 (3열)

```tsx
<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
  rowCount={3}
/>
```

### 커스텀 텍스트 스타일

```tsx
<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
  valueStyle={{ typo: 'body.1', color: 'primary' }}
  selectStyle={{ typo: 'caption.1', color: 'white' }}
/>
```

### 비활성화 상태

```tsx
<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
  disabled={true}
/>
```

### 컨테이너 스타일 커스터마이징

```tsx
<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
  containerStyle={{
    padding: 20,
    backgroundColor: '#f5f5f5',
  }}
/>
```
