import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import palette from '../theme/palette';
import { Theme, ThemeFonts, TypographyVariantsProps } from '../theme/types';
import typography from '../theme/typography';
import elevation, { ElevationStyles } from '../theme/elevation';

export interface ThemeProviderProps {
  themeFonts?: ThemeFonts;
  children: React.ReactNode;
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ themeFonts, children }) => {
  const systemColorScheme = useColorScheme(); // 시스템 다크 모드 감지
  const [isUsingSystemColorScheme, setUseSystemColorScheme] = useState(true);
  const [mode, setMode] = useState<'light' | 'dark'>(systemColorScheme === 'dark' ? 'dark' : 'light');

  // AsyncStorage에서 시스템 모드 사용 설정 값 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedUseSystemColorScheme = await AsyncStorage.getItem('useSystemColorScheme');
        if (storedUseSystemColorScheme !== null) {
          setUseSystemColorScheme(storedUseSystemColorScheme === 'true');
        }
        const storedMode = await AsyncStorage.getItem('themeMode');
        if (storedMode) {
          setMode(storedMode === 'dark' ? 'dark' : 'light');
        } else {
          setMode(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme settings', error);
      }
    };
    loadSettings();
  }, []);

  // 시스템 다크 모드 변경에 따른 효과 적용
  useEffect(() => {
    if (isUsingSystemColorScheme) {
      setMode(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [isUsingSystemColorScheme]);

  // 테마 토글 함수
  const toggleTheme = async () => {
    setUseSystemColorScheme(false); // 사용자 지정 모드로 전환
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('themeMode', newMode); // 로컬스토리지에 저장
      return newMode;
    });
  };

  // 시스템 모드 사용 설정 변경 함수
  const handleSetUseSystemColorScheme = async (useSystem: boolean) => {
    setUseSystemColorScheme(useSystem);
    await AsyncStorage.setItem('useSystemColorScheme', useSystem.toString());
  };

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
