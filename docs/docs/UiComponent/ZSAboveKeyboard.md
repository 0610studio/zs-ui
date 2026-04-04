---
sidebar_position: 10
---

# ZSAboveKeyboard

키보드 바로 위에 떠 있는 floating UI를 만들 때 사용합니다. 키보드가 나타나거나 사라질 때 자동으로 위치를 조정합니다.

## 철학

1. **ZSContainer와 보완 관계입니다**. ZSContainer가 화면 전체 레이아웃과 자동 스크롤을 담당한다면, ZSAboveKeyboard는 키보드 위에 띄워야 하는 독립적인 UI 요소를 담당합니다.
2. **오버레이 시스템과는 독립입니다**. `hideOverlay('all')`로 닫히지 않고, `OverlayProvider` 없이도 동작합니다.
3. **필요한 곳에만 사용합니다**. 단순히 "키보드가 올라와도 입력 필드가 보이게" 하려면 [ZSContainer](./ZSContainer.md)의 `scrollToFocusedInput`을 사용하세요. ZSAboveKeyboard는 전송 버튼, 툴바 같이 키보드에 딱 붙어서 따라다녀야 하는 UI에 적합합니다.

## ZSAboveKeyboard

| 상황 | 설명 |
|------|------|
| 채팅 전송 버튼 | 키보드 위에 고정된 전송/입력 바 |
| 툴바 | 키보드가 열렸을 때만 보여야 하는 포맷 툴바 |
| 상태 표시 | 키보드와 함께 올라오는 상태 메시지 |

> **ZSContainer와 함께 쓸 수 있습니다**. ZSContainer 안에서 ZSAboveKeyboard를 형제 레벨에 배치하면, 스크롤 자동 대응과 floating UI를 동시에 사용할 수 있습니다.

## 기본 사용법

```tsx
import { ZSAboveKeyboard } from '@0610studio/zs-ui';

function ChatScreen() {
  return (
    <ZSContainer>
      {/* 메시지 목록 */}
      <MessageList />
      {/* 키보드 위 전송 버튼 */}
      <ZSAboveKeyboard>
        <SendButton onPress={handleSend} />
      </ZSAboveKeyboard>
    </ZSContainer>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | 키보드 위에 표시할 컴포넌트 |
| `keyboardShowOffset` | `number` | `0` | 키보드 표시 시 추가 여백 (px) |
| `keyboardHideOffset` | `number` | `0` | 키보드 숨김 시 추가 여백 (px) |
| `handleLayoutHeight` | `(height: number) => void` | `undefined` | 레이아웃 높이 변경 콜백 |
| `showOnlyKeyboardVisible` | `boolean` | `false` | 키보드가 열렸을 때만 표시 |
| `backgroundColor` | `string` | `undefined` | 배경색 |
| `...props` | `ViewProps` | - | React Native `View` 기본 속성 |

## 예제

키보드가 열렸을 때만 표시하려면 `showOnlyKeyboardVisible`을 사용합니다.

```tsx
<ZSAboveKeyboard showOnlyKeyboardVisible={true}>
  <FormatToolbar />
</ZSAboveKeyboard>
```
