---
sidebar_position: 7
---

# ThrottleButton

비동기 함수를 실행할 때 중복 클릭을 방지해 주는 버튼 컴포넌트입니다. debounce와 throttle 기능이 내장되어 있어 네트워크 요청을 안전하게 처리할 수 있습니다.

## 기본 사용법

```tsx
import { ThrottleButton } from '@0610studio/zs-ui';

<ThrottleButton
  primaryLabelComponent={<Text>저장</Text>}
  primaryOnPress={async () => {
    await saveData();
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loadingComponent` | `React.ReactNode` | `<ActivityIndicator />` | 로딩 중 표시할 컴포넌트 |
| `disabled` | `boolean` | `false` | 비활성화 여부 |
| `primaryOnPress` | `() => Promise<void>` | Required | 버튼 클릭 시 실행될 비동기 함수 |
| `primaryLabelComponent` | `React.ReactNode` | Required | 버튼에 표시될 컴포넌트 |
| `primaryButtonStyle` | `TouchableOpacityProps['style']` | `{}` | 버튼 스타일 |
| `marginHorizontal` | `number` | `20` | 좌우 여백 |
| `marginBottom` | `number` | `20` | 하단 여백 |
| `onError` | `(error: Error) => void` | `undefined` | 비동기 함수 실행 중 오류 발생 시 호출되는 함수 |
| `...touchableProps` | `TouchableOpacityProps` | - | React Native `TouchableOpacity`의 모든 기본 속성 |

## 특징

- **중복 클릭 방지**: debounce와 throttle 기능으로 안전한 네트워크 요청 처리
- **로딩 상태**: 비동기 함수 실행 중 자동으로 로딩 상태 표시
- **에러 처리**: 에러 발생 시 콜백 함수를 통해 처리 가능
- **커스터마이징**: 로딩 컴포넌트와 스타일을 자유롭게 설정 가능

## 동작 방식

- **Debounce**: 300ms 이내의 연속 클릭을 무시합니다
- **Throttle**: 비동기 함수 실행 후 2초 동안 추가 클릭을 방지합니다
- **로딩 상태**: 비동기 함수가 실행되는 동안 자동으로 로딩 상태를 표시합니다

## 예제

### 기본 사용

```tsx
<ThrottleButton
  primaryLabelComponent={<ZSText typo="body.2">저장</ZSText>}
  primaryOnPress={async () => {
    await saveUserData();
  }}
/>
```

### 커스텀 로딩 컴포넌트

```tsx
<ThrottleButton
  loadingComponent={
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#007AFF" />
      <ZSText typo="body.2" style={{ marginLeft: 8 }}>
        저장 중...
      </ZSText>
    </View>
  }
  primaryLabelComponent={<ZSText typo="body.2">저장</ZSText>}
  primaryOnPress={async () => {
    await saveUserData();
  }}
/>
```

### 에러 처리

```tsx
<ThrottleButton
  primaryLabelComponent={<ZSText typo="body.2">전송</ZSText>}
  primaryOnPress={async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('전송 실패');
    }
  }}
  onError={(error) => {
    Alert.alert('오류', error.message);
  }}
/>
```

### 커스텀 스타일

```tsx
<ThrottleButton
  primaryLabelComponent={
    <ZSText typo="body.1" color="white">저장</ZSText>
  }
  primaryButtonStyle={{
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
  }}
  marginHorizontal={0}
  marginBottom={0}
  primaryOnPress={async () => {
    await saveUserData();
  }}
/>
```

### 비활성화 상태

```tsx
<ThrottleButton
  disabled={!isFormValid}
  primaryLabelComponent={<ZSText typo="body.2">제출</ZSText>}
  primaryOnPress={async () => {
    await submitForm();
  }}
/>
```

### TouchableOpacity 속성 사용

```tsx
<ThrottleButton
  primaryLabelComponent={<ZSText typo="body.2">저장</ZSText>}
  primaryOnPress={async () => {
    await saveUserData();
  }}
  activeOpacity={0.7}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
/>
```
