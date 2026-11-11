# Snackbar

저장 완료처럼 짧은 결과를 잠깐 알립니다. iOS와 Android가 같은 모양·같은 동작입니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS·Android | zs-ui가 그리는 스낵바 — 기본은 화면 위(기기 상태바 바로 아래)에 최대 3개까지 쌓이고, 시간이 지나거나 누르거나 옆으로 밀면 닫힙니다. `OverlayProvider snackbarPosition="bottom"`이면 M3 자리(아래 고정 영역·탭 바·키보드 위)에 뜹니다 |

모양은 두 플랫폼 같습니다 — 높이 60(한 줄)의 캡슐, [흐림 막](./start#흐림-막) 면, 문구 `subtitle2` `text`.

## 기본 사용법

```tsx
import { ZSButton, useOverlay } from '@0610studio/zs-ui';

function SaveButton() {
  const { showSnackbar } = useOverlay();

  const onSave = async () => {
    await save();
    showSnackbar({ message: '저장했습니다', type: 'success' });
  };

  return <ZSButton title="저장" onPress={onSave} />;
}
```

## Props — `ShowSnackbarProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `message` | `string` | Required | 문구 — 한두 줄로 짧게 |
| `type` | `'success' \| 'error'` | `undefined` | 문구 앞 상태 아이콘 — `success`는 `success` 원 안 체크, `error`는 `error` 원 안 느낌표. 면 색은 바뀌지 않습니다. 주지 않으면 아이콘 없음 |
| `action` | `{ label: string; onPress: () => void }` | `undefined` | 동작 버튼 하나. 있으면 `duration`과 관계없이 동작을 누르거나 스낵바를 눌러 닫을 때까지 남습니다 |
| `duration` | `'short' \| 'long'` | `'short'` | 동작이 없을 때 표시 시간 — `short` 4초, `long` 10초 |

`ShowSnackbarProps` 타입을 내보냅니다.

## 반환값

`showSnackbar(props): boolean` — 항상 `true`를 반환합니다.

## 동작 버튼 — 실행 취소

```tsx
showSnackbar({
  message: '기록을 보관했습니다',
  action: { label: '실행 취소', onPress: () => restore(id) },
});
```

동작은 하나만 둡니다(M3). 동작 버튼은 높이 44의 `primary` 채움 캡슐에 `onPrimary` 강조 라벨입니다. 동작을 누르면 스낵바를 닫고 `onPress`를 호출합니다. 스낵바의 문구 부분을 누르면 동작 없이 닫힙니다.

## 옆으로 밀어 닫기

왼쪽·오른쪽으로 밀거나 문구 영역을 누르면 동작을 실행하지 않고 닫힙니다. 동작 버튼을 누르면 닫은 뒤 `action.onPress`를 호출합니다.

## 자리와 개수

자리는 앱 전체에 한 번 정합니다 — [`OverlayProvider snackbarPosition`](./start#overlayprovider). 어느 자리든 스낵바는 자기 자리만 차지해, 떠 있어도 스낵바 밖의 상단 바 버튼·화면·아래 고정 버튼이 그대로 눌립니다.

### 위 — `'top'`(기본)

- 첫 스낵바 윗변은 기기 상태바(창 위 safe area) 끝에서 8 아래입니다. 두 플랫폼 같고, 상단 바(헤더)와 상관없이 그 위를 덮습니다.
- 16 위에서 내려오며 나타납니다.

### 아래 — `'bottom'`(M3)

- 바닥은 다음 가운데 가장 높은 것이고, 그 위 8에 섭니다(MDC 스낵바 여백).
  - 창 아래 safe area(홈 표시줄·Android 내비게이션 바)
  - 지금 보이는 `ZSScreen` 화면이 알린 아래 가림 — `bottomComponent`(예: 화면 아래 고정 버튼, [ZSKeyboardStickyView](../UiComponent/ZSKeyboardStickyView) CTA)가 있으면 그 윗변, 없으면 화면 아래 safe area·겹친 탭 바가 시작하는 곳
  - 열린 키보드의 윗변
- `ZSScreen`을 쓰지 않는 화면·시트 안·내비게이터 밖에서는 창 아래 safe area와 키보드만 봅니다.
- 16 아래에서 올라오며 나타납니다.

### 두 자리 공통

- 좌우는 safe area와 12의 여백 안입니다. 아이폰 듀오의 레일처럼 옆 inset이 있으면 그 안쪽입니다. 넓은 창에서는 폭이 가독 폭(640)을 넘지 않고 가운데에 섭니다.
- 이어서 부르면 8 간격으로 쌓이고 새 스낵바가 아래에 섭니다. 최대 3개까지 보이고, 넘치면 가장 오래된 것부터 닫힙니다.
- iOS는 앱 창 맨 위(react-native-screens `FullWindowOverlay`)에 그려 열린 [BottomSheet](./BottomSheet)·formSheet 라우트 위에도 뜹니다.
- Android는 앱 화면 안에 그려, 시트가 열려 있으면 시트의 어두운 막 아래에 놓입니다. 시트보다 위인 창(`Modal`)은 떠 있는 동안 화면 터치·포커스를 모두 가져가 스낵바에 쓰지 않습니다.

## 접근성

- 뜰 때 스크린 리더(VoiceOver·TalkBack)가 문구를 읽습니다.
- 문구 부분은 버튼이고, 힌트로 `ThemeProvider accessibilityLabels.closeMessage`(기본 'Close message')를 읽습니다. 스크린 리더 사용자는 밀지 않고 문구를 눌러 닫습니다. 동작 버튼은 따로 포커스됩니다.
- 상태 아이콘은 읽지 않습니다 — 문구가 상태를 말하게 씁니다.
- 동작이 있는 스낵바는 시간이 지나도 닫히지 않아, 스크린 리더 사용자가 동작까지 갈 시간을 줍니다.

## 관련 문서

- [ZSBanner](../UiComponent/ZSBanner) — 사라지지 않고 화면 안에 남는 상태 메시지
- [GlobalOverlay](./start#globaloverlay) — React 밖에서 `showSnackbar`
