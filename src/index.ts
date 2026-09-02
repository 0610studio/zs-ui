import { GlobalOverlay } from './model/globalOverlay'
import { useStyleSheetCreate } from './model/useStyleSheetCreate'
import { OverlayProvider } from "./context/OverlayContext";
import { BackPriority, useBackHandler } from "./context/BackHandlerContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useFoldingState } from './model/useFoldingState'
import { usePreventDoublePress, PREVENT_DOUBLE_PRESS_INTERVAL } from './model/usePreventDoublePress';
import { themeFactory } from './theme/palette';
import { createShadow } from './theme/elevation';
import { RADIUS, DURATION, DISABLED_OPACITY } from './theme/tokens';
import { FoldingState } from './model/types';
import ErrorComponent from './ui/ZSTextField/ui/ErrorComponent';
import ZSContainer from './ui/ZSContainer';
import ZSPressable from './ui/ZSPressable';
import ZSText from './ui/ZSText';
import ZSTextField from './ui/ZSTextField';
import ZSRadioGroup from './ui/ZSRadioGroup';
import ZSSwitch from './ui/ZSSwitch';
import ZSView from './ui/ZSView';
import AnimatedWrapper from './ui/atoms/AnimatedWrapper';
import TextAtom from './ui/atoms/TextAtom';
import ZSAboveKeyboard from "./ui/ZSAboveKeyboard";
import { ZSContainerRef } from "./ui/ZSContainer";
import { ZSTextProps } from "./ui/ZSText";
import { BoxStyle, ZSTextFieldRef } from "./ui/ZSTextField";
import { AlertOverlay, BottomSheetOverlay, SnackbarNotify, useOverlay, PopOverButton, PopOverMenu, ZSPortal } from './overlay';
import ZSBlockButton from './ui/ZSBlockButton';
import ZSTooltip from './ui/ZSTooltip';
import ZSSkeleton from './ui/ZSSkeleton';
import ZSSkeletonBox from './ui/ZSSkeletonBox';
import ZSBorderBeam from './ui/ZSBorderBeam';
import ZSSegmented from './ui/ZSSegmented';
import ZSChip from './ui/ZSChip';
import ZSCheckBox from './ui/ZSCheckBox';
import ZSMessageBar from './ui/ZSMessageBar';
import ZSTab from './ui/ZSTab';
import ZSDropdown from './ui/ZSDropdown';
import ZSCalendar from './ui/ZSCalendar';
import { useCalendarAgenda } from './ui/ZSCalendar/hooks/useCalendarAgenda';
// 소비자가 events 파이프라인(범위 계산 · prefetch · 리스트 파생)을 직접 짜려면
// 날짜 엔진과 인덱스 유틸이 필요하다 — 캘린더와 같은 규칙을 쓰도록 함께 공개한다.
import {
  CALENDAR_LOCALES,
  resolveCalendarLocale,
  buildEventIndex,
  countEventsOn,
  eventsInRange,
  getEventsOn,
  visibleRangeOf,
  addDays,
  addMonths,
  buildMonthMatrix,
  compareDate,
  daysInMonth,
  diffDays,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isValidDateString,
  monthOfWeek,
  monthsBetween,
  startOfMonth,
  startOfWeek,
  toDateString,
  todayDateString,
  weeksBetween,
  weeksInMonth,
} from './ui/ZSCalendar/core';

