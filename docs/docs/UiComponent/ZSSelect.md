# ZSSelect

목록에서 값 하나를 고르는 선택 컨트롤입니다. 누르는 칸은 두 플랫폼 모두 [ZSTextField](./ZSTextField)와 같은 모양(테두리·떠오르는 라벨·글꼴·모서리 16)이고, 열리는 메뉴는 플랫폼 메뉴입니다.

| 플랫폼 | 메뉴 |
|--------|------|
| iOS | UIKit 시스템 메뉴(`UIMenu`) — 고른 항목에 체크. 칸 아래 가장자리에서 펼쳐지고 그 자리로 접혀, 열고 닫는 동안 칸은 그대로입니다 |
| Android | Compose 메뉴 — 칸 바로 아래, 칸과 같은 폭·모서리(16), 앱 글꼴. 항목은 Material 3 Expressive 선택 항목이라 고른 항목은 `primary` 면에 `onPrimary` 글자·앞 체크가 붙고 TalkBack에 선택 상태를 알립니다. 열려 있는 동안 칸은 포커스 테두리(`text` 2)와 위쪽 화살표 |

## 기본 사용법

```tsx
import { useState } from 'react';
import { ZSSelect } from '@0610studio/zs-ui';

const DOMAINS = [
  { label: 'gmail.com', value: 'gmail.com' },
  { label: 'naver.com', value: 'naver.com' },
  { label: 'kakao.com', value: 'kakao.com' },
];

function DomainPicker() {
  const [domain, setDomain] = useState('gmail.com');
  return <ZSSelect label="도메인" options={DOMAINS} value={domain} onValueChange={setDomain} />;
}
```

## Props — `ZSSelectProps<T>`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `label` | `string` | Required | 칸 라벨(떠오르는 라벨) |
| `options` | `ZSSelectOption<T>[]` | Required | `{ label: string; value: T }` 목록 |
| `value` | `T \| null` | `undefined` | 선택한 값(제어). `null`이면 선택 전 |
| `defaultValue` | `T \| null` | `null` | 비제어 초기값 |
| `onValueChange` | `(value: T, index: number) => void` | `undefined` | 고른 `value`와 `options` 안 위치 |
| `placeholder` | `string` | `undefined` | 선택 전 문구 |
| `variant` | `'outlined' \| 'inbox' \| 'underline'` | `'outlined'` | 칸 모양 — [ZSTextField variant](./ZSTextField)와 같습니다 |
| `menuColor` | `ColorName \| string` | `'surface3'` | 메뉴 배경 — 색 역할 이름 또는 직접 지정한 색(Android만, iOS 시스템 메뉴는 시스템이 그립니다) |
| `disabled` | `boolean` | `false` | |
| `accessibilityLabel` | `string` | `label` | 스크린 리더가 읽는 이름 |
| `accessibilityHint` | `string` | `undefined` | 스크린 리더 힌트 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 바깥 컨테이너 스타일 |
| `testID` | `string` | `undefined` | |

`T`는 `string`·`number`입니다(기본 `string`). `ZSSelectProps`·`ZSSelectOption` 타입을 내보냅니다.

```tsx
const SIZES: ZSSelectOption<number>[] = [
  { label: '작게', value: 12 },
  { label: '보통', value: 16 },
  { label: '크게', value: 20 },
];

<ZSSelect<number> label="글자 크기" options={SIZES} value={size} onValueChange={setSize} />
```

## 선택 전 상태

아직 고르지 않았으면 `value`에 `null`을 줍니다. `options`에 없는 값도 선택 전으로 보입니다.

```tsx
const [city, setCity] = useState<string | null>(null);

<ZSSelect label="도시" options={CITIES} value={city} onValueChange={setCity} placeholder="도시를 고르세요" />
<ZSButton title="선택 지우기" variant="text" onPress={() => setCity(null)} />
```

| | iOS | Android |
|---|-----|---------|
| 선택 전 표시 | 라벨이 떠오르고 칸 글자 자리에 `placeholder`를 placeholder 색으로. 없으면 빈 칸에 라벨만 둡니다 | 같음 |
| 메뉴 | 맨 위에 `placeholder`(없으면 `—`) 항목이 체크된 채 나오고, 하나를 고르면 메뉴에서 빠집니다 | 실제 선택지만 나옵니다 |

