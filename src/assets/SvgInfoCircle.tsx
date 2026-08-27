import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/** 원 안의 i — 안내/중립 메시지용 상태 아이콘 */
export const SvgInfoCircle = ({ size = 20, color = '#5E696E', strokeWidth = 1.8 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 11.2V16.3"
        stroke={color}
        strokeWidth={strokeWidth + 0.2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="8.4" r="1.05" fill={color} />
    </Svg>
  );
};
