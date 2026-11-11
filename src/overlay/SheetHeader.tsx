import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SPACE } from '../theme/spacing';
import ZSText from '../ui/ZSText';

/** 헤더 줄 최소 높이 — 오른쪽 버튼(44~48)이 들어가는 높이 */
export const SHEET_HEADER_MIN_HEIGHT = 48;

interface SheetHeaderProps {
  header?: ReactNode;
  headerRight?: ReactNode;
  paddingHorizontal: number;
}

/**
 * 시트 헤더 줄 — 손잡이 바로 아래, 콘텐츠의 끌기 막이(SheetContent) 밖에 그려 손잡이처럼 시트를 끌 수 있다.
 * 오른쪽 버튼은 누를 수 있는 뷰라 탭은 버튼이 받고, 나머지 헤더에서 끌면 시트가 움직인다.
 * 문자열 제목은 Text 대신 줄 전체가 접근성 머리글이 된다 — Android 에서 포커스 가능한 Text 는 터치를 가져가 시트 끌기를 막는다.
 */
export function SheetHeader({ header, headerRight, paddingHorizontal }: SheetHeaderProps) {
  const title = typeof header === 'string' || typeof header === 'number' ? String(header) : null;
  return (
    <View testID="zs-bottom-sheet-header" style={[styles.row, { paddingHorizontal }]}>
      <View
        style={styles.title}
        accessible={title !== null}
        accessibilityRole={title !== null ? 'header' : undefined}
        accessibilityLabel={title ?? undefined}
      >
        {title !== null ? (
          <ZSText variant="h4" emphasized accessible={false} numberOfLines={2}>
            {title}
          </ZSText>
        ) : (
          header
        )}
      </View>
      {headerRight ? (
        <View testID="zs-bottom-sheet-header-right" style={styles.right}>
          {headerRight}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, minHeight: SHEET_HEADER_MIN_HEIGHT, paddingBottom: SPACE.sm },
  title: { flex: 1, minWidth: 0 },
  right: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs },
});
