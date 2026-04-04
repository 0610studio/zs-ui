---
sidebar_position: 1
---

# ZSContainer

화면 단위 레이아웃을 구성할 때 사용하는 루트 컨테이너입니다. SafeArea, 스크롤, 키보드 대응을 하나로 묶어서 제공합니다.

별도로 `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView`를 조합할 필요가 없습니다.

## 철학

1. **화면 하나 = ZSContainer 하나**. 각 스크린의 최상단 래퍼로 사용합니다.
2. **키보드가 올라와도 입력 필드가 보입니다**. `scrollToFocusedInput`이 기본 켜져 있어, 터치한 입력 필드를 키보드 위로 자동 스크롤합니다. 추가 여백이 필요하면 `keyboardScrollExtraOffset`으로 조절합니다.
3. **필요한 것만 키면 됩니다**. 기본값(ScrollView 활성, 바텀 SafeArea)만으로 대부분의 화면이 동작합니다.

## ZSContainer

| 상황 | 설명 |
|------|------|
| 일반 화면 레이아웃 | 헤더, 본문, 푸터가 있는 화면 |
| 입력 폼이 있는 화면 | 키보드 자동 스크롤이 필요한 화면 |
| 스크롤 없는 고정 화면 | `scrollViewDisabled={true}` |
| 폴더블 기기 양면 분할 | `rightComponent` + `dividerLineComponent` |

> **ZSAboveKeyboard와의 차이**: ZSContainer는 화면 전체의 레이아웃과 자동 스크롤을 담당합니다. 키보드 바로 위에 떠 있는 버튼 같은 floating UI가 필요하면 [ZSAboveKeyboard](./ZSAboveKeyboard.md)를 사용하세요.

## 기본 사용법

```tsx
import { ZSContainer } from '@0610studio/zs-ui';

function MyScreen() {
  return (
    <ZSContainer>
      <ZSText typo="heading.1">제목</ZSText>
      <ZSText typo="body.2">본문 내용</ZSText>
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
| `topComponent` | `ReactNode` | `undefined` | 상단에 표시할 컴포넌트 (스크롤 밖에 고정) |
| `bottomComponent` | `ReactNode` | `undefined` | 하단에 표시할 컴포넌트 (스크롤 밖에 고정) |
| `rightComponent` | `ReactNode` | `undefined` | 우측 화면 컴포넌트 (폴더블 펼침 상태) |
| `showsVerticalScrollIndicator` | `boolean` | `true` | 세로 스크롤 인디케이터 표시 여부 |
| `scrollToFocusedInput` | `boolean` | `true` | 입력 필드 포커스 시 키보드 위로 자동 스크롤 |
| `keyboardScrollExtraOffset` | `number` | `30` | 자동 스크롤 시 키보드와의 추가 여백 (px) |
| `translucent` | `boolean` | `undefined` | 상태바 반투명 여부 |
| `onScroll` | `(event: NativeSyntheticEvent<NativeScrollEvent>) => void` | `undefined` | 스크롤 이벤트 핸들러 |
| `scrollEventThrottle` | `number` | `16` | 스크롤 이벤트 스로틀 (ms) |
| `foldableSingleScreen` | `boolean` | `false` | 폴더블 펼침 상태에서도 단일 화면 모드 |
| `dividerLineComponent` | `ReactNode` | `undefined` | 폴더블 좌우 화면 사이 구분선 |
| `...props` | `ViewProps` | - | React Native `View` 기본 속성 |

## 주요 기능

### 키보드 자동 스크롤

`scrollToFocusedInput={true}` (기본값)일 때, 터치한 입력 필드가 키보드에 가리지 않도록 자동으로 스크롤합니다. `keyboardScrollExtraOffset`으로 입력 필드와 키보드 사이의 여백을 조절할 수 있습니다.

```tsx
<ZSContainer keyboardScrollExtraOffset={50}>
  <ZSTextField label="이름" value={name} onChangeText={setName} />
  <ZSTextField label="이메일" value={email} onChangeText={setEmail} />
</ZSContainer>
```

자동 스크롤이 필요 없는 화면이라면 `scrollToFocusedInput={false}`로 끌 수 있습니다.

### 고정 헤더 / 푸터

`topComponent`와 `bottomComponent`는 스크롤 영역 밖에 고정됩니다.

```tsx
<ZSContainer
  topComponent={<Header title="제목" />}
  bottomComponent={<ZSBlockButton title="저장" onPress={handleSave} />}
>
  <ZSText typo="body.2">스크롤되는 본문</ZSText>
</ZSContainer>
```

### 스크롤 없는 고정 레이아웃

```tsx
<ZSContainer scrollViewDisabled={true}>
  <ZSText>스크롤 없는 화면</ZSText>
</ZSContainer>
```

### 상태바 설정

```tsx
<ZSContainer
  barStyle="light-content"
  statusBarColor="#000000"
  backgroundColor="#000000"
>
  <ZSText typo="body.2" color="white">다크 배경 화면</ZSText>
</ZSContainer>
```

### Ref 사용

`ZSContainerRef`로 내부 ScrollView에 접근할 수 있습니다.

```tsx
import { useRef } from 'react';
import { ZSContainer, ZSContainerRef } from '@0610studio/zs-ui';

function MyComponent() {
  const containerRef = useRef<ZSContainerRef>(null);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <ZSContainer ref={containerRef}>
      <View style={{ height: 2000 }}>
        <ZSText typo="body.2">긴 콘텐츠</ZSText>
      </View>
    </ZSContainer>
  );
}
```

### SafeArea 에지 설정

```tsx
<ZSContainer edges={['top', 'bottom']}>
  <ZSText typo="body.2">상하단 SafeArea 적용</ZSText>
</ZSContainer>

<ZSContainer edges={[]}>
  <ZSText typo="body.2">SafeArea 없음 (엣지 투 엣지)</ZSText>
</ZSContainer>
```

## 폴더블 기기 지원

폴더블 기기에서 화면을 좌우로 분할할 수 있습니다. 자세한 내용은 [폴더블 기기 지원](../FoldableDevice) 문서를 참조하세요.

```tsx
<ZSContainer
  rightComponent={<RightPanel />}
  dividerLineComponent={<View style={{ width: 1, backgroundColor: '#E0E0E0' }} />}
>
  <LeftPanel />
</ZSContainer>
```
