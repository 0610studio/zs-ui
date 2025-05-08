import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { Platform, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import palette from '../theme/palette';
import { Theme, ThemeFonts, TypographyVariantsProps } from '../theme/types';
import typography from '../theme/typography';
import elevation, { ElevationStyles } from '../theme/elevation';

export interface ThemeProviderProps {
  themeFonts?: ThemeFonts;
  children: React.ReactNode;
  isDarkModeEnabled?: boolean;
}

export interface ThemeProps {
  palette: Palette;
  typography: TypographyVariantsProps;
  elevation: ElevationStyles;
}

export interface Palette extends Theme {
  mode: 'light' | 'dark';
  isUsingSystemColorScheme: boolean;
  setUseSystemColorScheme: (useSystem: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeProps | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ themeFonts, children, isDarkModeEnabled = true }) => {
  const systemColorScheme = useColorScheme(); // 시스템 다크 모드 감지
  const [isUsingSystemColorScheme, setUseSystemColorScheme] = useState(isDarkModeEnabled ? true : false);
  const [mode, setMode] = useState<'light' | 'dark'>(isDarkModeEnabled ? (systemColorScheme === 'dark' ? 'dark' : 'light') : 'light');

  // AsyncStorage에서 시스템 모드 사용 설정 값 로드
  useEffect(() => {
    const loadSettings = async () => {
      let isMounted = true;
      try {
        if (isMounted) {
          if (isDarkModeEnabled) {
            const storedUseSystemColorScheme = await AsyncStorage.getItem('useSystemColorScheme');
            const storedMode = await AsyncStorage.getItem('themeMode');

            if (storedUseSystemColorScheme !== null) {
              setUseSystemColorScheme(storedUseSystemColorScheme === 'true');
            }
            if (storedMode) {
              setMode(storedMode === 'dark' ? 'dark' : 'light');
            } else {
              setMode(systemColorScheme === 'dark' ? 'dark' : 'light');
            }
          } else {
            setMode('light');
          }
        }
      } catch (error) {
        console.error('Failed to load theme settings', error);
      }

      return () => {
        isMounted = false;
      };
    };

    loadSettings();
  }, []);

  // 시스템 다크 모드 변경에 따른 효과 적용
  useEffect(() => {
    if (isUsingSystemColorScheme) {
      setMode(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [isUsingSystemColorScheme]);

  // 안드로이드 하단 제스쳐 영역 스타일
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(mode);
      NavigationBar.setBackgroundColorAsync(palette({ mode }).background.base)
    }
  }, [mode])

  // 테마 토글 함수
  const toggleTheme = useCallback(async () => {
    setUseSystemColorScheme(false); // 사용자 지정 모드로 전환
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('themeMode', newMode); // 로컬스토리지에 저장
      return newMode;
    });
  }, []);

  // 시스템 모드 사용 설정 변경 함수
  const handleSetUseSystemColorScheme = useCallback(async (useSystem: boolean) => {
    setUseSystemColorScheme(useSystem);
    await AsyncStorage.setItem('useSystemColorScheme', useSystem.toString());
  }, []);

  const themeValue = useMemo(() => ({
    palette: {
      isUsingSystemColorScheme,
      setUseSystemColorScheme: handleSetUseSystemColorScheme,
      toggleTheme,
      ...palette({ mode }), // 선택된 모드에 따른 팔레트 적용
    },
    typography: typography({ themeFonts }),
    elevation: elevation(palette({ mode }))
  }), [mode, isUsingSystemColorScheme, typography, themeFonts]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}
