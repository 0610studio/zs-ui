import { useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ZSButton, ZSPressable, ZSText, useOverlay, useTheme } from '@0610studio/zs-ui';
import { GAP, PAGE_INSET } from '../../src/ui/kit/layout';
import AnimalPhoto from '../../src/ui/kit/AnimalPhoto';
import ModalHeader from '../../src/ui/diary/ModalHeader';
import { DocumentPage, PlayGlyph } from '../../src/ui/diary/detail/FileThumb';
import { NOT_IN_EXAMPLE_MESSAGE } from '../../src/model/diary/common';
import { DETAIL_TEXT } from '../../src/model/diary/detail';
import { findRecord, type RecordFile } from '../../src/model/diary/records';

const PLAY = 66;

function Page({ file, width, height, onOpen }: { file: RecordFile; width: number; height: number; onOpen: () => void }) {
  const size = Math.min(width - PAGE_INSET * 2, height);
  if (file.kind === 'pdf') {
    return (
      <View style={[styles.page, { width, height }]}>
        <DocumentPage width={size * 0.8} height={Math.min(size * 1.05, height)} />
        <ZSButton title={DETAIL_TEXT.pdfView} variant="tonal" color="neutral" onPress={onOpen} style={styles.center} testID="gallery-pdf" />
      </View>
    );
  }
  return (
    <View style={[styles.page, { width, height }]}>
      <AnimalPhoto kind={file.photo} width={size} height={file.kind === 'video' ? Math.round(size / 1.6) : size} radius="none" accessibilityLabel={file.kind === 'video' ? '동영상' : '사진'} />
      {file.kind === 'video' ? (
        <ZSPressable onPress={onOpen} radius="full" accessibilityRole="button" accessibilityLabel={DETAIL_TEXT.videoPlay} testID="gallery-play" style={[styles.center, styles.play]}>
          <PlayGlyph size={PLAY * 0.5} color="#ffffff" />
        </ZSPressable>
      ) : null}
    </View>
  );
}

export default function GalleryScreen() {
  const { colors } = useTheme();
  const { showSnackbar } = useOverlay();
  const { id, index } = useLocalSearchParams<{ id: string; index?: string }>();
  const { width } = useWindowDimensions();
  const [pageHeight, setPageHeight] = useState(0);
  const files = findRecord(id ?? '')?.files ?? [];
  const start = Math.min(Math.max(Number(index ?? 0) || 0, 0), Math.max(files.length - 1, 0));
  const [current, setCurrent] = useState(start);

  return (
    <>
      <ModalHeader title={DETAIL_TEXT.gallery} leading={{ kind: 'close', onPress: () => router.back() }} />
      <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={(event) => setPageHeight(event.nativeEvent.layout.height)}>
        {pageHeight > 0 ? (
          <FlatList
            data={files}
            keyExtractor={(file) => file.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={start}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(event) => setCurrent(Math.round(event.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => <Page file={item} width={width} height={pageHeight} onOpen={() => showSnackbar({ message: NOT_IN_EXAMPLE_MESSAGE })} />}
            testID="gallery-list"
          />
        ) : null}
        <View style={styles.counter} accessibilityLiveRegion="polite" testID="gallery-counter">
          <ZSText variant="label" emphasized style={styles.counterText}>{`${current + 1} / ${files.length}`}</ZSText>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  page: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignSelf: 'center' },
  play: { width: PLAY, height: PLAY, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  counter: { position: 'absolute', right: PAGE_INSET, bottom: GAP['3xl'], paddingHorizontal: GAP.md, paddingVertical: GAP.xs, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.47)' },
  counterText: { color: '#ffffff' },
});
