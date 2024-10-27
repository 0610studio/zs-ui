import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const SvgX = ({ size = 12, color = '#5E696E' }) => {
  const strokeWidth = size * 0.12;
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={`
          M ${size * 0.25} ${size * 0.25}
          Q ${size / 2} ${size / 2} ${size * 0.75} ${size * 0.75}
          M ${size * 0.25} ${size * 0.75}
          Q ${size / 2} ${size / 2} ${size * 0.75} ${size * 0.25}
        `}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};