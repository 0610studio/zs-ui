import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSScreen, ZSText, useTheme, useWindowLayout } from '@0610studio/zs-ui';
import ScreenHeader from '../ScreenHeader';

export function LiveSize({ padded = true }: { padded?: boolean }) {
  const { width, height, orientation } = useWindowLayout();
  const { colors } = useTheme();
  const [contentWidth, setContentWidth] = useState(0);
  return (
    <View style={[styles.live, !padded && { paddingHorizontal: 0 }, { backgroundColor: colors.surface2 }]}>
      <View onLayout={(event) => setContentWidth(Math.round(event.nativeEvent.layout.width))}>
        <ZSText variant="caption" color="textSecondary" testID="foldable-live-size">
          {`${Math.round(width)} × ${Math.round(height)} · 본문 ${contentWidth} · ${orientation}`}
        </ZSText>
      </View>
    </View>
  );
}

export function EndMarker({ label = '마지막 문장과 테두리 전체가 보여야 합니다.', testID = 'foldable-end-marker' }: { label?: string; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={[styles.marker, { borderColor: colors.text, backgroundColor: colors.surface2 }]}>
      <ZSText variant="subtitle2" emphasized>스크롤 끝</ZSText>
      <ZSText variant="body2">{label}</ZSText>
    </View>
  );
}

export function LabPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <ScreenHeader title={title} />
      <ZSScreen backgroundColor="surface1" maxContentWidth="readable" topComponent={<LiveSize />} style={labStyles.content}>
        {children}
      </ZSScreen>
    </>
  );
}

export const labStyles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

const styles = StyleSheet.create({
  live: { paddingHorizontal: 20, paddingVertical: 8 },
  marker: { borderWidth: 2, borderRadius: 12, padding: 16, gap: 8 },
});
