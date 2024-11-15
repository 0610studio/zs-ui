---
sidebar_position: 1
---

# 시작하기

각 테마 색상은 `primary`, `secondary`, `danger`, `warning`, `success`, `information`과 같은 다양한 상태에 맞게 정의되어 있으며, 기본 배경과 텍스트 색상도 포함되어있습니다.

`ThemeProvider`로 감싸서 전체 앱에서 useTheme를 사용할 수 있도록 설정합니다.

```jsx
import React from 'react';
import { ThemeProvider } from '@0610studio/zs-ui';
import App from './App';

const Root = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default Root;
```

<br />

### 시스템 색상 설정 감지

`useColorScheme` 훅을 사용하여 시스템의 다크 모드 설정을 감지합니다.

themeMode와 useSystemColorScheme 값은 **AsyncStorage**에 저장되어 있어 사용자가 앱을 다시 열 때 동일한 테마가 적용됩니다.

<br />

### 테마 토글 함수

`toggleTheme` : 사용자가 테마를 라이트와 다크 모드 사이에서 전환할 수 있습니다. 이 함수는 AsyncStorage에 모드를 저장합니다.

<br />

### **속성별 타입**

#### **1. `ThemeProviderProps`**
| **속성 이름**  | **데이터 타입**     | **설명**                                                                                     |
|----------------|---------------------|---------------------------------------------------------------------------------------------|
| `themeFonts`   | `ThemeFonts`       | 타이포그래피 커스터마이징을 위한 설정 (선택).                                                |
| `children`     | `React.ReactNode`  | `ThemeProvider`로 감싸질 React 컴포넌트.                                                    |

#### **2. `ThemeProps`**
| **속성 이름**  | **데이터 타입**              | **설명**                                                                                     |
|----------------|-----------------------------|---------------------------------------------------------------------------------------------|
| `palette`      | `Palette`                  | 테마 색상 팔레트 (라이트 및 다크 모드 지원).                                                |
| `typography`   | `TypographyVariantsProps`  | 타이포그래피 스타일을 정의한 객체.                                                          |

#### **3. `Palette`**
| **속성 이름**                | **데이터 타입**                 | **설명**                                                                                     |
|------------------------------|--------------------------------|---------------------------------------------------------------------------------------------|
| `mode`                      | `'light' | 'dark'`           | 현재 테마 모드 (라이트/다크).                                                               |
| `isUsingSystemColorScheme`  | `boolean`                    | 시스템 색상 모드 사용 여부.                                                                 |
| `setUseSystemColorScheme`   | `(useSystem: boolean) => void` | 시스템 색상 모드 활성화/비활성화 설정 함수.                                                  |
| `toggleTheme`               | `() => void`                 | 테마를 수동으로 전환하는 함수.                                                              |

#### **4. `Theme`**
| **속성 이름**   | **데이터 타입**   | **설명**                                                                                     |
|----------------|-------------------|---------------------------------------------------------------------------------------------|
| `primary`      | `ColorScale`     | 주요 색상 데이터.                                                                            |
| `secondary`    | `ColorScale`     | 보조 색상 데이터.                                                                            |
| `text`         | `TextColors`     | 텍스트 색상 데이터 (주요, 보조, 비활성 등).                                                  |
| `background`   | `BackgroundColors` | 배경 색상 데이터 (레이어별, 컨텍스트별).                                                     |
| `action`       | `ActionColors`   | 액션 상태별 색상 데이터 (hover, pressed 등).                                                 |
| `divider`      | `string`         | 분할선 색상.                                                                                |

#### **5. `TypographyVariantsProps`**
| **속성 이름**  | **데이터 타입**      | **설명**                                                                                     |
|----------------|----------------------|---------------------------------------------------------------------------------------------|
| `heading`      | `TypographyStyle`   | 헤딩 스타일 (폰트 크기, 두께 등).                                                           |
| `body`         | `TypographyStyle`   | 본문 스타일.                                                                               |
| `caption`      | `TypographyStyle`   | 캡션 스타일.                                                                               |

