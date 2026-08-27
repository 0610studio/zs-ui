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
| **속성 이름** | **데이터 타입** | **기본값** | **설명** |
|---------------|-----------------|-----------|----------|
| `children` | `React.ReactNode` | Required | `ThemeProvider`로 감싸질 React 컴포넌트 |
| `themeFonts` | `ThemeFonts` | `undefined` | 폰트 weight 별 폰트 패밀리 이름 매핑 (`400`·`700` 필수) |
| `isDarkModeEnabled` | `boolean` | `true` | `false`면 시스템 설정을 무시하고 라이트 모드로 고정 |
| `customPalette` | `(config) => Theme` | `undefined` | `themeFactory` 로 만든 커스텀 팔레트 함수 |
| `foldable` | `FoldableConfig` | `undefined` | 폴더블 펼침 상태의 단일 화면 최대 폭 설정 |

#### **2. `ThemeProps`** — `useTheme()` 반환값
| **속성 이름** | **데이터 타입** | **설명** |
|---------------|-----------------|----------|
| `palette` | `Palette` | 테마 색상 팔레트 + 모드 제어 함수 |
| `typography` | `TypographyVariantsProps` | 타이포그래피 스타일 객체 |
| `elevation` | `ElevationStyles` | 레벨 0~9 의 `boxShadow` 스타일 맵 |
| `foldable` | `FoldableConfig` | 폴더블 관련 설정값 |

#### **3. `Palette`** — `Theme` 을 확장하며 모드 제어 API 를 더한다
| **속성 이름** | **데이터 타입** | **설명** |
|---------------|-----------------|----------|
| `mode` | `'light' \| 'dark'` | 현재 테마 모드 |
| `isUsingSystemColorScheme` | `boolean` | 시스템 색상 모드 사용 여부 |
| `setUseSystemColorScheme` | `(useSystem: boolean) => void` | 시스템 색상 모드 활성화/비활성화 |
| `toggleTheme` | `() => void` | 라이트 ↔ 다크 수동 전환 |

#### **4. `Theme`**
| **속성 이름** | **데이터 타입** | **설명** |
|---------------|-----------------|----------|
| `mode` | `'light' \| 'dark'` | 팔레트가 생성된 모드 |
| `primary` | `ColorPaletteExtend` | 주요 색상 (5~100 + `main`·`lighter`·`light`·`dark`·`darker`) |
| `secondary` | `ColorPalette` | 보조 색상 (5~100 + `main`) |
| `danger` / `warning` / `success` / `information` / `grey` | `ColorPalette` | 상태·중립 색상 |
| `text` | `ThemeTextType` | 텍스트 색상 (`base`·`secondary`·`disabled`·`white`·`black` 및 상태색) |
| `background` | `ThemeBackground` | 배경 색상 (`base`·`layer1`·`layer2`·`neutral` 및 상태색) |
| `elevationShadow` | `string[]` | 레벨별 그림자 색상 배열 (0~9) |
| `modalBgColor` | `string` | 모달 오버레이 배경색 |
| `mainColor` | `MainColors` | 각 시맨틱 색상의 `main` 값 모음 |

#### **5. `TypographyVariantsProps`**
각 스타일은 `1`~`6` 서브스타일을 가집니다.

| **속성 이름** | **데이터 타입** | **설명** |
|---------------|-----------------|----------|
| `heading` | `TypoNumber` | 가장 크고 두드러진 제목 |
| `title` | `TypoNumber` | 페이지·섹션 제목 |
| `subTitle` | `TypoNumber` | 부제목 |
| `label` | `TypoNumber` | 버튼·입력 필드 레이블 |
| `body` | `TypoNumber` | 본문 |
| `caption` | `TypoNumber` | 작은 부가 텍스트 |
| `themeFonts` | `ThemeFonts` | 적용된 폰트 매핑 (선택) |
