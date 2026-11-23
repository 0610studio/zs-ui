import ScreenHeader, { type ScreenHeaderProps } from '../ScreenHeader';
import { useTopBarSlot } from '@0610studio/zs-ui';
import { useHorizontalBars } from '../../model/StatusBarSlot';
import DuoTopBarHeader from './DuoTopBarHeader';

export default function RecipeHeader(props: ScreenHeaderProps) {
  useHorizontalBars();
  const slot = useTopBarSlot();
  return slot ? <DuoTopBarHeader {...props} /> : <ScreenHeader {...props} />;
}

export type { ScreenHeaderProps as RecipeHeaderProps };
