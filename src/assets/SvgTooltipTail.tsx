import Svg, { Path } from 'react-native-svg';

/** 툴팁 말풍선 꼬리 — 아래를 향하는 삼각형, 끝이 살짝 둥글다 (위 방향은 사용처에서 180도 회전) */
export const SvgTooltipTail = ({ width = 12, height = 7, color = '#141A21' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 7" fill="none">
      <Path
        d="M0 0 H12 L7.04 5.79 Q6 7 4.96 5.79 Z"
        fill={color}
      />
    </Svg>
  );
};
