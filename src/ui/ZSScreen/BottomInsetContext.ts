import { createContext, useContext } from 'react';

export const ScreenBottomInsetContext = createContext(0);

/**
 * 한쪽에 놓인 `bottomComponent`(`bottomComponentPlacement` 'start'·'end')의 높이.
 * 그 아래로 흐르는 칸이 마지막 내용을 가리지 않게 아래 여백으로 씁니다. 전폭이거나 없으면 0.
 */
export const useScreenBottomInset = () => useContext(ScreenBottomInsetContext);
