---
sidebar_position: 5
---

# ZSRadioGroup

여러 개의 라디오 버튼을 그룹으로 묶어 선택할 수 있는 컴포넌트입니다. 옵션은 배열 형태로 전달하며, 선택된 값을 상위 컴포넌트로 전달합니다.

## 기본 사용법

```tsx
import { ZSRadioGroup } from '@0610studio/zs-ui';

const options = [
  { index: 0, value: 'Apple' },
  { index: 1, value: 'Banana' },
];

<ZSRadioGroup
  options={options}
  value={selected}
  onSelect={setSelected}
/>
```

## Props

| 이름 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `options` | `RadioOption[]` | Required | 라디오 버튼 옵션 배열 |
| `value` | `RadioOption` | `undefined` | 현재 선택된 값 |
| `onSelect` | `(value: RadioOption) => void` | Required | 값이 변경될 때 호출되는 함수 |
| `containerStyle` | `ViewProps` | `undefined` | 최상위 컨테이너 스타일 |
| `valueStyle` | `ZSTextProps` | `undefined` | 옵션 텍스트 스타일 |
| `selectStyle` | `ZSTextProps` | `undefined` | fullWidth 모드에서 선택 버튼 텍스트 스타일 |
| `minWidth` | `number` | `undefined` | 각 옵션의 최소 너비 |
| `disabled` | `boolean` | `false` | 전체 비활성화 여부 |
| `fullWidth` | `boolean` | `false` | true이면 세로 배열 형태로 렌더링 |

`fullWidth`가 `true`인 경우, 각 옵션 우측에 선택 버튼이 표시되며 세로 방향으로 배치됩니다.
