---
sidebar_position: 1
---

# useTheme

useTheme는 ThemeContext에서 테마 속성을 가져와 사용하는 훅입니다. 

ThemeProvider 외부에서 호출할 경우 오류가 발생합니다.

각 테마 색상은 `primary`, `secondary`, `danger`, `warning`, `success`, `information`과 같은 다양한 상태에 맞게 정의되어 있으며, 기본 배경과 텍스트 색상도 포함되어있습니다.

<br />

### 시스템 색상 설정 감지

`useColorScheme` 훅을 사용하여 시스템의 다크 모드 설정을 감지합니다.

<br />

### AsyncStorage 사용

themeMode와 useSystemColorScheme 값은 AsyncStorage에 저장되어 있어 사용자가 앱을 다시 열 때 동일한 테마가 적용됩니다.

<br />

### 테마 토글 함수

`toggleTheme` : 사용자가 테마를 라이트와 다크 모드 사이에서 전환할 수 있습니다. 이 함수는 AsyncStorage에 모드를 저장합니다.