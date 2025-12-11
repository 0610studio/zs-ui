import { BLACK, PRIMITIVE_BLUE, PRIMITIVE_GREEN, PRIMITIVE_GREY, PRIMITIVE_GREY_DARK, PRIMITIVE_ORANGE, PRIMITIVE_RED, PRIMITIVE_TEAL, PRIMITIVE_YELLOW, SHADOW_COLORS, WHITE } from "./primitive";
import { Theme, ColorPalette, ColorPaletteExtend } from "./types";

export const transparency = {
  '0%': '00',   // 완전 투명
  '2%': '05',
  '4%': '0A',
  '6%': '0F',
  '8%': '14',
  '10%': '1A',
  '12%': '1F',
  '14%': '24',
  '16%': '29',
  '18%': '2E',
  '20%': '33',
  '22%': '38',
  '24%': '3D',
  '26%': '42',
  '28%': '47',
  '30%': '4D',
  '32%': '52',
  '34%': '57',
  '36%': '5C',
  '38%': '61',
  '40%': '66',
  '42%': '6B',
  '44%': '70',
  '46%': '75',
  '48%': '7A',
  '50%': '80',
  '52%': '85',
  '54%': '8A',
  '56%': '8F',
  '58%': '94',
  '60%': '99',
  '62%': '9E',
  '64%': 'A3',
  '66%': 'A8',
  '68%': 'AD',
  '70%': 'B3',
  '72%': 'B8',
  '74%': 'BD',
  '76%': 'C2',
  '78%': 'C7',
  '80%': 'CC',
  '82%': 'D1',
  '84%': 'D6',
  '86%': 'DB',
  '88%': 'E0',
  '90%': 'E6',
  '92%': 'EB',
  '94%': 'F0',
  '96%': 'F5',
  '98%': 'FA',
  '100%': 'FF'  // 완전 불투명
};

const MODAL_BG_COLOR = {
  light: PRIMITIVE_GREY[90] + transparency['52%'],
  dark: PRIMITIVE_GREY[90] + transparency['40%'],
}

const SEMANTIC_LIGHT_COLORS = {
  primary: {
    ...PRIMITIVE_ORANGE,
    lighter: PRIMITIVE_ORANGE[20],
    light: PRIMITIVE_ORANGE[30],
    main: PRIMITIVE_ORANGE[50],
    dark: PRIMITIVE_ORANGE[60],
    darker: PRIMITIVE_ORANGE[70],
  },
  secondary: {
    ...PRIMITIVE_TEAL,
    lighter: PRIMITIVE_TEAL[20],
    light: PRIMITIVE_TEAL[30],
    main: PRIMITIVE_TEAL[50],
    dark: PRIMITIVE_TEAL[60],
    darker: PRIMITIVE_TEAL[70],
  },
  danger: {
    ...PRIMITIVE_RED,
    lighter: PRIMITIVE_RED[20],
    light: PRIMITIVE_RED[30],
    main: PRIMITIVE_RED[50],
    dark: PRIMITIVE_RED[60],
    darker: PRIMITIVE_RED[70],
  },
  warning: {
    ...PRIMITIVE_YELLOW,
    lighter: PRIMITIVE_YELLOW[20],
    light: PRIMITIVE_YELLOW[30],
    main: PRIMITIVE_YELLOW[50],
    dark: PRIMITIVE_YELLOW[60],
    darker: PRIMITIVE_YELLOW[70],
  },
  success: {
    ...PRIMITIVE_GREEN,
    lighter: PRIMITIVE_GREEN[20],
    light: PRIMITIVE_GREEN[30],
    main: PRIMITIVE_GREEN[50],
    dark: PRIMITIVE_GREEN[60],
    darker: PRIMITIVE_GREEN[70],
  },
  information: {
    ...PRIMITIVE_BLUE,
    lighter: PRIMITIVE_BLUE[20],
    light: PRIMITIVE_BLUE[30],
    main: PRIMITIVE_BLUE[50],
    dark: PRIMITIVE_BLUE[60],
    darker: PRIMITIVE_BLUE[70],
  },
  grey: {
    ...PRIMITIVE_GREY,
    lighter: PRIMITIVE_GREY[20],
    light: PRIMITIVE_GREY[30],
    main: PRIMITIVE_GREY[20],
    dark: PRIMITIVE_GREY[60],
    darker: PRIMITIVE_GREY[70],
  },
};

