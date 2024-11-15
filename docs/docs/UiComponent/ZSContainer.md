---
sidebar_position: 1
---

# ZSContainer

`SafeAreaView`, `KeyboardAvoidingView`, `ScrollView` 등의 중첩된 레이아웃 구조를 간결하고 체계적으로 관리할 수 있는 컴포넌트입니다.

### 기본 사용법

```tsx
import { ZSContainer } from '@0610studio/zs-ui';

function MyScreen() {
  return (
    <ZSContainer>
      ...
    </ZSContainer>
  );
}
```

### 로딩 상태 처리
```tsx
<ZSContainer isLoader={true} loadingComponent={<ActivityIndicator size="large" color="blue" />} />
```

### 스크롤뷰 없이 사용
```tsx
<ZSContainer isScrollView={false}>
  <View>
    <Text>스크롤뷰 없이 고정된 레이아웃</Text>
  </View>
</ZSContainer>
```

### 상단/하단 컴포넌트 추가
```tsx
<ZSContainer
  topComponent={<Text>상단 컴포넌트</Text>}
  bottomComponent={<Button title="하단 버튼" onPress={() => alert('클릭됨')} />}
>
  <Text>메인 콘텐츠</Text>
</ZSContainer>
```

---

## Props

| 속성명                      | 타입                                | 기본값           | 설명                                                                 |
|-----------------------------|-------------------------------------|------------------|----------------------------------------------------------------------|
| `backgroundColor`           | `string`                           | `undefined`      | 배경 색상을 지정합니다.                                              |
| `isLoader`                  | `boolean`                          | `false`          | 로딩 상태를 활성화합니다.                                            |
| `statusBarColor`            | `string`                           | `undefined`      | 상태바 배경 색상을 지정합니다.                                       |
| `barStyle`                  | `'light-content' \| 'dark-content'`| `'dark-content'` | 상태바 텍스트 스타일을 설정합니다.                                   |
| `edges`                     | `Array<'top' \| 'bottom' \| ...>`  | `['top', 'bottom']` | SafeAreaView의 가장자리 설정.                                        |
| `isScrollView`              | `boolean`                          | `true`           | 스크롤뷰 활성화 여부를 설정합니다.                                   |
| `scrollViewRef`             | `React.RefObject<ScrollView>`      | `undefined`      | 스크롤뷰 참조를 전달합니다.                                          |
| `topComponent`              | `ReactNode`                        | `undefined`      | 상단에 표시할 컴포넌트.                                              |
| `bottomComponent`           | `ReactNode`                        | `undefined`      | 하단에 표시할 컴포넌트.                                              |
| `showsVerticalScrollIndicator`| `boolean`                        | `true`           | 세로 스크롤 표시 여부를 제어합니다.                                  |
| `loadingComponent`          | `React.ReactNode`                  | `<ActivityIndicator />` | 로딩 상태에서 표시할 컴포넌트.                                       |
| `keyboardVerticalOffset`    | `number`                           | `undefined`      | 키보드와의 수직 간격을 설정합니다.                                   |