export {
  useTheme,
  useFoldingState,
  usePreventDoublePress,
  PREVENT_DOUBLE_PRESS_INTERVAL,
  createShadow,
  ThemeProvider,
  OverlayProvider,
  themeFactory,
  RADIUS,
  DURATION,
  DISABLED_OPACITY,
  FoldingState,
  ZSView,
  AnimatedWrapper,
  TextAtom,
  ZSContainer,
  ZSPressable,
  ZSText,
  ZSTextField,
  ZSRadioGroup,
  ZSSwitch,
  ErrorComponent,
  ZSAboveKeyboard,
  ZSBlockButton,
  ZSSkeleton,
  ZSSkeletonBox,
  ZSBorderBeam,
  ZSSegmented,
  ZSCheckBox,
  ZSChip,
  ZSMessageBar,
  ZSTab,
  ZSDropdown,
  ZSCalendar,
  useCalendarAgenda,
  buildEventIndex,
  countEventsOn,
  eventsInRange,
  getEventsOn,
  CALENDAR_LOCALES,
  resolveCalendarLocale,
  visibleRangeOf,
  addDays,
  addMonths,
  buildMonthMatrix,
  compareDate,
  daysInMonth,
  diffDays,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isValidDateString,
  monthOfWeek,
  monthsBetween,
  startOfMonth,
  startOfWeek,
  toDateString,
  todayDateString,
  weeksBetween,
  weeksInMonth,
  ZSTooltip,
  AlertOverlay,
  BottomSheetOverlay,
  SnackbarNotify,
  useOverlay,
  PopOverButton,
  PopOverMenu,
  ZSPortal,
  GlobalOverlay,
  useStyleSheetCreate,
  BackPriority,
  useBackHandler,
};

import type { ThemeProviderProps, ThemeProps, Palette, FoldableConfig } from "./context/ThemeContext";
import {
  ColorPalette,
  ColorPaletteExtend,
  ThemeTextType,
  ThemeBackground,
  MainColors,
  Theme,
  TypographyVariants,
  ThemeFonts,
  ThemeFontAssets,
  FontAsset,
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
import { ZSBorderBeamProps, ZSBorderBeamGlowConfig } from "./ui/ZSBorderBeam";
import { ZSSegmentedProps, ZSSegmentedTextSize } from "./ui/ZSSegmented";
import { ZSChipProps, ZSChipVariant } from "./ui/ZSChip";
import { ZSMessageBarProps, ZSMessageBarVariant } from "./ui/ZSMessageBar";
import { ZSTabProps, ZSTabItem, ZSTabLayout } from "./ui/ZSTab";
import { ZSDropdownProps } from "./ui/ZSDropdown";
import { ZSSkeletonProps } from "./ui/ZSSkeleton";
import { ZSSkeletonBoxProps } from "./ui/ZSSkeletonBox";
import { ZSCheckBoxProps } from "./ui/ZSCheckBox";
import { ZSTooltipProps, ZSTooltipPlacement, ZSTooltipTailAlign } from "./ui/ZSTooltip";
import type { ZSCalendarProps, CalendarHeaderContext } from "./ui/ZSCalendar/ZSCalendar";
import type {
  CalendarEvent,
  CalendarLabels,
  CalendarLocaleCode,
  CalendarLocaleStrings,
  CalendarMode,
  CalendarTheme,
  CalendarThemeOverride,
  DateRange,
  DateString,
  EventIndex,
  FirstDayOfWeek,
} from "./ui/ZSCalendar/core";
import type { CalendarAgenda, CalendarAgendaOptions } from "./ui/ZSCalendar/hooks/useCalendarAgenda";
import type { CalendarScrollBinding } from "./ui/ZSCalendar/context";
import type { CalendarFontSources } from "./ui/ZSCalendar/skia/fonts";

export type {
  ThemeProviderProps,
  ThemeProps,
  Palette,
  FoldableConfig,
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
  ThemeFontAssets,
  FontAsset,
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
  ZSBorderBeamProps,
  ZSBorderBeamGlowConfig,
  ZSSegmentedProps,
  ZSSegmentedTextSize,
  ZSChipProps,
  ZSChipVariant,
  ZSMessageBarProps,
  ZSMessageBarVariant,
  ZSTabProps,
  ZSTabItem,
  ZSTabLayout,
  ZSDropdownProps,
  ZSSkeletonProps,
  ZSSkeletonBoxProps,
  ZSCheckBoxProps,
  ZSTooltipProps,
  ZSTooltipPlacement,
  ZSTooltipTailAlign,
  ZSCalendarProps,
  CalendarHeaderContext,
  CalendarEvent,
  CalendarLabels,
  CalendarLocaleCode,
  CalendarLocaleStrings,
  CalendarMode,
  CalendarTheme,
  CalendarThemeOverride,
  CalendarFontSources,
  CalendarAgenda,
  CalendarAgendaOptions,
  CalendarScrollBinding,
  DateRange,
  DateString,
  EventIndex,
  FirstDayOfWeek,
};
