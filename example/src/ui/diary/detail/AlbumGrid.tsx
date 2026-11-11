import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSPressable, radiusStyle } from '@0610studio/zs-ui';
import type { RecordFile } from '../../../model/diary/records';
import FileThumb from './FileThumb';

const GAP = 3;

const floorTenth = (value: number) => Math.floor(value * 10) / 10;

/** 한 줄 칸 수 — 넓은 그리드(폴더블 펼침 전체 폭)는 5칸, 폰 폭은 3칸 */
const WIDE_GRID = 560;
const columnsFor = (width: number) => (width >= WIDE_GRID ? 5 : 3);

// 마지막 줄은 남은 칸끼리 폭을 나눈다(1개면 전폭)
const tileWidth = (index: number, count: number, width: number, columns: number): number => {
  const rest = count % columns;
  const inLastRow = rest !== 0 && index >= count - rest;
  const perRow = inLastRow ? rest : columns;
  return floorTenth((width - GAP * (perRow - 1)) / perRow);
};

const KIND_LABEL: Record<RecordFile['kind'], string> = { photo: '사진', video: '동영상', pdf: 'PDF' };

export default function AlbumGrid({ files, onOpen, testID }: { files: RecordFile[]; onOpen: (index: number) => void; testID: string }) {
  const [width, setWidth] = useState(0);
  const columns = columnsFor(width);
  // 폰 폭은 그대로(3칸 120, 3장 미만 130), 넓은 그리드는 정사각 칸
  const height = columns === 3 ? (files.length < 3 ? 130 : 120) : Math.round(tileWidth(0, columns, width, columns));
  return (
    <View style={[styles.grid, radiusStyle('xl')]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)} testID={testID}>
      {width > 0
        ? files.map((file, index) => {
            const tile = tileWidth(index, files.length, width, columns);
            return (
              <ZSPressable
                key={file.id}
                onPress={() => onOpen(index)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`${KIND_LABEL[file.kind]} ${index + 1}/${files.length}`}
                testID={`${testID}-${index}`}
                style={{ width: tile, height }}
              >
                <FileThumb file={file} width={tile} height={height} />
              </ZSPressable>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: GAP, overflow: 'hidden' },
});
