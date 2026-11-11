# ZSTopBar

화면 맨 위에 두는 상단 바입니다. iPhone Duo 에서 세로 바를 끄면(`LayoutProvider barAxis="horizontal"`) 상태바가 오른쪽 위 모서리로 모이고, 그 왼쪽 시계 옆 칸이 빕니다. `ZSTopBar`는 이 칸에 검색창·버튼 같은 컨트롤을 놓습니다. 그 밖의 기기에서는 상태바 아래에 놓입니다.

```tsx
import { StyleSheet, View } from 'react-native';
import { ZSTopBar } from '@0610studio/zs-ui';

function MapScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Map style={StyleSheet.absoluteFill} />
      <ZSTopBar style={{ position: 'absolute', top: 0, left: 0, right: 0 }} contentStyle={{ gap: 8 }}>
        <SearchField style={{ flex: 1 }} />
        <IconButton icon="bell" />
      </ZSTopBar>
    </View>
  );
}
```

## 배치

| 기기 | `safeArea` true (기본) | `safeArea` false |
|------|------|------|
| iPhone Duo, 세로 바 끔 (`besideStatusBar`) | 시스템 bar region 안. 왼쪽은 시스템 여백, 오른쪽은 상태바 시작점까지 | 컴포넌트 전체(위 safe area 높이, 상태바 밑 포함) |
| 그 밖 (`belowStatusBar`) | 상태바 아래 safe area 안, `height` 만큼 | 컴포넌트 전체(상태바 높이 + `height`) |

- 컴포넌트 높이는 `ZSTopBar`가 정합니다. 시계 옆 칸이면 위 safe area 높이라, 그 아래 콘텐츠는 safe area 위쪽부터 놓으면 됩니다.
- children 은 가로 줄(`flexDirection: 'row'`, `alignItems: 'center'`)에 놓입니다. 높이가 `height`보다 작은 컨트롤은 줄 가운데에 옵니다.
- 화면 맨 위에 둡니다. 시계 옆 칸 판단은 컴포넌트 자기 좌표로 하므로, 상태바 아래에 두면 `belowStatusBar`가 됩니다.

## 사용 조건

상태바 옆 배치는 iOS 27.1 이상과 iOS 27.1 SDK(Xcode 27.1) 빌드가 필요합니다. 나머지 환경에서는 safe area 아래에 배치합니다.

## @expo/ui 컨트롤 넣기

`@expo/ui` 의 `Host` 는 SwiftUI 내용을 safe area 안에 둡니다. 상단 바는 위 safe area 안에 있어서 그대로 두면 버튼이 safe area 아래(상단 바 밖)로 밀려납니다. `Host` 에 `ignoreSafeArea="container"` 를 줍니다.

```tsx
import { Button, Host } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, labelStyle } from '@expo/ui/swift-ui/modifiers';

<ZSTopBar>
  <SearchField style={{ flex: 1 }} />
  <Host matchContents ignoreSafeArea="container">
    <Button label="알림" systemImage="bell" onPress={openNotices} modifiers={[labelStyle('iconOnly'), buttonStyle('glass'), controlSize('regular')]} />
  </Host>
</ZSTopBar>
```

`controlSize('large')` glass 버튼은 약 60pt 로 칸(48)보다 큽니다. `regular` 를 씁니다. Android Compose `Host` 는 이 문제가 없습니다.

## Props — `ZSTopBarProps`

| Prop | Type | Default | 설명 |
|------|------|--------|------|
| `children` | `ReactNode` | `undefined` | 상단 바 컨트롤 |
| `safeArea` | `boolean` | `true` | 위 표의 배치 |
| `height` | `number` | `48` | 상단 바 컨트롤 높이. 48 이하면 시계 옆 칸에서 컨트롤 가운데가 시계 숫자 가운데와 맞습니다. 더 크면 시스템이 위쪽을 고정해 가운데가 내려갑니다 |
| `onRegionChange` | `(region: ZSTopBarRegion) => void` | `undefined` | 배치·영역이 바뀔 때 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 바깥 스타일. 높이는 덮어쓰지 않습니다 |
| `contentStyle` | `StyleProp<ViewStyle>` | `undefined` | children 을 담는 가로 줄 스타일 |
| `testID` | `string` | `undefined` | children 줄은 `${testID}-content` |

## `ZSTopBarRegion`

| 필드 | Type | 설명 |
|------|------|------|
| `placement` | `'besideStatusBar' \| 'belowStatusBar'` | 시계 옆 칸인지, 상태바 아래인지 |
| `measured` | `boolean` | `false` 면 iOS 네이티브 첫 측정 전 추정값 |
| `height` | `number` | 컴포넌트 높이 |
| `contentInsets` | `{ top, left, right, bottom }` | children 줄이 컴포넌트 가장자리에서 떨어진 거리 |
| `systemBar` | `{ x, y, width, height } \| null` | 시스템 bar region(컴포넌트 좌표). `besideStatusBar` 일 때만 |
| `systemMargins` | `{ left, right } \| null` | 화면 레이아웃 여백(모서리 반영, 컴포넌트 가장자리 기준). `besideStatusBar` 이고 iOS 가 값을 줄 때만 |

`ZSTopBarProps`·`ZSTopBarRegion`·`ZSTopBarPlacement`·`ZSTopBarInsets`·`ZSTopBarRect` 타입을 내보냅니다. 아래 줄 콘텐츠의 왼쪽 시작을 상단 바와 맞추려면 `contentInsets.left`를 씁니다.
