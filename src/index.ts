import {
  useTheme,
  OverlayProvider,
  ThemeProvider,
  GlobalOverlay,
} from './model'
import { useFoldingState } from './model/useFoldingState'
import { themeFactory } from './theme/palette';

import ErrorComponent from './ui/ZSTextField/ui/ErrorComponent';
import ZSContainer from './ui/ZSContainer';
import ZSPressable from './ui/ZSPressable';
import ZSText from './ui/ZSText';
import ThrottleButton from './ui/ThrottleButton';
import ZSTextField from './ui/ZSTextField';
import ZSRadioGroup from './ui/ZSRadioGroup';
import ZSBottomCta from './ui/ZSBottomCta';
import ZSView from './ui/ZSView';
import AnimatedWrapper from './ui/atoms/AnimatedWrapper';
import TextAtom from './ui/atoms/TextAtom';
import ZSAboveKeyboard from "./ui/ZSAboveKeyboard";
import { ZSContainerRef } from "./ui/ZSContainer";
import { ZSTextProps } from "./ui/ZSText";
import { BoxStyle } from "./ui/ZSTextField";

import {
  AlertOverlay,
  BottomSheetOverlay,
  SnackbarNotify,
  useOverlayProvider,
  useOverlay,
  PopOverButton,
  PopOverMenu,
  ZSPortal,
} from './overlay';

export {
  useTheme,
  useFoldingState,
  OverlayProvider,
  ThemeProvider,
  themeFactory,
  // ---
  ZSBottomCta,
  ZSView,
  AnimatedWrapper,
  TextAtom,
  ZSContainer,
  ZSPressable,
  ZSText,
  ThrottleButton,
  ZSTextField,
  ZSRadioGroup,
  ErrorComponent,
  ZSAboveKeyboard,
  // ---
  AlertOverlay,
  BottomSheetOverlay,
  SnackbarNotify,
  useOverlayProvider,
  useOverlay,
  PopOverButton,
  PopOverMenu,
  ZSPortal,
  // Global overlay functions
  GlobalOverlay,
};

// ------------------------------------------------------

import type {
  ThemeProviderProps,
  ThemeProps,
  Palette,
} from "./model/useThemeProvider";
import {
  ColorPalette,
  ColorPaletteExtend,
  ThemeTextType,
  ThemeBorderType,
  ThemeBackground,
  MainColors,
  Theme,
  TypographyVariants,
  ThemeFonts,
  TypoNumber,
  TypographyVariantsProps,
  TypoStyle,
  TypoOptions,
  TypoSubStyle,
  TypoColorOptions
} from "./theme/types";
import { ThemeFactoryColors, ThemeFactoryConfig } from "./theme/palette";
import {
  SnackItem,
  ShowAlertProps,
  ShowSnackBarProps,
  ShowBottomSheetProps,
  PopOverMenuProps,
  CustomSnackbarProps,
  OverlayProviderProps,
  AlertAction,
  AlertActions,
  SnackType,
  HideOption,
  BottomSheetOptions,
  FoldingStateInfo,
  UseFoldingStateReturn,
  GetFoldingStateResponse
} from "./model/types";
import {
  RadioOption,
  ShadowLevel,
  ShadowStyle,
} from "./ui/types";

export type {
  ThemeProviderProps,
  ThemeProps,
  Palette,
  ZSTextProps,
  BoxStyle,
  ColorPalette,
  ColorPaletteExtend,
  ThemeTextType,
  ThemeBorderType,
  ThemeBackground,
  MainColors,
  Theme,
  TypographyVariants,
  ThemeFonts,
  TypoNumber,
  TypographyVariantsProps,
  TypoStyle,
  TypoOptions,
  TypoSubStyle,
  TypoColorOptions,
  ThemeFactoryColors,
  ThemeFactoryConfig,
  SnackItem,
  ShowAlertProps,
  ShowSnackBarProps,
  ShowBottomSheetProps,
  PopOverMenuProps,
  CustomSnackbarProps,
  OverlayProviderProps,
  AlertAction,
  AlertActions,
  SnackType,
  HideOption,
  BottomSheetOptions,
  RadioOption,
  ShadowLevel,
  ShadowStyle,
  ZSContainerRef,
  FoldingStateInfo,
  UseFoldingStateReturn,
  GetFoldingStateResponse
};
