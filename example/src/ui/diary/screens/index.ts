import type { ComponentType } from 'react';
import type { DiaryCategoryCode } from '../../../model/diary/categories';
import { AbnormalScreen, TodoScreen, WalkScreen } from './Phase2Screens';
import { MeasureScreen, MedicalScreen } from './Phase3Screens';
import { BehaviorScreen, FeedScreen } from './Phase4Screens';
import { PoopeeScreen } from './PoopeeScreen';
import { MemoScreen, PlayScreen, WeightScreen } from './SimpleScreens';

export const DIARY_SCREENS: Partial<Record<DiaryCategoryCode, ComponentType>> = {
  memo: MemoScreen,
  weight: WeightScreen,
  play: PlayScreen,
  poopee: PoopeeScreen,
  todo: TodoScreen,
  abnormal: AbnormalScreen,
  walk: WalkScreen,
  medical: MedicalScreen,
  measure: MeasureScreen,
  feed: FeedScreen,
  behavior: BehaviorScreen,
};
