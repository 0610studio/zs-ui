# 공통 토큰과 유틸리티

ZS-ui 컴포넌트가 함께 사용하는 모서리, 간격, 모션, 비활성 상태와 그림자 기준입니다. 앱에서 ZS-ui 컴포넌트와 나란히 배치하는 커스텀 UI에도 같은 값을 적용할 수 있습니다.

## 토큰

```tsx
import { RADIUS, SPACING, DURATION, DISABLED_OPACITY } from '@0610studio/zs-ui';
```

| Export | 값 | 용도 |
|---|---|---|
| `RADIUS` | `xs` 4 · `sm` 6 · `md` 12 · `lg` 14 · `xl` 16 · `xxl` 22 · `sheet` 26 · `pill` 9999 | 컴포넌트 모서리 반경 단계(체크박스 `xs`, 버튼 `sm`·`md`, 입력·카드 `lg`, 스낵바 `xl`, 다이얼로그 `xxl`, 바텀시트 `sheet`) |
| `SPACING` | `xxs` 4 · `xs` 8 · `sm` 12 · `md` 16 · `lg` 20 · `xl` 24 · `xxl` 32 · `xxxl` 40 · `screen` 16 | 패딩·마진·`gap` 간격 단계(4pt 격자). `screen`은 화면 좌우 여백 하나 |
| `DURATION` | `press` 100 · `fast` 150 · `base` 200 · `slow` 250 · `enter` 300 (ms) | 눌림·퇴장, 포커스, 상태 전환, 이동, 오버레이 진입 애니메이션 시간 |
| `DISABLED_OPACITY` | `0.7` | 비활성 컴포넌트의 공통 투명도 |

토큰은 개별 화면에서 비슷한 숫자를 새로 만드는 대신, ZS-ui 컴포넌트와 시각적 리듬을 맞춰야 할 때 사용합니다.

## 간격 쓰는 곳

간격은 `SPACING` 단계로만 씁니다. 같은 역할에는 같은 단계를 쓰고, 묶음 안 간격은 묶음 사이 간격보다 좁게 둡니다.

| 자리 | 단계 | 값 |
|---|---|---|
| 화면 좌우 여백(카드·목록·헤더의 바깥 끝) | `screen` | 16 |
| 아이콘과 글자 사이, 배지 안쪽 | `xxs` | 4 |
| 제목과 본문 사이, 한 묶음 안의 줄 사이, 붙은 버튼 사이 | `xs` | 8 |
| 칩·태그 사이, 목록 항목 사이 | `sm` | 12 |
| 카드 안쪽 여백, 입력칸 안쪽 좌우 | `md` | 16 |
| 카드와 카드 사이 | `lg` | 20 |
| 섹션과 섹션 사이 | `xl` | 24 |
| 화면 위 큰 구획, 빈 화면 안내 위아래 | `xxl`·`xxxl` | 32·40 |

```tsx
import { SPACING } from '@0610studio/zs-ui';

const styles = StyleSheet.create({
  page: { paddingHorizontal: SPACING.screen },
  card: { padding: SPACING.md, gap: SPACING.xs, marginBottom: SPACING.lg },
});
```

기존 화면의 4의 배수가 아닌 값(5·10·15 등)은 화면을 고칠 때 가까운 단계로 옮깁니다. 5는 `xxs`(4), 10은 `xs`(8)나 `sm`(12) 중 역할에 맞는 쪽, 15는 `md`(16)로 옮깁니다.

## 그림자 생성

`createShadow`는 React Native 그림자 속성과 테마 색상을 `boxShadow` 값 배열(`BoxShadowValue[]`)로 변환합니다.

```tsx
import { createShadow, useTheme } from '@0610studio/zs-ui';

const { palette } = useTheme();
const cardShadow = createShadow(
  {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  palette.grey[100],
);
```

일반적인 카드와 오버레이는 `ZSView`의 `elevationLevel`을 먼저 사용하고, 임의의 오프셋이나 블러가 필요한 경우에만 `createShadow`를 사용하세요.

## 중복 실행 방지

`usePreventDoublePress(onPress, interval?)`는 결제나 제출처럼 중복 호출을 막아야 하는 액션에 사용합니다. 첫 호출만 통과시키고 `interval` 동안 연속 호출을 막으며, 기본 잠금 시간은 `PREVENT_DOUBLE_PRESS_INTERVAL`(2000ms)입니다.

```tsx
import {
  PREVENT_DOUBLE_PRESS_INTERVAL,
  usePreventDoublePress,
} from '@0610studio/zs-ui';

const handleSubmit = usePreventDoublePress(
  () => submitForm(),
  PREVENT_DOUBLE_PRESS_INTERVAL,
);
```

일반 버튼의 짧은 연타 방어는 `ZSPressable`에 내장되어 있습니다. 더 긴 잠금이 필요한 경우 `ZSBlockButton`의 `preventDoublePress` 또는 이 훅을 사용하세요.

## 관련 문서

- [Palette](./palette)
- [Typography](./typography)
- [ZSView](../UiComponent/ZSView)
- [ZSPressable](../UiComponent/ZSPressable)
