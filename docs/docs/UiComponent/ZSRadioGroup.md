# ZSRadioGroup

여러 선택지 중 하나만 고르는 목록입니다. 선택지가 화면에 모두 보여야 할 때 씁니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS·Android | SVG 컨트롤입니다. 라벨을 포함한 줄 전체가 선택 영역입니다. |

라디오는 [ZSCheckbox](./ZSCheckbox)와 같은 톤입니다. 고르면 채움 강조라 `primary`로 채운 원 + 흰 점, 안 고르면 `textSecondary` 링(지름 20, 링 2)이고, 비활성은 흐린 `text`입니다. 고른 줄 라벨은 강조 굵기라 색 말고 굵기로도 드러납니다.

줄은 좌우 여백 없이 부모 내용선에 맞고, 최소 높이(iOS 44pt·Android 56dp)가 라벨 있는 [ZSCheckbox](./ZSCheckbox)·[ZSSwitch](./ZSSwitch) 줄과 같아 한 목록에 섞어도 줄이 맞습니다. 큰 글자로 라벨이 여러 줄이 되면 줄이 늘어납니다. 한 칸 줄(`columns` 1)은 줄 사이에 `border` 구분선이 있습니다.

## 기본 사용법

```tsx
import { useState } from 'react';
import { ZSRadioGroup, type ZSRadioOption } from '@0610studio/zs-ui';

const OPTIONS: ZSRadioOption[] = [
  { value: 'email', label: '이메일로 받기' },
  { value: 'sms', label: '문자로 받기' },
  { value: 'none', label: '받지 않기' },
];

function ResponseType() {
  const [type, setType] = useState('email');
  return <ZSRadioGroup options={OPTIONS} value={type} onValueChange={setType} />;
}
```

보통은 하나가 선택된 상태로 씁니다(M3). 필수 선택을 따로 검증하는 폼이면 `value`·`defaultValue`에 `null`을 줘 아무것도 고르지 않은 채 시작합니다. 선택지가 5개를 넘으면 [ZSSelect](./ZSSelect)를 씁니다.

### 가로 격자 — `columns`

성별·예/아니오처럼 짧은 선택지는 `columns`로 한 줄에 나란히 둡니다. 칸은 같은 폭이고 줄 사이 구분선은 없습니다.

```tsx
<ZSRadioGroup options={[{ value: 'male', label: '남아' }, { value: 'female', label: '여아' }]} columns={2} defaultValue={null} onValueChange={setGender} />
```

## Props — `ZSRadioGroupProps<T>`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `options` | `ZSRadioOption<T>[]` | Required | 선택지 |
| `value` | `T \| null` | `undefined` | 선택한 `value`(제어). `null`이면 아무것도 고르지 않은 상태 |
| `defaultValue` | `T \| null` | 첫 선택지 | 비제어 초기값. `null`이면 고르지 않은 채 시작 |
| `onValueChange` | `(value: T, index: number) => void` | `undefined` | 고른 선택지의 `value`와 `options` 안 위치 |
| `disabled` | `boolean` | `false` | 전체 비활성 |
| `columns` | `number` | `1` | 한 줄에 놓을 선택지 수 — 2 이상이면 같은 폭 칸의 가로 격자 |
| `accessibilityLabel` | `string` | `undefined` | 그룹 이름(무엇을 고르는지, 예: `'결제 수단'`) |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | 항목에는 `${testID}-${value}`가 붙습니다 |

### `ZSRadioOption<T>`

| 필드 | Type | 설명 |
|------|------|------|
| `value` | `T` | `onValueChange`로 돌려주는 식별자 |
| `label` | `string` | 보이는 문구 |
| `disabled` | `boolean` | 이 항목만 비활성 |
| `accessibilityLabel` | `string` | 스크린 리더 이름. 기본 `label` |
| `accessibilityHint` | `string` | 스크린 리더 힌트 |

`T`는 `string`·`number`입니다(기본 `string`). `ZSRadioGroupProps`·`ZSRadioOption` 타입을 내보냅니다.

```tsx
const MINUTES: ZSRadioOption<number>[] = [
  { value: 10, label: '10분 전' },
  { value: 30, label: '30분 전' },
  { value: 60, label: '1시간 전' },
];

const [minutes, setMinutes] = useState(10);
<ZSRadioGroup options={MINUTES} value={minutes} onValueChange={setMinutes} />
```

## 제어·비제어

`value`를 주지 않으면 비제어이고, 처음 선택은 `defaultValue`(없으면 첫 선택지)입니다.

```tsx
<ZSRadioGroup options={OPTIONS} defaultValue="sms" onValueChange={(value) => save(value)} />
```

## 접근성

```tsx
const PAYMENTS: ZSRadioOption[] = [
  { value: 'card', label: '카드', accessibilityHint: '다음 화면에서 카드를 고릅니다' },
  { value: 'phone', label: '휴대폰', accessibilityLabel: '휴대폰 소액결제' },
];

<ZSRadioGroup options={PAYMENTS} accessibilityLabel="결제 수단" value={method} onValueChange={setMethod} />
```

| | iOS (VoiceOver) | Android (TalkBack) |
|---|-----|---------|
| 선택지 | 줄마다 라디오 역할, 이름, 선택 상태 | 줄 전체가 라디오 하나 — 이름, 선택 상태 |
| 그룹 이름 | `accessibilityLabel` | `accessibilityLabel` |
| `accessibilityHint` | 이름·상태 다음에 읽습니다 | 이름·상태 다음에 읽습니다 |
| 비활성 선택지 | 비활성으로 읽습니다 | 비활성으로 읽습니다 |

그룹 이름을 언제 읽는지는 플랫폼마다 다릅니다. 선택지 이름만으로 뜻이 통하게 쓰고, 화면에도 그룹 제목을 두는 편이 좋습니다.

## 관련 문서

- [ZSSelect](./ZSSelect) — 선택지가 많을 때
- [ZSSegmentedControl](./ZSSegmentedControl) — 보기 전환
