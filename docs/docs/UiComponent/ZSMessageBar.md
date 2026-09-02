---
sidebar_position: 15
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSMessageBar

화면에 인라인으로 놓는 상태 메시지 바입니다. 폼 안내·경고·결과 알림에 사용합니다.

일시적으로 떠올랐다 사라지는 알림이 필요하면 [Snackbar](../OverlayComponent/Snackbar.md)를 사용하세요. `ZSMessageBar` 는 레이아웃 흐름 안에 남아 있는 메시지입니다.

<LocalPlayground example="ZSMessageBar" height={720} />

## 기본 사용법

```tsx
import { ZSMessageBar } from '@0610studio/zs-ui';

<ZSMessageBar
  intent="warning"
  message="본인 인증이 완료되지 않았습니다."
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | Required | 본문 메시지 |
| `title` | `string` | `undefined` | 메시지 위에 굵게 표시되는 제목 |
| `intent` | `IntentOptions` | `'information'` | 색상 계열과 기본 아이콘을 결정 |
| `variant` | `'pastel' \| 'solid' \| 'stroke'` | `'pastel'` | 배경 스타일 |
| `icon` | `React.ReactNode \| null` | intent 기본 아이콘 | 커스텀 아이콘. **`null` 을 넘기면 아이콘을 숨깁니다** |
| `actionLabel` | `string` | `undefined` | 본문 아래 텍스트 버튼 라벨 |
| `onAction` | `() => void` | `undefined` | 액션 버튼 탭 시 호출 |
| `showClose` | `boolean` | `false` | `true`면 우측 상단 닫기(X) 버튼 표시 |
| `onClose` | `() => void` | `undefined` | 닫기 버튼 탭 시 호출 |
| `visible` | `boolean` | `undefined` | 표시 여부를 외부에서 제어할 때 사용 (미지정 시 닫기 버튼으로 내부 제어) |
| `textSize` | `TypoSubStyle` | `'3'` | 텍스트 typo 크기 (`'1'`~`'6'`). 아이콘 크기도 함께 결정됩니다 |
| `fullWidth` | `boolean` | `true` | `false`면 콘텐츠 폭에 맞춰 줄어듭니다 |
| `animated` | `boolean` | `true` | `false`면 등장·퇴장 페이드를 끕니다 |
| `disabled` | `boolean` | `false` | 비활성화 (흐리게 표시) |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## intent 별 기본 아이콘

| Intent | 아이콘 |
|--------|--------|
| `information` (기본) · `primary` · `grey` | 정보 (i) |
| `success` | 체크 원형 |
| `warning` | 경고 삼각형 |
| `danger` | 금지 |

`icon` prop 으로 교체하거나 `icon={null}` 로 숨길 수 있습니다.

## Variant

| Variant | 배경 | 테두리 | 본문 색 | 아이콘 색 |
|---------|------|--------|---------|-----------|
| `pastel` (기본) | `intent.5` | `intent.20` | 본문 기본색 (`text.base`) | intent 잉크 |
| `solid` | `intent.50` | `intent.50` | 흰색 (`warning` 만 검정) | 본문과 동일 |
| `stroke` | `background.base` | `intent.30` | 라이트: 어두운 잉크 / 다크: 밝은 shade | 본문과 동일 |

> `pastel` 은 본문에 intent 색 잉크가 아니라 중립 본문색을 씁니다. 색으로 상태를 전달하는 역할은 배경과 아이콘이 맡고, 본문은 읽기에만 집중시킵니다 (대비 14:1 이상).
>
> `intent` 스케일은 다크모드에서도 라이트와 같아 `pastel` 배경이 두 모드에서 모두 밝습니다. 그래서 다크모드에서는 `text.base`(밝은 색) 대신 명도가 같은 어두운 `grey.10` 을 씁니다. 배경이 실제로 뒤집히는 `grey` intent 만 예외로 `text.base` 를 그대로 사용합니다.

## 특징

- **레이아웃 애니메이션**: 닫기·표시 전환 시 페이드와 함께 주변 레이아웃이 부드럽게 재배치됩니다 (`LinearTransition`)
- **제어·비제어 양쪽 지원**: `visible` 미지정 시 닫기 버튼이 내부 상태로 동작하고, 지정하면 부모가 소유합니다. 제어 모드에서 다시 열리면 내부 상태도 함께 동기화됩니다
- **대비 보정된 본문 색**: intent × variant × 테마 모드별로 읽히는 색을 따로 정의합니다

## 예제

### 제목 + 본문 + 액션

```tsx
<ZSMessageBar
  intent="danger"
  title="결제에 실패했습니다"
  message="카드 한도를 확인한 뒤 다시 시도해주세요."
  actionLabel="다시 시도"
  onAction={retryPayment}
/>
```

### 닫을 수 있는 안내 (비제어)

```tsx
<ZSMessageBar
  intent="information"
  message="이번 주부터 배송 정책이 변경되었습니다."
  showClose
  onClose={() => markAsRead()}
/>
```

### 외부에서 표시 제어

```tsx
const [visible, setVisible] = useState(false);

<ZSMessageBar
  intent="success"
  message="저장되었습니다."
  visible={visible}
  showClose
  onClose={() => setVisible(false)}
/>
```

### variant 비교

```tsx
<ZSMessageBar intent="warning" variant="pastel" message="pastel 스타일" />
<ZSMessageBar intent="warning" variant="solid" message="solid 스타일" />
<ZSMessageBar intent="warning" variant="stroke" message="stroke 스타일" />
```

### 아이콘 숨기기 · 교체

```tsx
{/* 숨김 */}
<ZSMessageBar message="아이콘 없는 메시지" icon={null} />

{/* 커스텀 */}
<ZSMessageBar message="배송 중입니다" icon={<MyTruckIcon size={20} />} />
```

### 콘텐츠 폭에 맞추기

```tsx
<ZSMessageBar fullWidth={false} intent="success" message="적용 완료" textSize="5" />
```

### 폼 검증 메시지

입력 필드의 `errorMessage` 는 필드 단위 오류에, `ZSMessageBar` 는 폼 전체 상태에 사용하면 역할이 겹치지 않습니다.

```tsx
{submitError && (
  <ZSMessageBar
    intent="danger"
    message={submitError}
    showClose
    onClose={() => setSubmitError('')}
  />
)}
<ZSTextField label="이메일" value={email} onChangeText={setEmail} />
```
