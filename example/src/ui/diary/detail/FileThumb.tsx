import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../../kit/layout';
import AnimalPhoto from '../../kit/AnimalPhoto';
import type { RecordFile } from '../../../model/diary/records';

export function PlayGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5.5v13a1 1 0 001.5.86l10.4-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" fill={color} />
    </Svg>
  );
}

export function DocumentPage({ width, height }: { width: number; height: number }) {
  const { colors } = useTheme();
  const page = Math.min(width * 0.62, height * 0.78);
  const pageHeight = page * 1.3;
  const line = colors.border;
  return (
    <View style={[styles.docBack, { width, height, backgroundColor: colors.surface3 }]}>
      <Svg width={page} height={pageHeight} viewBox="0 0 100 130">
        <Rect x={0} y={0} width={100} height={130} rx={4} fill={colors.background} />
        <Rect x={10} y={12} width={48} height={8} rx={2} fill={colors.primary} />
        {[30, 40, 50, 60, 70, 84, 94, 104].map((y) => (
          <Rect key={y} x={10} y={y} width={y % 20 === 0 ? 62 : 80} height={4} rx={2} fill={line} />
        ))}
      </Svg>
    </View>
  );
}

export default function FileThumb({ file, width, height }: { file: RecordFile; width: number; height: number }) {
  if (file.kind === 'pdf') {
    return (
      <View>
        <DocumentPage width={width} height={height} />
        <View style={styles.strip}>
          <ZSText variant="caption" emphasized style={styles.stripText}>
            PDF
          </ZSText>
        </View>
      </View>
    );
  }
  return (
    <View>
      <AnimalPhoto kind={file.photo} width={width} height={height} radius="none" />
      {file.kind === 'video' ? (
        <View style={[styles.strip, styles.stripEnd]}>
          <PlayGlyph size={16} color="#ffffff" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  docBack: { alignItems: 'center', justifyContent: 'center' },
  strip: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: GAP.xxs + 1, paddingHorizontal: GAP.sm, backgroundColor: 'rgba(0,0,0,0.35)', flexDirection: 'row' },
  stripEnd: { justifyContent: 'flex-end' },
  stripText: { color: '#ffffff' },
});
