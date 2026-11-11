import Svg, { Path } from 'react-native-svg';

export type ContentIconName = 'heart' | 'chat' | 'chevronRight';

const HEART = 'M12 19.9s-7.7-4.6-7.7-10.4A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 7.7 2.4c0 5.8-7.7 10.4-7.7 10.4z';

type Props = {
  name: ContentIconName;
  color: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
};

export default function ContentIcon({ name, color, size = 24, strokeWidth = 1.8, fill }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Shape name={name} fill={fill} />
    </Svg>
  );
}

function Shape({ name, fill }: { name: ContentIconName; fill?: string }) {
  switch (name) {
    case 'heart':
      return <Path d={HEART} fill={fill ?? 'none'} />;
    case 'chat':
      return <Path d="M5 18.4V7.6A2.6 2.6 0 0 1 7.6 5h8.8A2.6 2.6 0 0 1 19 7.6v6a2.6 2.6 0 0 1-2.6 2.6H8.3z" />;
    case 'chevronRight':
      return <Path d="m10 6.5 5.5 5.5-5.5 5.5" />;
  }
}
