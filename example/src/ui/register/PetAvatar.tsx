import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import AnimalPhoto, { type AnimalPhotoKind } from '../kit/AnimalPhoto';

type Props = {
  photo: AnimalPhotoKind | null;
  name: string;
  size: number;
  onPress?: () => void;
  badge?: 'camera' | 'check';
  testID?: string;
};

const BADGE_RATIO = 0.3;

function CameraGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8.5h3.2l1.6-2.5h6.4l1.6 2.5H20v10.5H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={13.5} r={3.2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function CheckGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 12.5l4 4 8-8.5" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function PetAvatar({ photo, name, size, onPress, badge, testID }: Props) {
  const { colors } = useTheme();
  const badgeSize = Math.round(size * BADGE_RATIO);
  const face = photo ? (
    <AnimalPhoto kind={photo} width={size} height={size} radius="full" />
  ) : (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface3 }]}>
      <ZSText variant={size >= 96 ? 'h2' : 'subtitle1'} emphasized color="textSecondary">
        {name.trim().charAt(0) || '?'}
      </ZSText>
    </View>
  );
  const mark = badge ? (
    <View
      pointerEvents="none"
      style={[
        styles.badge,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          borderColor: colors.background,
          backgroundColor: badge === 'check' ? colors.primary : colors.text,
        },
      ]}
    >
      {badge === 'check' ? (
        <CheckGlyph size={badgeSize * 0.62} color={colors.onPrimary} />
      ) : (
        <CameraGlyph size={badgeSize * 0.58} color={colors.background} />
      )}
    </View>
  ) : null;

  // 배지는 원 밖으로 걸치므로 누름 영역(원형으로 잘린다) 밖 형제로 둔다
  return (
    <View style={{ width: size, height: size }}>
      {onPress ? (
        <ZSPressable onPress={onPress} radius="full" accessibilityRole="button" accessibilityLabel="반려동물 사진 고르기" testID={testID}>
          {face}
        </ZSPressable>
      ) : (
        face
      )}
      {mark}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -2, bottom: -2, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
