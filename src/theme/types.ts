import { TextProps } from "react-native";

export type ColorPalette = {
  0: string;
  5: string;
  10: string; // p-lighter
  20: string; // p-light
  30: string;
  40: string;
  50: string; // p-main
  60: string; // p-dark
  70: string; // p-darker
  80: string;
  90: string;
  100: string;
  main: string;
};

export type ColorPaletteExtend = ColorPalette & {
  lighter: string;
  light: string;
  dark: string;
  darker: string;
};

export interface ThemeTextType {
  main: string;
  primary: string;
  secondary: string;
  disabled: string;
  danger: string;
  warning: string;
  success: string;
  information: string;
  white: string;
  black: string;
}

export interface ThemeBorderType {
  box: string;
  active: string;
  base: string;
  danger: string;
  warning: string;
  success: string;
  information: string;
}

export interface ThemeBackground {
  layer1: string;
  layer2: string;
  neutral: string;
  base: string;
  danger: string;
  warning: string;
  success: string;
  information: string;
}

export interface MainColors {
  primary: string;
  secondary: string;
  danger: string;
  warning: string;
  success: string;
  information: string;
  grey: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  primary: ColorPaletteExtend;
  secondary: ColorPalette;
  danger: ColorPalette;
  warning: ColorPalette;
  success: ColorPalette;
  information: ColorPalette;
  grey: ColorPalette;
  text: ThemeTextType;
  border: ThemeBorderType;
  background: ThemeBackground;
  action: {
    hover: string;
    pressed: string;
    disable: string;
  };
  divider: string;
  elevationShadow: string[];
  modalBgColor: string;
  mainColor: MainColors;
}

export interface TypographyVariants {
  themeFonts?: ThemeFonts;
  heading: TypoNumber;
  label: TypoNumber;
  title: TypoNumber;
  subTitle: TypoNumber;
  body: TypoNumber;
  caption: TypoNumber;
};

export interface ThemeFonts {
  100?: string;
  200?: string;
  300?: string;
  400: string;
  500?: string;
  600?: string;
  700: string;
  800?: string;
  900?: string;
};

export interface TypoNumber {
  '1': TextProps['style'];
  '2': TextProps['style'];
  '3': TextProps['style'];
  '4': TextProps['style'];
  '5': TextProps['style'];
  '6': TextProps['style'];
}

export interface TypographyVariantsProps extends TypographyVariants {
  themeFonts?: ThemeFonts;
};

export type TypoStyle = 'heading' | 'title' | 'subTitle' | 'label' | 'body' | 'caption';

export type TypoOptions =
  'heading.1' |
  'heading.2' |
  'heading.3' |
  'heading.4' |
  'heading.5' |
  'heading.6' |
  'title.1' |
  'title.2' |
  'title.3' |
  'title.4' |
  'title.5' |
  'title.6' |
  'subTitle.1' |
  'subTitle.2' |
  'subTitle.3' |
  'subTitle.4' |
  'subTitle.5' |
  'subTitle.6' |
  'body.1' |
  'body.2' |
  'body.3' |
  'body.4' |
  'body.5' |
  'body.6' |
  'label.1' |
  'label.2' |
  'label.3' |
  'label.4' |
  'label.5' |
  'label.6' |
  'caption.1' |
  'caption.2' |
  'caption.3' |
  'caption.4' |
  'caption.5' |
  'caption.6';

export type TypoSubStyle = '1' | '2' | '3' | '4' | '5' | '6';

export type TextColorOptions = 'primary' | 'secondary' | 'disabled' | 'danger' | 'warning' | 'success' | 'information' | 'white' | 'black';
