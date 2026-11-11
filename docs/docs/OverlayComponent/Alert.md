# Alert

되돌릴 수 없는 동작 확인처럼 사용자의 결정이 필요할 때 대화상자를 띄웁니다. iOS와 Android가 같은 모양·같은 동작입니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS·Android | zs-ui가 그리는 대화상자 — 흐림 막(scrim) 위 화면 가운데 카드(최대 폭 360), 제목·본문 아래에 취소·확인 버튼을 나란히 둡니다(좁으면 [세로로](#버튼-배치)) |

시스템 대화상자가 필요하면 React Native `Alert.alert`를 그대로 쓰면 됩니다.

## 기본 사용법

```tsx
import { ZSButton, useOverlay } from '@0610studio/zs-ui';

function SaveButton() {
  const { showAlert } = useOverlay();

  return (
    <ZSButton
      title="저장"
      onPress={() =>
        showAlert({
          title: '변경 내용을 저장할까요?',
          message: '저장하지 않으면 입력한 내용이 사라집니다.',
          confirm: { label: '확인' },
          cancel: { label: '취소' },
        })
      }
    />
  );
}
```

- `showAlert`는 먼저 키보드를 내립니다.
- 버튼을 누르면 대화상자가 닫힌 뒤 그 버튼의 `onPress`가 호출됩니다. 그래서 `onPress`에서 다른 오버레이를 띄워도 됩니다.
- 대화상자가 떠 있는 동안 `showAlert`를 다시 부르면 덮어쓰지 않고 차례로 띄웁니다. 앞 대화상자를 닫으면 다음 대화상자가 뜹니다.
- 열린 [BottomSheet](./BottomSheet) 위에도 뜹니다.

## Props — `ShowAlertProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `title` | `string` | Required | 제목 |
| `message` | `string` | `undefined` | 본문 |
| `confirm` | `AlertButton & { destructive?: boolean }` | Required | 주 동작 버튼(filled `primary`, `destructive`면 filled `error`) — [파괴 동작](#파괴-동작) |
| `cancel` | `AlertButton` | `undefined` | 취소 버튼(회색 tonal, `color="neutral"`). 나란히 두면 확인 앞, 세로로 쌓으면 확인 아래에 놓입니다 |
| `dismissible` | `boolean` | `false` | 바깥(어두운 막) 탭으로 닫기 — [닫기](#닫기--dismissible) |

### `AlertButton`

| 필드 | Type | Default | 설명 |
|------|------|---------|------|
| `label` | `string` | Required | 버튼 문구 — 동작을 나타내는 동사(“삭제”, “저장”)를 씁니다 |
| `onPress` | `() => void` | `undefined` | 대화상자가 닫힌 뒤 호출합니다. 생략하면 닫기만 합니다 |

버튼은 확인·취소 두 개까지입니다(M3 대화상자 동작 2개, HIG 버튼 수 최소화). 확인만 있으면 한 줄을 다 채웁니다.

`ShowAlertProps`·`AlertButton` 타입을 내보냅니다.

## 파괴 동작

사용자가 의도하지 않았을 수 있는 파괴 동작은 `destructive`와 취소를 함께 둡니다(HIG). 확인 버튼을 `error` 면에 `onError` 글자로 칠합니다.

```tsx
showAlert({
  title: '기록을 삭제할까요?',
  message: '삭제한 기록은 되돌릴 수 없습니다.',
  confirm: { label: '삭제', destructive: true, onPress: remove },
  cancel: { label: '취소' },
});
```

## 닫기 — `dismissible`

| 방법 | 닫히는 경우 |
|------|------------|
| 버튼 | 항상 |
| 바깥(어두운 막) 탭 | `dismissible: true`일 때 |
| Android 뒤로가기 | 취소 버튼이 있거나 `dismissible: true`일 때 |

바깥 탭·뒤로가기로 닫으면 취소 버튼을 누른 것과 같아 `cancel.onPress`가 호출됩니다. 취소 쪽 정리(로딩 해제 등)를 한 곳에 두면 됩니다.

취소 버튼이 없고 `dismissible`도 아니면 버튼으로만 닫힙니다. Android 뒤로가기도 막아 뒤 화면으로 넘어가지 않습니다.

```tsx
showAlert({
  title: '업데이트가 필요합니다',
  message: '계속하려면 최신 버전으로 업데이트하세요.',
  confirm: { label: '업데이트', onPress: openStore },
});
```

## 배치와 모양

두 플랫폼 모두 화면 가운데에 표시하며 최대 폭은 360입니다. 큰 글자나 긴 라벨에서는 버튼을 세로로 쌓고 확인을 위에 둡니다. 제목·본문이 넘치면 해당 영역만 스크롤합니다.

뒤 배경의 재질은 [흐림 막](./start#흐림-막)을 따릅니다.

### 버튼 배치

취소·확인을 나란히 두되, 글자 배율이 1.3배 이상이거나 라벨이 들어가지 않으면 세로로 쌓습니다.

## 접근성

앱 창 맨 위(iOS는 react-native-screens `FullWindowOverlay`, Android는 `Modal` 창)에 그려, 열리면 스크린 리더(VoiceOver·TalkBack) 포커스가 대화상자 안에만 머물고 뒤 화면은 읽히지 않습니다. 제목은 header로 읽힙니다.

## 관련 문서

- [오버레이 개요](./start)
- [BottomSheet](./BottomSheet)
- [ZSMenu](../UiComponent/ZSMenu) — 선택지가 여러 개면 메뉴