const SEMANTIC_DARK_COLORS = {
  primary: {
    ...SEMANTIC_LIGHT_COLORS.primary,
    lighter: PRIMITIVE_ORANGE[20],
    light: PRIMITIVE_ORANGE[30],
    main: PRIMITIVE_ORANGE[50],
    dark: PRIMITIVE_ORANGE[60],
    darker: PRIMITIVE_ORANGE[70],
  },
  secondary: {
    ...SEMANTIC_LIGHT_COLORS.secondary,
    lighter: PRIMITIVE_TEAL[20],
    light: PRIMITIVE_TEAL[30],
    main: PRIMITIVE_TEAL[50],
    dark: PRIMITIVE_TEAL[60],
    darker: PRIMITIVE_TEAL[70],
  },
  danger: {
    ...SEMANTIC_LIGHT_COLORS.danger,
    lighter: PRIMITIVE_RED[20],
    light: PRIMITIVE_RED[30],
    main: PRIMITIVE_RED[50],
    dark: PRIMITIVE_RED[60],
    darker: PRIMITIVE_RED[70],
  },
  warning: {
    ...SEMANTIC_LIGHT_COLORS.warning,
    lighter: PRIMITIVE_YELLOW[20],
    light: PRIMITIVE_YELLOW[30],
    main: PRIMITIVE_YELLOW[50],
    dark: PRIMITIVE_YELLOW[60],
    darker: PRIMITIVE_YELLOW[70],
  },
  success: {
    ...SEMANTIC_LIGHT_COLORS.success,
    lighter: PRIMITIVE_GREEN[20],
    light: PRIMITIVE_GREEN[30],
    main: PRIMITIVE_GREEN[50],
    dark: PRIMITIVE_GREEN[60],
    darker: PRIMITIVE_GREEN[70],
  },
  information: {
    ...SEMANTIC_LIGHT_COLORS.information,
    lighter: PRIMITIVE_BLUE[20],
    light: PRIMITIVE_BLUE[30],
    main: PRIMITIVE_BLUE[50],
    dark: PRIMITIVE_BLUE[60],
    darker: PRIMITIVE_BLUE[70],
  },
  grey: {
    ...PRIMITIVE_GREY_DARK,
    lighter: PRIMITIVE_GREY_DARK[20],
    light: PRIMITIVE_GREY_DARK[30],
    main: PRIMITIVE_GREY_DARK[20],
    dark: PRIMITIVE_GREY_DARK[60],
    darker: PRIMITIVE_GREY_DARK[70],
  },
};

const MAIN_COLORS = {
  light: {
    primary: SEMANTIC_LIGHT_COLORS.primary.main,
    secondary: SEMANTIC_LIGHT_COLORS.secondary.main,
    danger: SEMANTIC_LIGHT_COLORS.danger.main,
    warning: SEMANTIC_LIGHT_COLORS.warning.main,
    success: SEMANTIC_LIGHT_COLORS.success.main,
    information: SEMANTIC_LIGHT_COLORS.information.main,
    grey: SEMANTIC_LIGHT_COLORS.grey.main
  },
  dark: {
    primary: SEMANTIC_DARK_COLORS.primary.main,
    secondary: SEMANTIC_DARK_COLORS.secondary.main,
    danger: SEMANTIC_DARK_COLORS.danger.main,
    warning: SEMANTIC_DARK_COLORS.warning.main,
    success: SEMANTIC_DARK_COLORS.success.main,
    information: SEMANTIC_DARK_COLORS.information.main,
    grey: SEMANTIC_DARK_COLORS.grey.main
  }
}

