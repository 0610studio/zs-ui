import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * 꼭짓점은 Q 커브로 둥글린다 — strokeLinejoin 은 라운드가 stroke 굵기에 비례해 인상이 달라진다.
 * 폭 21.2 는 원형 아이콘(지름 18)과 나란히 놨을 때 같게 읽히도록 한 광학 보정이다.
 */
export const SvgAlertTriangle = ({ size = 20, color = '#806E00', strokeWidth = 1.8 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.25 6.3L20.35 16.9Q22.6 20.8 18.1 20.8L5.9 20.8Q1.4 20.8 3.65 16.9L9.75 6.3Q12 2.4 14.25 6.3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M12 9V14.8"
        stroke={color}
        strokeWidth={strokeWidth + 0.2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="17.6" r="1.15" fill={color} />
    </Svg>
  );
};
