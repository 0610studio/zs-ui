---
sidebar_position: 3
---

# typography

ZS-ui는 React Native 스타일링에서 일관된 타이포그래피를 적용할 수 있도록 `useTheme`에서 `typography`를 제공합니다.

이를 통해 ZS-ui 컴포넌트 외부에서도 동일한 타이포그래피 스타일을 사용할 수 있습니다.


### 사용법

```tsx
import { useTheme } from '@0610studio/zs-ui/src/model/useThemeProvider';
import { Text } from 'react-native';

const { typography } = useTheme();

<Text style={{fontFamily: typography.themeFonts[400]}}></Text>
```

