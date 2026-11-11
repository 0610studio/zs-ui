import { createContext, useContext } from 'react';

// 지금 그려지는 바탕 면의 색 — 없으면 페이지 배경(background) 위다
export const SurfaceContext = createContext<string | null>(null);

export function useSurface(): string | null {
  return useContext(SurfaceContext);
}
