import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/** onLayout 폭이 유일한 반응형 기준 — 폴드 펼침·회전·split view 가 자동으로 반영된다 */
export function useContainerWidth(): { width: number; onLayout: (event: LayoutChangeEvent) => void } {
  const [width, setWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    // 소수점 흔들림에 SkPicture 캐시가 매 프레임 버려지는 것을 막는다
    setWidth((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
  }, []);

  return { width, onLayout };
}
