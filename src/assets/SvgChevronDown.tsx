import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const SvgChevronDown = ({ size = 20, color = '#637381', strokeWidth = "1.6" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9.5L12 15.5L18 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
