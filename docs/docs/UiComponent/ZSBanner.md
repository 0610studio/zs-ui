# ZSBanner

화면 안 관련 UI 가까이에 두는 상태 메시지입니다. 시간이 지나도 사라지지 않고 자리를 지킵니다(HIG는 상태를 관련 UI 가까이에 두라고 권합니다). 잠깐 알리고 사라져도 되는 결과는 [Snackbar](../OverlayComponent/Snackbar)를 씁니다.

두 플랫폼 같은 모양입니다 — 모서리 20(`xl`)의 면 한 장, 그림자 없음, 한 줄이면 높이 56, 안쪽 여백 16.

## 기본 사용법

```tsx
import { ZSBanner } from '@0610studio/zs-ui';

<ZSBanner status="success" message="프로필을 저장했습니다." />

<ZSBanner
  status="error"
  title="동기화 실패"
  message="네트워크 연결을 확인해 주세요."
  action={{ label: '다시 시도', onPress: retry }}
  onClose={() => setError(null)}
/>
```

## Props — `ZSBannerProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `message` | `string` | Required | 본문 |
| `title` | `string` | `undefined` | 제목(강조 굵기). 없으면 `message`가 강조 굵기, 있으면 `message`는 기본 굵기입니다 |
| `status` | `ZSBannerStatus` | `'info'` | `'info' \| 'success' \| 'warning' \| 'error' \| 'neutral'` |
| `variant` | `ZSBannerVariant` | `'tonal'` | `'tonal'`: 상태 색 컨테이너, `'outlined'`: 배경 위 상태 색 테두리 |
| `icon` | `ReactNode \| null` | 상태별 기본 아이콘 | `null`이면 아이콘을 숨깁니다 |
| `action` | `{ label: string; onPress: () => void }` | `undefined` | 본문 아래 동작 버튼 |
| `onClose` | `() => void` | `undefined` | 있으면 닫기 버튼을 보입니다 |
| `closeAccessibilityLabel` | `string` | `accessibilityLabels.closeMessage`(`'Close message'`) | 닫기 버튼의 스크린 리더 라벨. 앱 전체 기본값은 [ThemeProvider `accessibilityLabels`](../Provider/ThemeProvider#스크린-리더-문구--accessibilitylabels)로 바꿉니다 |
| `visible` | `boolean` | `undefined` | 보임 여부 — 제어. 주지 않으면 비제어로 닫기 버튼이 숨깁니다 |
| `defaultVisible` | `boolean` | `true` | 비제어 초기값 |
| `fullWidth` | `boolean` | `true` | `false`면 내용 폭 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 배너 상자 스타일 |
| `testID` | `string` | `'zs-banner'` | 닫기 버튼은 `${testID}-close` |

`ZSBannerProps`·`ZSBannerStatus`·`ZSBannerVariant` 타입을 내보냅니다.

## 색

| status | tonal 배경 · 글자 | 아이콘 · outlined 테두리 |
|--------|-----------------|------------------------|
| `info` · `success` · `warning` · `error` | `*Container` · `on*Container` | 상태 main 색 |
| `neutral` | `surface2` · `text` | `textSecondary` |

닫기 X는 글자색입니다. outlined 배경은 `background`, 글자는 `text`입니다.

```tsx
<ZSBanner status="warning" variant="outlined" message="저장 공간이 부족합니다." />
<ZSBanner status="neutral" icon={null} message="아이콘 없이 텍스트만" />
```

기본 아이콘(22)은 상태 main 색 면 안에 기호를 배너 면 색으로 오려 낸 모양입니다 — `info`·`neutral` 원 안 i, `success` 원 안 체크, `warning` 세모 안 느낌표, `error` 원 안 느낌표. `error`는 [ZSTextField](./ZSTextField) 오류 표시와 같은 느낌표입니다.

## 보이기·숨기기

- `visible`을 주지 않으면 닫기 버튼을 누를 때 스스로 숨고 `onClose`를 호출합니다. 숨긴 채 시작하려면 `defaultVisible={false}`.
- `visible`을 주면 부모가 소유합니다. 닫기 버튼은 `onClose`만 호출합니다.
- 나타날 때 fade spring으로 페이드인하고 사라질 때 짧게 페이드아웃합니다. 배너 자리가 바뀌면 위치는 move spring으로 옮겨 가고 크기는 바로 바뀝니다([모션 토큰](../Theme/tokens#모션--spring--timing)).

```tsx
const [error, setError] = useState<string | null>(null);

<ZSBanner visible={error !== null} status="error" message={error ?? ''} onClose={() => setError(null)} />
```

## 접근성

- `error`·`warning`은 `alert`, 나머지는 `summary` 역할입니다.
- Android에서는 나타날 때 읽힙니다(`accessibilityLiveRegion="polite"`).
- 닫기 버튼은 보이는 X 20, 터치 영역 44(두 플랫폼 같음)이고 Android는 48dp까지 넓힙니다.
- 글자 크기 설정이 커져 문구가 여러 줄이 되면 위로 정렬하고, 아이콘·닫기 버튼을 첫 줄 가운데에 맞춥니다.

## 관련 문서

- [Snackbar](../OverlayComponent/Snackbar) — 화면 위에 잠깐 뜨는 알림
- [ZSTextField](./ZSTextField) — 입력 오류는 필드의 `errorText`
