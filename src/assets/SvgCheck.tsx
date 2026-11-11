import Svg, { Path } from 'react-native-svg';
import { ICON_VIEW_BOX, iconStrokeWidth } from './iconStroke';

export const SvgCheck = ({ size = 24, color = '#ffffff', strokeWidth = iconStrokeWidth(size) as number | string }) => {
  return (
    <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
      <Path
        d="M6 12L10.2426 16.2426L18.727 7.75732"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
