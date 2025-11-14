import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const SvgCheck = ({ size = 24, color = '#ffffff', strokeWidth = "2" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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
