---
sidebar_position: 6
---

# ZSBottomButton

키보드가 표시될 때 자동으로 위치를 조정하는 하단 고정 버튼입니다. 비동기 동작을 지원하며, 기본 버튼과 보조 버튼을 함께 표시할 수 있습니다.

## 기본 사용법

```tsx
import { ZSBottomButton } from '@0610studio/zs-ui';

<ZSBottomButton
  primaryLabelComponent={<Text>확인</Text>}
  primaryOnPress={async () => {
    // 비동기 작업 수행
  }}
/>
```

## Props

| 이름 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `loadingComponent` | `React.ReactNode` | `<ActivityIndicator />` | 로딩 중 표시할 컴포넌트 |
| `height` | `number` | `55` | 버튼 영역의 높이 |
| `disabled` | `boolean` | `false` | 비활성화 여부 |
| `primaryOnPress` | `() => Promise<any>` | Required | 메인 버튼 클릭 시 실행될 비동기 함수 |
| `primaryLabelComponent` | `React.ReactNode` | Required | 메인 버튼에 표시될 컴포넌트 |
| `primaryButtonStyle` | `TouchableOpacityProps['style']` | `{}` | 메인 버튼 스타일 |
| `secondaryOnPress` | `() => void` | `undefined` | 서브 버튼 클릭 시 실행될 함수 |
| `secondaryLabelComponent` | `React.ReactNode` | `undefined` | 서브 버튼에 표시될 컴포넌트 |
| `secondaryButtonStyle` | `TouchableOpacityProps['style']` | `{}` | 서브 버튼 스타일 |

ZSBottomButton은 안전 영역을 고려하여 하단에 고정되며, 키보드가 나타날 경우 버튼이 자동으로 위로 이동하여 입력 필드가 가려지지 않도록 합니다.
