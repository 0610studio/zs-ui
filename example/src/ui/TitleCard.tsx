import { ViewProps } from "react-native";
import { ZSText, ZSView } from "zs-ui";

type Props = ViewProps & {
  title?: string;
  gap?: number;
  flexDirection?: 'row' | 'column';
};

export default function TitleCard({
  title,
  gap = 10,
  children,
  flexDirection = 'row'
}: Props) {
  return (
    <ZSView color='layer2' style={{ width: '100%' }}>
      {title && <ZSText typo="heading.4" style={{ marginBottom: 15, marginLeft: 10 }}>{title}</ZSText>}
      <ZSView color='base' style={{ flexWrap: 'wrap', flexDirection: flexDirection, gap: gap, padding: 14, borderRadius: 14, width: '100%' }}>
        {children}
      </ZSView>
    </ZSView>
  )
}