import Svg, { Path } from 'react-native-svg';
import { ICON_VIEW_BOX, iconStrokeWidth } from './iconStroke';

export const SvgX = ({ size = 12, color = '#5E696E' }) => {
  return (
    <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
      <Path
        d="M6 6L18 18M6 18L18 6"
        stroke={color}
        strokeWidth={iconStrokeWidth(size)}
        strokeLinecap="round"
      />
    </Svg>
  );
};
