---
sidebar_position: 1
---

# 개요

`ZS-ui`는 React Native Expo를 위한 UI 컴포넌트 라이브러리입니다. 현재 배포 버전은 **0.13.n**이며, Expo 환경에서 손쉽게 테마와 공통 UI 컴포넌트를 사용할 수 있도록 도와줍니다.

다크 모드, 테마 시스템, 타이포그래피, Overlay 컴포넌트(Alert, BottomSheet, Snackbar) 등의 주요 UI 요소가 기본 제공되며, 일관된 사용자 인터페이스를 빠르게 구축할 수 있습니다.


<div style={{
  display: 'flex',
  overflowX: 'auto',
  gap: '20px',
  padding: '0 10px 0 0'
}}>
  <div style={{
    minWidth: '300px',
    flexShrink: 0
  }}>
    <video controls width="300">
      <source src="/video/theme.mp4" type="video/mp4" />
    </video>
    <p>Theme</p>
  </div>
  <div style={{
    minWidth: '300px',
    flexShrink: 0
  }}>
    <video controls width="300">
      <source src="/video/layout.mp4" type="video/mp4" />
    </video>
    <p>Layout</p>
  </div>
  <div style={{
    minWidth: '300px',
    flexShrink: 0
  }}>
    <video controls width="300">
      <source src="/video/overlay.mp4" type="video/mp4" />
    </video>
    <p>Overlay</p>
  </div>
</div>

## 주요 특징

### 테마 시스템

다크 모드, 커스터마이징 가능한 색상 팔레트, 일관된 타이포그래피 시스템을 제공합니다. `themeFactory`를 통해 브랜드 색상을 쉽게 적용할 수 있습니다.

### UI 컴포넌트

Text, View, Container 등 기본 컴포넌트부터 TextField, RadioGroup, Switch 등 입력 컴포넌트, Pressable, ThrottleButton 등 인터랙션 컴포넌트까지 다양한 컴포넌트를 제공합니다.

### Overlay 시스템

Alert, BottomSheet, Snackbar, Modality, PopOver, Loader 등 다양한 오버레이 컴포넌트를 제공하여 사용자 알림과 상호작용을 쉽게 구현할 수 있습니다.

### 플랫폼 최적화

iOS와 Android의 네이티브 스타일을 자동으로 적용하며, 폴더블 디바이스 지원과 키보드 처리, SafeArea 자동 처리를 포함합니다.

## 설치

```bash
npx expo install @0610studio/zs-ui
```

## 빠른 시작

### 기본 설정

```tsx
import { ThemeProvider, OverlayProvider } from '@0610studio/zs-ui';

export default function App() {
  return (
    <ThemeProvider>
      <OverlayProvider>
        {/* 앱 내용 */}
      </OverlayProvider>
    </ThemeProvider>
  );
}
```

자세한 설정 방법은 [Provider 구성](./Provider/00_start) 문서를 참조하세요.

### 첫 번째 컴포넌트 사용

```tsx
import { ZSText, ZSView } from '@0610studio/zs-ui';

export default function MyScreen() {
  return (
    <ZSView elevationLevel={2} style={{ padding: 20 }}>
      <ZSText typo="heading.1" color="base">
        안녕하세요!
      </ZSText>
      <ZSText typo="body.2" color="secondary">
        ZS-ui를 사용해보세요
      </ZSText>
    </ZSView>
  );
}
```

## 문서 구조

- **[Provider 구성](./Provider/00_start)**: 앱의 기본 설정과 Provider 구성 방법
- **[Theme](./Theme/00_start)**: 테마 시스템과 스타일링
- **[UI 컴포넌트](./UiComponent/ZSText)**: 기본 UI 컴포넌트 사용법
- **[Overlay 컴포넌트](./OverlayComponent/00_start)**: 오버레이 컴포넌트 사용법

## 추가 리소스

- **Playground**: [Expo Snack](https://snack.expo.dev/@studio0610/zs-ui_13_playground)에서 라이브 예제 확인
- **GitHub**: [소스 코드](https://github.com/0610studio/zs-ui) 확인