const SEMANTIC_TEXT_COLORS = {
  light: {
    primary: SEMANTIC_LIGHT_COLORS.primary.main,
    base: SEMANTIC_LIGHT_COLORS.grey[80],
    secondary: SEMANTIC_LIGHT_COLORS.grey[60],
    disabled: SEMANTIC_LIGHT_COLORS.grey[50],
    danger: SEMANTIC_LIGHT_COLORS.danger[60],
    warning: SEMANTIC_LIGHT_COLORS.warning[60],
    success: SEMANTIC_LIGHT_COLORS.success[60],
    information: SEMANTIC_LIGHT_COLORS.information[60],
    white: WHITE,
    black: BLACK,
  },
  dark: {
    primary: SEMANTIC_DARK_COLORS.primary.main,
    base: SEMANTIC_DARK_COLORS.grey[90],
    secondary: SEMANTIC_DARK_COLORS.grey[70],
    disabled: SEMANTIC_DARK_COLORS.grey[50],
    danger: SEMANTIC_DARK_COLORS.danger[30],
    warning: SEMANTIC_DARK_COLORS.warning[30],
    success: SEMANTIC_DARK_COLORS.success[30],
    information: SEMANTIC_DARK_COLORS.information[30],
    white: WHITE,
    black: BLACK,
  },
};

const SEMANTIC_BACKGROUND_COLORS = {
  light: {
    primary: SEMANTIC_LIGHT_COLORS.primary.main,
    layer1: SEMANTIC_LIGHT_COLORS.grey[5],
    layer2: SEMANTIC_LIGHT_COLORS.grey[20],
    neutral: SEMANTIC_LIGHT_COLORS.grey[30],
    base: WHITE,
    danger: SEMANTIC_LIGHT_COLORS.danger[5],
    warning: SEMANTIC_LIGHT_COLORS.warning[5],
    success: SEMANTIC_LIGHT_COLORS.success[5],
    information: SEMANTIC_LIGHT_COLORS.information[5],
  },
  dark: {
    primary: SEMANTIC_DARK_COLORS.primary.main,
    layer1: SEMANTIC_DARK_COLORS.grey[5],
    layer2: SEMANTIC_DARK_COLORS.grey[20],
    neutral: SEMANTIC_DARK_COLORS.grey[30],
    base: BLACK,
    danger: SEMANTIC_DARK_COLORS.danger[80],
    warning: SEMANTIC_DARK_COLORS.warning[80],
    success: SEMANTIC_DARK_COLORS.success[80],
    information: SEMANTIC_DARK_COLORS.information[80],
  },
};

// ThemeFactory 타입 정의
export interface ThemeFactoryColors {
  primary?: Partial<ColorPaletteExtend>;
  secondary?: Partial<ColorPalette>;
  danger?: Partial<ColorPalette>;
  warning?: Partial<ColorPalette>;
  success?: Partial<ColorPalette>;
  information?: Partial<ColorPalette>;
  grey?: Partial<ColorPalette>;
}

export interface ThemeFactoryConfig {
  light?: ThemeFactoryColors;
  dark?: ThemeFactoryColors;
}

/**
 * 테마 팩토리 함수 - SEMANTIC_LIGHT_COLORS와 SEMANTIC_DARK_COLORS를 재정의할 수 있는 기능을 제공합니다.
 * @param config - 라이트/다크 모드별로 색상을 재정의할 수 있는 설정 객체
 * @returns 재정의된 SEMANTIC_LIGHT_COLORS와 SEMANTIC_DARK_COLORS를 포함한 팩토리 함수
 */
