import Svg, { Path } from 'react-native-svg';
import { ICON_VIEW_BOX, iconStrokeWidth } from './iconStroke';

export type SvgChevronDirection = 'up' | 'down' | 'left' | 'right';

export const CHEVRON_PATHS: Record<SvgChevronDirection, string> = {
  down: 'M6 9.5L12 15.5L18 9.5',
  up: 'M6 14.5L12 8.5L18 14.5',
  left: 'M14.5 6L8.5 12L14.5 18',
  right: 'M9.5 6L15.5 12L9.5 18',
};

export const SvgChevron = ({
  direction = 'down' as SvgChevronDirection,
  size = 24,
  color = '#637381',
  strokeWidth = iconStrokeWidth(size) as number | string,
}) => {
  return (
    <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
      <Path
        d={CHEVRON_PATHS[direction]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
