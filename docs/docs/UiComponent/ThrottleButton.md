---
sidebar_position: 7
---

# ThrottleButton

비동기 함수를 실행할 때 중복 클릭을 방지해 주는 버튼 컴포넌트입니다. 클릭 후 일정 시간 동안 재클릭을 막아 네트워크 요청을 안전하게 처리할 수 있습니다.

## 기본 사용법

```tsx
import { ThrottleButton } from '@0610studio/zs-ui';

<ThrottleButton
  primaryLabelComponent={<Text>저장</Text>}
  primaryOnPress={async () => {
    await saveData();
  }}
/>
```

## Props

| 이름 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `loadingComponent` | `React.ReactNode` | `<ActivityIndicator />` | 로딩 중 표시할 컴포넌트 |
| `disabled` | `boolean` | `false` | 비활성화 여부 |
| `primaryOnPress` | `() => Promise<void>` | Required | 버튼 클릭 시 실행될 비동기 함수 |
| `primaryLabelComponent` | `React.ReactNode` | Required | 버튼에 표시될 컴포넌트 |
| `primaryButtonStyle` | `TouchableOpacityProps['style']` | `{}` | 버튼 스타일 |
| `marginHorizontal` | `number` | `20` | 좌우 여백 |
| `marginBottom` | `number` | `20` | 하단 여백 |
| `onError` | `(error: Error) => void` | `undefined` | 비동기 함수 실행 중 오류 발생 시 호출되는 함수 |

ThrottleButton은 debounce(300ms)와 throttle(2초)이 적용되어 빠른 연속 클릭을 방지하며, 비동기 함수가 종료될 때까지 로딩 상태를 유지합니다.
