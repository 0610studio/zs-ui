---
sidebar_position: 1
---

# ZSContainer

`SafeAreaView`, `KeyboardAvoidingView`, `ScrollView` 등의 중첩된 레이아웃 구조를 간결하고 체계적으로 관리할 수 있는 컨테이너 컴포넌트입니다. 키보드 처리, 폴더블 디바이스 지원, 스크롤 관리 등의 기능을 포함합니다.

## 기본 사용법

```tsx
import { ZSContainer } from '@0610studio/zs-ui';

function MyScreen() {
  return (
    <ZSContainer>
      <Text>내용</Text>
    </ZSContainer>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | 테마 `background.base` | 배경 색상 |
| `statusBarColor` | `string` | `undefined` | 상태바 배경 색상 |
| `barStyle` | `'light-content' \| 'dark-content'` | `undefined` | 상태바 텍스트 스타일 |
| `edges` | `Array<'top' \| 'right' \| 'bottom' \| 'left'>` | `['bottom']` | SafeAreaView의 가장자리 설정 |
| `scrollViewDisabled` | `boolean` | `false` | 스크롤뷰 비활성화 여부 |
| `topComponent` | `ReactNode` | `undefined` | 상단에 표시할 컴포넌트 |
| `bottomComponent` | `ReactNode` | `undefined` | 하단에 표시할 컴포넌트 |
| `rightComponent` | `ReactNode` | `undefined` | 우측에 표시할 컴포넌트 (폴더블 디바이스용) |
| `showsVerticalScrollIndicator` | `boolean` | `true` | 세로 스크롤 표시 여부 |
| `keyboardScrollExtraOffset` | `number` | `30` | 키보드와의 추가 수직 간격 |
| `translucent` | `boolean` | `undefined` | 상태바 반투명 여부 |
| `onScroll` | `(event: NativeSyntheticEvent<NativeScrollEvent>) => void` | `undefined` | 스크롤 이벤트 핸들러 |
| `scrollEventThrottle` | `number` | `16` | 스크롤 이벤트 스로틀 시간 (ms) |
| `scrollToFocusedInput` | `boolean` | `true` | 포커스된 입력 필드로 자동 스크롤 여부 |
| `foldableSingleScreen` | `boolean` | `false` | 폴더블 디바이스에서 단일 화면 모드 사용 여부 |
| `dividerLineComponent` | `ReactNode` | `undefined` | 폴더블 디바이스에서 좌우 화면 사이의 구분선 컴포넌트 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **키보드 처리**: 입력 필드 포커스 시 자동으로 키보드 위로 스크롤
- **SafeArea 지원**: iOS와 Android의 SafeArea를 자동으로 처리
- **폴더블 디바이스**: 폴더블 디바이스에서 좌우 화면 분할 지원
- **스크롤 관리**: 스크롤 이벤트와 자동 스크롤 기능 제공
- **상단/하단 컴포넌트**: 고정된 헤더와 푸터 컴포넌트 지원

## 주요 기능

### 1. 키보드 처리

입력 필드가 포커스되면 자동으로 키보드 위로 스크롤됩니다.

```tsx
<ZSContainer scrollToFocusedInput={true}>
  <ZSTextField label="이름" value={name} onChangeText={setName} />
  <ZSTextField label="이메일" value={email} onChangeText={setEmail} />
</ZSContainer>
```

### 2. 상단/하단 컴포넌트

```tsx
<ZSContainer
  topComponent={<Header title="제목" />}
  bottomComponent={<Button title="저장" />}
>
  <Text>메인 콘텐츠</Text>
</ZSContainer>
```

### 3. 스크롤 비활성화

```tsx
<ZSContainer scrollViewDisabled={true}>
  <Text>스크롤 없는 고정 레이아웃</Text>
</ZSContainer>
```

### 4. 폴더블 디바이스 지원

폴더블 디바이스에서 좌우 화면을 분할하여 사용할 수 있습니다.

```tsx
<ZSContainer
  rightComponent={<RightPanel />}
  dividerLineComponent={<View style={{ width: 1, backgroundColor: '#ccc' }} />}
>
  <LeftPanel />
</ZSContainer>
```

### 5. 단일 화면 모드

폴더블 디바이스에서도 단일 화면으로 사용할 수 있습니다.

```tsx
<ZSContainer foldableSingleScreen={true}>
  <Text>단일 화면 모드</Text>
</ZSContainer>
```

## 예제

### 기본 레이아웃

```tsx
<ZSContainer>
  <ZSText typo="heading.1">제목</ZSText>
  <ZSText typo="body.2">본문 내용</ZSText>
</ZSContainer>
```

### 상태바 설정

```tsx
<ZSContainer
  barStyle="light-content"
  statusBarColor="#000000"
  backgroundColor="#000000"
>
  <Text style={{ color: '#fff' }}>다크 모드 화면</Text>
</ZSContainer>
```

### 커스텀 스크롤 이벤트

```tsx
<ZSContainer
  onScroll={(event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    console.log('Scroll offset:', offsetY);
  }}
  scrollEventThrottle={100}
>
  <View style={{ height: 2000 }}>
    <Text>긴 콘텐츠</Text>
  </View>
</ZSContainer>
```

### Ref 사용

```tsx
import { useRef } from 'react';
import { ZSContainer, ZSContainerRef } from '@0610studio/zs-ui';

function MyComponent() {
  const containerRef = useRef<ZSContainerRef>(null);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <>
      <ZSContainer ref={containerRef}>
        <View style={{ height: 2000 }}>
          <Text>긴 콘텐츠</Text>
        </View>
      </ZSContainer>
      <Button title="맨 위로" onPress={scrollToTop} />
    </>
  );
}
```

### SafeArea 에지 설정

```tsx
<ZSContainer edges={['top', 'bottom']}>
  <Text>상하단 SafeArea 적용</Text>
</ZSContainer>

<ZSContainer edges={[]}>
  <Text>SafeArea 없음</Text>
</ZSContainer>
```
