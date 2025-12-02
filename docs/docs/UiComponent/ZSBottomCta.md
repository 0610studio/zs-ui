---
sidebar_position: 9
---

# ZSBottomCta

화면 하단에 고정되는 CTA(Call To Action) 컴포넌트입니다. 키보드가 나타날 때 자동으로 위치를 조정하며, 부드러운 애니메이션 효과를 제공합니다.

## 기본 사용법

```tsx
import { ZSBottomCta } from '@0610studio/zs-ui';

<ZSBottomCta
  render={() => (
    <Button title="저장" onPress={handleSave} />
  )}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `render` | `() => React.ReactNode` | Required | CTA 컴포넌트를 렌더링하는 함수 |
| `offset` | `number` | `0` | 키보드가 표시될 때 추가 오프셋 |

## 특징

- **키보드 대응**: 키보드가 나타나면 자동으로 키보드 위로 이동합니다
- **애니메이션**: `FadeInDown`과 `FadeOutDown` 애니메이션이 적용됩니다
- **절대 위치**: 화면 하단에 고정되어 표시됩니다
- **유연한 렌더링**: `render` 함수를 통해 원하는 컴포넌트를 표시할 수 있습니다

## 예제

- **키보드 대응**: 키보드가 나타나면 자동으로 키보드 위로 이동합니다
- **애니메이션**: `FadeInDown`과 `FadeOutDown` 애니메이션이 적용됩니다
- **절대 위치**: 화면 하단에 고정되어 표시됩니다
- **유연한 렌더링**: `render` 함수를 통해 원하는 컴포넌트를 표시할 수 있습니다

## 예제

### 기본 사용

```tsx
<ZSBottomCta
  render={() => (
    <ThrottleButton
      primaryLabelComponent={<ZSText typo="body.1" color="white">저장</ZSText>}
      primaryButtonStyle={{
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
      }}
      primaryOnPress={async () => {
        await saveData();
      }}
    />
  )}
/>
```

### 커스텀 오프셋

```tsx
<ZSBottomCta
  offset={20}
  render={() => (
    <Button title="저장" onPress={handleSave} />
  )}
/>
```

### 여러 버튼

```tsx
<ZSBottomCta
  render={() => (
    <View style={{ flexDirection: 'row', gap: 10, padding: 20 }}>
      <Button title="취소" onPress={handleCancel} />
      <Button title="확인" onPress={handleConfirm} />
    </View>
  )}
/>
```

### ZSContainer와 함께 사용

```tsx
<ZSContainer>
  <View style={{ padding: 20 }}>
    <ZSText typo="heading.1">제목</ZSText>
    <ZSTextField label="이름" value={name} onChangeText={setName} />
  </View>
  
  <ZSBottomCta
    render={() => (
      <ThrottleButton
        primaryLabelComponent={<ZSText typo="body.1">저장</ZSText>}
        primaryOnPress={async () => {
          await saveData();
        }}
      />
    )}
  />
</ZSContainer>
```

