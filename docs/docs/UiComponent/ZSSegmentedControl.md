# ZSSegmentedControl

같은 콘텐츠의 하위 보기를 전환하는 세그먼트 컨트롤입니다. 두 플랫폼 모두 zs-ui가 같은 JS 구현으로 그립니다. 스크린 리더 역할만 플랫폼 관례를 따릅니다([접근성](#접근성)).

## 기본 사용법

```tsx
import { ZSSegmentedControl, type ZSSegmentedControlOption } from '@0610studio/zs-ui';

const RANGES: ZSSegmentedControlOption[] = [
  { label: '일', value: 'day' },
  { label: '주', value: 'week' },
  { label: '월', value: 'month' },
];

<ZSSegmentedControl options={RANGES} onValueChange={(value) => setRange(value)} />
```

## Props — `ZSSegmentedControlProps<T>`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `options` | `ZSSegmentedControlOption<T>[]` | Required | 칸 목록. 2~5개, 라벨은 짧은 명사로(HIG·M3) |
| `value` | `T` | `undefined` | 선택한 `value`(제어) |
| `defaultValue` | `T` | 첫 항목 | 비제어 초기값 |
| `onValueChange` | `(value: T, index: number) => void` | `undefined` | 고른 칸의 `value`와 `options` 안 위치 |
| `disabled` | `boolean` | `false` | 컨트롤 전체 비활성 — [칸을 막고 싶을 때](#칸을-막고-싶을-때) |
| `fullWidth` | `boolean` | `true` | 부모 폭을 채웁니다. `false`면 칸 폭을 가장 긴 라벨에 맞춥니다 — 제목 옆처럼 가로 행 안에 둘 때 |
| `accessibilityLabel` | `string` | `undefined` | 컨트롤 이름(무엇을 고르는지, 예: `'기간'`). 화면에는 보이지 않습니다 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | |

### `ZSSegmentedControlOption<T>`

| 필드 | Type | 설명 |
|------|------|------|
| `label` | `string` | 보이는 문구 |
| `value` | `T` | `onValueChange`로 돌려주는 값 |
| `accessibilityLabel` | `string` | 이 칸의 스크린 리더 이름. 기본 `label` — 기호·줄임말처럼 소리 내어 읽기 어려운 라벨일 때 줍니다 |

`T`는 `string`·`number`입니다(기본 `string`). `ZSSegmentedControlProps`·`ZSSegmentedControlOption` 타입을 내보냅니다.

## 제어·비제어

`value`를 주지 않으면 비제어이고, 처음 선택은 `defaultValue`(없으면 첫 항목)입니다.

```tsx
const VIEWS: ZSSegmentedControlOption[] = [
  { label: '목록', value: 'list' },
  { label: '지도', value: 'map' },
];

const [view, setView] = useState('list');

<ZSSegmentedControl options={VIEWS} value={view} onValueChange={setView} />
{view === 'list' ? <ListView /> : <MapView />}
```

고른 보기를 페이지처럼 가로로 넘기려면 아래에 [ZSSegmentedPages](./ZSSegmentedPages)를 둡니다.

## 칸을 막고 싶을 때

항목별 비활성 옵션은 없습니다. 고를 수 없는 항목은 `options`에서 제외합니다.

## 접근성

```tsx
const LAYOUTS: ZSSegmentedControlOption[] = [
  { label: '☰', value: 'list', accessibilityLabel: '목록' },
  { label: '▦', value: 'grid', accessibilityLabel: '격자' },
];

<ZSSegmentedControl options={LAYOUTS} accessibilityLabel="보기" fullWidth={false} />
```

| | iOS (VoiceOver) | Android (TalkBack) |
|---|-----|---------|
| 칸 | 칸마다 버튼 역할, 이름, 선택 상태(시스템 세그먼트처럼) | 칸마다 라디오 역할, 이름, 선택 상태 |
| 컨트롤 이름 | `accessibilityLabel`을 칸마다 힌트로 읽습니다(iOS에는 라디오 그룹에 맞는 그릇 역할이 없습니다) | `accessibilityLabel`(라디오 그룹 이름) |

컨트롤 이름을 언제 읽는지는 플랫폼마다 다릅니다. 칸 이름만으로 뜻이 통하게 쓰고, 화면에도 옆에 제목을 두는 편이 좋습니다. 힌트 prop은 없습니다.

## 관련 문서

- [ZSSegmentedPages](./ZSSegmentedPages) — 고른 보기를 페이지처럼 넘기기
- [ZSRadioGroup](./ZSRadioGroup)
