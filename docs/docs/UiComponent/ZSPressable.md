---
sidebar_position: 4
---

# ZSPressable

커스텀 스타일과 애니메이션이 적용된 버튼 컴포넌트를 제공합니다.

이 컴포넌트는 사용자의 클릭 및 롱클릭 이벤트를 다루며, 배경 색상, 애니메이션 효과, 그림자 레벨 등을 쉽게 설정할 수 있도록 설계되었습니다.


### 기본 사용법

```tsx
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ZSPressable from '@0610studio/zs-ui';

export default function App() {
  return (
    <ZSPressable
      style={{ 
        backgroundColor: background.neutral,
        paddingVertical: 20,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
      }}
      onPress={useCallback(() => {
        console.log('ZSPressable onPress');
      }, [])}
      fullWidth
    >
      <ZSText typo="subTitle.1">ZSPressable 버튼</ZSText>
    </ZSPressable>
  );
}
```


## Props

### 기본 속성

| Prop                          | Type                      | Default                        | Description                                                  |
|-------------------------------|---------------------------|--------------------------------|--------------------------------------------------------------|
| `onPress`                     | `(value?: any) => void`   | Required                      | 버튼 클릭 시 실행될 콜백 함수입니다.                         |
| `onLongPress`                 | `(value?: any) => void`   | `undefined`                   | 버튼을 길게 누를 때 실행될 콜백 함수입니다.                  |
| `pressedBackgroundColor`      | `string`                  | `'rgba(180, 180, 180, 0.1)'` | 눌렸을 때 버튼의 배경 색상입니다.                            |
| `pressedBackgroundBorderRadius`| `number`                | `16`                          | 눌렸을 때의 버튼의 둥근 모서리 반경입니다.                   |
| `flex`                        | `number`                  | `undefined`                   | 버튼의 flex 속성입니다.                                       |
| `minWidth`                    | `number`                  | `undefined`                   | 버튼의 최소 너비를 지정합니다.                               |
| `isAnimation`                 | `boolean`                 | `true`                        | 버튼에 애니메이션 효과를 적용할지 여부를 설정합니다.          |
| `elevationLevel`              | `ShadowLevel`             | `0`                           | 버튼의 그림자 깊이를 설정합니다. (0~9 단계)                  |
| `fullWidth`                   | `boolean`                 | `false`                       | 버튼이 부모 요소의 전체 너비를 차지하도록 설정합니다.         |

### 추가 Props
`ZSPressable`는 `ViewProps`를 확장하여 기본 React Native `View`에서 사용하는 모든 속성을 지원합니다.

---

### `ShadowLevel` 및 `AnimatedWrapper`

`ZSPressable`은 내부적으로 `AnimatedWrapper`를 사용하여 플랫폼별 그림자 효과를 제공합니다. iOS와 Android에 따라 그림자 스타일이 적절히 적용됩니다.

| Level | iOS Shadow | Android Elevation |
|-------|------------|-------------------|
| 0     | 없음       | 0                 |
| 1     | 얕음       | 1                 |
| ...   | ...        | ...               |
| 9     | 깊음       | 9                 |
