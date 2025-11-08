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
  light: '#212B3688',
  dark: '#00000088'
}

const SHADOW_COLORS = {
  light: [
    'rgba(0, 0, 0, 0.18)',
    'rgba(0, 0, 0, 0.20)',
    'rgba(0, 0, 0, 0.22)',
    'rgba(0, 0, 0, 0.23)',
    'rgba(0, 0, 0, 0.25)',
    'rgba(0, 0, 0, 0.27)',
    'rgba(0, 0, 0, 0.29)',
    'rgba(0, 0, 0, 0.30)',
    'rgba(0, 0, 0, 0.32)',
    'rgba(0, 0, 0, 0.34)',
  ],
  dark: [
    'rgba(255, 255, 255, 0.58)',
    'rgba(255, 255, 255, 0.60)',
    'rgba(255, 255, 255, 0.62)',
    'rgba(255, 255, 255, 0.63)',
    'rgba(255, 255, 255, 0.65)',
    'rgba(255, 255, 255, 0.67)',
    'rgba(255, 255, 255, 0.69)',
    'rgba(255, 255, 255, 0.70)',
    'rgba(255, 255, 255, 0.72)',
    'rgba(255, 255, 255, 0.74)',
  ]
}

// FF9F06
const LIGHT_COLORS = {
  primary: {
    5: '#fffaf0',
    10: '#ffeccc',
    20: '#ffda9e',
    30: '#ffc86e',
    40: '#ffb742',
    50: '#ffa20d',
    60: '#e69100',
    70: '#cc8000',
    80: '#b37000',
    90: '#996000',
    100: '#805000',
    lighter: '#ffda9e',
    light: '#ffc86e',
    main: '#ffa20d',
    dark: '#e69100',
    darker: '#b37000',
  },
  secondary: {
    5: '#D1EDFF',
    10: '#ADE2FF',
    20: '#85D4FF',
    30: '#5CC5FF',
    40: '#33B7FF',
    50: '#007FFF',
    60: '#0075E6',
    70: '#006ACC',
    80: '#005FB3',
    90: '#005499',
    100: '#003866',
    main: '#007FFF',
  },
  danger: {
    5: '#FEECF0',
    10: '#FCD4DE',
    20: '#F799B1',
    30: '#F36689',
    40: '#EF3E5E',
    50: '#EB003B',
    60: '#D50136',
    70: '#8D0023',
    80: '#5E0018',
    90: '#2F000C',
    100: '#1A0008',
    main: '#EB003B',
  },
  warning: {
    5: '#FFF8E9',
    10: '#FFEAC1',
    20: '#FFE2A7',
    30: '#FFD47C',
    40: '#FFC550',
    50: '#FFB724',
    60: '#98690A',
    70: '#66490E',
    80: '#4D370B',
    90: '#332507',
    100: '#1F1805',
    main: '#FFB724',
  },
  success: {
    5: '#EEF7F0',
    10: '#CEE9D4',
    20: '#B2DCBB',
    30: '#8CCA99',
    40: '#33A14B',
    50: '#008A1E',
    60: '#006E18',
    70: '#005312',
    80: '#00370C',
    90: '#002207',
    100: '#001804',
    main: '#008A1E',
  },
  information: {
    5: '#E9F0FF',
    10: '#D4E1FF',
    20: '#A9C3FF',
    30: '#7DA4FF',
    40: '#5286FF',
    50: '#2768FF',
    60: '#1F53CC',
    70: '#173E99',
    80: '#0C1F4D',
    90: '#040A1A',
    100: '#020510',
    main: '#2768FF',
  },
  grey: {
    5: '#F8F8F8',
    10: '#F9FAFB',
    20: '#F4F6F8',
    30: '#DFE3E8',
    40: '#C4CDD5',
    50: '#919EAB',
    60: '#637381',
    70: '#454F5B',
    80: '#1C252E',
    90: '#141A21',
    100: '#000000',
    main: '#F4F6F8',
  },
};

const DARK_COLORS = {
  primary: {
    ...LIGHT_COLORS.primary,
    main: '#FF9F06',
  },
  secondary: {
    ...LIGHT_COLORS.secondary,
    main: '#007FFF',
  },
  danger: {
    ...LIGHT_COLORS.danger,
    main: '#EB003B',
  },
  warning: {
    ...LIGHT_COLORS.warning,
    main: '#FFB724',
  },
  success: {
    ...LIGHT_COLORS.success,
    main: '#008A1E',
  },
  information: {
    ...LIGHT_COLORS.information,
    main: '#2768FF',
  },
  grey: {
    5: '#141414',  // layer1
    10: '#1F1F1F', // layer2
    20: '#2C2C2C', // neutral
    30: '#3D3D3D',
    40: '#4F4F4F',
    50: '#606060',
    60: '#737373',
    70: '#8C8C8C',
    80: '#bfbfbf',
    90: '#ededed',
    100: '#FFFFFF',
    main: '#2C2C2C',
  },
};

