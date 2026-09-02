import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/** 사선 끝은 원 stroke 안쪽에서 멈춘다 — 테두리까지 그으면 linecap 이 밖으로 삐져나온다. */
export const SvgProhibition = ({ size = 20, color = '#CC163E', strokeWidth = 1.8 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M6.91 17.09L17.09 6.91"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};
