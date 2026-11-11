# ZSMenu

버튼이나 요소를 눌러 동작 목록(편집·공유·삭제 등)을 여는 네이티브 메뉴입니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS | `UIMenu`(SwiftUI `Menu`, 길게 누르면 `ContextMenu`) — 메뉴를 연 요소 옆에 뜨고 접힘선·화면 가장자리를 시스템이 피합니다 |
| Android | Material 3 `DropdownMenu` — 연 요소 아래에 뜨고 앱 테마 색으로 칠합니다 |

## 기본 사용법

```tsx
import { ZSButton, ZSMenu, type ZSMenuItem } from '@0610studio/zs-ui';

const ITEMS: ZSMenuItem[] = [
  { key: 'edit', label: '편집', icon: { sf: 'pencil' } },
  { key: 'share', label: '공유', icon: { sf: 'square.and.arrow.up' } },
  { key: 'delete', label: '삭제', icon: { sf: 'trash' }, destructive: true },
];

function MoreButton() {
  return (
    <ZSMenu items={ITEMS} onSelect={(key) => handle(key)}>
      <ZSButton title="더 보기" variant="outlined" />
    </ZSMenu>
  );
}
```

`children`이 메뉴를 여는 요소(트리거)입니다. 항목을 고르면 메뉴가 닫히고 `onSelect(key)`가 호출됩니다.

## Props — `ZSMenuProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `items` | `ZSMenuItem[]` | Required | 메뉴 항목 |
| `onSelect` | `(key: string) => void` | Required | 고른 항목의 `key` |
| `children` | `ReactNode` | Required | 누르면 메뉴를 여는 요소 |
| `title` | `string` | `undefined` | 메뉴 제목(iOS만) |
| `openOnLongPress` | `boolean` | `false` | 길게 눌러 엽니다(iOS는 `ContextMenu`) |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | |

### `ZSMenuItem`

| 필드 | Type | 설명 |
|------|------|------|
| `key` | `string` | `onSelect`로 돌려주는 식별자 |
| `label` | `string` | 항목 문구 |
| `icon` | `{ sf?: string; android?: ImageSourcePropType }` | iOS SF Symbol 이름, Android 이미지 소스 |
| `destructive` | `boolean` | 파괴 동작 — 빨간색(iOS 시스템 destructive, Android `error` 색) |
| `disabled` | `boolean` | 고를 수 없음 |
| `checked` | `boolean` | 켬·끔 상태 항목. iOS는 시스템 체크, Android는 끝에 `text` 색 ✓(비활성 항목은 비활성 색) |

`ZSMenuProps`·`ZSMenuItem` 타입을 내보냅니다.

## 아이콘

iOS는 `icon.sf`, Android는 `icon.android`만 씁니다. HIG·M3 모두 한 메뉴 안에서는 아이콘을 전부 넣거나 전부 빼라고 하므로, Android 이미지가 없으면 Android에서는 아이콘을 뺍니다.

```tsx
const items = Platform.OS === 'ios' ? ITEMS : ITEMS.map(({ icon, ...item }) => item);
```

## 켬·끔 항목

```tsx
<ZSMenu
  items={[{ key: 'pin', label: '상단 고정', checked: pinned }]}
  onSelect={() => setPinned((value) => !value)}
>
  <ZSButton title={pinned ? '고정됨' : '고정 안 됨'} variant="tonal" />
</ZSMenu>
```

## 트리거

트리거에 `onPress`는 필요 없습니다. `ZSButton`은 `onPress` 없이 넘기세요.

- **iOS**: 시스템 메뉴가 트리거를 감싸 누름을 받습니다. 트리거의 `onPress` 유무와 관계없이 열립니다.
- **Android**: 트리거가 `ZSButton`·`ZSPressable`이거나 `onPress`·`onLongPress`를 받는 컴포넌트면 그 누름(`openOnLongPress`면 길게 누름)에 메뉴 열기를 잇습니다. 원래 핸들러가 있으면 함께 불리고, 스크린 리더도 같은 버튼으로 엽니다. 누를 수 없는 요소(`View`·`ZSText` 등)는 zs-ui가 `Pressable`로 감쌉니다.

```tsx
<ZSMenu items={items} onSelect={handle} openOnLongPress>
  <View style={{ padding: 24, borderRadius: 16 }}>
    <ZSText>길게 누르세요</ZSText>
  </View>
</ZSMenu>
```

## 관련 문서

- [ZSSelect](./ZSSelect) — 값 하나 고르기
- [Alert](../OverlayComponent/Alert) — 파괴 동작 확인
