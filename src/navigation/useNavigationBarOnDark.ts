import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { holdNavigationBarOverDark } from './navigationBarStore';

/**
 * 이 화면이 보이는(포커스된) 동안 Android 하단 내비게이션 바 아래가 테마를 따르지 않는 어두운 면(카메라·사진)임을 알린다.
 * ThemeProvider 가 버튼·제스처 손잡이를 흰색으로 두고 ZSNavigationBarFade 를 끈다. 화면을 벗어나면 테마 모드의 색으로 돌아간다.
 * iOS 에서는 아무것도 하지 않는다.
 */
export function useNavigationBarOnDark(): void {
  useFocusEffect(useCallback(() => holdNavigationBarOverDark(), []));
}
