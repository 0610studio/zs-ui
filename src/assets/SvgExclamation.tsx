import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const SvgExclamation = ({ 
  size = 24,
  backgroundColor = '#FF4D4F',
  exclamationColor = '#FFFFFF',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      {/* 배경 원 */}
      <Circle
        cx="12"
        cy="12"
        r="10"
        fill={backgroundColor}
      />
      
      {/* 느낌표 표시 */}
      <Path
        d="M12 6.5v6"
        stroke={exclamationColor}
        strokeWidth="2.2"
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