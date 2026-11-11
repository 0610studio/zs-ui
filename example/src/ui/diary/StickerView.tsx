import { Image, StyleSheet, View } from 'react-native';
import { ZSText } from '@0610studio/zs-ui';
import { STICKER_EMOJI_BASE, findSticker } from './diaryAssets';

export default function StickerView({ value, size }: { value: string; size: number }) {
  const sticker = findSticker(value);
  if (sticker) return <Image source={sticker.image} style={{ width: size, height: size }} resizeMode="contain" />;
  return (
    <View style={[styles.emojiWrap, { width: size, height: size }]}>
      <Image source={STICKER_EMOJI_BASE} style={StyleSheet.absoluteFill} resizeMode="contain" />
      <ZSText allowFontScaling={false} style={{ fontSize: Math.round(size * 0.54), lineHeight: Math.round(size * 0.7) }}>
        {value}
      </ZSText>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiWrap: { alignItems: 'center', justifyContent: 'center' },
});