const MAIN_COLORS = {
  light: {
    primary: LIGHT_COLORS.primary.main,
    secondary: LIGHT_COLORS.secondary.main,
    danger: LIGHT_COLORS.danger.main,
    warning: LIGHT_COLORS.warning.main,
    success: LIGHT_COLORS.success.main,
    information: LIGHT_COLORS.information.main,
    grey: LIGHT_COLORS.grey.main
  },
  dark: {
    primary: DARK_COLORS.primary.main,
    secondary: DARK_COLORS.secondary.main,
    danger: DARK_COLORS.danger.main,
    warning: DARK_COLORS.warning.main,
    success: DARK_COLORS.success.main,
    information: DARK_COLORS.information.main,
    grey: DARK_COLORS.grey.main
  }
}

const TEXT_COLORS = {
  light: {
    primary: LIGHT_COLORS.primary.main,
    base: LIGHT_COLORS.grey[80],
    secondary: LIGHT_COLORS.grey[60],
    disabled: LIGHT_COLORS.grey[50],
    danger: LIGHT_COLORS.danger[60],
    warning: LIGHT_COLORS.warning[60],
    success: LIGHT_COLORS.success[60],
    information: LIGHT_COLORS.information[60],
    white: '#FFFFFF',
    black: '#000000',
  },
  dark: {
    primary: LIGHT_COLORS.primary.main,
    base: DARK_COLORS.grey[90],
    secondary: DARK_COLORS.grey[70],
    disabled: DARK_COLORS.grey[50],
    danger: DARK_COLORS.danger[30],
    warning: DARK_COLORS.warning[30],
    success: DARK_COLORS.success[30],
    information: DARK_COLORS.information[30],
    white: '#FFFFFF',
    black: '#000000',
  },
};

const BACKGROUND_COLORS = {
  light: {
    primary: LIGHT_COLORS.primary.main,
    layer1: LIGHT_COLORS.grey[5],
    layer2: LIGHT_COLORS.grey[20],
    neutral: LIGHT_COLORS.grey[30],
    base: '#fff',
    danger: LIGHT_COLORS.danger[5],
    warning: LIGHT_COLORS.warning[5],
    success: LIGHT_COLORS.success[5],
    information: LIGHT_COLORS.information[5],
  },
  dark: {
    primary: DARK_COLORS.primary.main,
    layer1: DARK_COLORS.grey[5],
    layer2: DARK_COLORS.grey[20],
    neutral: DARK_COLORS.grey[30],
    base: '#000',
    danger: DARK_COLORS.danger[80],
    warning: DARK_COLORS.warning[80],
    success: DARK_COLORS.success[80],
    information: DARK_COLORS.information[80],
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
 * 테마 팩토리 함수 - LIGHT_COLORS와 DARK_COLORS를 재정의할 수 있는 기능을 제공합니다.
 * @param config - 라이트/다크 모드별로 색상을 재정의할 수 있는 설정 객체
 * @returns 재정의된 LIGHT_COLORS와 DARK_COLORS를 포함한 팩토리 함수
 */
export function themeFactory(config: ThemeFactoryConfig = {}) {
  // 기본 색상들을 깊은 복사로 생성
  const createCustomLightColors = (): typeof LIGHT_COLORS => {
    const customColors = { ...LIGHT_COLORS };
    
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

  const createCustomDarkColors = (): typeof DARK_COLORS => {
    const customColors = { ...DARK_COLORS };
    
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
        white: '#FFFFFF',
        black: '#000000',
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
        white: '#FFFFFF',
        black: '#000000',
      },
    };

    const customBackgroundColors = {
      light: {
        primary: colors.primary.main,
        layer1: colors.grey[5],
        layer2: colors.grey[20],
        neutral: colors.grey[30],
        base: '#fff',
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
        base: '#000',
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
  const colors = mode === 'light' ? LIGHT_COLORS : DARK_COLORS;

  const theme: Theme = {
    mode,
    ...colors,
    text: TEXT_COLORS[mode],
    background: BACKGROUND_COLORS[mode],
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
