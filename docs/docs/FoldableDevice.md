import LocalPlayground from '@site/src/components/LocalPlayground';

# 폴더블 기기 지원

폴더블 기기의 접힘/펼침 상태를 감지하고, 펼침 상태에서 양쪽 화면에 콘텐츠를 분할하여 표시할 수 있는 기능을 제공합니다.

:::warning 실제 Android 앱에서 확인하세요
웹에서는 예제를 렌더링하지 않고 미지원 안내만 띄웁니다. `useFoldingState`의 접힘·펼침 감지, hinge 전환, `rightComponent` 2-pane 렌더링은 Android 폴더블 에뮬레이터 또는 실제 기기에서 확인하세요.
:::

<LocalPlayground example="FoldableDevice" height={720} />

![폴더블 기기 예제 1](/img/fold_1.gif)

![폴더블 기기 예제 2](/img/fold_2.gif)



## 기본 사용법

```tsx
import { ZSContainer, useFoldingState, FoldingState } from '@0610studio/zs-ui';

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
import { useFoldingState, FoldingState } from '@0610studio/zs-ui';

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
  FOLDED = 'folded',     // 접힘 상태 (일반 스마트폰 모드)
  UNFOLDED = 'unfolded'  // 펼침 상태 (태블릿 모드)
}
```

`useFoldingState()` 는 `{ foldingState, width }` 를 반환합니다. 상태 비교는 문자열 리터럴 대신 `FoldingState` enum 으로 하세요.

## ZSContainer 폴더블 지원

### ZSContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dividerLineComponent` | `ReactNode` | `undefined` | 두 화면 사이의 구분선 컴포넌트 |
| `rightComponent` | `ReactNode` | `undefined` | 펼침 상태에서 오른쪽 화면에 표시할 컴포넌트 |
| `foldableSingleScreen` | `boolean` | `undefined` | 펼침 상태에서도 분할하지 않고 단일 화면으로 유지 |
| `unfoldedSinglePaneMaxWidth` | `number \| false` | `ThemeProvider` 의 `foldable` 설정 | 펼침 + 단일 화면일 때 콘텐츠 최대 가로 길이(px). `false`면 전폭 |

### 동작 방식

- **접힘 상태 (FOLDED)**: 일반적인 단일 화면으로 동작하며 `rightComponent`는 표시되지 않습니다.
- **펼침 상태 (UNFOLDED)**: 화면이 좌우로 분할되어 왼쪽에는 기본 콘텐츠, 오른쪽에는 `rightComponent`가 표시됩니다.

## 특징

1. **플랫폼 지원**: Android 폴더블 기기에서만 동작합니다. iOS·웹에서는 항상 `FoldingState.FOLDED`입니다.
2. **독립 스크롤**: 양쪽 화면은 각자 스크롤됩니다.
3. **키보드 처리**: 키보드가 열리면 마지막으로 터치한 쪽 화면을 키보드 위로 스크롤합니다.
4. **상태 변경**: 접거나 펼치면 화면 크기 변경 이벤트로 상태를 다시 읽어 리렌더링합니다. Activity가 다시 만들어지지 않게 하려면 [config plugin](./Provider/start#android-폴더블-설정)을 등록합니다.
