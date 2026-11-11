import Svg, { Path, Circle } from 'react-native-svg';
import { ICON_VIEW_BOX, iconStrokeWidth } from './iconStroke';

const SvgExclamation = ({
  size = 24,
  backgroundColor = '#FF4D4F',
  exclamationColor = '#FFFFFF',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={ICON_VIEW_BOX}
    >
      <Circle
        cx="12"
        cy="12"
        r="10"
        fill={backgroundColor}
      />

      <Path
        d="M12 6.5v6"
        stroke={exclamationColor}
        strokeWidth={iconStrokeWidth(size)}
        strokeLinecap="round"
      />
      <Circle
        cx="12.1"
        cy="17"
        r="1.5"
        fill={exclamationColor}
      />
    </Svg>
  );
};

export default SvgExclamation;
