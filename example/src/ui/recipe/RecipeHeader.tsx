import ScreenHeader, { type ScreenHeaderProps } from '../ScreenHeader';
import { useHorizontalBars, useStatusBarSlot } from '../../model/StatusBarSlot';
import DuoTopBarHeader from './DuoTopBarHeader';

export default function RecipeHeader(props: ScreenHeaderProps) {
  useHorizontalBars();
  const slot = useStatusBarSlot();
  return slot ? <DuoTopBarHeader {...props} /> : <ScreenHeader {...props} />;
}

export type { ScreenHeaderProps as RecipeHeaderProps };
