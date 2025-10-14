---
sidebar_position: 6
---

# 폴더블 기기 지원

폴더블 기기의 접힘/펼침 상태를 감지하고, 펼침 상태에서 양쪽 화면에 콘텐츠를 분할하여 표시할 수 있는 기능을 제공합니다.

![폴더블 기기 예제 1](/img/fold_1.gif)

![폴더블 기기 예제 2](/img/fold_2.gif)



## 기본 사용법

```tsx
import { ZSContainer, useFoldingState } from '@0610studio/zs-ui';
import { FoldingState } from '@0610studio/zs-ui/model/types';

function FoldableScreen() {
  const { foldingState } = useFoldingState();

  return (
    <ZSContainer
      dividerLineComponent={<View style={{ width: 3, backgroundColor: '#E0E0E0' }} />}
      rightComponent={
        <View>
          <Text>오른쪽 화면 콘텐츠</Text>
        </View>
      }
    >
      <View>
        <Text>왼쪽 화면 콘텐츠</Text>
        <Text>현재 상태: {foldingState === FoldingState.UNFOLDED ? '펼침' : '접힘'}</Text>
      </View>
    </ZSContainer>
  );
}
```

## 폴딩 상태 감지

### useFoldingState Hook

폴더블 기기의 현재 상태를 감지하는 Hook입니다.

```tsx
import { useFoldingState } from '@0610studio/zs-ui';
import { FoldingState } from '@0610studio/zs-ui/model/types';

function MyComponent() {
  const { foldingState, width } = useFoldingState();

  return (
    <View>
      <Text>현재 상태: {foldingState === FoldingState.UNFOLDED ? '펼침' : '접힘'}</Text>
      <Text>화면 너비: {width}pt</Text>
    </View>
  );
}
```

### FoldingState 타입

```tsx
export enum FoldingState {
  FOLDED = 'FOLDED',     // 접힘 상태 (일반 스마트폰 모드)
  UNFOLDED = 'UNFOLDED'  // 펼침 상태 (태블릿 모드)
}
```

## ZSContainer 폴더블 지원

### ZSContainer Props

| 속성명 | 타입 | 기본값 | 설명 |
|--------|------|--------|------|
| `dividerLineComponent` | `ReactNode` | `undefined` | 두 화면 사이의 구분선 컴포넌트 |
| `rightComponent` | `ReactNode` | `undefined` | 펼침 상태에서 오른쪽 화면에 표시할 컴포넌트 |

### 동작 방식

- **접힘 상태 (FOLDED)**: 일반적인 단일 화면으로 동작하며 `rightComponent`는 표시되지 않습니다.
- **펼침 상태 (UNFOLDED)**: 화면이 좌우로 분할되어 왼쪽에는 기본 콘텐츠, 오른쪽에는 `rightComponent`가 표시됩니다.

### 구분선 설정

두 화면 사이에 구분선을 추가할 수 있습니다.

```tsx
<ZSContainer
  dividerLineComponent={
    <View style={{ 
      width: 2, 
      backgroundColor: '#E0E0E0',
      marginHorizontal: 8 
    }} />
  }
  rightComponent={<RightContent />}
>
  <LeftContent />
</ZSContainer>
```

## 주의사항

1. **플랫폼 지원**: 현재 Android 폴더블 기기에서만 지원됩니다.
2. **스크롤 동기화**: 양쪽 화면의 스크롤은 독립적으로 동작합니다.
3. **키보드 처리**: 키보드가 나타날 때 양쪽 화면 모두에서 적절한 스크롤 처리가 이루어집니다.
4. **성능**: 폴딩 상태 변경 시 리렌더링 및 재시작 발생
