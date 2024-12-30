import { ViewProps } from "react-native";
import { ZSText, ZSView, useTheme } from "zs-ui";

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
  const { palette: { background } } = useTheme();

  return (
    <ZSView style={{ backgroundColor: background.layer2 }}>
      {
        title && <ZSText typo="heading.3" style={{ marginBottom: 15 }}>{title}</ZSText>
      }

      <ZSView style={{ flexWrap: 'wrap', flexDirection: flexDirection, gap: gap, backgroundColor: background.base, padding: 14, borderRadius: 14 }}>
        {children}
      </ZSView>
    </ZSView>
  )
}