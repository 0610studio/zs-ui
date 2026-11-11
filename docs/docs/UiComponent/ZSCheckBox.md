# ZSCheckbox

여러 항목을 고르거나 약관에 동의할 때 쓰는 체크 선택입니다. 두 플랫폼 모두 네모 체크박스입니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS·Android | SVG 컨트롤입니다. 라벨을 포함한 줄 전체가 선택 영역입니다. |

켠 상태는 채움 강조라 두 플랫폼 모두 `primary` 칸 + 흰 체크이고, 끈 상태는 `textSecondary` 테두리입니다.

`label`이 있으면 부모 폭을 채우는 한 줄(iOS 44pt·Android 56dp)이고, [ZSRadioGroup](./ZSRadioGroup)·[ZSSwitch](./ZSSwitch) 행과 높이가 같아 `gap` 없이 쌓으면 됩니다.

## 기본 사용법

```tsx
import { useState } from 'react';
import { ZSCheckbox } from '@0610studio/zs-ui';

function Agreements() {
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  return (
    <>
      <ZSCheckbox label="이용약관 동의 (필수)" value={terms} onValueChange={setTerms} />
      <ZSCheckbox label="마케팅 수신 동의 (선택)" value={marketing} onValueChange={setMarketing} />
    </>
  );
}
```

## Props — `ZSCheckboxProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `value` | `boolean` | `undefined` | 선택 여부(제어) |
| `defaultValue` | `boolean` | `false` | 비제어 초기값 |
| `onValueChange` | `(value: boolean) => void` | `undefined` | 바뀐 값 |
| `label` | `string` | `undefined` | 라벨. 없으면 컨트롤 크기만 차지합니다 |
| `disabled` | `boolean` | `false` | |
| `accessibilityLabel` | `string` | `label` | 스크린 리더가 읽는 이름. 라벨 없이 쓰면 꼭 줍니다 |
| `accessibilityHint` | `string` | `undefined` | 스크린 리더 힌트 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | |

`ZSCheckboxProps` 타입을 내보냅니다.

## 제어·비제어

`value`를 주지 않으면 비제어이고, 처음 값은 `defaultValue`(기본 `false`)입니다.

```tsx
<ZSCheckbox label="로그인 상태 유지" defaultValue onValueChange={(checked) => saveKeepSignedIn(checked)} />
```

## 접근성

라벨 없이 쓰면(표 머리의 전체 선택 등) `accessibilityLabel`을 꼭 주세요. 둘 다 없으면 개발 모드에서 경고합니다.

```tsx
<ZSCheckbox accessibilityLabel="전체 선택" value={allChecked} onValueChange={toggleAll} />
```

| | iOS (VoiceOver) | Android (TalkBack) |
|---|-----|---------|
| 읽는 것 | 이름, 체크 상태, 체크박스 | 체크 상태, 이름, 체크박스 |
| 포커스 | 라벨이 있으면 줄 전체가 한 번 | 라벨이 있으면 줄 전체가 한 번 |
| `accessibilityHint` | 이름·값 다음에 읽습니다 | 이름·값 다음에 읽습니다 |

## 관련 문서

- [ZSSwitch](./ZSSwitch)
- [ZSRadioGroup](./ZSRadioGroup)
