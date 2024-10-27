export interface RadioOption {
    value: string;
    index: string;
}

export type ShadowLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ShadowStyle {
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
}
