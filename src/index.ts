import { GlobalOverlay } from './model/globalOverlay'
import { useStyleSheetCreate } from './model/useStyleSheetCreate'
import { OverlayProvider } from "./context/OverlayContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useFoldingState } from './model/useFoldingState'
import { themeFactory } from './theme/palette';
import ErrorComponent from './ui/ZSTextField/ui/ErrorComponent';
import ZSContainer from './ui/ZSContainer';
import ZSPressable from './ui/ZSPressable';
import ZSText from './ui/ZSText';
import ThrottleButton from './ui/ThrottleButton';
import ZSTextField from './ui/ZSTextField';
import ZSRadioGroup from './ui/ZSRadioGroup';
import ZSSwitch from './ui/ZSSwitch';
import ZSBottomCta from './ui/ZSBottomCta';
import ZSView from './ui/ZSView';
import AnimatedWrapper from './ui/atoms/AnimatedWrapper';
import TextAtom from './ui/atoms/TextAtom';
import ZSAboveKeyboard from "./ui/ZSAboveKeyboard";
import { ZSContainerRef } from "./ui/ZSContainer";
import { ZSTextProps } from "./ui/ZSText";
import { BoxStyle, ZSTextFieldRef } from "./ui/ZSTextField";
import { AlertOverlay, BottomSheetOverlay, SnackbarNotify, useOverlay, PopOverButton, PopOverMenu, ZSPortal } from './overlay';
import ZSBlockButton from './ui/ZSBlockButton';
import ZSSkeleton from './ui/ZSSkeleton';
import ZSSkeletonBox from './ui/ZSSkeletonBox';

export {
  useTheme,
  useFoldingState,
  ThemeProvider,
  OverlayProvider,
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
  ZSSwitch,
  ErrorComponent,
  ZSAboveKeyboard,
  ZSBlockButton,
  ZSSkeleton,
  ZSSkeletonBox,
  // ---
  AlertOverlay,
  BottomSheetOverlay,
  SnackbarNotify,
  useOverlay,
  PopOverButton,
  PopOverMenu,
  ZSPortal,
  // Global overlay functions
  GlobalOverlay,
  useStyleSheetCreate,
};

// ------------------------------------------------------

import type { ThemeProviderProps, ThemeProps, Palette } from "./context/ThemeContext";
import {
  ColorPalette,
  ColorPaletteExtend,
  ThemeTextType,
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
  ShadowLevel,
  ShadowStyle,
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
  FoldingStateInfo
} from "./model/types";
import { RadioOption } from "./ui/types";

export type {
  ThemeProviderProps,
  ThemeProps,
  Palette,
  ZSTextProps,
  BoxStyle,
  ZSTextFieldRef,
  ColorPalette,
  ColorPaletteExtend,
  ThemeTextType,
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
};
