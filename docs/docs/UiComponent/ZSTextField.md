# ZSTextField

라벨·안내 문구·오류·글자 수를 갖춘 텍스트 입력입니다. 입력은 React Native `TextInput`이고 둘레 모양은 zs-ui가 그려 iOS·Android에서 같습니다. 라벨은 비어 있으면 칸 안에 있다가 포커스·값이 있으면 떠오릅니다.

## 기본 사용법

```tsx
import { useState } from 'react';
import { ZSTextField } from '@0610studio/zs-ui';

function NameField() {
  const [name, setName] = useState('');
  return <ZSTextField label="이름" value={name} onChangeText={setName} helperText="실명으로 입력하세요" required />;
}
```

라벨은 필수입니다(M3·HIG — placeholder로 라벨을 대신하지 않습니다). `placeholder`는 라벨이 떠오른 뒤에만 보입니다.

## Props — `ZSTextFieldProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `label` | `string` | Required | 항상 보이는 라벨 |
| `variant` | `ZSTextFieldVariant` | `'outlined'` | `'outlined' \| 'inbox' \| 'underline'` — [variant](#variant) |
| `value` | `string` | `undefined` | 주면 제어 모드 |
| `defaultValue` | `string` | `undefined` | 비제어 모드 초기값 |
| `onChangeText` | `(text: string) => void` | `undefined` | 값 변경. 지우기 버튼도 이것으로 `''`를 넘깁니다 |
| `helperText` | `string` | `undefined` | 필드 아래 안내 문구 |
| `errorText` | `string` | `undefined` | 있으면 오류 상태 — 안내 문구 대신 보입니다 |
| `required` | `boolean` | `false` | 라벨 뒤 `*` |
| `clearable` | `boolean` | `true` | 값이 있고 포커스일 때 지우기 버튼 |
| `clearAccessibilityLabel` | `string` | `'Clear text'` | 지우기 버튼의 스크린 리더 이름. 앱 전체 기본값은 [ThemeProvider `accessibilityLabels.clearText`](../Provider/ThemeProvider#스크린-리더-문구--accessibilitylabels)로 바꿉니다 |
| `showCount` | `boolean` | `false` | `maxLength`와 함께 `현재/최대` 글자 수 |
| `disabled` | `boolean` | `false` | 편집 불가(`editable={false}`)와 비활성 색 |
| `multiline` | `boolean` | `false` | 여러 줄 입력 |
| `minRows` | `number` | `1` | `multiline` 최소 줄 수 |
| `maxRows` | `number` | `undefined` | `multiline` 최대 줄 수 — 넘으면 칸 안에서 스크롤합니다. 없으면 계속 늘어납니다 |
| `startAdornment` | `ReactNode` | `undefined` | 입력 앞 요소(아이콘 등). 있으면 라벨이 늘 떠 있습니다 |
| `endAdornment` | `ReactNode` | `undefined` | 입력 뒤 요소(단위·비밀번호 보기 버튼 등) |
| `maxFontSizeMultiplier` | `number` | 앱 상한 | 글자 확대 상한. 주지 않으면 [앱 상한](../Theme/typography#앱-전체-상한--maxfontsizemultiplier)(기본 2배). 라벨·칸 높이도 같은 배율로 맞춥니다 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 바깥 컨테이너 스타일 |
| `inputStyle` | `TextInputProps['style']` | `undefined` | `TextInput` 스타일 |
| `...props` | `TextInputProps` | `undefined` | `placeholder`·`keyboardType`·`maxLength`·`onFocus`·`onBlur`·`returnKeyType` 등(`style`·`editable` 제외) |

`ref`는 `TextInput` 인스턴스(`ZSTextFieldRef`)입니다 — `ref.current?.focus()`. `ZSTextFieldProps`·`ZSTextFieldRef`·`ZSTextFieldVariant` 타입을 내보냅니다.

## variant

높이는 기본 글자 크기에서 한 줄 칸의 높이이고, 글자 크기 설정이 커지면 함께 늘어납니다. 모서리는 두 플랫폼 모두 16(`lg`)이고, 좌우 안쪽 여백(`underline` 제외)은 두 플랫폼 모두 16이라 iOS [ZSSelect](./ZSSelect)의 라벨·값과 글자 시작선이 맞습니다.

| `variant` | 모양 | iOS 높이 | Android 높이 |
|-----------|------|---------|-------------|
| `outlined` (기본) | 테두리 박스. 떠오른 라벨이 위 테두리에 걸리고 그 자리의 선이 비워집니다(배경을 깔지 않아 어떤 배경 위에서도 됩니다) | 52pt | 56dp |
| `inbox` | 테두리 박스 + 바탕색 면(`background`). 라벨이 칸 안 위쪽으로 떠오릅니다 | 56pt | 56dp |
| `underline` | 아래 선만. 라벨이 입력 줄 위로 떠오르고 좌우 여백이 없습니다 | 52pt | 52dp |

## 제어·비제어

`value`를 주면 제어, 주지 않으면 `defaultValue`로 시작하는 비제어입니다. 필드가 많은 폼에서는 비제어가 가볍습니다 — 키 입력마다 부모가 다시 그려지지 않습니다. 값은 `onChangeText`나 `onEndEditing`으로 받습니다.

```tsx
<ZSTextField label="이메일" value={email} onChangeText={setEmail} />

const codeRef = useRef('');
<ZSTextField label="인증번호" defaultValue="" onChangeText={(text) => (codeRef.current = text)} maxLength={6} showCount />
```

## 상태

```tsx
<ZSTextField label="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" errorText={emailError} />

<ZSTextField label="메모" value={memo} onChangeText={setMemo} multiline minRows={2} maxRows={5} maxLength={200} showCount />

<ZSTextField variant="inbox" label="몸무게" keyboardType="decimal-pad" endAdornment={<ZSText color="textSecondary">kg</ZSText>} />

<ZSTextField variant="underline" label="아이디" value="zs-ui" disabled />
```

| 상태 | 테두리·선 | 라벨 |
|------|-----------|------|
| 기본 | `borderStrong` 1(세 variant 같음) | `textSecondary` |
| 포커스 | `text` 2 | `text` |
| 오류 | `error` 2 + 끝에 오류 아이콘 | `error` |
| 비활성 | `text` 12% 1 — 오류 문구가 있어도 같습니다 | 글자·라벨 `text` 38% |

포커스·오류 테두리(2)는 기본 테두리(1) 위에 겹쳐 그립니다. 두께가 끊겨 바뀌지 않고, 위 테두리의 색·불투명도만 짧게 페이드합니다.

- 포커스 테두리·라벨·커서·선택 손잡이는 `text`입니다. 얇은 표시라 `primary`로 그리지 않습니다([색 규칙](../Theme/colors#색-규칙--채움과-얇은-표시)). 오류면 `error`입니다. Android 선택 영역은 같은 색 40%입니다.
- 값·라벨·placeholder는 `body1` 강조 굵기 하나로 그립니다.
- placeholder는 `textSecondary`를 칸 면 쪽으로 조금 옅게 옮긴 회색입니다. 값보다 옅고 라벨과도 갈리며, 칸 면 위 4.5:1을 지킵니다.

## 접근성

- 이름은 `accessibilityLabel`(기본 `label`), 힌트는 오류 문구 또는 안내 문구입니다. 그려진 라벨 글자는 스크린 리더에서 숨겨 두 번 읽히지 않습니다.
- 오류 문구가 새로 생기거나 바뀌면 스크린 리더가 읽습니다. iOS(VoiceOver)는 라벨과 오류 문구를 이어 읽고, 앞 안내를 끊지 않고 차례로 읽어 여러 칸에 한꺼번에 오류가 생겨도 모두 들립니다. 처음 그릴 때부터 있던 문구는 읽지 않습니다. Android(TalkBack)는 `accessibilityLiveRegion="polite"`로 읽습니다.
- 지우기 버튼은 보이는 원보다 넓은 터치 영역(iOS 44pt·Android 48dp)을 갖고, 누르면 [ZSPressable](./ZSPressable)과 같은 누름 표시(iOS 하이라이트·Android ripple)가 보입니다.

## 관련 문서

- [ZSScreen](./ZSScreen) — 키보드 자동 스크롤
- [ZSKeyboardStickyView](./ZSKeyboardStickyView) — 키보드 위 버튼
- [ZSSelect](./ZSSelect) — 목록에서 고르기
