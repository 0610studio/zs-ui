# ZSSwitch

저장 버튼 없이 바로 반영되는 설정을 켜고 끄는 네이티브 스위치입니다(M3).

| 플랫폼 | 구현 |
|--------|------|
| iOS | SwiftUI `Toggle`(UISwitch) |
| Android | Material 3 `Switch` — 라벨이 있으면 줄 전체를 눌러 바꿉니다 |

크기·모양은 시스템이 정하고 색은 앱 테마를 받습니다. 켜진 트랙은 채움 강조라 두 플랫폼 모두 `primary`이고(iOS는 이 컨트롤에 tint를 직접 겁니다), Android 꺼짐은 트랙 `surface4`·썸과 테두리 `textSecondary`입니다([네이티브 컨트롤에 넘기는 테마](../Theme/colors#네이티브-컨트롤에-넘기는-테마)). 트랙·썸 색 props는 없습니다.

`label`이 있으면 앞 라벨 · 뒤 스위치의 부모 폭 한 줄(iOS 44pt·Android 56dp)이고, [ZSRadioGroup](./ZSRadioGroup)·[ZSCheckbox](./ZSCheckbox) 행과 높이가 같아 `gap` 없이 쌓으면 됩니다.

## 기본 사용법

```tsx
import { useState } from 'react';
import { ZSSwitch } from '@0610studio/zs-ui';

function NotificationSetting() {
  const [push, setPush] = useState(true);
  return <ZSSwitch label="푸시 알림" value={push} onValueChange={setPush} />;
}
```

## Props — `ZSSwitchProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `value` | `boolean` | `undefined` | 켜짐 여부(제어) |
| `defaultValue` | `boolean` | `false` | 비제어 초기값 |
| `onValueChange` | `(value: boolean) => void` | `undefined` | 바뀐 값 |
| `label` | `string` | `undefined` | 같은 줄 라벨. 없으면 스위치 크기만 차지합니다 |
| `contentInset` | `number` | `0` | 라벨 행의 좌우 안쪽 여백(pt·dp). 목록 행 여백을 스위치가 직접 가지면 Android 누름 효과(리플)가 행 끝에서 끝까지 퍼집니다 — 부모는 그 행에 좌우 여백을 두지 않습니다 |
| `disabled` | `boolean` | `false` | |
| `accessibilityLabel` | `string` | `label` | 스크린 리더가 읽는 이름. 라벨 없이 쓰면 꼭 줍니다 |
| `accessibilityHint` | `string` | `undefined` | 스크린 리더 힌트(iOS만) |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | |

`ZSSwitchProps` 타입을 내보냅니다.

## 제어·비제어

`value`를 주지 않으면 비제어이고, 처음 값은 `defaultValue`(기본 `false`)입니다.

```tsx
<ZSSwitch label="자동 재생" defaultValue onValueChange={(on) => saveAutoPlay(on)} />
```

## 접근성

라벨 없이 쓰면 보이는 라벨을 옆에 따로 두고 그 문구를 `accessibilityLabel`로 넘기세요. 둘 다 없으면 개발 모드에서 경고합니다.

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <ZSText variant="subtitle2">Wi-Fi</ZSText>
  <ZSSwitch accessibilityLabel="Wi-Fi" value={wifi} onValueChange={setWifi} />
</View>
```

| | iOS (VoiceOver) | Android (TalkBack) |
|---|-----|---------|
| 읽는 것 | 이름, 켬·끔, 스위치 | 이름, 켬·끔, 스위치 |
| 포커스 | 한 번(라벨과 스위치가 한 요소) | 한 번 — 라벨이 있으면 줄 전체가 한 요소 |
| `accessibilityHint` | 이름·값 다음에 읽습니다 | 지원하지 않습니다 |

## 관련 문서

- [ZSCheckbox](./ZSCheckbox) — 여러 항목 선택·동의
