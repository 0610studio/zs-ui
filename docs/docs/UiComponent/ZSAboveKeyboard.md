---
sidebar_position: 10
---

# ZSAboveKeyboard

키보드 위에 고정되는 컴포넌트입니다. 키보드가 나타나거나 사라질 때 자동으로 위치를 조정하며, 플랫폼별 키보드 동작 차이를 처리합니다.

## 기본 사용법

```tsx
import { ZSAboveKeyboard } from '@0610studio/zs-ui';

<ZSAboveKeyboard>
  <Button title="전송" onPress={handleSend} />
</ZSAboveKeyboard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | 키보드 위에 표시할 컴포넌트 |
| `keyboardShowOffset` | `number` | `0` | 키보드가 표시될 때 추가 오프셋 |
| `keyboardHideOffset` | `number` | `0` | 키보드가 숨겨질 때 추가 오프셋 |
| `handleLayoutHeight` | `(height: number) => void` | `undefined` | 레이아웃 높이 변경 시 호출되는 콜백 |
| `showOnlyKeyboardVisible` | `boolean` | `false` | 키보드가 표시될 때만 보이도록 설정 |
| `backgroundColor` | `string` | `undefined` | 배경색 |

## 특징

- **플랫폼별 처리**: Android 11 (API 30) 이전/이후 버전의 키보드 동작 차이를 자동으로 처리합니다
- **SafeArea 지원**: iOS의 SafeArea를 고려하여 위치를 조정합니다
- **조건부 표시**: `showOnlyKeyboardVisible` 옵션으로 키보드가 있을 때만 표시할 수 있습니다
- **레이아웃 추적**: 레이아웃 높이 변경을 추적할 수 있는 콜백 제공

## 예제

- **플랫폼별 처리**: Android 11 (API 30) 이전/이후 버전의 키보드 동작 차이를 자동으로 처리합니다
- **SafeArea 지원**: iOS의 SafeArea를 고려하여 위치를 조정합니다
- **조건부 표시**: `showOnlyKeyboardVisible` 옵션으로 키보드가 있을 때만 표시할 수 있습니다
- **레이아웃 추적**: 레이아웃 높이 변경을 추적할 수 있는 콜백 제공

## 예제

### 기본 사용

```tsx
<ZSAboveKeyboard>
  <Button title="전송" onPress={handleSend} />
</ZSAboveKeyboard>
```

### 커스텀 오프셋

```tsx
<ZSAboveKeyboard
  keyboardShowOffset={10}
  keyboardHideOffset={20}
>
  <Button title="전송" onPress={handleSend} />
</ZSAboveKeyboard>
```

### 키보드가 있을 때만 표시

```tsx
<ZSAboveKeyboard showOnlyKeyboardVisible={true}>
  <Button title="전송" onPress={handleSend} />
</ZSAboveKeyboard>
```

### 배경색 지정

```tsx
<ZSAboveKeyboard backgroundColor="#ffffff">
  <View style={{ padding: 20 }}>
    <Button title="전송" onPress={handleSend} />
  </View>
</ZSAboveKeyboard>
```

### 레이아웃 높이 추적

```tsx
<ZSAboveKeyboard
  handleLayoutHeight={(height) => {
    console.log('Component height:', height);
  }}
>
  <Button title="전송" onPress={handleSend} />
</ZSAboveKeyboard>
```

### ZSTextField와 함께 사용

```tsx
<ZSContainer>
  <ZSTextField
    label="메시지"
    value={message}
    onChangeText={setMessage}
  />
  
  <ZSAboveKeyboard>
    <ThrottleButton
      primaryLabelComponent={<ZSText typo="body.1">전송</ZSText>}
      primaryOnPress={async () => {
        await sendMessage();
      }}
    />
  </ZSAboveKeyboard>
</ZSContainer>
```

