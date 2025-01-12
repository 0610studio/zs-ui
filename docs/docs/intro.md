---
sidebar_position: 1
---

# 개요

`ZS-ui`는 JavaScript만으로 구현된 `Expo`용 UI 컴포넌트 라이브러리입니다. 

다크 모드, 테마, 타이포그래피, Alert와 같은 주요 UI 요소가 포함되어 있으며, 직관적이고 일관된 사용자 인터페이스를 구현할 수 있습니다.

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
      <source src="https://github.com/user-attachments/assets/7b66915e-163e-4abe-9fab-fb25e33d7a88" type="video/mp4" />
    </video>
    <p>테마</p>
  </div>
  <div style={{
    minWidth: '300px',
    flexShrink: 0
  }}>
    <video controls width="300">
      <source src="https://github.com/user-attachments/assets/73f59984-fc7b-4004-a516-089a2969ea1d" type="video/mp4" />
    </video>
    <p>UI 컴포넌트</p>
  </div>
  <div style={{
    minWidth: '300px',
    flexShrink: 0
  }}>
    <video controls width="300">
      <source src="https://github.com/user-attachments/assets/24918e91-9afc-4777-b6c7-b914bfb30e60" type="video/mp4" />
    </video>
    <p>Overlay 컴포넌트</p>
  </div>
</div>

<br />

# 설치방법

아래 명령어를 통해 필요한 패키지들을 설치합니다.

```sql
# 필수 패키지 설치
npx expo install @react-native-async-storage/async-storage react-native-reanimated react-native-svg react-native-safe-area-context expo-navigation-bar

# ZS UI 설치
npx expo install @0610studio/zs-ui
```

<br />

# 폴더 구조

```sql
root/
├── example/             # 예제 폴더 - 사용 예제
│ 
├── src/
│   ├── assets/          # 폰트와 이미지 같은 정적 파일들을 저장
│   ├── model/           # Provider 및 전역 상태 관리 관련 폴더
│   ├── overlay/          # Alert, 스낵바, 바텀시트 등의 overlay 관련 UI 컴포넌트
│   ├── theme/           # 색상 팔레트와 타이포그래피 등의 테마 설정 파일
│   └── ui/              # UI 컴포넌트와 atomic 기본 요소들
└──
```

