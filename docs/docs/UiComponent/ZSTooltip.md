---
sidebar_position: 14
---

# ZSTooltip

꼬리가 달린 말풍선 컴포넌트입니다. 기능 안내·신규 배지 같은 짧은 힌트에 사용합니다.

**배치는 담당하지 않습니다.** 앵커 요소 주변에 놓는 것은 부모의 책임이며, 이 컴포넌트는 말풍선 자체와 꼬리 방향·정렬만 처리합니다.

## 기본 사용법

```tsx
import { ZSTooltip } from '@0610studio/zs-ui';

<View>
  <ZSTooltip message="새로운 기능이 추가되었어요" />
  <MyButton />
</View>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `undefined` | 말풍선 메시지. `children` 지정 시 `children` 이 우선합니다 |
| `children` | `React.ReactNode` | `undefined` | 커스텀 콘텐츠 |
| `visible` | `boolean` | `undefined` | 표시 여부를 외부에서 제어할 때 사용 (미지정 시 내부 상태로 동작) |
| `initialVisible` | `boolean` | `true` | 비제어 모드의 초기 표시 상태 |
| `onClose` | `() => void` | `undefined` | 닫기 버튼 탭 시 호출 |
| `placement` | `'top' \| 'bottom'` | `'top'` | 앵커 기준 말풍선 위치. `top` 이면 꼬리가 **아래**를 향합니다 |
| `showClose` | `boolean` | `false` | `true`면 닫기(X) 버튼 표시 |
| `floating` | `boolean` | `false` | `true`면 위아래로 살짝 떠다니는 반복 애니메이션 |
| `backgroundColor` | `string` | 테마 `grey[90]` | 말풍선 배경색 |
| `textColor` | `string` | 테마 `background.base` | 메시지·닫기 아이콘 색 |
| `typo` | `TypoOptions` | `'body.4'` | 메시지 타이포그래피 |
| `tailAlign` | `'start' \| 'center' \| 'end'` | `'start'` | 꼬리 정렬 |
| `tailOffset` | `number` | `16` | `start`/`end` 정렬 시 가장자리에서 꼬리까지의 간격(px) |
| `closeAccessibilityLabel` | `string` | `'툴팁 닫기'` | 닫기 버튼의 접근성 라벨 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **테마 반전 표면**: 라이트 모드는 어두운 말풍선 + 밝은 텍스트, 다크 모드는 그 반대로 자동 반전되어 배경과 확실히 구분됩니다
- **등장·퇴장 애니메이션**: `placement` 에 따라 `FadeInUp`/`FadeInDown` 방향이 정해집니다 (150ms)
- **그림자**: `boxShadow` 로 렌더해 iOS·Android 가 동일합니다
- **hug 레이아웃**: 콘텐츠 폭으로 렌더링되고 부모 폭을 넘지 않습니다 (`maxWidth: '100%'`)
- **pointerEvents 통과**: 컨테이너는 `box-none` 이라 말풍선 밖 영역의 터치를 막지 않습니다

## 꼬리 방향과 정렬

`placement` 가 꼬리의 **방향**을, `tailAlign` 이 꼬리의 **가로 위치**를 정합니다.

```tsx
{/* 앵커 위에 놓고 꼬리는 아래를 향함 (기본) */}
<ZSTooltip message="위쪽 말풍선" placement="top" />

{/* 앵커 아래에 놓고 꼬리는 위를 향함 */}
<ZSTooltip message="아래쪽 말풍선" placement="bottom" />

{/* 꼬리 정렬 */}
<ZSTooltip message="좌측 정렬" tailAlign="start" />
<ZSTooltip message="가운데 정렬" tailAlign="center" />
<ZSTooltip message="우측 정렬" tailAlign="end" />
```

앵커가 화면 왼쪽에 있으면 `tailAlign="start"`, 오른쪽이면 `"end"` 를 주고 `tailOffset` 으로 앵커 중심에 맞춥니다.

## 예제

### 닫을 수 있는 안내

```tsx
const [visible, setVisible] = useState(true);

<ZSTooltip
  message="여기서 알림 설정을 변경할 수 있어요"
  visible={visible}
  showClose
  onClose={() => setVisible(false)}
/>
```

### 시선을 끄는 떠다니는 애니메이션

```tsx
<ZSTooltip message="여기를 눌러보세요" floating />
```

### 커스텀 콘텐츠

```tsx
<ZSTooltip placement="bottom" tailAlign="center">
  <View style={{ gap: 4 }}>
    <ZSText typo="subTitle.4" color="white">신규 기능</ZSText>
    <ZSText typo="caption.1" color="white">이제 폴더블 기기를 지원합니다</ZSText>
  </View>
</ZSTooltip>
```

### 앵커 주변 배치

배치는 부모가 담당합니다. 앵커 위에 겹쳐 띄우려면 `position: 'absolute'` 를 사용합니다.

```tsx
<View>
  <View style={{ position: 'absolute', bottom: '100%', left: 0 }}>
    <ZSTooltip message="이 버튼을 눌러 저장하세요" tailAlign="start" tailOffset={20} />
  </View>
  <ZSBlockButton title="저장" typo="body.2" onPress={handleSave} />
</View>
```

### 색상 직접 지정

```tsx
<ZSTooltip
  message="주의가 필요합니다"
  backgroundColor="#B54708"
  textColor="#FFFFFF"
/>
```
