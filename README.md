# zs-ui

This library was created using [create-expo-module](https://docs.expo.dev/modules/get-started/), a tool for creating native modules for Expo projects.

# install

```bash
npx expo install @react-native-async-storage/async-storage react-native-gesture-handler react-native-reanimated react-native-svg react-native-safe-area-context

npx expo install @0610studio/zs-ui
```

# 사용법

### app/_layout.tsx

```tsx
const themeFonts = {
  100: 'Pretendard-Thin',
  200: 'Pretendard-ExtraLight',
  300: 'Pretendard-Light',
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
  800: 'Pretendard-ExtraBold',
  900: 'Pretendard-Black',
};

const requireFonts = {
  'Pretendard-Thin': require('../assets/fonts/Pretendard-Thin.otf'),
  'Pretendard-ExtraLight': require('../assets/fonts/Pretendard-ExtraLight.otf'),
  'Pretendard-Light': require('../assets/fonts/Pretendard-Light.otf'),
  'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
  'Pretendard-Black': require('../assets/fonts/Pretendard-Black.otf'),
};

const [loaded] = useFonts(requireFonts);

<ThemeProvider themeFonts={themeFonts}>
  <NotifyProvider
    customSnackbar={SnackBar}
    loaderComponent={LoadingLottieComponent}
  >

  </NotifyProvider>
</ThemeProvider>
```

### 예제 폴더

- [레이아웃](https://github.com/KimJeonghun91/zs-ui/blob/main/example/src/pages/LayoutExample.tsx)

- [알림](https://github.com/KimJeonghun91/zs-ui/blob/main/example/src/pages/NotifyExample.tsx)

- [Theme](https://github.com/KimJeonghun91/zs-ui/blob/main/example/src/pages/ThemeExample.tsx)


### 실행 영상


https://github.com/user-attachments/assets/73f59984-fc7b-4004-a516-089a2969ea1d



https://github.com/user-attachments/assets/24918e91-9afc-4777-b6c7-b914bfb30e60



https://github.com/user-attachments/assets/7b66915e-163e-4abe-9fab-fb25e33d7a88

