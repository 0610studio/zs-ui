import { createContext } from 'react';

/** 입력 칸을 누르면 여는 컨트롤(ZSSelect)이 열려 있는 동안 칸을 포커스처럼 보이게 한다 — 라이브러리 내부용 */
export const FieldActiveContext = createContext(false);
