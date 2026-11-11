import { Platform, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { withOpacity } from '../../theme/color';
import { OPACITY } from '../../theme/state';
import { SvgChevron } from '../../assets/SvgChevron';
import ZSTextField from '../ZSTextField';
import { FieldActiveContext } from '../ZSTextField/FieldActiveContext';
import type { ZSTextFieldVariant } from '../ZSTextField/geometry';
import { placeholderColor } from '../ZSTextField/placeholderColor';

const CHEVRON_SIZE = 20;

interface SelectFieldProps {
  label: string;
  text: string;
  isPlaceholder: boolean;
  open: boolean;
  disabled: boolean;
  variant: ZSTextFieldVariant;
}

/**
 * 누르면 메뉴를 여는 칸 — ZSTextField 와 같은 모양(테두리·떠오르는 라벨·글꼴)을 읽기 전용으로 그린다.
 * 누르기·스크린 리더는 바깥 트리거가 맡으므로 칸 자체는 터치·접근성에서 뺀다.
 */
export function SelectField({ label, text, isPlaceholder, open, disabled, variant }: SelectFieldProps) {
  const { colors, typography } = useTheme();
  // Android 는 칸을 Compose 호스트 안에 그려 바깥으로 넘친 것이 잘린다 — outlined 의 떠오른 라벨(위 테두리에 반쯤 걸침)만큼 위를 비운다
  const labelOverhang = Platform.OS === 'android' && variant === 'outlined' ? Math.ceil((typography.caption.lineHeight ?? 16) / 2) : 0;
  const textColor = isPlaceholder && !disabled ? placeholderColor(colors.textSecondary, colors.background) : undefined;
  const chevronColor = disabled ? withOpacity(colors.text, OPACITY.disabled) : colors.textSecondary;
  return (
    <FieldActiveContext.Provider value={open && !disabled}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={labelOverhang > 0 ? { paddingTop: labelOverhang } : undefined}>
        <ZSTextField
          label={label}
          value={text}
          variant={variant}
          disabled={disabled}
          readOnly
          clearable={false}
          inputStyle={textColor ? { color: textColor } : undefined}
          endAdornment={<SvgChevron direction={open ? 'up' : 'down'} size={CHEVRON_SIZE} color={chevronColor} />}
        />
      </View>
    </FieldActiveContext.Provider>
  );
}
