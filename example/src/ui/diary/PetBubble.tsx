import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ZSBorderBeam, ZSBox, radiusStyle, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';

const CHARACTER = require('../../../assets/barabom/feed/rabom_teacher.png');
const SIZE = 56;

export default function PetBubble({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <View style={styles.row} testID={testID}>
      <Image source={CHARACTER} style={styles.character} resizeMode="contain" accessibilityIgnoresInvertColors />
      <ZSBox backgroundColor="surface2" style={[styles.bubble, radiusStyle('lg')]} accessible accessibilityLiveRegion="polite">
        {children}
      </ZSBox>
    </View>
  );
}

const BEAM_COLORS = ['#ffb96a20', '#ffd17b70', '#ffd17b', '#ffaa90', '#ffaa9033'];
const NOTE_RADIUS = 24;

export function PetNoteCard({ children, testID }: { children: ReactNode; testID?: string }) {
  const { colors, mode, shadows } = useTheme();
  return (
    <ZSBorderBeam colors={BEAM_COLORS} borderRadius={NOTE_RADIUS} duration={4200} style={[shadows.md, { borderRadius: NOTE_RADIUS }]}>
      <View style={[styles.note, { backgroundColor: mode === 'dark' ? colors.surface2 : colors.background }]} accessible accessibilityLiveRegion="polite" testID={testID}>
        <Image source={CHARACTER} style={styles.noteCharacter} resizeMode="contain" accessibilityIgnoresInvertColors />
        <View style={styles.noteText}>{children}</View>
      </View>
    </ZSBorderBeam>
  );
}

const styles = StyleSheet.create({
  note: { flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md, paddingStart: GAP.md, paddingEnd: GAP.lg, borderRadius: NOTE_RADIUS },
  noteCharacter: { width: 44, height: 44 },
  noteText: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: GAP.sm },
  character: { width: SIZE, height: SIZE },
  bubble: { flexGrow: 1, flexShrink: 1, paddingHorizontal: GAP.md, paddingVertical: GAP.md, gap: GAP.xxs },
});
