import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/** 원 안의 체크 — 완료/성공 메시지용 상태 아이콘 */
export const SvgCheckCircle = ({ size = 20, color = '#1E9E5A', strokeWidth = 1.8 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M8.1 11.8L10.9 14.6L15.9 9.2"
        stroke={color}
        strokeWidth={strokeWidth + 0.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
