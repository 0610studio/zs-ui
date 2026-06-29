import React from 'react';
import { Image, type ImageSourcePropType, type StyleProp, type ViewStyle, type ViewProps } from 'react-native';
import { TypoColorOptions, TypoOptions, TypoSubStyle, ViewColorOptions, IntentOptions } from '../../theme/types';
import { useTheme } from '../../context/ThemeContext';
import { resolveTextColor } from '../../theme/resolveColor';
import ZSPressable from '../ZSPressable';
import ZSView from '../ZSView';
import ZSText from '../ZSText';

// variant 별 텍스트 색상 토큰 (intent 단위 예외값 포함)
const PASTEL_TEXT_COLOR: Record<IntentOptions, TypoColorOptions> = {
  primary: 'primary.60',
  danger: 'danger.60',
  information: 'information.60',
  success: 'success.60',
  warning: 'warning.60',
  grey: 'grey.70',
};

const STROKE_TEXT_COLOR: Record<IntentOptions, TypoColorOptions> = {
  primary: 'primary.50',
  danger: 'danger.50',
  information: 'information.50',
  success: 'success.50',
  warning: 'warning.60',
  grey: 'grey.60',
};

// typo 크기(subStyle)별 패딩
const PADDING_HORIZONTAL: Record<TypoSubStyle, number> = { '1': 11, '2': 11, '3': 10, '4': 8, '5': 7, '6': 5 };
const PADDING_VERTICAL: Record<TypoSubStyle, number> = { '1': 9, '2': 9, '3': 8, '4': 6, '5': 5, '6': 4 };

type Props = ViewProps & {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  title: string;
  intent?: IntentOptions;
  variant?: 'solid' | 'pastel' | 'stroke';
  typo: TypoOptions;
  prefixIcon?: ImageSourcePropType;
  isLoading?: boolean;
  disabled?: boolean;
};

function ZSBlockButton({ onPress, style, title, intent = 'primary', typo, prefixIcon, variant = 'solid', isLoading = false, disabled = false, ...props }: Props) {
  const { palette } = useTheme();
  const size = typo.split('.')[1] as TypoSubStyle;

  const colors: {
    backgroundColor: ViewColorOptions | 'transparent';
    textColor: TypoColorOptions;
    borderColor?: string;
    borderWidth: number;
  } = variant === 'solid'
    ? { backgroundColor: `${intent}.50` as ViewColorOptions, textColor: 'white', borderColor: undefined, borderWidth: 0 }
    : variant === 'pastel'
      ? { backgroundColor: `${intent}.10` as ViewColorOptions, textColor: PASTEL_TEXT_COLOR[intent], borderColor: undefined, borderWidth: 0 }
      : { backgroundColor: 'transparent', textColor: STROKE_TEXT_COLOR[intent], borderColor: palette[intent][50], borderWidth: 1 };

  const paddingHorizontal = PADDING_HORIZONTAL[size] ?? 10;
  const paddingVertical = PADDING_VERTICAL[size] ?? 8;
  const textColorValue = resolveTextColor(palette, colors.textColor);

  return (
    <ZSPressable onPress={onPress} style={style} isLoading={isLoading} disabled={disabled} {...props}>
      <ZSView
        style={{
          paddingHorizontal,
          paddingVertical,
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
          backgroundColor: colors.backgroundColor === 'transparent' ? 'transparent' : undefined,
          borderColor: colors.borderColor,
          borderWidth: colors.borderWidth,
        }}
        color={colors.backgroundColor !== 'transparent' ? colors.backgroundColor : undefined}
      >
        {prefixIcon && (
          <Image
            style={{ width: 12, height: 12, marginTop: 1 }}
            tintColor={textColorValue}
            source={prefixIcon}
          />
        )}
        <ZSText color={colors.textColor} typo={typo}>{title}</ZSText>
      </ZSView>
    </ZSPressable>
  );
}

export default React.memo(ZSBlockButton);
