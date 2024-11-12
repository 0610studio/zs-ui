---
sidebar_position: 3
---

# typography

ZS-ui component가 아닌 style 에서도 적용할 수 있도록 useTheme 에서 typography 를 제공합니다.


### 사용법

```tsx
import { useTheme } from '@0610studio/zs-ui/src/model/useThemeProvider';
import { Text } from 'react-native';

const { typography } = useTheme();

<Text style={{fontFamily: typography.themeFonts[400]}}></Text>
```

