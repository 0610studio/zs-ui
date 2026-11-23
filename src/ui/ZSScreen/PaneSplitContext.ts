import { createContext } from 'react';

/**
 * ZSScreen 안의 ZSPaneLayout 이 지금 두 칸으로 나뉘었는지 알리는 통로. ZSScreen 은 이 값으로 한쪽 아래 영역
 * (bottomComponentPlacement)을 정한다 — 앱이 spacing·divider 를 바꿔도 실제 분할과 어긋나지 않는다.
 * null 은 '알리는 pane 없음'(언마운트)이다.
 */
export const PaneSplitReportContext = createContext<((split: boolean | null) => void) | null>(null);
