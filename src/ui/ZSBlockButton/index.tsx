import { Image, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { TypoColorOptions, TypoOptions, ViewColorOptions, IntentOptions } from '../../theme/types';
import { useTheme } from '../../context/ThemeContext';
import ZSPressable from '../ZSPressable';
import ZSView from '../ZSView';
import ZSText from '../ZSText';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  title: string;
  intent?: IntentOptions;
  variant?: 'solid' | 'pastel' | 'stroke';
  typo: TypoOptions;
  prefixIcon?: ImageSourcePropType;
};

function ZSBlockButton({ onPress, style, title, intent = 'primary', typo, prefixIcon, variant = 'solid' }: Props) {
  const { palette } = useTheme();
  const size = typo.split('.')[1];

  const getColors = (): {
    backgroundColor: ViewColorOptions | 'transparent';
    textColor: TypoColorOptions;
    borderColor?: string;
    borderWidth: number;
  } => {
    const baseColor = intent === 'danger' ? 'danger'
      : intent === 'primary' ? 'primary'
        : intent === 'information' ? 'information'
          : intent === 'success' ? 'success'
            : intent === 'warning' ? 'warning'
              : 'grey';

    if (variant === 'solid') {
      return {
        backgroundColor: `${baseColor}.50` as ViewColorOptions,
        textColor: 'white' as TypoColorOptions,
        borderColor: undefined,
        borderWidth: 0,
      };
    } else if (variant === 'pastel') {
      return {
        backgroundColor: `${baseColor}.10` as ViewColorOptions,
        textColor: (intent === 'danger' ? 'danger.60'
          : intent === 'primary' ? 'primary.60'
            : intent === 'information' ? 'information.60'
              : intent === 'success' ? 'success.60'
                : intent === 'warning' ? 'warning.60'
                  : 'grey.70') as TypoColorOptions,
        borderColor: undefined,
        borderWidth: 0,
      };
    } else { // stroke
      return {
        backgroundColor: 'transparent',
        textColor: (intent === 'danger' ? 'danger.50'
          : intent === 'primary' ? 'primary.50'
            : intent === 'information' ? 'information.50'
              : intent === 'success' ? 'success.50'
                : intent === 'warning' ? 'warning.60'
                  : 'grey.60') as TypoColorOptions,
        borderColor: intent === 'danger' ? palette.danger[50]
          : intent === 'primary' ? palette.primary[50]
            : intent === 'information' ? palette.information[50]
              : intent === 'success' ? palette.success[50]
                : intent === 'warning' ? palette.warning[50]
                  : palette.grey[50],
        borderWidth: 1,
      };
    }
  };

  const colors = getColors();

  const paddingHorizontal = size === '1' ? 11
    : size === '2' ? 11
      : size === '3' ? 10
        : size === '4' ? 8
          : size === '5' ? 7
            : 10;
  const paddingVertical = size === '1' ? 9
    : size === '2' ? 9
      : size === '3' ? 8
        : size === '4' ? 6
          : size === '5' ? 5
            : 8;

  const getTextColorValue = () => {
    const [c01, c02] = colors.textColor.split('.');
    if (c02) {
      return palette[c01][c02];
    }
    return palette.text[c01];
  };

  const textColorValue = getTextColorValue();

  return (
    <ZSPressable onPress={onPress} style={style}>
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

export default ZSBlockButton;