`onValueChange`는 실제 선택지를 골랐을 때만 호출합니다. 다시 비우려면 부모가 `value`를 `null`로 바꿉니다.

## 제어·비제어

`value`를 주지 않으면 비제어이고, 처음 값은 `defaultValue`(없으면 선택 전)입니다.

```tsx
<ZSSelect label="도시" options={CITIES} placeholder="도시를 고르세요" onValueChange={(value) => track(value)} />
<ZSSelect label="도시" options={CITIES} defaultValue="서울" />
```

## 칸 모양·메뉴 색 바꾸기

```tsx
<ZSSelect label="반려동물" options={PETS} value={pet} onValueChange={setPet} variant="inbox" />
<ZSSelect label="반려동물" options={PETS} value={pet} onValueChange={setPet} menuColor="primaryContainer" />
<ZSSelect label="반려동물" options={PETS} value={pet} onValueChange={setPet} menuColor="#E8F3EF" />
```

- `variant`는 칸만 바꿉니다. 같은 화면의 [ZSTextField](./ZSTextField)와 같은 값을 주면 폼이 한 모양으로 맞습니다.
- `menuColor`는 Android 메뉴 면입니다. 글자는 `text`로 그리므로 밝은 면(라이트)·어두운 면(다크)을 고르세요. iOS 메뉴는 시스템이 그려 바꾸지 않습니다.

## iOS·Android 차이

| | iOS | Android |
|---|-----|---------|
| 칸 | `ZSTextField`와 같은 모양, 부모 폭 | 같음. 떠오른 라벨이 잘리지 않게 `outlined` 칸 위를 라벨 반 높이만큼 비웁니다 |
| 메뉴 위치·폭 | 칸 아래 가운데에서 펼쳐지는 시스템 메뉴(폭은 항목에 맞춤) — 화면 가장자리·접힘선을 자동으로 피합니다 | 칸 바로 아래, 칸 폭 |
| 메뉴 모양 | 시스템 | 모서리 16(`RADIUS.lg`), `menuColor` 면, 앱 글꼴 `body1` |
| 열린 동안 칸 | 그대로 | 포커스 테두리, 화살표 위로 |

선택지가 많아 검색이 필요하면 [BottomSheet](../OverlayComponent/BottomSheet)에 목록을 두고, 2~5개를 한눈에 보이게 고르려면 [ZSRadioGroup](./ZSRadioGroup)·[ZSSegmentedControl](./ZSSegmentedControl)을 씁니다.

### iOS 메뉴를 UIKit 으로 그리는 이유

iOS 26 의 메뉴(SwiftUI `Menu`·UIKit 버튼 메뉴 모두)는 열고 닫을 때 유리 면을 메뉴 버튼 모양으로 펼치고 접어 넣습니다. 칸 전체를 메뉴 버튼으로 두면 그 유리 면이 칸 위를 지나며 글자·테두리를 굴절시켜 칸이 흔들려 보입니다. zs-ui 는 칸 위를 덮는 투명 UIKit 버튼(`ZSSelectMenuView`)으로 메뉴를 열고, 펼치고 접히는 기준(`highlightPreview`·`dismissalPreview`, `menuAttachmentPoint`)을 칸 아래 가장자리 가운데의 보이지 않는 점으로 둡니다.

## 접근성

칸 하나를 버튼으로 읽습니다 — 이름(`accessibilityLabel`, 기본 `label`), 지금 값(고른 항목, 선택 전이면 `placeholder`), 힌트(`accessibilityHint`) 순서입니다. 그린 라벨·글자는 따로 읽지 않습니다. Android는 드롭다운 역할과 열림 상태를 함께 알립니다. 비활성이면 비활성으로 읽고 열리지 않습니다.

## 관련 문서

- [ZSMenu](./ZSMenu) — 선택이 아니라 동작 목록
- [ZSRadioGroup](./ZSRadioGroup)
- [ZSSegmentedControl](./ZSSegmentedControl)