export function themeFactory(config: ThemeFactoryConfig = {}) {
  // 기본 색상들을 깊은 복사로 생성
  const createCustomLightColors = (): typeof SEMANTIC_LIGHT_COLORS => {
    const customColors = { ...SEMANTIC_LIGHT_COLORS };
    
    if (config.light) {
      Object.keys(config.light).forEach((key) => {
        const colorKey = key as keyof ThemeFactoryColors;
        if (config.light?.[colorKey]) {
          customColors[colorKey] = {
            ...customColors[colorKey],
            ...config.light[colorKey],
          } as any;
        }
      });
    }
    
    return customColors;
  };

  const createCustomDarkColors = (): typeof SEMANTIC_DARK_COLORS => {
    const customColors = { ...SEMANTIC_DARK_COLORS };
    
    if (config.dark) {
      Object.keys(config.dark).forEach((key) => {
        const colorKey = key as keyof ThemeFactoryColors;
        if (config.dark?.[colorKey]) {
          customColors[colorKey] = {
            ...customColors[colorKey],
            ...config.dark[colorKey],
          } as any;
        }
      });
    }
    
    return customColors;
  };

  const customLightColors = createCustomLightColors();
  const customDarkColors = createCustomDarkColors();

  // 재정의된 색상으로 새로운 팔레트 함수 반환
  return function createPalette({
    mode = 'light',
    themeColors = {},
  }: {
    mode?: 'light' | 'dark';
    themeColors?: { light?: Theme; dark?: Theme };
  } = {}): Theme {
    const colors = mode === 'light' ? customLightColors : customDarkColors;

    // 재정의된 색상을 기반으로 동적으로 색상 매핑 생성
    const customTextColors = {
      light: {
        primary: colors.primary.main,
        base: colors.grey[80],
        secondary: colors.grey[60],
        disabled: colors.grey[50],
        danger: colors.danger[60],
        warning: colors.warning[60],
        success: colors.success[60],
        information: colors.information[60],
        white: WHITE,
        black: BLACK,
      },
      dark: {
        primary: colors.primary.main,
        base: colors.grey[90],
        secondary: colors.grey[70],
        disabled: colors.grey[50],
        danger: colors.danger[30],
        warning: colors.warning[30],
        success: colors.success[30],
        information: colors.information[30],
        white: WHITE,
        black: BLACK,
      },
    };

    const customBackgroundColors = {
      light: {
        primary: colors.primary.main,
        layer1: colors.grey[5],
        layer2: colors.grey[20],
        neutral: colors.grey[30],
        base: WHITE,
        danger: colors.danger[5],
        warning: colors.warning[5],
        success: colors.success[5],
        information: colors.information[5],
      },
      dark: {
        primary: colors.primary.main,
        layer1: colors.grey[5],
        layer2: colors.grey[20],
        neutral: colors.grey[30],
        base: BLACK,
        danger: colors.danger[80],
        warning: colors.warning[80],
        success: colors.success[80],
        information: colors.information[80],
      },
    };

    const customMainColors = {
      light: {
        primary: colors.primary.main,
        secondary: colors.secondary.main,
        danger: colors.danger.main,
        warning: colors.warning.main,
        success: colors.success.main,
        information: colors.information.main,
        grey: colors.grey.main
      },
      dark: {
        primary: colors.primary.main,
        secondary: colors.secondary.main,
        danger: colors.danger.main,
        warning: colors.warning.main,
        success: colors.success.main,
        information: colors.information.main,
        grey: colors.grey.main
      }
    };

    const theme: Theme = {
      mode,
      ...colors,
      text: customTextColors[mode],
      background: customBackgroundColors[mode],
      elevationShadow: SHADOW_COLORS[mode],
      modalBgColor: MODAL_BG_COLOR[mode],
      mainColor: customMainColors[mode]
    };

    // 사용자 정의 테마 컬러가 있을 경우 병합
    if (themeColors?.[mode]) {
      return {
        ...theme,
        ...themeColors[mode],
      };
    }

    return theme;
  };
}

export default function palette({
  mode = 'light',
  themeColors = {},
}: {
  mode?: 'light' | 'dark';
  themeColors?: { light?: Theme; dark?: Theme };
} = {}): Theme {
  const colors = mode === 'light' ? SEMANTIC_LIGHT_COLORS : SEMANTIC_DARK_COLORS;

  const theme: Theme = {
    mode,
    ...colors,
    text: SEMANTIC_TEXT_COLORS[mode],
    background: SEMANTIC_BACKGROUND_COLORS[mode],
    elevationShadow: SHADOW_COLORS[mode],
    modalBgColor: MODAL_BG_COLOR[mode],
    mainColor: MAIN_COLORS[mode]
  };

  // 사용자 정의 테마 컬러가 있을 경우 병합
  if (themeColors?.[mode]) {
    return {
      ...theme,
      ...themeColors[mode],
    };
  }

  return theme;
}
