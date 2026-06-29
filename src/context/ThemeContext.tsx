import React, { createContext, useContext, useMemo, useReducer, useEffect, useCallback } from 'react';
import { Platform, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import palette from '../theme/palette';
import { Theme, ThemeFonts, TypographyVariantsProps } from '../theme/types';
import typography from '../theme/typography';
import elevation, { ElevationStyles } from '../theme/elevation';

export interface FoldableConfig {
  /**
   * 언폴딩 상태에서 rightComponent가 없을 때(단일 화면) 콘텐츠 최대 가로 길이(px).
   * 미주입(undefined) 또는 false면 전폭으로 늘린다. 폭을 제한하려면 반드시 값을 주입해야 한다.
   */
  unfoldedSinglePaneMaxWidth?: number | false;
}

export interface ThemeProviderProps {
  themeFonts?: ThemeFonts;
  children: React.ReactNode;
  isDarkModeEnabled?: boolean;
  customPalette?: (config: { mode?: 'light' | 'dark'; themeColors?: { light?: Theme; dark?: Theme } }) => Theme;
  foldable?: FoldableConfig;
}

export interface ThemeProps {
  palette: Palette;
  typography: TypographyVariantsProps;
  elevation: ElevationStyles;
  foldable: FoldableConfig;
}

export interface Palette extends Theme {
  mode: 'light' | 'dark';
  isUsingSystemColorScheme: boolean;
  setUseSystemColorScheme: (useSystem: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeProps | null>(null);
type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  isUsingSystemColorScheme: boolean;
};

type ThemeAction =
  | { type: 'HYDRATE'; state: ThemeState }
  | { type: 'SYNC_SYSTEM_MODE'; systemMode: ThemeMode }
  | { type: 'SET_USE_SYSTEM_COLOR_SCHEME'; useSystem: boolean; systemMode: ThemeMode }
  | { type: 'TOGGLE_THEME' };

const getSystemMode = (systemColorScheme: ReturnType<typeof useColorScheme>): ThemeMode =>
  systemColorScheme === 'dark' ? 'dark' : 'light';

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SYNC_SYSTEM_MODE':
      return state.isUsingSystemColorScheme
        ? { ...state, mode: action.systemMode }
        : state;
    case 'SET_USE_SYSTEM_COLOR_SCHEME':
      return {
        ...state,
        isUsingSystemColorScheme: action.useSystem,
        mode: action.useSystem ? action.systemMode : state.mode,
      };
    case 'TOGGLE_THEME':
      return {
        isUsingSystemColorScheme: false,
        mode: state.mode === 'light' ? 'dark' : 'light',
      };
    default:
      return state;
  }
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ themeFonts, children, isDarkModeEnabled = true, customPalette, foldable }) => {
  const systemColorScheme = useColorScheme();
  const systemMode = getSystemMode(systemColorScheme);
  const [themeState, dispatchTheme] = useReducer(
    themeReducer,
    {
      isUsingSystemColorScheme: isDarkModeEnabled,
      mode: isDarkModeEnabled ? systemMode : 'light',
    }
  );
  const { isUsingSystemColorScheme, mode } = themeState;

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        if (!isMounted) return;
        
        if (!isDarkModeEnabled) {
          dispatchTheme({
            type: 'HYDRATE',
            state: {
              isUsingSystemColorScheme: false,
              mode: 'light',
            },
          });
          return;
        }

        const storedUseSystemColorScheme = await AsyncStorage.getItem('useSystemColorScheme');
        const storedMode = await AsyncStorage.getItem('themeMode');

        if (!isMounted) return;

        const isUsingSystemColorScheme = storedUseSystemColorScheme === null
          ? true
          : storedUseSystemColorScheme === 'true';
        const savedMode = storedMode === 'dark' || storedMode === 'light' ? storedMode : undefined;

        dispatchTheme({
          type: 'HYDRATE',
          state: {
            isUsingSystemColorScheme,
            mode: isUsingSystemColorScheme ? systemMode : savedMode ?? systemMode,
          },
        });
      } catch (error) {
        console.error('Failed to load theme settings', error);
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [isDarkModeEnabled, systemMode]);

  useEffect(() => {
    dispatchTheme({ type: 'SYNC_SYSTEM_MODE', systemMode });
  }, [systemMode]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setStyle(mode);
    }
  }, [mode])

  const toggleTheme = useCallback(async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    dispatchTheme({ type: 'TOGGLE_THEME' });
    await AsyncStorage.multiSet([
      ['useSystemColorScheme', 'false'],
      ['themeMode', newMode],
    ]);
  }, [mode]);

  const handleSetUseSystemColorScheme = useCallback(async (useSystem: boolean) => {
    dispatchTheme({ type: 'SET_USE_SYSTEM_COLOR_SCHEME', useSystem, systemMode });
    await AsyncStorage.setItem('useSystemColorScheme', useSystem.toString());
  }, [systemMode]);

  const unfoldedSinglePaneMaxWidth = foldable?.unfoldedSinglePaneMaxWidth;

  const themeValue = useMemo(() => {
    const currentPalette = customPalette ? customPalette({ mode }) : palette({ mode });
    return {
      palette: {
        isUsingSystemColorScheme,
        setUseSystemColorScheme: handleSetUseSystemColorScheme,
        toggleTheme,
        ...currentPalette,
      },
      typography: typography({ themeFonts }),
      elevation: elevation(currentPalette),
      foldable: { unfoldedSinglePaneMaxWidth },
    };
  }, [mode, isUsingSystemColorScheme, themeFonts, customPalette, handleSetUseSystemColorScheme, toggleTheme, unfoldedSinglePaneMaxWidth]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}
