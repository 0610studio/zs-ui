import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ICON_STROKE_WIDTH, ICON_VIEW_BOX } from '../../assets/iconStroke';

export type StatusIconKind = 'info' | 'success' | 'warning' | 'error';

interface StatusIconProps {
  kind: StatusIconKind;
  size: number;
  color: string;
  ink: string;
}

const TRIANGLE = 'M14.25 6.3L20.35 16.9Q22.6 20.8 18.1 20.8L5.9 20.8Q1.4 20.8 3.65 16.9L9.75 6.3Q12 2.4 14.25 6.3Z';

function StatusIcon({ kind, size, color, ink }: StatusIconProps) {
  const stroke = { stroke: ink, strokeWidth: ICON_STROKE_WIDTH, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox={ICON_VIEW_BOX}>
      {kind === 'warning' ? <Path d={TRIANGLE} fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" /> : <Circle cx="12" cy="12" r="9.5" fill={color} />}
      {kind === 'info' ? (
        <>
          <Path d="M12 11v5.4" {...stroke} />
          <Circle cx="12" cy="7.9" r="1.2" fill={ink} />
        </>
      ) : kind === 'error' ? (
        <>
          <Path d="M12 7.4v5.6" {...stroke} />
          <Circle cx="12" cy="16.4" r="1.2" fill={ink} />
        </>
      ) : kind === 'success' ? (
        <Path d="M8 12.2l2.8 2.8 5.2-5.4" {...stroke} />
      ) : (
        <>
          <Path d="M12 9.6v4.4" {...stroke} />
          <Circle cx="12" cy="17.2" r="1.15" fill={ink} />
        </>
      )}
    </Svg>
  );
}

export default React.memo(StatusIcon);
